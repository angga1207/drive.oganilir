import { useRouter } from "next/router";
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from "axios";
import { BaseUri } from "./serverIP";
import { setCookie, getCookie, hasCookie, deleteCookie } from 'cookies-next';

const baseUri = BaseUri();
const CurrentToken = getCookie('token');

export async function getPath(slug: any = null) {
    try {
        const res = await axios.get(`${baseUri}/getPath`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${CurrentToken}`,
            },
            params: {
                slug: slug
            }
        });
        const data = await res.data;
        return data;
    } catch (error) {
        return {
            status: 'error',
            message: error
        }
    }
}