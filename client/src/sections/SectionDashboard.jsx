import {useContext, useEffect, useState} from "react";
import { UserContext } from "../UserContext.jsx";
import axios from "axios";
import {DateTime} from "luxon";
import ReactApexChart from 'react-apexcharts';
import ClicksChart from "../components/ClicksChart.jsx";
import DevicesChart from "../components/DevicesChart.jsx";

export default function SectionDashboard(props) {
    const { email, username,id, avatar } = useContext(UserContext);
    const [allLinksStats, setAllLinksStats] = useState([]);
    const [totalClicks, setTotalClicks] = useState(null);
    const [activeLinks, setActiveLinks] = useState(0);
    const [expiredLinks, setExpiredLinks] = useState(0);
    const [totalEvents, setTotalEvents] = useState([]);



    useEffect(() => {
        const fetchLinksStats = async () => {
            try {
                const response = await axios.post(`/links/statistics`, { user_id: id });
                if (response.status === 200) {
                    setAllLinksStats(response.data); // Assign response.data.data to allLinks
                    setTotalClicks(response.data.reduce((acc, obj) => acc + obj.clicks_count, 0))

                    const active = response.data.reduce((count, item) => {
                        if (item.status === "active") {
                            return count + 1;
                        }
                        return count;
                    }, 0);
                    setActiveLinks(active);

                    const expired = response.data.reduce((count, item) => {
                        if (item.status === "expired") {
                            return count + 1;
                        }
                        return count;
                    }, 0);
                    setExpiredLinks(expired);
                }
            } catch (error) {
                console.error('Error getting all links', error);
                // Handle the error
            }
        };
        fetchLinksStats();
    },[])



    return (
            <div className="flex h-[350px]">
                <div className="w-[60%] mr-8 h-full">
                    {/*BASIC STATS*/}
                    <div className="bg-light my-2 mb-6 drop-shadow rounded-lg p-5 pb-7 h-fit flex-grow ">
                        <h1 className="pb-6">
                            Overall Stats
                        </h1>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="flex">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#F3B03E"
                                     className="w-12 h-12 bg-[#FEF9F0] rounded-lg p-2">
                                    <path fill-rule="evenodd" d="M12 1.5a.75.75 0 01.75.75V4.5a.75.75 0 01-1.5 0V2.25A.75.75 0 0112 1.5zM5.636 4.136a.75.75 0 011.06 0l1.592 1.591a.75.75 0 01-1.061 1.06l-1.591-1.59a.75.75 0 010-1.061zm12.728 0a.75.75 0 010 1.06l-1.591 1.592a.75.75 0 01-1.06-1.061l1.59-1.591a.75.75 0 011.061 0zm-6.816 4.496a.75.75 0 01.82.311l5.228 7.917a.75.75 0 01-.777 1.148l-2.097-.43 1.045 3.9a.75.75 0 01-1.45.388l-1.044-3.899-1.601 1.42a.75.75 0 01-1.247-.606l.569-9.47a.75.75 0 01.554-.68zM3 10.5a.75.75 0 01.75-.75H6a.75.75 0 010 1.5H3.75A.75.75 0 013 10.5zm14.25 0a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H18a.75.75 0 01-.75-.75zm-8.962 3.712a.75.75 0 010 1.061l-1.591 1.591a.75.75 0 11-1.061-1.06l1.591-1.592a.75.75 0 011.06 0z" clip-rule="evenodd" />
                                </svg>
                                <div className=" flex flex-col ml-4 ">
                                    <p className="font-light">Total Clicks</p>
                                    <h1 className="font-bold text-2xl">{totalClicks}</h1>
                                </div>
                            </div>

                            <div className="flex">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#8DDA55"
                                     className="w-12 h-12 bg-[#F6FDF2] rounded-lg p-2">
                                    <path fill-rule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />
                                </svg>
                                <div className=" flex flex-col ml-4 ">
                                    <p className="font-light">Active Links</p>
                                    <h1 className="font-bold text-2xl">{activeLinks}</h1>
                                </div>
                            </div>

                            <div className="flex">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#58C0E8"
                                     className="w-12 h-12 bg-[#F2FBFE] rounded-lg p-2">
                                    <path fill-rule="evenodd" d="M2.25 2.25a.75.75 0 000 1.5H3v10.5a3 3 0 003 3h1.21l-1.172 3.513a.75.75 0 001.424.474l.329-.987h8.418l.33.987a.75.75 0 001.422-.474l-1.17-3.513H18a3 3 0 003-3V3.75h.75a.75.75 0 000-1.5H2.25zm6.54 15h6.42l.5 1.5H8.29l.5-1.5zm8.085-8.995a.75.75 0 10-.75-1.299 12.81 12.81 0 00-3.558 3.05L11.03 8.47a.75.75 0 00-1.06 0l-3 3a.75.75 0 101.06 1.06l2.47-2.47 1.617 1.618a.75.75 0 001.146-.102 11.312 11.312 0 013.612-3.321z" clip-rule="evenodd" />
                                </svg>
                                <div className=" flex flex-col ml-4">
                                    <p className="font-light">Total Campaigns</p>
                                    <h1 className="font-bold text-2xl">0</h1>
                                </div>
                            </div>

                            <div className="flex">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#EB5032"
                                     className="w-12 h-12 bg-[#FDF1EF] rounded-lg p-2">
                                    <path fill-rule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clip-rule="evenodd" />
                                </svg>
                                <div className=" flex flex-col ml-4">
                                    <p className="font-light">Expired Links</p>
                                    <h1 className="font-bold text-2xl">{expiredLinks}</h1>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* CLICKS CHART */}
                    <div className="flex h-full ">
                        <div className="bg-light my-2 mr-8 drop-shadow rounded-lg p-5 w-[55%]">
                            <h1 className="">Clicks Chart</h1>
                            <div className="">
                                <ClicksChart id={id}/>
                            </div>
                        </div>

                        <div className="bg-light my-2 drop-shadow rounded-lg p-5 w-[45%]">
                            <h1 className="">Devices</h1>
                            <div className="mt-8">
                                <DevicesChart />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-[40%] h-full">
                    {/*TOP LINKS*/}
                    <div className="bg-light mt-2 drop-shadow rounded-lg p-5 pb-7">
                        <h1>
                            Top Links
                        </h1>
                        {!allLinksStats.length == 0 && (
                            <div className="flex">
                                <p className="mx-auto justify-center items-center">No Data</p>
                            </div>
                        )}
                        {allLinksStats.length > 0 && (
                            <div className="pt-6">
                                {allLinksStats.filter((link) => link.clicks_count > 0).slice(0, 7).map((link) => {
                                    return (
                                        <div className="py-4 flex-col" key={link.shortened_id} >
                                            <div className="flex flex-col">
                                                <div className="flex justify-between ">
                                                    <div className="flex flex-col col-span-2">
                                                        <div className="flex ">
                                                            <img src={`https://www.google.com/s2/favicons?domain=${link.original_url}&sz=256`} alt="" className="w-5 h-5 self-center ml-2 mr-5 "/>
                                                            <div>
                                                                <p className="text-sm">{link.original_url}</p>
                                                                <div >
                                                                    <p className=" cursor-pointer text-xs text-accent" onClick={() => {{
                                                                        navigator.clipboard.writeText(`${import.meta.env.VITE_API_BASE_URL}/${link.shortened_id}`);
                                                                        setToastMessage('Copied to clipboard');
                                                                        handleToast();
                                                                    }}}>
                                                                        <span className="">{import.meta.env.VITE_API_BASE_URL.replace(/^https?:\/\//, '')}</span>
                                                                        <span>/{link.shortened_id}</span>
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="self-center justify-self-end flex ">
                                                        <p>{link.clicks_count}</p>
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                                             fill="currentColor" className="w-5 h-5 ml-2">
                                                            <path fill-rule="evenodd"
                                                                  d="M12 1.5a.75.75 0 01.75.75V4.5a.75.75 0 01-1.5 0V2.25A.75.75 0 0112 1.5zM5.636 4.136a.75.75 0 011.06 0l1.592 1.591a.75.75 0 01-1.061 1.06l-1.591-1.59a.75.75 0 010-1.061zm12.728 0a.75.75 0 010 1.06l-1.591 1.592a.75.75 0 01-1.06-1.061l1.59-1.591a.75.75 0 011.061 0zm-6.816 4.496a.75.75 0 01.82.311l5.228 7.917a.75.75 0 01-.777 1.148l-2.097-.43 1.045 3.9a.75.75 0 01-1.45.388l-1.044-3.899-1.601 1.42a.75.75 0 01-1.247-.606l.569-9.47a.75.75 0 01.554-.68zM3 10.5a.75.75 0 01.75-.75H6a.75.75 0 010 1.5H3.75A.75.75 0 013 10.5zm14.25 0a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H18a.75.75 0 01-.75-.75zm-8.962 3.712a.75.75 0 010 1.061l-1.591 1.591a.75.75 0 11-1.061-1.06l1.591-1.592a.75.75 0 011.06 0z"
                                                                  clip-rule="evenodd"/>
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
    )
}