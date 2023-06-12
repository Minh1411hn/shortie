import {useContext, useEffect, useRef, useState} from "react";
import { UserContext } from "../UserContext.jsx";
import axios from "axios";
import { toPng } from 'html-to-image';
import { useSpring, animated } from 'react-spring';
import { DateTime } from "luxon";
import {DateTimePicker, LocalizationProvider} from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { styled } from '@mui/system';
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import Typography from '@mui/material/Typography';
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { Dayjs } from 'dayjs';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import EditLinkModal from "../components/EditLinkModal.jsx";

function ButtonField(props) {
    const {
        setOpen,
        label,
        id,
        disabled,
        InputProps: { ref } = {},
        inputProps: { 'aria-label': ariaLabel } = {},
    } = props;

    return (
        <Button
            sx={{
                borderRadius: '10px',
                borderColor: "#696cff",
                color: "#696cff",
            }}
            variant="outlined"
            id={id}
            disabled={disabled}
            ref={ref}
            aria-label={ariaLabel}
            onClick={() => setOpen?.((prev) => !prev)}
        >
            {label ?? 'Pick a date'}
        </Button>
    );
}
function ButtonDatePicker(props) {
    const [open, setOpen] = useState(false);

    return (
        <DateTimePicker
            slots={{ field: ButtonField, ...props.slots }}
            slotProps={{ field: { setOpen } }}
            {...props}
            disablePast={true}
            ampm={false}
            open={open}
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
            timeSteps={{ hours: 1, minutes: 1}}

        />
    );
}


export default function SectionLinks() {
    const [newLink, setNewLink] = useState('');
    const {email,id,setId,setEmail,username,setUsername, avatar, setAvatar } = useContext(UserContext);
    const [shortenedLink, setShortenedLink] = useState(null);
    const [shortenedResult, setShortenedResult] = useState([]);
    const [previewImage, setPreviewImage] = useState(null);
    const [previewTitle, setPreviewTitle] = useState(null);
    const [previewDescription, setPreviewDescription] = useState(null);
    const [totalClicks, setTotalClicks] = useState(0);
    const [allLinks, setAllLinks] = useState([]);
    const [expireDate, setExpireDate] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [searchLinks, setSearchLinks] = useState(null);
    const [selectedShortenedId, setSelectedShortenedId] = useState(null);
    const [selectedExpireDate, setSelectedExpireDate] = useState(null);
    const [selectedOriginUrl, setSelectedOriginUrl] = useState(null);



    const fadeIn = useSpring({
        opacity: shortenedLink ? 1 : 0,
        from: { opacity: 0 },
        config: { duration: 700 },
    });

    const handleToast = () => {
        setShowToast(!showToast);
    };



    useEffect (() => {
        console.log(expireDate);
    }, [expireDate]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.post(`/links`, { user_id: id });
                if (response.status === 200) {
                    setAllLinks(response.data); // Assign response.data.data to allLinks
                }
            } catch (error) {
                console.error('Error getting all links', error);
                // Handle the error
            }
        };
        fetchData();
    }, [shortenedLink, selectedShortenedId]);

    const updateSelectedLink = (updatedLink) => {
        setSelectedShortenedId(updatedLink);
    };

    const handleDelete = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post(`/links/delete`, { shortened_id: selectedShortenedId });
            if (response.status === 200) {
                console.log(response.data);
                setToastMessage('Link deleted successfully');
                handleToast();
                setSelectedShortenedId(null);
            }
        } catch (error) {
            console.error('Error deleting link', error);
            // Handle the error
        }
    }


    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await axios.post('/shorten/new', { long_url: newLink, user_id: id, expired_at: expireDate });


            if (response.status === 200) {
                console.log(response.data);
                const data = response.data;
                setShortenedResult(data);
                setShortenedLink(`${import.meta.env.VITE_API_BASE_URL}/${data.shortened_id}`);
                // setPreviewImage(response.data.previewImage);
                // setPreviewTitle(response.data.previewTitle);
                // setPreviewDescription(response.data.previewDescription);
                // Handle the response data
                // console.log('Shortened URL ID:', data.data.shortened_url);
            } else {
                throw new Error('Failed to shorten URL');
            }
        } catch (error) {
            console.error('Error during URL shortening:', error);
            // Handle the error
        }
    };





    return (
        <div className="flex">
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
            {selectedShortenedId && (
                <EditLinkModal selectedShortenedId={selectedShortenedId}
                               selectedOriginUrl={selectedOriginUrl}
                               selectedExpireDate={selectedExpireDate}
                               setSelectedShortenedId={updateSelectedLink}
                               userId={id} />
            )}
            <div className="w-2/3">
                {/* search block*/}
                <div className="bg-light my-2 mr-4 drop-shadow rounded-lg px-5 pt-5 h-fit">
                    <h1 className="pb-4">Shortened Link</h1>
                    <div className={`pb-4`} >
                        <input type="text"
                               value={searchLinks || ''}
                               onChange={ev => setSearchLinks(ev.target.value)}
                               placeholder="Search Original or Shortened URL"
                               className="bg-white flex-grow px-4 py-2 rounded-lg border-[1px] border-accentHover text-sm w-1/3"/>
                    </div>
                </div>

                {/* shortened block*/}
                <div className="overflow-y-scroll overscroll-auto bg-light my-4 mr-4 drop-shadow rounded-lg px-5 max-h-[800px]">
                    <div className="relative ">
                        {allLinks.map((link) => {
                            const CreatedAt = DateTime.fromISO(link.created_at).plus({hours: 7}).toFormat("dd MMM yyyy HH:mm");
                            const ExpiredAt = DateTime.fromISO(link.expired_at).plus({hours: 7}).toFormat("dd MMM yyyy HH:mm");
                            const rawOriginUrl = link.original_url;
                            const linkRegex = new RegExp(searchLinks, 'i');

                            let status = '';

                            const currentTime = DateTime.now();

                            if (link.expired_at !== null && (DateTime.fromISO(link.expired_at).plus({ hours: 7 }) < currentTime)) {
                                status = 'Expired';
                            } else if (link.deleted_at !== null) {
                                status = 'Deleted';
                            }

                            function correctOriginUrl (rawOriginUrl) {
                                const protocolRegex = /^(https?|ftp):\/\//;
                                if (!protocolRegex.test(rawOriginUrl)) {
                                    // If the URL does not have a protocol, prepend "http://" before redirecting
                                    return `http://${rawOriginUrl}`;
                                } else {
                                    // The URL already has a protocol, redirect as is
                                    return rawOriginUrl;
                                }
                            }

                            if (!searchLinks || linkRegex.test(link.original_url) || linkRegex.test(`${import.meta.env.VITE_API_BASE_URL}/${link.shortened_id}`)) {
                                return (
                                    <div className="border-[1px] border-accentHover my-4 p-4 rounded-lg flex-col pb-5" key={link.shortened_id} >
                                        <div className="flex flex-row items-center">
                                            <Tooltip title="Click to copy" arrow PopperProps={{placement: "top"}} >
                                                <h2 className="pb-2 cursor-pointer" onClick={() => {{
                                                    navigator.clipboard.writeText(`${import.meta.env.VITE_API_BASE_URL}/${link.shortened_id}`);
                                                    setToastMessage('Copied to clipboard');
                                                    handleToast();
                                                }}}>
                                                    <span className="text-accent">{import.meta.env.VITE_API_BASE_URL.replace(/^https?:\/\//, '')}</span>
                                                    <span>/{link.shortened_id}</span>
                                                </h2>
                                            </Tooltip>
                                            {/* each link tools */}
                                            <div className="flex absolute right-0 mr-6 space-x-2">
                                                <Tooltip title="Edit Link" arrow PopperProps={{placement: "top"}}>
                                                    <a onClick={()=>{setSelectedShortenedId(link.shortened_id);setSelectedExpireDate(link.expired_at);setSelectedOriginUrl(link.original_url)}}>
                                                        <svg xmlns="http://www.w3.org/2000/svg"
                                                             fill="none" viewBox="0 0 24 24"
                                                             strokeWidth="1.5"
                                                             stroke="white"
                                                             className=" w-7 h-7 bg-accent rounded-lg p-[5px] cursor-pointer">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                                                        </svg>
                                                    </a>
                                                </Tooltip>
                                                <Tooltip title="Open Origin URL" arrow PopperProps={{placement: "top"}}>
                                                    <a href={correctOriginUrl(link.original_url)} target="_blank">
                                                        <svg xmlns="http://www.w3.org/2000/svg"
                                                             fill="none"
                                                             viewBox="0 0 24 24"
                                                             strokeWidth="1.5"
                                                             stroke="white"
                                                             className=" w-7 h-7 bg-accent rounded-lg p-[5px] cursor-pointer">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                                        </svg>
                                                    </a>
                                                </Tooltip>
                                            </div>
                                        </div>

                                        <p>{link.original_url}</p>
                                        <div className="border-b-[1px] my-4"></div>
                                        <div className="flex items-center space-x-1 text-grey">
                                            <Tooltip title="Created At" arrow PopperProps={{placement: "top"}}>
                                                <div className="flex space-x-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                                         strokeWidth="2" stroke="#696cff" className="w-5 h-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                                    </svg>
                                                    <p>{CreatedAt}</p>
                                                </div>
                                            </Tooltip>
                                            {link.expired_at && (
                                                <Tooltip title="Expired At" arrow PopperProps={{placement: "top"}}>
                                                    <div className={`flex items-center space-x-1 pl-5 ${status === "Expired"? "text-red-500" : ""}`}>
                                                        <svg xmlns="http://www.w3.org/2000/svg"
                                                             fill="none"
                                                             viewBox="0 0 24 24"
                                                             strokeWidth="2"
                                                             stroke={ status === "Expired"? "red" : "#696cff"}
                                                             className="w-5 h-5">
                                                            <path strokeLinecap="round"
                                                                  strokeLinejoin="round"
                                                                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z"/>
                                                        </svg>
                                                        <p className={`${status === "Expired"? "text-red-500" : ""}`}>{ExpiredAt}</p>
                                                        {status === `Expired` && (
                                                            <p className="font-bold text-red-500 ">(Expired Link)</p>
                                                        )}
                                                    </div>
                                                </Tooltip>
                                            )}

                                        </div>

                                        <div className="">



                                        </div>
                                    </div>
                                )
                            }
                        })}
                    </div>
                </div>



            </div>

            <div className="w-1/3">
                {/*input original link*/}
                <div className="bg-light my-2 drop-shadow rounded-lg px-5 py-5 h-fit">
                    <h1 className="pb-4">Create New Link</h1>
                    <p className="pb-4">Enter your link below</p>
                    <form className="" onSubmit={handleSubmit}>
                        <div className="rounded-lg border-[1px] align-middle flex justify-end">
                            <div className="flex-grow">
                                <input
                                    className="p-4 text-sm w-full rounded-lg"
                                    type="text"
                                    value={newLink }
                                    placeholder="https://google.com"
                                    onChange={ev => {
                                        setNewLink(ev.target.value);
                                        setShortenedLink(null);
                                        setExpireDate(null);
                                    }}
                                />
                            </div>
                            <button className="ml-4 rounded-lg px-4 py-2 bg-accent text-white h-[40px] flex items-center self-center mr-2 ">
                                Create Link
                            </button>
                        </div>
                        <div className="mt-4 flex space-x-2">
                            <div className="flex-grow">
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <Stack spacing={1}>
                                        <ButtonDatePicker
                                            label={`Expire Date: ${
                                                expireDate == null ? 'NONE' : expireDate.format('MM/DD/YYYY - HH:mm')
                                            }`}
                                            value={expireDate}
                                            onChange={(newValue) => setExpireDate(newValue)}
                                        />
                                    </Stack>
                                </LocalizationProvider>
                            </div>
                            {expireDate && !shortenedLink && (
                                <Tooltip title="Cancel Expire Date" arrow PopperProps={{placement: "top"}}>
                                <div onClick={()=>{setExpireDate(null)}} >
                                    <svg xmlns="http://www.w3.org/2000/svg"
                                         fill="none"
                                         viewBox="0 0 24 24"
                                         strokeWidth="1.5"
                                         stroke="#696cff"
                                         className=" w-9 h-9 bg-white rounded-lg border-[1px] border-[#696cff] p-[5px] cursor-pointer">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                </Tooltip>
                            )}
                        </div>
                    </form>
                </div>
                {/*shorten option*/}

                {/*link preview*/}
                {shortenedLink && (
                    <animated.div id="shortened-link-preview" className="bg-light my-2 drop-shadow rounded-lg px-5 py-5 h-fit" style={fadeIn}>
                        <h2>Your Link Is Ready 🎉</h2>
                        <div className="bg-dark my-4 rounded-lg">
                            <img src={"https://i.imgur.com/Xej6z3I.jpg"} alt={previewTitle} className="mx-auto py-4 w-3/5" />
                        </div>
                        <Tooltip title="Click to copy" arrow PopperProps={{placement: "top"}}>
                            <div onClick={() => {navigator.clipboard.writeText(shortenedLink); setToastMessage("Copied to Clipboard!"); handleToast()}} className="cursor-pointer rounded-lg border-[1px] border-gray-200 py-3 flex text-accent">
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
                                <a className="">{shortenedLink}</a>
                            </div>
                        </Tooltip>
                    </animated.div>
                )}

                {/* QR code and info*/}
                {shortenedLink && (
                    <animated.div id="shortened-link-preview" className="bg-light my-2 drop-shadow rounded-lg px-5 py-5 h-fit" style={fadeIn}>
                        <div className="flex">
                            <h2>QR Code</h2>
                            <button className="rounded-lg px-4 py-2 bg-accent text-white text-sm h-[35px] flex items-center self-center absolute right-5"
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = `https://qrcode.tec-it.com/API/QRCode?data=${shortenedLink}&code=QRCode&translate-esc=true&dpi=300&color=%23696cff&imagetype=Png&eclevel=L`;
                                        link.download = 'qr-code.png';
                                        link.click();
                                    }}>Download PNG</button>
                        </div>
                        <div className="flex border-[1px] border-accent rounded-lg p-4 mt-4">
                            <img src={`https://qrcode.tec-it.com/API/QRCode?data=${shortenedLink}&code=QRCode&translate-esc=true&dpi=100&imagetype=Png&eclevel=L`}
                                 alt=""
                                 className="w-1/5"></img>
                            <div className="ml-2 items-center flex">
                                <div className="space-y-2">
                                    <div className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg"
                                             fill="none"
                                             viewBox="0 0 24 24"
                                             strokeWidth="2"
                                             stroke="#696cff"
                                             className="w-5 h-5 mx-4">
                                            <path strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"/>
                                        </svg>
                                        <p className="justify-self overflow-hidden overflow-ellipsis whitespace-nowrap max-w-[300px]">{newLink}</p>
                                    </div>
                                    <div className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg"
                                             fill="none"
                                             viewBox="0 0 24 24"
                                             strokeWidth="2"
                                             stroke="#696cff"
                                             className="w-5 h-5 mx-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p>{DateTime.fromISO(shortenedResult.created_at).plus({hours: 7}).toFormat("dd MMM yyyy hh:mm")}</p>
                                    </div>
                                    {shortenedResult.expired_at && (
                                        <div className="flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg"
                                                 fill="none"
                                                 viewBox="0 0 24 24"
                                                 strokeWidth="2"
                                                 stroke="#696cff"
                                                 className="w-5 h-5 mx-4">
                                                <path strokeLinecap="round"
                                                      strokeLinejoin="round"
                                                      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
                                            </svg>
                                            <p>{DateTime.fromISO(shortenedResult.expired_at).plus({hours: 7}).toFormat("dd MMM yyyy hh:mm")}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </animated.div>
                )}


            </div>

        </div>
    )
}