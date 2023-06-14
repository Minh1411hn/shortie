import {useContext, useEffect, useState} from "react";
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import axios from "axios";
import {styled} from '@mui/system';
import Gravatar from "react-gravatar";
import {UserContext} from "../UserContext.jsx";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Tooltip from "@mui/material/Tooltip";



const style = {
    position: 'absolute',
    borderRadius: '10px',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: 'background.paper',
    p: 4,
};

const BlurredBackdrop = styled('div')({
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backdropFilter: 'blur(8px)',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
});


export default function ProfileModal({openProfile, setOpenProfile}) {
    const {email,id,setId,setEmail,username,setUsername, avatar, setAvatar,apiKey } = useContext(UserContext);
    const [resetPasswordNotice, setResetPasswordNotice] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const handleToast = () => {
        setShowToast(!showToast);
    };



    async function handleResetPassword(ev) {
        ev.preventDefault();

        try {
            const response = await axios.post('/forgot-password', { email }, { withCredentials: true });
            const {status, data} = response;
            if (status === 200) {
                // Handle the success response
                setResetPasswordNotice(data.message);
            }
        } catch (error) {
            // Handle the error response from the API
            if (error.response) {
                const { status, data } = error.response;
                console.log(`API error: ${status} - ${data.message}`);
                setResetPasswordNotice(data.message)
                // Display an error message to the user as needed
            } else {
                console.log(`Network error: ${error.message}`);
                // Display a network error message to the user as needed
            }
        }
    }


    return (
        <div>
            <Snackbar
                open={showToast}
                autoHideDuration={400}
                onClose={handleToast}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleToast} severity="success" sx={{ width: '100%' }} closeButton={false} >
                    {toastMessage}
                </Alert>
            </Snackbar>
            <Modal
                open={openProfile}
                onClose={() => {
                    setOpenProfile(false);
                }}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                BackdropComponent={BlurredBackdrop}>
                <Box sx={style}>
                    <div className="p-5" >
                        <div className=" mx-auto items-center flex flex-col">
                            <form className={'w-2/5 h-3/5 flex flex-col relative rounded-lg flex items-center'}>
                                <div className="w-40 h-40 relative rounded-full border-4 border-gray-200 overflow-hidden">
                                    <Gravatar email={email} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full object-cover" />
                                </div>
                            </form>
                        </div>
                        <p className="mx-auto text-center text-lg font-semibold pt-4">{username}</p>

                        <div className="w-4/5 mx-auto">
                            <div className="flex flex-col mb-10">
                                <label className="mb-1 pl-2 text-sm text-gray-500" htmlFor="email">Email</label>
                                <input
                                    id="email"
                                    type="text"
                                    placeholder={email}
                                    value={email}
                                    disabled={true}
                                    className="block w-full rounded-lg p-2 bg-gray-100 mb-5"
                                />
                                <label className="mb-1 pl-2 text-sm text-gray-500" htmlFor="email">Api Key</label>
                                <Tooltip title="Click to copy" arrow PopperProps={{placement: "top"}}>
                                    <div onClick={() => {navigator.clipboard.writeText(apiKey);setToastMessage('Link deleted successfully');handleToast();}}>
                                        <input
                                            id="email"
                                            type="text"
                                            placeholder={apiKey}
                                            value={apiKey}
                                            disabled={true}
                                            className="block w-full rounded-lg p-2 bg-gray-100 cursor-pointer"
                                        />
                                    </div>
                                </Tooltip>
                            </div>
                            {resetPasswordNotice && (
                                <p className={`mb-6 ${resetPasswordNotice === "Reset password email sent successfully"? "text-green-500 text-center" : "text-red-500"}`}>{resetPasswordNotice}</p>
                            )}
                            <div className="mx-auto items-center justify-center flex mt-4">
                                <button className="rounded-lg py-1 px-5 bg-accent text-white self-center mx-4" onClick={handleResetPassword}>
                                    Reset Password
                                </button>
                                <button className="rounded-lg py-1 px-5 bg-accentHover text-grey self-center mx-4" onClick={()=>{setOpenProfile(false)}}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </Box>
            </Modal>
        </div>
    );
}