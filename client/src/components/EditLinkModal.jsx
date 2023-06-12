import {useEffect, useState} from "react";
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Tooltip from "@mui/material/Tooltip";
import axios from "axios";
import {styled} from '@mui/system';
import {DateTime} from "luxon";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";


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




export default function EditLinkModal ({selectedShortenedId, selectedExpireDate, selectedOriginUrl, userId,setSelectedShortenedId }) {
    const [originLink, setOriginLink] = useState(null);
    const [expireDate, setExpireDate] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState();


    useEffect(() => {
        const luxonObject = DateTime.fromISO(selectedExpireDate, { zone: "UTC" }).plus({hours: 7});
        setExpireDate(selectedExpireDate? luxonObject.toJSDate() : null);
    }, []);


    const handleToast = () => {
        preventDefault();
        if (toastMessage) {
            setShowToast(!showToast);
            setToastMessage(null);
        }
    };

    const handleDelete = async (event) => {
        try {
            const response = await axios.post('/shorten/delete', { shortened_id: selectedShortenedId});
            console.log(`response ${JSON.stringify(response.data)}`);

            if (response.status === 200) {
                console.log(response.data);
                const data = response.data;
                setSelectedShortenedId(false);
            } else {
                throw new Error('Failed to shorten URL');
                // setToastMessage(`Edit Failed! ${response.status}`);
                // setShowToast(true);
            }
        } catch (error) {
            console.error('Error during URL shortening:', error);
            // setToastMessage(`Edit Failed! ${error}`);
            // setShowToast(true);

        }
    }

    const handleEdit = async (event) => {
        try {
            const response = await axios.post('/shorten/edit', { long_url: originLink? originLink : selectedOriginUrl, expired_at: DateTime.fromJSDate(expireDate).minus({hours: 7}).toISO(), shortened_id: selectedShortenedId});
            console.log(`response ${JSON.stringify(response.data)}`);

            if (response.status === 200) {
                console.log(response.data);
                const data = response.data;
                // setExpireDate(response.expired_at)
                setToastMessage('Edit Success!');
                setShowToast(true);
            } else {
                throw new Error('Failed to shorten URL');
                // setToastMessage(`Edit Failed! ${response.status}`);
                // setShowToast(true);
            }
        } catch (error) {
            console.error('Error during URL shortening:', error);
            // setToastMessage(`Edit Failed! ${error}`);
            // setShowToast(true);

        }
    };



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
                open={selectedShortenedId?true:false}
                onClose={() => {
                    console.log(`selectedLink ${selectedShortenedId}`);
                    setSelectedShortenedId(null);
                }}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                BackdropComponent={BlurredBackdrop}
            >
                <Box sx={style}>
                    <div className="h-fit" >
                        <div className="flex flex-grow">
                            <h2>Edit Your Link</h2>
                            <Tooltip title="Delete" arrow PopperProps={{placement: "top"}}>
                                <a onClick={()=>{handleDelete(event);}} className="flex absolute right-8">
                                    <svg xmlns="http://www.w3.org/2000/svg"
                                         fill="none" viewBox="0 0 24 24"
                                         strokeWidth="1.5"
                                         stroke="white"
                                         className=" w-7 h-7 bg-red-500 rounded-lg p-[5px] cursor-pointer">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                    </svg>
                                </a>
                            </Tooltip>
                        </div>
                        <div className="bg-dark my-4 rounded-lg">
                            <img src={"https://i.imgur.com/Xej6z3I.jpg"} alt="" className="mx-auto py-4 w-3/5" />
                        </div>
                        <Tooltip title="Click to copy" arrow PopperProps={{placement: "top"}}>
                            <div onClick={() => {navigator.clipboard.writeText(selectedShortenedId)}} className="cursor-pointer rounded-lg border-[1px] border-gray-200 py-3 flex text-white bg-accent">
                                <svg xmlns="http://www.w3.org/2000/svg"
                                     fill="none"
                                     viewBox="0 0 24 24"
                                     strokeWidth="1.5"
                                     stroke="currentColor"
                                     className="w-6 h-6 mx-4">
                                    <path strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"/>
                                </svg>
                                <a className="">{`${import.meta.env.VITE_API_BASE_URL}/${selectedShortenedId}`}</a>
                            </div>
                        </Tooltip>


                        <div className="mt-4">
                            <p className="ml-2 mb-1 font-light">Your Origin Url</p>
                            <input
                                className="p-2 text-md w-full rounded-lg border-[1px] mb-4"
                                type="text"
                                value={originLink}
                                defaultValue={selectedOriginUrl}
                                placeholder="https://google.com"
                                onChange={ev => {
                                    setOriginLink(ev.target.value);
                                }}
                            />

                            <p className="ml-2 mb-1 font-light">Your Expire Date of Url</p>
                            <DatePicker
                                selected={expireDate}
                                onChange={(date) => setExpireDate(date)}
                                showTimeSelect
                                isClearable
                                placeholderText="Expire Date : None"
                                timeFormat="HH:mm"
                                timeIntervals={15}
                                timeCaption="Time"
                                dateFormat="MMMM d, yyyy HH:mm"
                                className="rounded-lg border-[1px] p-2 w-full text-md"
                            />

                            <div className="mx-auto items-center justify-center flex mt-4">
                                <button className="rounded-lg py-1 px-5 bg-accent text-white self-center mx-4" onClick={()=>{handleEdit();setToastMessage("Edit Success");handleToast()}}>
                                    Save
                                </button>
                                <button className="rounded-lg py-1 px-5 bg-accentHover text-grey self-center mx-4" onClick={()=>{setSelectedShortenedId(false)}}>
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