const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const crypto = require('crypto');
const axios = require('axios');
const useragent = require('useragent');
const maxmind = require('maxmind');
// const{ CityResponse } = require('maxmind');
//
//
// const cityLookup = maxmind.open('/path/to/GeoLiteCity.mmdb');
// const asnLookup = maxmind.open('/path/to/GeoIPASNum.mmdb');
// const ispLookup = maxmind.open('/path/to/GeoISP.mmdb');

useragent(true);


const app = express();


dotenv.config();
const pool = new Pool({
    connectionString: process.env.POSTGRESQL_URI,
});

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error connecting to the database', err);
    } else {
        console.log('Connected to the database');
    }
});




const server = app.listen(4000);
dotenv.config();
const jwtSecret = process.env.JWT_SECRET;
const bcryptSalt = bcrypt.genSaltSync(10);

app.use(cookieParser());
app.use(express.json());
app.use(cors({
    credentials: true,
    origin: process.env.BASE_URL,
}));

app.set("trust proxy", 1);

function generateApiKey() {
    const apiKeyBytes = crypto.randomBytes(32);
    return apiKeyBytes.toString('hex');
}



app.get('/test', (req, res) => {
    res.json('test ok');
});


app.post('/register', async (req, res) => {
    const { email, password, username } = req.body;
    try {
        // Check if the user already exists
        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rowCount > 0) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        // Create a new user
        const hashedPassword = bcrypt.hashSync(password, 10);
        const apiKey = generateApiKey();
        const query = 'INSERT INTO users (email, password, api_key, username) VALUES ($1, $2, $3, $4) RETURNING *';
        const values = [email, hashedPassword, apiKey, username];
        const createdUser = await pool.query(query, values);

        // Sign a JWT token
        const token = jwt.sign({ userId: createdUser.rows[0].id, email,  username}, jwtSecret);

        // Set a cookie containing the JWT token
        res.cookie('token', token, { httpOnly: true, sameSite: 'none', secure: true });

        // Return the new user details
        res.status(201).json({
            id: createdUser.rows[0].id,
            email: createdUser.rows[0].email,
            username: createdUser.rows[0].username,
        });
    } catch(err) {
        console.error('Error creating user', err);
        res.status(500).json({ error: 'Error creating user' });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const client = await pool.connect();

        // Find the user with the provided email
        const query = 'SELECT * FROM users WHERE email = $1';
        const values = [email];
        const result = await client.query(query, values);

        if (result.rowCount === 0) {
            // If the email is not found, respond with a 404 error
            return res.status(404).json({ message: 'Email not found' });
        }

        const foundUser = result.rows[0];
        const passOk = await bcrypt.compare(password, foundUser.password);

        if (!passOk) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        const { id, username, avatar, api_key } = foundUser;
        const token = jwt.sign({ userId: id, email, username, avatar,apiKey: foundUser.api_key }, jwtSecret);
        res.cookie('token', token, { sameSite: 'none', secure: true }).json({
            id,
            username,
            avatar,
            api_key,
        });
        client.release();
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



app.get('/profile', (req,res) => {
    const token = req.cookies?.token;
    if (token) {
        jwt.verify(token, jwtSecret, {}, (err, userData) => {
            if (err) throw err;
            res.json(userData);
        });
    } else {
        res.status(401).json('no token');
    }
});

app.post('/reset-password', async (req, res) => {
    const { email, id, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Generate a salt and hash the password
        const client = await pool.connect();

        // Update the user's password in the database
        const query = 'UPDATE users SET password = $1 WHERE id = $2 RETURNING *';
        const values = [hashedPassword, id];
        const result = await client.query(query, values);

        const user = result.rows[0];

        // Generate a new JWT token with the updated user information
        jwt.sign(
            { userId: id, email, username: user.username, avatar: user.avatar },
            jwtSecret,
            {},
            (err, token) => {
                if (err) throw err;
                res.cookie('token', token, { sameSite: 'none', secure: true }).status(201).json({
                    id: user.id,
                    email,
                    username: user.username,
                    avatar: user.avatar,
                });
            }
        );

        client.release();
    } catch (error) {
        console.error('Error during password reset:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.post('/shorten', async (req, res) => {
    const { user_id, long_url } = req.body;

    let previewTitle, previewDescription, previewImage;

    // if (long_url) {
    //     axios.post('https://api.linkpreview.net/', {
    //         key: process.env.PREVIEW_API_KEY,
    //         q: long_url
    //     })
    //         .then(function (response) {
    //             previewTitle = response.data.title;
    //             previewDescription = response.data.description;
    //             previewImage = response.data.image;
    //         })
    //         .catch(function (error) {
    //             console.log(error);
    //         });
    // }

    const { customAlphabet } = await import('nanoid');
    function generateShortenUrl() {
        const id = customAlphabet('1234567890abcdef', 10);
        return id();
    }

    try {
        const client = await pool.connect();

        const unique_id = generateShortenUrl();

        // Save the URL and its shortened ID to the database
        const query = 'INSERT INTO urls (user_id,original_url, shortened_id) VALUES ($1, $2, $3)';
        const values = [user_id, long_url, unique_id];
        await client.query(query, values);

        client.release();

        // Return the shortened URL and preview data in the response
        res.status(201).json({ shortened_id: unique_id, previewTitle, previewDescription, previewImage });
    } catch (error) {
        console.error('Error during URL shortening:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.post('/links', async (req, res) => {
    const { user_id } = req.body;

    try {
        const client = await pool.connect();
        const query = 'SELECT * FROM urls WHERE user_id = $1 ORDER BY created_at DESC';
        const values = [user_id];
        const result = await client.query(query, values);
        client.release();
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error getting URLs:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.get('/:shortened_id', async (req, res) => {
    const { shortened_id: shortenedId } = req.params;
    // const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const ipAddress = req.ip;
    // const geo = asnLookup.get(ipAddress);


    const userAgent = useragent.parse(req.headers['user-agent']);
    const device = `${userAgent.os.toString()} - ${userAgent.toString()}`;

    console.log(ipAddress);
    console.log(userAgent);

    try {
        const client = await pool.connect();
        const query = 'SELECT * FROM urls WHERE shortened_id = $1';
        const values = [shortenedId];
        const result = await client.query(query, values);
        client.release();

        if (result.rowCount === 0) {
            return res.status(200).json({ message: 'URL not found' });
        } else if (result.rows[0].deleted_at !== null) {
            return res.status(200).json({ message: 'URL deleted', deleted_at: result.rows[0].deleted_at });
        } else if (result.rows[0].expired_at !== null) {
            return res.status(200).json({ message: 'URL expired', expired_at:result.rows[0].expired_at });
        } else {

            const redirectUrl = `https://${result.rows[0].original_url}`;
            return res.redirect(redirectUrl);

            // res.status(200).json(result.rows[0]);
            // console.log(result.rows[0]);
        }
    } catch (error) {
        console.error('Error getting URLs:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
