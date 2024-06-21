// src/Common/Sidebar.js
import React from 'react';
import { Link } from 'react-router-dom';
import './sidebar.css';

function Sidebar() {
    return (
        <aside className="sidebar">
            <ul>
                <li><Link to="/login">로그인</Link></li>
            </ul>
        </aside>
    );
}

export default Sidebar;
