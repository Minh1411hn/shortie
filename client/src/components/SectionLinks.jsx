import {useContext, useEffect, useRef, useState} from "react";
import { UserContext } from "../UserContext.jsx";
import axios from "axios";
import { toPng } from 'html-to-image';
import { useSpring, animated } from 'react-spring';


export default function SectionLinks() {
    const [newLink, setNewLink] = useState('');
    const {email,id,setId,setEmail,username,setUsername, avatar, setAvatar } = useContext(UserContext);
    const [shortenedLink, setShortenedLink] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [previewTitle, setPreviewTitle] = useState(null);
    const [previewDescription, setPreviewDescription] = useState(null);
    const [totalClicks, setTotalClicks] = useState(0);
    const [allLinks, setAllLinks] = useState([]);

    const fadeIn = useSpring({
        opacity: shortenedLink ? 1 : 0,
        from: { opacity: 0 },
        config: { duration: 700 },
    });


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.post(`/links`, { user_id: id });
                if (response.status === 200) {
                    setAllLinks(response.data); // Assign response.data.data to allLinks
                    console.log(response.data);
                }
            } catch (error) {
                console.error('Error getting all links', error);
                // Handle the error
            }
        };
        fetchData();
    }, [shortenedLink]);




    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await axios.post('/shorten', { long_url: newLink, user_id: id });


            if (response.status === 201) {
                setShortenedLink(`${import.meta.env.VITE_API_BASE_URL}/${response.data.shortened_id}`);
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
            <div className="w-2/3">
                <div className="bg-light my-2 mr-4 drop-shadow rounded-lg px-5 pt-5 h-fit">
                    <h1 className="pb-4">Shortened Link</h1>
                </div>

                <div className="overflow-y-scroll overscroll-auto bg-light my-4 mr-4 drop-shadow rounded-lg px-5">
                    <div className="relative h-[500px]">
                        {allLinks.map((link) => {
                            return (
                                <div className="border-[1px] border-accentHover my-4 p-4 rounded-lg flex-col pb-5" key={link.id}>
                                    <h2>
                                        <span className="text-accent">{import.meta.env.VITE_API_BASE_URL}</span>
                                        <span>/{link.shortened_id}</span>
                                    </h2>
                                    <div>{link.original_url}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>



            </div>

            <div className="w-1/3">
                <div className="bg-light my-2 drop-shadow rounded-lg px-5 pt-5 h-44">
                    <h1 className="pb-4">Create New Link</h1>
                    <p className="pb-4">Enter your link below</p>
                    <form className="rounded-lg border-[1px] align-middle flex justify-end" onSubmit={handleSubmit}>
                        <div className="flex-grow">
                            <input
                                className="p-4 text-sm w-full rounded-lg"
                                type="text"
                                value={newLink}
                                placeholder="https://google.com"
                                onChange={ev => {
                                    setNewLink(ev.target.value);
                                    setShortenedLink(null);
                                }}
                            />
                        </div>
                        <button className="ml-4 rounded-lg px-4 py-2 bg-accent text-white h-[40px] flex items-center self-center mr-2">
                            Create Link
                        </button>
                    </form>
                </div>

                {shortenedLink && (
                    <animated.div id="shortened-link-preview" className="bg-light my-2 drop-shadow rounded-lg px-5 py-5 h-fit" style={fadeIn}>
                        <h2>Your Link Is Ready 🎉</h2>
                        <div className="bg-dark my-4 rounded-lg">
                            <img src={"https://i.imgur.com/Xej6z3I.jpg"} alt={previewTitle} className="mx-auto py-4 w-4/5" />
                        </div>
                        <div onClick={() => {navigator.clipboard.writeText(shortenedLink);}} className="cursor-pointer rounded-lg border-[1px] border-gray-200 py-3 flex text-accent">
                            <svg xmlns="http://www.w3.org/2000/svg"
                                 fill="none"
                                 viewBox="0 0 24 24"
                                 stroke-width="1.5"
                                 stroke="currentColor"
                                 className="w-6 h-6 mx-4">
                                <path stroke-linecap="round"
                                      stroke-linejoin="round"
                                      d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"/>
                            </svg>
                            <a className="">{shortenedLink}</a>
                        </div>
                    </animated.div>
                )}

                {shortenedLink && (
                    <animated.div id="shortened-link-preview" className="bg-light my-2 drop-shadow rounded-lg px-5 py-5 h-fit" style={fadeIn}>
                        <div className="flex">
                            <h2>QR Code</h2>
                            <button className="rounded-lg px-4 py-2 bg-accent text-white h-[40px] flex items-center self-center"
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = `https://qrcode.tec-it.com/API/QRCode?data=${shortenedLink}&code=QRCode&translate-esc=true&dpi=300&color=%23696cff&imagetype=Png&eclevel=L`;
                                        link.download = 'qr-code.png';
                                        link.click();
                                    }}>Download PNG</button>
                        </div>
                        <div className="flex border-[1px] border-accent rounded-lg p-4 mt-4">
                            <img src={`https://qrcode.tec-it.com/API/QRCode?data=${shortenedLink}&code=QRCode&translate-esc=true&dpi=100&color=%23696cff&imagetype=Png&eclevel=L`}
                                 alt=""
                                 className="w-1/4"></img>
                            <div className="ml-4 items-center">
                                <div className="flex">
                                    <svg xmlns="http://www.w3.org/2000/svg"
                                         fill="none"
                                         viewBox="0 0 24 24"
                                         stroke-width="1.5"
                                         stroke="currentColor"
                                         className="w-6 h-6 mx-4">
                                        <path stroke-linecap="round"
                                              stroke-linejoin="round"
                                              d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"/>
                                    </svg>
                                    <p className="justify-self">{newLink}</p>
                                </div>

                                <div className="flex">
                                    <svg xmlns="http://www.w3.org/2000/svg"
                                         fill="none"
                                         viewBox="0 0 24 24"
                                         stroke-width="1.5"
                                         stroke="currentColor"
                                         className="w-6 h-6 mx-4">
                                        <path stroke-linecap="round"
                                              stroke-linejoin="round"
                                              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
                                    </svg>
                                    <p>DATE TIME</p>
                                </div>
                            </div>
                        </div>
                    </animated.div>
                )}


            </div>

        </div>
    )
}