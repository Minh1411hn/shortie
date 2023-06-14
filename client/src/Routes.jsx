import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext.jsx";
import ResetPassword from "./ResetPassword.jsx";
import MainSection from "./MainSection.jsx";
import RedirectToOriginal from "./RedirectToOriginal.jsx";
import RegisterAndLoginForm from "./RegisterAndLoginForm.jsx";

export default function Routes() {
    const {
        email,
        id,
        username,
        resetPassword,
        avatar,
        resetPasswordMessage,
        shortenedId
    } = useContext(UserContext);
    const [loading, setLoading] = useState(true);

    // useEffect(() => {
    //     // Simulate loading time or perform async operations
    //     setTimeout(() => {
    //         setLoading(false);
    //     }, 300);
    // }, []);
    //
    // if (loading) {
    //     return <div>Loading...</div>;
    // }

    if (email && id && username && !resetPassword) {
        return <MainSection />;
    }

    if (resetPassword || resetPasswordMessage ) {
        return <ResetPassword />;
    }

    else {
        return <RegisterAndLoginForm />;
    }

}
