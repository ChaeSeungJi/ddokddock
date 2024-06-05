import React,{useEffect,useState} from 'react';
import {getMyPage} from '../apis/mypage';
import axios from 'axios';

const Mypage = () => {
  const [data,setData]=useState(null);
  const [loading,setLoading]=useState(true);


  useEffect(()=>{
    getMyPage().then((res)=>{
      console.log('API 응답:', res); // 응답 데이터 출력
      setData(res.data);
      setLoading(false);
    });

  },[]);



if(loading) return <div>로딩중</div>;
console.log(data);

  return( 

  <div>
    <div>name : {data?.name}</div>
    <div>학과 : {data?.major}</div>
  </div>
  );
};

export default Mypage;

