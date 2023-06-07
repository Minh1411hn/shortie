import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.jsx';
import { BrowserRouter as Router } from 'react-router-dom';
import { UserContextProvider } from './UserContext';
import './index.css';

ReactDOM.render(
    <React.StrictMode>
        <Router>
            <UserContextProvider>
                <App />
            </UserContextProvider>
        </Router>
    </React.StrictMode>,
    document.getElementById('root')
);
