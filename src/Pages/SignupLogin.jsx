import React, { createContext, useState } from 'react'
import { Login } from "../Components/Login.jsx";
import { Signup } from "../Components/Signup.jsx";
import Aurora from "../Components/Aurora.jsx"
import '../Styles/SignupLogin.css'

export const isRegisteredStateContext = createContext();

export const SignupLogin = () => {
  const [isRegistered, setRegistration] = useState(1);
  return (
    <isRegisteredStateContext.Provider value={{isRegistered, setRegistration}}>
      <div className="row vw-100 vh-100 m-0 p-0 bg-black">
        <div className="col-4 vh-100 p-0">
          <div className="bg vh-100 p-0 d-flex justify-content-center align-items-center">
            <div className="box w-50 border border-info rounded-5 d-flex justify-content-center align-items-center">
              {isRegistered?<Login />:<Signup />}
            </div>
          </div>
        </div>
        <Aurora />
      </div>
    </isRegisteredStateContext.Provider>
  )
}