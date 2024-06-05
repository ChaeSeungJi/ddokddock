/*
import axios from "axios";
import { getAuthAxios } from "./authAxios";
import { getNewRefreshToken } from "./refresh";


//export const getMyPage=async ()=>{
export const getMyPage=async ()=>{
    const access=localStorage.getItem('access');

    const authAxios=getAuthAxios(access);

    const result=await authAxios.get('/mypage');
    return result.data;
};

*/

import axios from 'axios';
import { getAuthAxios } from './authAxios';
import { getNewRefreshToken } from './refresh';

export const getMyPage = async () => {
    const access = localStorage.getItem('access');
    const authAxios = getAuthAxios(access);

    try {
        const result = await authAxios.get('/mypage');
        return result.data;
    } catch (error) {
        console.error('마이페이지 호출 실패:', error.response ? error.response.data : error.message);
        throw error;
    }
};