import { useRouter } from "next/router";

import { setCookie, getCookie, hasCookie, deleteCookie } from 'cookies-next';
import { useState, useEffect, FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import axios from 'axios';
import axios, { AxiosRequestConfig } from "axios";
// const CurrentToken = getCookie('token');

export function BaseUri() {
    // const uri = 'http://127.0.0.1:8000/api';
    const uri = 'https://drive-backend.oganilirkab.go.id/api';
    return uri;
}

export function ClientDomain() {
    const uri = 'http://localhost:3001';
    // const uri = 'https://drive.oganilirkab.go.id';
    return uri;
}

export async function serverCheck() {
    try {
        // const CurrentToken = localStorage.getItem('token');

        var CurrentToken = '';
        if (typeof window !== 'undefined') {
            CurrentToken = document.cookie.split('token=')[1];
        }

        const res = await axios.post(BaseUri() + '/a12', {}, {
            headers: {
                'Content-Type': 'application/json',
                'access-control-allow-origin': '*',
                Authorization: `Bearer ${CurrentToken}`,
            }
        })

        // const res = await axios.get(BaseUri() + '/a12', {
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Access-Control-Allow-Origin': '*',
        //         Authorization: `Bearer ${CurrentToken}`,
        //     }
        // });

        const data = await res.data;

        if (data.message == 'Unauthenticated') {
            // showSweetAlert('info', 'Peringatan', 'Sesi Anda telah berakhir, silahkan login kembali', 'Tutup');
            localStorage.removeItem('token');
            deleteCookie('token');
            window.location.href = '/login';
        }

        if (data.status == 'success') {
            if (data.user === null) {
                localStorage.removeItem('token');
                deleteCookie('token');
                window.location.href = '/login';
            } else {
                localStorage.setItem('user', JSON.stringify(data.data));
            }
        }
        return data;
    } catch (error) {
        return {
            status: 'error',
            message: error
        }
    }
}

