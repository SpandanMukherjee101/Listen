import React, { useState } from 'react';
import { Link } from 'react-router-dom'
import profIcon from '../prof-icon.png'
import '../Styles/Navbar.css'

export const Navbar = () => {
    const [ str, setStr]= useState('')
    const search= (e)=>{
        setStr(e.target.value)
    }
  return (
    <nav className="navbar navbar-expand-lg">
        <div className="container-fluid d-flex justify-content-between">
            <div className="navbar-brand d-flex"><Link className="text-decoration-none l" to="/"><h1><span className="sqz">&#119070;</span>Listen<span className="sqzRev">&#119070;</span></h1></Link></div>
            <div className="input-group  w-25">
              <input className="form-control border border-info" id="searchBox" type="text" placeholder="Search song or listner" aria-label="search" aria-describedby="searchIcon" value={str} onChange={search}/>
              <button className="btn btn-outline-info" type="button" id="searchIcon">&#128270;</button>
            </div>
            <Link to="/profile"><img src={profIcon} alt='Profile-Icon'/></Link>
        </div>
    </nav>
  )
}