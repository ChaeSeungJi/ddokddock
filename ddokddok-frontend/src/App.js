import React from 'react';
// npm install react-router-dom
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './Common/header';

import Home from './Home/home_main';
import Login from './Login/login_main';
import Register from './Register/register_main';

import Studylist from './Studylist/studylist_main';
import QnA from './QnA/qna_main';
import Mypage from './Mypage/mypage_main';
import './App.css';

function App() {
  return (
    <div className="App">
      <Router>
        <Header />
        <div className="main-container">
          <div className="content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/studylist" element={<Studylist />} />
              <Route path="/qna" element={<QnA />} />
              <Route path="/mypage" element={<Mypage />} />
            </Routes>
            </div>
        </div>
      </Router>
    </div>
  );
}

export default App;
