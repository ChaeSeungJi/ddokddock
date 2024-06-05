/*
import axios from 'axios';

export const login=async(studentNum,password)=>{
    const result=await axios.post('http://localhost:3050/login',{studentNum,password});
    return result.data.data;
}

export default login;

*/

import axios from 'axios';

export const login = async (studentNum, password) => {
    try {
        const result = await axios.post('http://localhost:3050/login', { studentNum, password });
        return result.data.data;
    } catch (error) {
        console.error('로그인 실패:', error.response ? error.response.data : error.message);
        throw error;
    }
}

export default login;