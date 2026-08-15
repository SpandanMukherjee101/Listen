import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './Pages/Home.jsx';
import { Profile } from './Pages/Profile.jsx';
import { SignupLogin } from './Pages/SignupLogin.jsx';
import { MusicPlayerProvider } from './Context/MusicPlayerContext.jsx';
import { MusicPlayerBar } from './Components/MusicPlayerBar.jsx';
import './App.css';

export const App = () => {
    const token = localStorage.getItem('token');

    return (
        <MusicPlayerProvider>
            <div className="app-container" >
                <Routes>
                    <Route path="/" element={token ? <Home /> : <Navigate to="/login" />} />
                    <Route path="/profile" element={token ? <Profile /> : <Navigate to="/login" />} />
                    <Route path="/login" element={token ? <Navigate to="/" /> : <SignupLogin />} />
                </Routes>
                {token && <MusicPlayerBar />}
            </div>
        </MusicPlayerProvider>
    );
};

export default App;