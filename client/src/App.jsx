import axios from "axios";
import {UserContextProvider} from "./UserContext";
import Routes from "./Routes";
import './App.css';
import './index.css';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
// import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
    axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
    axios.defaults.withCredentials = true;
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <UserContextProvider>
                <Routes/>
            </UserContextProvider>
        </LocalizationProvider>
    )
}

export default App
