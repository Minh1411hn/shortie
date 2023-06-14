import { useContext, useState } from "react";
import { UserContext } from "../UserContext.jsx";
import LogoImg from "../assets/logo.svg";

function Panel({ setSelectedSection, selectedSection, onClick }) {

    const handlePanelSectionClick = (section) => {
        onClick(section);
    };

    return (
        <div className="w-[13%] bg-light ">
            <div className="mx-auto bg-white rounded-full mt-4 flex items-center ml-5 py-2">
                <img src={LogoImg} alt="" width="35px" className="p-2" />
                <span className=" text-grey font-bold text-[27px] align-middle">shortie</span>
            </div>
            <div className="flex-grow overflow-y-auto">
                <div className="flex flex-col flex-grow">

                    {/*DASHBOARD*/}
                    <div className={`flex items-center px-3 h-10 mx-3 my-2 rounded-lg cursor-pointer ${selectedSection === 'dashboard' ? "text-accent bg-accentHover" : "text-grey"}`} onClick={()=> {handlePanelSectionClick('dashboard')}}>
                        <div className="flex-shrink-0 flex-grow-0">
                            <svg xmlns="http://www.w3.org/2000/svg"
                                 fill="none"
                                 viewBox="0 0 24 24"
                                 strokeWidth="1.5"
                                 stroke="currentColor"
                                 className="w-6 h-6">
                                <path strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/>
                            </svg>
                        </div>
                        <span className={`flex-shrink-0 flex-grow ml-2 text-sm font-semibold`}>
                            Dashboard
                        </span>
                    </div>

                    {/*LINKS*/}
                    <div className={`flex items-center px-3 h-10 mx-3 my-2 rounded-lg cursor-pointer ${selectedSection === 'links' ? "text-accent bg-accentHover" : "text-grey"}`} onClick={()=> {handlePanelSectionClick('links')}}>
                        <div className="flex-shrink-0 flex-grow-0">
                            <svg xmlns="http://www.w3.org/2000/svg"
                                 fill="none"
                                 viewBox="0 0 24 24"
                                 strokeWidth="1.5"
                                 stroke="currentColor"
                                 className="w-6 h-6">
                                <path strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"/>
                            </svg>
                        </div>
                        <span className="flex-shrink-0 flex-grow ml-2 text-sm font-semibold">
                            Links
                        </span>
                    </div>

                    {/*QR CODES*/}
                    <div className={`flex items-center px-3 h-10 mx-3 my-2 rounded-lg cursor-pointer ${selectedSection === 'qr codes' ? "text-accent bg-accentHover" : "text-grey"}`} onClick={()=> {handlePanelSectionClick('qr codes')}}>
                        <div className="flex-shrink-0 flex-grow-0">
                            <svg xmlns="http://www.w3.org/2000/svg"
                                 fill="none"
                                 viewBox="0 0 24 24"
                                 strokeWidth="1.5"
                                 stroke="currentColor"
                                 className="w-6 h-6">
                                <path strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z"/>
                                <path strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z"/>
                            </svg>
                        </div>
                        <span className="flex-shrink-0 flex-grow ml-2 text-sm font-semibold">
                            QR Codes
                        </span>
                    </div>

                    {/*CAMPAIGNS*/}
                    <div className={`flex items-center px-3 h-10 mx-3 my-2 rounded-lg cursor-pointer ${selectedSection === 'campaigns' ? "text-accent bg-accentHover" : "text-grey"}`} onClick={()=> {handlePanelSectionClick('campaigns')}}>
                        <div className="flex-shrink-0 flex-grow-0">
                            <svg xmlns="http://www.w3.org/2000/svg"
                                 fill="none"
                                 viewBox="0 0 24 24"
                                 strokeWidth="1.5"
                                 stroke="currentColor"
                                 className="w-6 h-6">
                                <path strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"/>
                            </svg>
                        </div>
                        <span className="flex-shrink-0 flex-grow ml-2 text-sm font-semibold">
                            Campaigns
                        </span>
                    </div>

                    {/*CUSTOM LINKS*/}
                    <a className={`flex items-center px-3 h-10 mx-3 my-2 rounded-lg cursor-pointer ${selectedSection === 'custom link' ? "text-accent bg-accentHover" : "text-grey"}`} href={'https://documenter.getpostman.com/view/21834131/2s93sf3Wjk'} target="_blank">
                        <div className="flex-shrink-0 flex-grow-0">
                            <svg xmlns="http://www.w3.org/2000/svg"
                                 fill="none"
                                 viewBox="0 0 24 24"
                                 strokeWidth="1.5"
                                 stroke="currentColor"
                                 className="w-6 h-6">
                                <path strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33"/>
                            </svg>
                        </div>
                        <span className="flex-shrink-0 flex-grow ml-2 text-sm font-semibold">
                            API
                        </span>
                    </a>

                </div>
            </div>
        </div>
    )}

export default Panel;