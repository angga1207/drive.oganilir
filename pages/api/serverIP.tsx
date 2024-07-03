import { useRouter } from "next/router";

import { setCookie, getCookie, hasCookie, deleteCookie } from 'cookies-next';
import { useState, useEffect, FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import axios from 'axios';
import axios, { AxiosRequestConfig } from "axios";
// const CurrentToken = getCookie('token');

export function BaseUri() {
    // const uri = 'http://127.0.0.1:8000/api';
    const uri = 'http://drive-backend.oganilirkab.go.id/api';
    return uri;
}

export function ClientDomain() {
    const uri = 'http://localhost:3000';
    return uri;
}

export async function serverCheck() {
    try {
        const CurrentToken = localStorage.getItem('token');
        const res = await axios.post(BaseUri() + '/a12', {}, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${CurrentToken}`,
            }
        })
        const data = await res.data;

        if (data.status == 'success') {
            if (data.user === null) {
                localStorage.removeItem('token');
                deleteCookie('token');
                window.location.href = '/login';
            }
            localStorage.setItem('user', data.data);
        }
        return data;
    } catch (error) {
        return {
            status: 'error',
            message: error
        }
    }
}

