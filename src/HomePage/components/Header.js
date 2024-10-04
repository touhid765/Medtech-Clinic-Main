import React from 'react';
import './Header.css';
import { Link } from 'react-router-dom';

function Header() {
    return (
        <header className="header">
            <div className="header-top">
                <h1>MedTech Clinic</h1>
                <nav>
                    <ul>
                        <li><Link to="/patient-login">Patient Login</Link></li>
                        <li><Link to="/doctor-login">Doctor Login</Link></li>
                        <li><Link to="/clinic-login">Clinic Login</Link></li>
                    </ul>
                </nav>
            </div> 
        </header>
    );
}

export default Header;
