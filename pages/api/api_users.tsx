import { useRouter } from "next/router";
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from "axios";
import { BaseUri } from "./serverIP";
import { setCookie, getCookie, hasCookie, deleteCookie } from 'cookies-next';

const baseUri = BaseUri();
// const CurrentToken = getCookie('token');

var CurrentToken = '';
if (typeof window !== 'undefined') {
    CurrentToken = document.cookie.split('token=')[1];
}


export async function getUsers(search: any = null, page: any = null) {
    try {
        const res = await axios.get(`${baseUri}/getUsers`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${CurrentToken}`,
            },
            params: {
                search: search,
                page: page
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

export async function createUser(data: any) {
    try {
        const res = await axios.post(`${baseUri}/createUser`, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${CurrentToken}`,
            }
        });
        const response = await res.data;
        return response;
    } catch (error) {
        return {
            status: 'error',
            message: error
        }
    }
}

export async function updateUser(data: any) {
    try {
        if (!data.id) {
            return {
                status: 'error',
                message: 'User ID is required'
            }
        }
        const res = await axios.post(`${baseUri}/updateUser/${data.id}`, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${CurrentToken}`,
            }
        });
        const response = await res.data;
        return response;
    } catch (error) {
        return {
            status: 'error',
            message: error
        }
    }
}

export async function updateUserAccess(id: any, access: any) {
    try {
        if (!id) {
            return {
                status: 'error',
                message: 'User ID is required'
            }
        }
        const res = await axios.post(`${baseUri}/updateUserAccess/${id}`, { access: access }, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${CurrentToken}`,
            }
        });
        const response = await res.data;
        return response;
    } catch (error) {
        return {
            status: 'error',
            message: error
        }
    }
}

export async function getProfile() {
    try {
        const res = await axios.get(`${baseUri}/getProfile`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${CurrentToken}`,
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

export async function getActivities(page: any = 1) {
    try {
        const res = await axios.get(`${baseUri}/getActivities`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${CurrentToken}`,
            },
            params: {
                page: page
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

export async function updateProfile(data: any) {
    try {
        const res = await axios.post(`${baseUri}/updateProfile`, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${CurrentToken}`,
            }
        });
        const response = await res.data;
        return response;
    } catch (error) {
        return {
            status: 'error',
            message: error
        }
    }
}

export async function loggedWithGoogle(data: any) {
    try {
        const res = await axios.post(`${baseUri}/login/google`, data, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${CurrentToken}`,
            }
        });
        const response = await res.data;
        return response;
    } catch (error) {
        return {
            status: 'error',
            message: error
        }
    }
}