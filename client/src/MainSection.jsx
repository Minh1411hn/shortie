import {useContext, useEffect, useRef, useState} from "react";
import {UserContext} from "./UserContext.jsx";
import axios from "axios";
import Gravatar from 'react-gravatar';
import md5 from "blueimp-md5";
import Panel from "./components/Panel.jsx";
import SectionDashboard from "./sections/SectionDashboard.jsx";
import SectionCampaigns from "./sections/SectionCampaigns.jsx";
import SectionAPI from "./sections/SectionAPI.jsx";
import SectionLinks from "./sections/SectionLinks.jsx";
import SectionQRCodes from "./sections/SectionQRCodes.jsx";
import MenuButton from "./components/MenuButton.jsx";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import ProfileModal from "./components/ProfileModal.jsx";




export default function MainSection() {
    const {email,id,setId,setEmail,username,setUsername, avatar, setAvatar,apiKey } = useContext(UserContext);
    const [selectedSection, setSelectedSection] = useState('links');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [openProfile, setOpenProfile] = useState(false);

    const handleToast = () => {
        setShowToast(!showToast);
    };

    const handleOpenProfile = (state) => {
        setOpenProfile(state);
    };

    useEffect(() => {
        if (selectedSection === "qr codes" || selectedSection === "campaigns") {
            setToastMessage("This section is not yet available");
            handleToast();
        }
    }, [selectedSection]);


    return (
        <div className="flex h-screen">

            <Panel selectedSection={selectedSection} onClick={(selectedSection)=>{setSelectedSection(selectedSection)}}/>
            <Snackbar
                open={showToast}
                autoHideDuration={2000}
                onClose={handleToast}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleToast} severity="warning" sx={{ width: '100%' }} closeButton={false} >
                    {toastMessage}
                </Alert>
            </Snackbar>

            {openProfile &&
                <ProfileModal openProfile={openProfile}
                              setOpenProfile={handleOpenProfile}
                                        />
            }

            <div className="w-[87%] bg-dark align-center flex flex-col">
                <div className="w-[95%] mx-auto">

                    <div className="bg-light my-2 drop-shadow h-20 rounded-lg mb-10 mt-5 flex">
                        <div className="flex-row flex self-center">

                            <div className="flex items-center pl-5">
                                <h1 className="uppercase align-middle text-2xl font-medium">
                                    {selectedSection}
                                </h1>
                            </div>

                            <div className=" flex absolute right-4 self-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                     stroke="grey" className="w-7 h-7 self-center mr-4 cursor-pointer" onClick={()=>{setToastMessage("This section is not yet available");handleToast()}}>
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                          d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"/>
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                </svg>
                                <div className="self-center">
                                    <MenuButton setOpenProfile={handleOpenProfile}/>
                                </div>
                            </div>
                        </div>
                    </div>

                    {selectedSection === 'dashboard' && <SectionDashboard />}
                    {selectedSection === 'links' && <SectionLinks/>}
                    {selectedSection === 'qr codes' && <SectionQRCodes/>}
                    {selectedSection === 'campaigns' && <SectionCampaigns/>}
                    {selectedSection === 'api' && <SectionAPI/>}
                </div>
            </div>
        </div>
    )
}

