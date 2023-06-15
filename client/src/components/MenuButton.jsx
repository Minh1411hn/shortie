import {useContext, useEffect, useRef, useState} from "react";
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { createTheme } from '@mui/material/styles';
import {UserContext} from "../UserContext.jsx";
import Gravatar from "react-gravatar";
import {ThemeProvider} from "@mui/system";
import axios from "axios";

export default function MenuButton({setOpenProfile}) {
    const {email,id,setId,setEmail,username,setUsername, avatar, setAvatar} = useContext(UserContext);
    const [anchorEl, setAnchorEl] = useState(null);

    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const theme = createTheme({
        status: {
            danger: '#e53e3e',
        },
        palette: {
            primary: {
                main: '#5A697D',
                darker: '#5A697D',
            },
            secondary: {
                main: '#EA3323',
            },
            neutral: {
                main: '#64748B',
                contrastText: '#fff',
            },
        },
    });

    function logout() {
        axios.post('/api/logout',).then(()=> {
            setId(null);
            setEmail(null);
        });
    }


    return(
        <div>
            <ThemeProvider theme={theme}>
                <Button
                    id="basic-button"
                    color="primary"
                    aria-controls={open ? 'basic-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handleClick}
                    endIcon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                  strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
                    </svg>
                    }
                >
                    <Gravatar email={email} className="w-8 h-8 rounded-full mr-2"/>
                    {username}
                </Button>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}

                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
            >
                <MenuItem onClick={()=>{handleClose();setOpenProfile(true)}}>Profile</MenuItem>
                <MenuItem onClick={()=>{handleClose();logout()}} sx={{color: "red"}}>Logout</MenuItem>
            </Menu>
            </ThemeProvider>
        </div>
    )
}