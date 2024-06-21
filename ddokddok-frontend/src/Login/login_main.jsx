import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';
import login from '../apis/login';

const LoginMain = () => {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleIdChange = (e) => {
        setId(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // 입력된 이메일과 비밀번호를 출력
        // 나중에 서버로 데이터를 전송 필요
        console.log('id:', id);
        console.log('Password:', password);
    };

    const handleRegisterClick = () => {
        navigate('/register');
    };


    const handleLoginClick = async () => {
        navigate('/mypage');
        console.log('id:', id);
        console.log('Password:', password);
    
          // 로그인 api 호출
        const result = await login(id, password);
        console.log('로그인 성공:', result);
    
        const { accessToken, refreshToken } = result; 
        localStorage.setItem('access', accessToken);
        localStorage.setItem('refresh', refreshToken);
        console.log('Navigating to /mypage');
     
        
    };

    return (
        <div>
            <div className="login-container">
                <h2>로그인</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="id">아이디</label>
                        <input
                            placeholder='아이디'
                            id="id"
                            value={id}
                            onChange={handleIdChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">비밀번호</label>
                        <input
                            placeholder='비밀번호'
                            type="password"
                            id="password"
                            value={password}
                            onChange={handlePasswordChange}
                            required
                        />
                    </div>
                    <button type="submit" onClick={handleLoginClick} className="login-button">로그인</button>
                </form>
                <button onClick={handleRegisterClick} className="register-button">
                    회원가입
                </button>
            </div>
        </div>
    );
};

export default LoginMain;
