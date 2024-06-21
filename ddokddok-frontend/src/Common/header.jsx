import React from 'react';
import logo from '../assets/logo.png';
import { Link } from 'react-router-dom';
import Studylist from '../Studylist/studylist_main';
import './header.css';

function Header() {
    return (
        <header className="header">
            <Link to="/">
                <img src={logo} alt="Logo" className="header-logo" />
            </Link>
            <nav className="header-nav">
                <ul>
                    <li><Link to="/studylist">스터디보기</Link></li>
                    <li><Link to="/qna">Q&A</Link></li>
                    <li><Link to="/mypage">마이페이지</Link></li>
                    <li className="header-right"><Link to="/login">로그인</Link></li>
                </ul>
            </nav>
        </header>
    );
}

export default Header;
