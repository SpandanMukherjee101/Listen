import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { Routing } from './Routing.jsx';
import Profile from "./Pages/Profile.jsx";
import { SignupLogin } from './Pages/SignupLogin.jsx';

function App() {
  const token = localStorage.getItem('token');

  return (
    <Routes>
      <Route path="/" element={token ? <Routing /> : <Navigate to="/login" />} />
      <Route path='/profile' element={token ? <Profile /> : <Navigate to="/login" />} />
      <Route path='/login' element={token ? <Navigate to="/" /> : <SignupLogin />} />
    </Routes>
  );
}

export default App;