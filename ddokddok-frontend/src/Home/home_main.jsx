import React, { useState } from 'react';
// npm install react-select
import Select from 'react-select';
// npm install react-syntax-highlighter
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// npm install react-syntax-highlighter prism-react-renderer
import { coy } from 'react-syntax-highlighter/dist/esm/styles/prism';

import './styles.css';

const languageOptions = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'c', label: 'C' },
    { value: 'cpp', label: 'C++' },
];

const Main = () => {


    return (
        <div>
            <h1>
            메인페이지입니다.
            </h1>
            
        </div>
    );
};

export default Main;