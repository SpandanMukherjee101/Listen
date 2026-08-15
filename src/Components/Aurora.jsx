import React from 'react';
import '../Styles/Aurora.css';

export const Aurora = () => {
    return (
        <div className="col-12 col-lg-8 d-none d-lg-flex justify-content-center align-items-center p-0">
            <div className="content h-25">
                <h1 className="title h-100 m-0">
                    Welcome to 𝄞Listen𝄞
                    <div className="aurora">
                        <div className="aurora__item"></div>
                        <div className="aurora__item"></div>
                        <div className="aurora__item"></div>
                        <div className="aurora__item"></div>
                    </div>
                </h1>
            </div>
        </div>
    );
};

export default Aurora;