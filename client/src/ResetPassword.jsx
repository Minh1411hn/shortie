import React, {useContext, useEffect, useState} from "react";
import {UserContext} from "./UserContext.jsx";
import Gravatar from "react-gravatar";
import md5 from "blueimp-md5";
import axios from "axios";




export default function ResetPassword() {
    const {email,id,username,setUsername, avatar, setAvatar, resetPasswordMessage, resetPassword, setResetPassword, setResetPasswordMessage} = useContext(UserContext);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordMatchError, setPasswordMatchError] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const {setEmail:setLoggedInEmail, setId,setUsername:setLoggedInUsername } = useContext(UserContext);


    const handleSubmit = async (event) => {
        event.preventDefault();

        if (password !== confirmPassword) {
            setPasswordMatchError(true);
        } else {
            setPasswordMatchError(false);

            try {
                const {data} = await axios.post('/reset-password', {
                    email,
                    id,
                    password,
                }, {withCredentials: true});
                setResetPassword(!resetPassword);
                setResetPasswordMessage(null);
                window.location.href = import.meta.env.VITE_CLIENT_URL;
                setLoggedInEmail(email);
                setId(data.id);
                setLoggedInUsername(data.username);
            } catch (error) {
                // Handle the error response from the API
                if (error.response) {
                    const {status, data} = error.response;
                    // console.log(`API error: ${status} - ${data.message}`);
                    // Display an error message to the user as needed
                } else {
                    // console.log(`Network error: ${error.message}`);
                    // Display a network error message to the user as needed
                }
            }
        }
    };



    const handleBackToMain = () => {
        setResetPassword(!resetPassword);
        setResetPasswordMessage(null);
        window.location.href = import.meta.env.VITE_CLIENT_URL;
    };



    useEffect(() => {
        function handleResize() {
            const width = window.innerWidth;
            const isMobileView = width < 765;
            setIsMobile(isMobileView);
        };
        handleResize();
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [])




    return (
        <div className="bg-[#FF7235] h-screen flex items-center justify-center overflow-hidden">
            <div className="bg-white w-[90%] md:w-[500px] mx-auto border rounded-[10px] justify-center py-5 items-center text-center">
                <div className={`${isMobile ? "w-4/5 mx-auto" : "w-2/3 mx-auto"}`}>
                    {resetPasswordMessage && (
                        <>
                            <div className="text-black text-3xl font-medium">
                                {resetPasswordMessage}
                            </div>
                            <p className="text-sm pt-3">
                                Your Reset Password link is invalid or has expired.
                            </p>
                            <button onClick={handleBackToMain} className="block w-full my-6 rounded-md p-2 bg-orange-500 text-white mx-auto drop-shadow-md" >Go Back</button>
                        </>
                    )}
                    {!resetPasswordMessage && (
                        <>
                            <div className="w-40 h-40 relative rounded-full border-4 border-gray-200 overflow-hidden mx-auto">
                                {avatar? (
                                    <img
                                        src={avatar}
                                        alt=""
                                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full object-cover"
                                    />
                                ) : (
                                    <Gravatar email={`https://www.gravatar.com/avatar/${md5(email.toLowerCase())}?d=retro&s=300`} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full object-cover" />
                                )}
                            </div>
                            <p className="font-semibold text-3xl py-5">{username}</p>
                            <form onSubmit={handleSubmit} className="mx-auto ">
                                <input value={password}
                                       onChange={ev => setPassword(ev.target.value)}
                                       type="password"
                                       placeholder="Enter New Password"
                                       className="block w-full rounded-lg p-2 mb-2 border mx-auto"/>
                                <input value={confirmPassword}
                                       onChange={ev => setConfirmPassword(ev.target.value)}
                                       type="password"
                                       placeholder="Re-Enter New Password"
                                       className="block w-full rounded-lg p-2 mb-2 border mx-auto"/>
                                {passwordMatchError && (
                                    <p className="mx-auto text-md text-center text-red-500 p-2">Passwords Not Match</p>
                                )}
                                <button className="block w-full mt-6 mb-2 rounded-md p-2 bg-orange-500 text-white mx-auto drop-shadow-md" >Reset Password</button>
                            </form>
                            <button onClick={handleBackToMain} className="text-sm underline text-gray-500 cursor-pointer">Cancel</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}