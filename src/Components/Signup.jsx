import React, { useContext, useReducer } from 'react'
import axios from 'axios'
import { isRegisteredStateContext } from '../Pages/SignupLogin'
import "../Styles/Login.css"

export const Signup = () => {
    const signupUrl = 'http://localhost:8000/api/signup'

    const {setRegistration} = useContext(isRegisteredStateContext);

    const reducer = (state, action) => {        
        return {
            ...state,
            [action.field]: action.value,
        };
    };

    const [formData, dispatch] = useReducer(reducer, {
        uid: "",
        name: "",
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        const action = {
            field: e.target.name,
            value: e.target.value,
        };
        dispatch(action);
    };

    const Signup = async () => {
        try {
            await axios.post(signupUrl, formData)
                .then((res) => {
                    localStorage.setItem('token', res.data);
                    window.location.reload();
                })
                .catch((err) => {
                    switch (err.status) {
                        case 404:
                            alert(err.response.data)
                            break;
                        case 409:
                            setRegistration(1)
                            break;

                        default:
                            console.log(err.response.data)
                            break;
                    }
                })
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <div className='h-100'>
            <h1 className="text-center mt-5 mb-3 text-info">
                Enter Your Details:
            </h1>
            <div className='d-flex justify-content-center align-items-center'>
                <div>
                    <h5 className='mt-3 text-info'>Userid:</h5>
                    <input className="form-control sign-form border border-info text-info" type="text" name="uid" value={formData.uid} onChange={handleChange} placeholder='Enter a unique id' />
                    <h5 className='mt-3 text-info'>Name:</h5>
                    <input className="form-control sign-form border border-info text-info" type="text" name="name" value={formData.name} onChange={handleChange} placeholder='Enter your name' />
                    <h5 className='mt-3 text-info'>Email:</h5>
                    <input className="form-control sign-form border border-info text-info" type="text" name="email" value={formData.email} onChange={handleChange} placeholder='Enter valid e-mail' />
                    <h5 className='mt-3 text-info'>Password:</h5>
                    <input className="form-control sign-form border border-info text-info" type="password" name="password" value={formData.password} onChange={handleChange} placeholder='Enter correct password' />
                    <div className="d-flex justify-content-center align-items-center"><button className="btn btn-outline-info mt-5 mb-5" onClick={Signup}>Signup</button></div>
                </div>
            </div>
        </div>
    )
}
