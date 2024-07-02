import { useRouter } from "next/router";

import { setCookie, getCookie, hasCookie, deleteCookie } from 'cookies-next';
import { useState, useEffect, FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import axios from 'axios';
import axios, { AxiosRequestConfig } from "axios";
// const CurrentToken = getCookie('token');

import { BaseUri } from "./serverIP";

export async function attempLogin(data: any) {
    const uri = BaseUri() + '/login';
    try {
        const res = await axios.post(uri, data);
        const dataRes = await res.data;
        return dataRes;
    } catch (error) {
        return {
            status: 'error',
            message: error
        }
    }
}