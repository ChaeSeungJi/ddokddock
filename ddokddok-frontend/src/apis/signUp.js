import axios from 'axios';

export const signUp=async (id,pw,name,age)=>{
    const result=await axios.post('http://localhost:3050/signup',{
        studentNum,
        password,
        email,
        name,
        age,
    });
    return result.data;
};