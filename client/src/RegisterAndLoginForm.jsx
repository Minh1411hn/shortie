import {useContext, useEffect, useState} from "react";
import axios from "axios";
import {UserContext} from "./UserContext.jsx";
import Gravatar from "react-gravatar";

export default function RegisterAndLoginForm() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoginOrRegister, setIsLoginOrRegister] = useState('login');
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [loginError, setLoginError] = useState(null);
    const [resetPasswordNotice, setResetPasswordNotice] = useState(null);
    const {setEmail:setLoggedInEmail, setId,setUsername:setLoggedInUsername } = useContext(UserContext);
    const [isMobile, setIsMobile] = useState(false);

    async function handleSubmit(ev) {
        ev.preventDefault();
        const url = isLoginOrRegister === 'register' ? '/api/register' : '/api/login';

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email) && isLoginOrRegister === "login") {
            setLoginError("Please enter a valid email address");
            return;
        } else if (!password && isLoginOrRegister === "login") {
            setLoginError("Please enter your password");
            return;
        }

        if (!emailRegex.test(email) && isLoginOrRegister === "register") {
            setLoginError("Please enter a valid email address");
            return;
        } else if (!username && isLoginOrRegister === "register") {
            setLoginError("Username must not blank");
            return;
        } else if (!password && isLoginOrRegister === "register") {
            setLoginError("Password must not blank");
            return;
        }


        try {
            const { data } = await axios.post(url, { email, password, username }, { withCredentials: true });
            setLoggedInEmail(email);
            setId(data.id);
            setLoggedInUsername(data.username);
        } catch (error) {
            if (error.response) {
                const { status, data } = error.response;
                // console.log(`API error: ${status} - ${data.message}`);
                setLoginError(data.message)
            } else {
                // console.log(`Network error: ${error.message}`);
            }
        }
    }

    async function handleForgotPassword(ev) {
        ev.preventDefault();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email) && isForgotPassword ) {
            setResetPasswordNotice("Please enter a valid email address");
            return;
        }

        try {
            const response = await axios.post('/api/forgot-password', { email }, { withCredentials: true });
            const {status, data} = response;
            if (status === 200) {
                // Handle the success response
                setResetPasswordNotice(data.message);
            }
        } catch (error) {
            // Handle the error response from the API
            if (error.response) {
                const { status, data } = error.response;
                // console.log(`API error: ${status} - ${data.message}`);
                setResetPasswordNotice(data.message)
            } else {
                // console.log(`Network error: ${error.message}`);
            }
        }
        setIsForgotPassword(true);
    }

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
        // <div className="bg-gradient-to-b from-[#FEF9EE] to-white h-screen flex items-center justify-center">
        <div className="bg-[#FF7235] h-screen flex items-center justify-center overflow-hidden">
            <div className="bg-white w-[90%] md:w-[500px] mx-auto border rounded-[10px] justify-center items-center">
                <div className={`${isMobile ? "w-4/5 mx-auto" : "w-3/5 mx-auto"}`}>
                    <div className="flex justify-between mt-5 mb-6 mx-auto border-[1px] rounded-md">
                        <button className={`block w-1/2 rounded-md p-2 ${isLoginOrRegister === "login" ? "bg-orange-500" +
                            " drop-shadow-md" +
                            " text-white" : "bg-white text-gray-500"}`} onClick={() => {
                            setIsLoginOrRegister("login");
                            setIsForgotPassword(false);
                        }}>
                            Sign In
                        </button>
                        <button className={`block w-1/2 rounded-md p-2 ${isLoginOrRegister === "register" ? "bg-orange-500 text-white drop-shadow-md" : "bg-white text-gray-500"}`}
                                onClick={() => {
                                    setIsLoginOrRegister("register");
                                    setIsForgotPassword(false);
                                }}>
                            Sign Up
                        </button>
                    </div>
                    {/*reset password section*/}
                    {isForgotPassword && (
                        <form className="mx-auto text-center" onSubmit={handleForgotPassword}>
                            <h1 className="text-lg pb-4">Reset Password</h1>
                            <input value={email}
                                   onChange={ev => setEmail(ev.target.value.trim().toLowerCase())}
                                   type="text"
                                   placeholder="Email"
                                   className="w-full rounded-lg p-2 mb-2 border-2 border-[#FEF9EE] mx-auto"/>
                            {loginError === 'Please enter a valid email address' && isForgotPassword && (
                                <div className=" mx-auto text-md text-center text-red-500 p-2 flex justify-between align-middle">
                                    <span className="">{loginError}</span>
                                    {isLoginOrRegister === 'login' && loginError === "Email not found" && (
                                        <button onClick={() => setIsLoginOrRegister('register')} className="text-red-500 font-medium underline cursor-pointer">Create one?</button>
                                    )}
                                </div>
                            )}
                            <button className="block w-full my-6 rounded-md p-2 bg-orange-500 text-white mx-auto drop-shadow-md">
                                Send Reset Email
                            </button>
                            {resetPasswordNotice && (
                                <p className={`mb-6 ${resetPasswordNotice === "Reset password email sent successfully"? "text-green-500" : "text-red-500"}`}>{resetPasswordNotice}</p>
                            )}
                        </form>
                    )}

                    {/*login logout section*/}
                    {!isForgotPassword && (
                        <div className="mx-auto pb-6">
                            <form className="mx-auto" onSubmit={handleSubmit}>
                                <input value={email}
                                       onChange={ev => {
                                           setEmail(ev.target.value.trim().toLowerCase());
                                       }}
                                       type="text"
                                       placeholder="Email"
                                       className="w-full rounded-lg p-2 mb-2 border-2 border-[#FEF9EE] mx-auto"/>
                                {isLoginOrRegister === "register" && (
                                    <input value={username}
                                           onChange={ev => setUsername(ev.target.value)}
                                           type="text"
                                           placeholder="Username"
                                           className="block w-full rounded-lg p-2 mb-2 border-2 border-[#FEF9EE] mx-auto"/>
                                )}
                                <input value={password}
                                       onChange={ev => setPassword(ev.target.value)}
                                       type="password"
                                       placeholder="Password"
                                       className="block w-full rounded-lg p-2 mb-2 border mx-auto"/>
                                {/* Login Error Alert */}
                                {loginError && isLoginOrRegister === 'login' && (
                                    <div className=" mx-auto text-md text-center text-red-500 p-2 flex justify-between align-middle">
                                        <span className="">{loginError}</span>

                                    </div>
                                )}
                                <button className="block w-full my-6 rounded-md p-2 bg-orange-500 text-white mx-auto drop-shadow-md">
                                    {isLoginOrRegister === "register"? "Sign Up":"Sign In"}
                                </button>
                            </form>
                            {isLoginOrRegister === "login" && !isForgotPassword && (
                                <button onClick={() => {setIsForgotPassword(true); setIsLoginOrRegister('')}} className="text-gray-500 block mx-auto underline cursor-pointer">Forgot password?</button>
                            )}
                        </div>
                    )}

                </div>

            </div>
        </div>
    )
}