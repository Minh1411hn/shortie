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
const Useragent = require('useragent');
const maxmind = require('maxmind');
const { DateTime } = require('luxon');
const { v4: uuidv4 } = require('uuid');
const ejs = require('ejs');


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
app.use(express.static('public'));
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

app.post('/api/logout', (req,res)=>{
    res.cookie('token', '', {sameSite:'none', secure:true}).json('ok');
})


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

app.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        // Search for the email in the database
        const client = await pool.connect();
        const query = 'SELECT * FROM users WHERE email = $1';
        const values = [email];
        const result = await client.query(query, values);

        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ message: 'Email not found' });
        }

        const token = uuidv4();

        const updateQuery = 'UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE email = $3';
        const updateValues = [token, new Date(Date.now() + 3600000), email];
        await pool.query(updateQuery, updateValues);

        axios
            .post(process.env.EMAIL_HOOKS, {
                email: email,
                token: `${process.env.CLIENT_URL}/?token=${token}`,
                user: user.username,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            .then(function (response) {
                // console.log(response);
            })
            .catch(function (error) {
                // console.log(error);
            });
        res.status(200).json({ message: 'Reset password email sent successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/reset-password', async (req, res) => {
    const { email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Generate a salt and hash the password
        const client = await pool.connect();

        // Update the user's password in the database
        const query = 'UPDATE users SET password = $1 WHERE email = $2 RETURNING *';
        const values = [hashedPassword, email];
        const result = await client.query(query, values);

        const user = result.rows[0];

        // Generate a new JWT token with the updated user information
        jwt.sign(
            { userId: user.id, email, username: user.username, avatar: user.avatar },
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

app.get('/reset-password/:token', async (req, res) => {
    const { token } = req.params;

    try {
        const client = await pool.connect();
        const query = 'SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > $2::TIMESTAMP';
        const values = [token, new Date()];
        const result = await client.query(query, values);

        const user = result.rows[0];

        if (!user) {
            res.status(404).json({ message: 'Invalid or expired token' });
        } else {
            res.status(200).json({ username: user.username, userId: user.user_id, avatar: user.avatar, email: user.email });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/shorten/edit', async (req, res) => {
    const { long_url, expired_at, shortened_id } = req.body;

    try {
        const client = await pool.connect();

        // Save the URL and its shortened ID to the database
        const query = 'UPDATE urls SET original_url = $1 , expired_at = $2 WHERE shortened_id = $3 RETURNING *';
        const values = [long_url, expired_at, shortened_id];
        const result = await client.query(query, values);

        client.release();

        // Return the shortened URL and preview data in the response
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error during edit:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.post('/shorten/delete', async (req, res) => {
    const { shortened_id } = req.body;
    try {
        const client = await pool.connect();
        const nowOutput = new Date();

        const query =`UPDATE urls SET deleted_at = $1 WHERE shortened_id = $2 RETURNING *`;
        const values = [nowOutput, shortened_id];
        const result = await client.query(query, values);
        client.release();

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error during delete:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/shorten/new', async (req, res) => {
    const {long_url, expired_at } = req.body;
    const api_key = req.headers['authorization'];

    try {
        const client = await pool.connect();

        // Check if the provided API key is valid
        const apiKeyQuery = 'SELECT * FROM users WHERE api_key = $1';
        const apiKeyValues = [api_key];
        const apiKeyResult = await client.query(apiKeyQuery, apiKeyValues);

        if (apiKeyResult.rows.length === 0) {
            // Invalid API key
            client.release();
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const urlRegex = /^(?:(?:(?:https?|ftp):)?\/\/)?([\w-]+(?:\.[\w-]+)+(?:[\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?)/;
        if (!urlRegex.test(long_url)) {
            client.release();
            return res.status(400).json({ message: 'Invalid URL' });
        }

        const { customAlphabet } = await import('nanoid');
        function generateShortenUrl() {
            const id = customAlphabet('1234567890abcdef', 7);
            return id();
        }

        const user_id = apiKeyResult.rows[0].id;
        const apiEndpoint = process.env.API_ENDPOINT.toString();
        const unique_id = generateShortenUrl();

        // Save the URL and its shortened ID to the database
        const query =
            'INSERT INTO urls (user_id, original_url, shortened_id, expired_at) VALUES ($1, $2, $3, $4) RETURNING CONCAT($5::text, shortened_id) AS shortened_url, original_url, shortened_id, expired_at, created_at';
        const values = [user_id, long_url, unique_id, expired_at, apiEndpoint ];
        const result = await client.query(query, values);

        client.release();

        // Return the shortened URL and preview data in the response
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error during URL shortening:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



app.post('/links', async (req, res) => {
    const { user_id } = req.body;

    try {
        const client = await pool.connect();
        const query = 'SELECT * FROM urls WHERE user_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC';
        const values = [user_id];
        const result = await client.query(query, values);
        client.release();
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error getting URLs:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/links/statistics', async (req, res) => {
    const { user_id } = req.body;

    try {
        const client = await pool.connect();
        const query = 'SELECT urls.*,\n' +
            '       CAST((SELECT COUNT(*) FROM events WHERE events.shortened_url_id = urls.id) AS INTEGER) AS clicks_count,\n' +
            '       CASE\n' +
            '           WHEN urls.deleted_at IS NOT NULL THEN \'deleted\'\n' +
            '           WHEN urls.expired_at IS NOT NULL AND EXTRACT(EPOCH FROM (urls.expired_at - NOW())) / 60 < 0 THEN \'expired\'\n' +
            '           ELSE \'active\'\n' +
            '       END AS status,\n' +
            '       CASE\n' +
            '           WHEN urls.expired_at IS NOT NULL THEN EXTRACT(EPOCH FROM (urls.expired_at - NOW())) / 60\n' +
            '           ELSE NULL\n' +
            '       END AS minutes_until_expired\n' +
            'FROM urls\n' +
            'WHERE urls.user_id = $1\n' +
            'ORDER BY clicks_count DESC;\n';
        const values = [user_id];
        const result = await client.query(query, values);
        client.release();
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error getting URLs:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/events/useragent', async (req, res) => {
    const { user_id } = req.body;

    try {
        const client = await pool.connect();
        const query = 'SELECT user_agent, COUNT(*) AS event_count\n' +
            'FROM events\n' +
            'LEFT JOIN urls u on u.id = events.shortened_url_id\n' +
            'WHERE u.user_id = $1\n' +
            'GROUP BY user_agent ORDER BY event_count DESC; ';
        const values = [user_id];
        const result = await client.query(query, values);
        client.release();

        const processedData = result.rows.map((item) => {
            const userAgent = Useragent.parse(item.user_agent);
            const device = userAgent.device.toString();
            const browser = userAgent.family;

            return {
                ...item,
                device,
                browser
            };
        });

        res.status(200).json(processedData);
    } catch (error) {
        console.error('Error getting URLs:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/links/timechart', async (req, res) => {
    const { user_id } = req.body;

    try {
        const client = await pool.connect();
        const query = 'SELECT EXTRACT(YEAR FROM DATE_TRUNC(\'month\', events.timestamp)) AS year,\n' +
            '       TO_CHAR(DATE_TRUNC(\'month\', events.timestamp), \'Month\') AS month_name,\n' +
            '       COUNT(*) AS clicks_count\n' +
            'FROM events\n' +
            'left join urls u on u.id = events.shortened_url_id\n' +
            'WHERE u.user_id = $1\n' +
            'GROUP BY year, month_name, DATE_PART(\'month\', DATE_TRUNC(\'month\', events.timestamp))\n' +
            'ORDER BY year, DATE_PART(\'month\', DATE_TRUNC(\'month\', events.timestamp));\n';
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

    try {
        const client = await pool.connect();
        const query = 'SELECT * FROM urls WHERE shortened_id = $1';
        const values = [shortenedId];
        const result = await client.query(query, values);
        const protocolRegex = /^(https?|ftp):\/\//;

        client.release();

        // Not Found URL
        if (result.rowCount === 0) {
            // return res.status(200).json({ message: 'URL not found' });
            return ejs.renderFile('error-page.ejs', {title: 'Url Not Found', message: 'The URL you requested not found' })
                .then((html) => {
                    res.status(401).send(html);
                })
                .catch((err) => {
                    console.error('Error rendering error page:', err);
                    res.status(500).json({ message: 'Internal server error' });
                });

        // Deleted URL
        } else if (result.rows[0].deleted_at !== null) {
            // return res.status(200).json({ message: 'URL deleted', deleted_at: result.rows[0].deleted_at });
            return ejs.renderFile('error-page.ejs', {title: 'Url Deleted', message: `The URL you requested has been deleted at ${DateTime.fromJSDate(result.rows[0].deleted_at).plus({hours:7}).toFormat('HH:mm dd/MM/yyyy')}` })
                .then((html) => {
                    res.status(401).send(html);
                })
                .catch((err) => {
                    console.error('Error rendering error page:', err);
                    res.status(500).json({ message: 'Internal server error' });
                });


        } else {
            const expiredAt = DateTime.fromJSDate(result.rows[0].expired_at);
            const currentTime = DateTime.now();
            const redirectUrl = result.rows[0].original_url;
            console.log(expiredAt < currentTime);
            if (expiredAt < currentTime) {
                // return res.status(200).json({ message: 'URL expired', expired_at: expiredAt});
                return ejs.renderFile('error-page.ejs', {title: 'Url Expired', message: `The URL you requested has expired at ${expiredAt.plus({hours:7}).toFormat('HH:mm dd/MM/yyyy')}` })
                    .then((html) => {
                        res.status(401).send(html);
                    })
                    .catch((err) => {
                        console.error('Error rendering error page:', err);
                        res.status(500).json({ message: 'Internal server error' });
                    });
            } else {
                try {
                    const client = await pool.connect();
                    const insertQuery = 'INSERT INTO events (shortened_url_id, timestamp, user_agent, ip_address) VALUES ($1, $2, $3, $4)';
                    const insertValues = [result.rows[0].id, new Date(), req.headers['user-agent'], req.ip];
                    await client.query(insertQuery, insertValues);
                    client.release();
                } catch (error) {
                    console.error('Error inserting event:', error);
                    res.status(500).json({ message: 'Internal server error' });
                }

                if (!protocolRegex.test(redirectUrl)) {
                    // If the URL does not have a protocol, prepend "http://" before redirecting
                    return res.redirect(`http://${redirectUrl}`);
                } else {
                    // The URL already has a protocol, redirect as is
                    return res.redirect(redirectUrl);
                }
            }
        }
    } catch (error) {
        console.error('Error getting URLs:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
