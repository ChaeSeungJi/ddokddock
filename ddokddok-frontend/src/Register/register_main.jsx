import React, { useState } from 'react';
import './styles.css';

const RegisterMain = () => {
    const [nickname, setNickname] = useState('');
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    
    const handleNicknameChange = (e) => {
        setNickname(e.target.value);
    };
    
    const handleIdChange = (e) => {
        setId(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // 입력된 정보를 출력
        console.log('nickname:', nickname);
        console.log('id:', id);
        console.log('Password:', password);
    };

    return (
        <div>
            <div className="register-container">
                <h2>회원가입</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="id">닉네임</label>
                        <input
                            placeholder='닉네임'
                            id="nickname"
                            value={nickname}
                            onChange={handleNicknameChange}
                            required
                        />
                    </div>
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


                    <button type="submit" className="register-button">가입하기</button>
                </form>
            </div>
        </div>
    );
};

export default RegisterMain;
