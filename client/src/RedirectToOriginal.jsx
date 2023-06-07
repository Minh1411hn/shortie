import React, {useContext, useEffect, useState} from "react";
import {UserContext} from "./UserContext.jsx";
import axios from "axios";

export default function RedirectToOriginal() {
    const {email, id, username, resetPassword,avatar, resetPasswordMessage, shortenedId} = useContext(UserContext);
    const [expiredAt, setExpiredAt] = useState(null);
    const [deletedAt, setDeletedAt] = useState(null);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`/api/${shortenedId}`);
                // console.log(response.data.message);

                if (response.data.message === `URL not found`) {
                    setNotFound(true);
                } else if (response.data.message === `URL deleted`) {
                    setDeletedAt(response.data.deleted_at);
                } else if (response.data.message === `URL expired`) {
                    setExpiredAt(response.data.expired_at);
                } else {
                    const originalUrl = response.data.original_url;
                    window.location.href = `${window.location.protocol}//${originalUrl}`;
                }
            } catch (error) {
                console.log(error)
            }
        }
        fetchData();
    }, []);

    return(
        <div>
            {notFound && <div>URL not found</div>}
            {deletedAt && <div>URL deleted at {deletedAt}</div>}
            {expiredAt && <div>URL expired at {expiredAt}</div>}
        </div>
    )
}