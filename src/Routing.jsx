import React from 'react'
import { Navbar } from "./Components/Navbar.jsx";
import Home from './Pages/Home.jsx';

export const Routing = () => {
  return (
    <div className='overflow-x-hidden'>
      <div className="App">
        <Navbar className="row" />
      </div>
      <div className="row">
        <Home/>
      </div>
    </div>
  );
}