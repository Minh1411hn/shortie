import RegisterAndLoginForm from "./RegisterAndLoginForm.jsx";
import {useContext} from "react";
import {UserContext} from "./UserContext.jsx";
import ResetPassword from "./ResetPassword.jsx";
import MainSection from "./MainSection.jsx";
import RedirectToOriginal from "./RedirectToOriginal.jsx";



export default function Routes() {
    const {email, id, username, resetPassword,avatar, resetPasswordMessage, shortenedId} = useContext(UserContext);

    if (shortenedId) {
        return <RedirectToOriginal/>;
    }


    if ((email && id && username && !resetPassword)){
        return <MainSection/>;
    }

    if (resetPassword || resetPasswordMessage ) {
        return <ResetPassword/>
    }

    return (
        <RegisterAndLoginForm/>
    );
}