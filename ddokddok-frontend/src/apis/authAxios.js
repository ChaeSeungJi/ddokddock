import axios from "axios";
import { getNewRefreshToken } from '../apis/refresh';

export const getAuthAxios = (token) => {
    const authAxios = axios.create({
        baseURL: 'http://localhost:3050',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    authAxios.interceptors.response.use(
        (res) => res,
        async (error) => {
            if (error.response && error.response.status === 401) {
                // 토큰이 만료된 경우
                const { accessToken, refreshToken } = await getNewRefreshToken();
                error.config.headers.Authorization = `Bearer ${accessToken}`;
                localStorage.setItem('access', accessToken);
                localStorage.setItem('refresh', refreshToken);
                
                // 요청을 다시 시도
                return authAxios(error.config);
            }
            return Promise.reject(error);
        }
    );

    return authAxios;
};
