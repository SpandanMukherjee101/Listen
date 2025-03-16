import React from 'react'
import { Navbar } from "../Components/Navbar";

const Profile = () => {
  return (
    <>
      <Navbar/>
      <button onClick={()=>{localStorage.removeItem('token'); window.location.reload();}}>logout</button>
    </>
  )
}

export default Profile