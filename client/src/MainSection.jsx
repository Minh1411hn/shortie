import {useContext, useEffect, useRef, useState} from "react";
import {UserContext} from "./UserContext.jsx";
import axios from "axios";
import Gravatar from 'react-gravatar';
import Panel from "./components/Panel.jsx";
import SectionDashboard from "./sections/SectionDashboard.jsx";
import SectionCampaigns from "./sections/SectionCampaigns.jsx";
import SectionCustomLink from "./sections/SectionCustomLink.jsx";
import SectionLinks from "./sections/SectionLinks.jsx";
import SectionQRCodes from "./sections/SectionQRCodes.jsx";



function Dashboard(props) {
    return null;
}

export default function MainSection() {
    const {email,id,setId,setEmail,username,setUsername, avatar, setAvatar } = useContext(UserContext);
    const [selectedSection, setSelectedSection] = useState('links');



    return (
        <div className="flex h-screen">

            <Panel selectedSection={selectedSection} onClick={(selectedSection)=>{setSelectedSection(selectedSection)}}/>

            <div className="w-[87%] bg-dark align-center flex flex-col">
                <div className="w-[95%] mx-auto">
                    <div className="bg-light my-2 drop-shadow h-20 rounded-lg mb-10">topbar</div>
                    {selectedSection === 'dashboard' && <SectionDashboard />}
                    {selectedSection === 'links' && <SectionLinks/>}
                    {selectedSection === 'qrcodes' && <SectionQRCodes/>}
                    {selectedSection === 'campaigns' && <SectionCampaigns/>}
                    {selectedSection === 'customlink' && <SectionCustomLink/>}
                </div>
            </div>
        </div>
    )
}

