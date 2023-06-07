import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
    const [email, setEmail] = useState(null);
    const [username, setUsername] = useState(null);
    const [id, setId] = useState(null);
    const [avatar, setAvatar] = useState(null);
    const [apiKey, setApiKey] = useState(null);
    const [resetPassword, setResetPassword] = useState(false);
    const [resetPasswordMessage, setResetPasswordMessage] = useState(null);
    const [shortenedId, setShortenedId] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (location.pathname !== "/") {
            // Extract the root path from the current path
            const rootPath = location.pathname.split("/")[1];
            console.log("Root Path:", rootPath);
            setShortenedId(rootPath);
        }

        if (shortenedId) {
            axios.get(`/api/${shortenedId}`)
                .then((response) => {
                    if (response.status === 200) {
                        window.location.href = response.data.original_url;
                    } else {
                        console.log("URL not found");
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
        } else if (token) {
            axios.get(`/api/reset-password/${token}`)
                .then((response) => {
                    if (response.status === 200) {
                        setId(response.data.userId);
                        setEmail(response.data.email);
                        setUsername(response.data.username);
                        setAvatar(response.data.avatar);
                        setResetPasswordMessage(response.data.message);
                        setResetPassword(true);
                    } else {
                        setResetPassword(true);
                        setResetPasswordMessage(response.data.message);
                    }
                })
                .catch((error) => {
                    if (error.response) {
                        setResetPassword(true);
                        setResetPasswordMessage(error.response.data.message);
                    } else {
                        console.error(error);
                        setResetPasswordMessage('Internal server error');
                    }
                });
        } else {
            axios.get('/api/profile')
                .then((response) => {
                    setId(response.data.userId);
                    setEmail(response.data.email);
                    setUsername(response.data.username);
                    setAvatar(response.data.avatar);
                    setApiKey(response.data.apiKey);
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }, [shortenedId, location.pathname]);

    return (
        <UserContext.Provider
            value={{
                email,
                setEmail,
                id,
                setId,
                username,
                setUsername,
                avatar,
                setAvatar,
                apiKey,
                setApiKey,
                resetPassword,
                setResetPassword,
                resetPasswordMessage,
                setResetPasswordMessage,
                shortenedId,
            }}
        >
            {children}
        </UserContext.Provider>
    );
}
