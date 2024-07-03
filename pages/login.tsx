import { useEffect, useState, useRef } from 'react';
import React from "react";
import ReCAPTCHA from "react-google-recaptcha";
import AuthLayout from '@/components/Layouts/AuthLayout';
import { setCookie, getCookie, hasCookie, deleteCookie } from 'cookies-next';
import { useSession, signIn, signOut } from 'next-auth/react';

import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import Link from 'next/link';
import { attempLogin } from '@/pages/api/auth';
import { loggedWithGoogle } from './api/api_users';
import Head from 'next/head';
import { serverCheck } from './api/serverIP';
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons';

const showSweetAlert = async (icon: any, title: any, text: any, confirmButtonText: any, cancelButtonText: any, callback: any) => {
    Swal.fire({
        icon: icon,
        title: title,
        text: text,
        showCancelButton: true,
        confirmButtonText: confirmButtonText,
        cancelButtonText: cancelButtonText,
    }).then((result) => {
        if (result.isConfirmed) {
            callback();
        }
    });
}

const Login = () => {

    const [isMounted, setIsMounted] = useState(false);
    const [isServerOnline, setIsServerOnline] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isMounted) {
            serverCheck().then((res) => {
                if (res.status == 'success') {
                    setIsServerOnline(true);
                } else {
                    setIsServerOnline(false);
                }
            });
        }
    }, [isMounted]);

    const [Token, setToken] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [datas, setDatas] = useState<any>({
        username: '',
        password: ''
    });
    const mySess = useSession();

    useEffect(() => {
        if (mySess.status === 'authenticated') {
            setIsLoading(true);
            loggedWithGoogle(mySess.data.user).then((res) => {
                if (res.status === 'success') {
                    localStorage.setItem('token', res.data.token);
                    localStorage.setItem('user', JSON.stringify(res.data.user));
                    localStorage.setItem('logginByGoogle', 'true')
                    setToken(res.data.token);
                    setCookie('token', res.data.token);
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 1000);
                } else {
                    showSweetAlert('error', 'Error', res.message, 'OK', 'Batal', () => { });
                }
            });
        }
    }, [mySess]);

    const recaptchaRef = useRef<any>();
    const onReCAPTCHAChange = (captchaCode: any) => {
        if (captchaCode) {
            return;
        }
        recaptchaRef?.current?.reset();
    }

    // useEffect(() => {
    //     if (localStorage.getItem('token')) {
    //         window.location.href = '/';
    //     }
    // }, [Token]);

    const tryLogin = () => {
        if (isServerOnline === false) {
            showSweetAlert('error', 'Error', 'Server sedang offline', 'OK', 'Batal', () => { });
            return;
        }

        Object.keys(datas).map((key) => {
            const el = document.getElementById(`error-${key}`);
            if (el) {
                el.innerHTML = '';
            }
        });

        if (!recaptchaRef || recaptchaRef?.current?.getValue() === '') {
            showSweetAlert('error', 'Error', 'Captcha harus diisi', 'OK', 'Batal', () => { });
            return;
        }

        attempLogin(datas).then((res) => {
            if (res.status === 'success') {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                setToken(res.data.token);
                setCookie('token', res.data.token);
                localStorage.setItem('logginByGoogle', 'false')
                window.location.href = '/';
            } else if (res.status === 'error validation') {
                Object.keys(res.message).map((key) => {
                    const error = res.message[key];
                    const el = document.getElementById(`error-${key}`);
                    if (el) {
                        el.innerHTML = error;
                    }
                });
            } else {
                showSweetAlert('error', 'Error', res.message, 'OK', 'Batal', () => { });
            }
        });
    }

    return (
        <>
            <Head>
                <title>
                    Login | Drive Ogan Ilir
                </title>
                <meta
                    name="description"
                    content={`Login | Drive Ogan Ilir`}
                    key="description"
                />
            </Head>

            <div className="w-screen relative bg-slate-200">
                <div className="h-full w-full p-5 lg:p-12 flex items-center justify-center relative overflow-hidden">
                    <div className="h-full w-full p-12 md:rounded-lg shadow backdrop-blur-3xl bg-gradient-to-r from-cyan-500 to-blue-500">
                        <div className="container relative">

                            <div className="grid md:grid-cols-12 grid-cols-1 items-center gap-[30px]">
                                <div className="md:col-span-8 hidden md:block">
                                    <div className="md:me-6">
                                        <h4 className="font-semibold text-4xl/tight lg:text-6xl/tight capitalize text-white mb-4">
                                            <div className='text-blue-200 font-bold'>
                                                Selamat Datang di
                                            </div>
                                            Drive Ogan Ilir
                                        </h4>
                                        <p className="text-lg max-w-xl text-default-200 mb-6">
                                            Drive Ogan Ilir adalah aplikasi berbasis web yang memudahkan masyarakat Kabupaten Ogan Ilir dalam menyimpan dan berbagi file secara online.
                                        </p>

                                        <div>
                                            <button
                                                type='button'
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    const el = document.getElementById('input-username');
                                                    if (el) {
                                                        el.focus();
                                                    }
                                                }}
                                                className="px-4 py-3 rounded bg-blue-500 text-white hover:bg-blue-600 transition-all duration-500">
                                                Mulai Sekarang
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-4 aos-init flex items-center justify-center flex-col gap-5 min-h-[calc(100vh-200px)]">

                                    <div className="flex items-center justify-center gap-4 w-full">
                                        <img
                                            src="/logo.png"
                                            className="h-[70px]"
                                            alt="Logo Drive Ogan Ilir" />

                                        <div className="">
                                            <div className="duration-[750ms] flex items-end space-x-1 text-white">
                                                <div className="animate-pulse font-bold text-[40px]"
                                                    style={{
                                                        animationDelay: '0s'
                                                    }}>
                                                    D
                                                </div>
                                                <div className="animate-pulse font-bold text-[40px]" style={{
                                                    animationDelay: '0.05s'
                                                }}>
                                                    r
                                                </div>
                                                <div className="animate-pulse font-bold text-[40px]" style={{
                                                    animationDelay: '0.1s'
                                                }}>
                                                    i
                                                </div>
                                                <div className="animate-pulse font-bold text-[40px]" style={{
                                                    animationDelay: '0.15s'
                                                }}>
                                                    v
                                                </div>
                                                <div className="animate-pulse font-bold text-[40px]" style={{
                                                    animationDelay: '0.2s'
                                                }}>
                                                    e
                                                </div>
                                                <div className="animate-pulse font-bold text-[40px]" style={{
                                                    animationDelay: '0.25s'
                                                }}>

                                                </div>
                                                <div className="animate-pulse font-bold text-[40px]" style={{
                                                    animationDelay: '0.3s'
                                                }}>
                                                    O
                                                </div>
                                                <div className="animate-pulse font-bold text-[40px]" style={{
                                                    animationDelay: '0.35s'
                                                }}>
                                                    g
                                                </div>
                                                <div className="animate-pulse font-bold text-[40px]" style={{
                                                    animationDelay: '0.4s'
                                                }}>
                                                    a
                                                </div>
                                                <div className="animate-pulse font-bold text-[40px]" style={{
                                                    animationDelay: '0.45s'
                                                }}>
                                                    n
                                                </div>
                                                <div className="animate-pulse font-bold text-[40px]" style={{
                                                    animationDelay: '0.5s'
                                                }}>

                                                </div>
                                                <div className="animate-pulse font-bold text-[40px]" style={{
                                                    animationDelay: '0.55s'
                                                }}>
                                                    I
                                                </div>
                                                <div className="animate-pulse font-bold text-[40px]" style={{
                                                    animationDelay: '0.6s'
                                                }}>
                                                    l
                                                </div>
                                                <div className="animate-pulse font-bold text-[40px]" style={{
                                                    animationDelay: '0.65s'
                                                }}>
                                                    i
                                                </div>
                                                <div className="animate-pulse font-bold text-[40px]" style={{
                                                    animationDelay: '0.7s'
                                                }}>
                                                    r
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <form
                                        className="space-y-4 w-full mt-12"
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            tryLogin();
                                        }}>
                                        <div className="text-slate-100 text-center text-lg font-semibold">
                                            Masuk dengan akun yang telah terdaftar
                                        </div>
                                        <div className="w-full">
                                            <input
                                                disabled={isLoading}
                                                value={datas.username}
                                                onChange={(e) => setDatas({ ...datas, username: e.target.value })}
                                                type="text"
                                                id="input-username"
                                                className="w-full border border-blue-200 rounded px-5 py-4 focus:outline-none focus:border-blue-400 transition-all duration-300"
                                                placeholder="Username" />
                                            <div id="error-username" className="mt-1 text-xs text-red-500 font-semibold"></div>
                                        </div>
                                        <div className="w-full">
                                            <div className="relative">
                                                <input
                                                    disabled={isLoading}
                                                    value={datas.password}
                                                    onChange={(e) => setDatas({ ...datas, password: e.target.value })}
                                                    type={showPassword ? 'text' : 'password'}
                                                    className="w-full border border-blue-200 rounded px-5 py-4 focus:outline-none focus:border-blue-400 transition-all duration-300"
                                                    placeholder="Password" />
                                                <div className="absolute right-0 top-0 h-full flex items-center pr-3"
                                                    onClick={() => {
                                                        setShowPassword(!showPassword);
                                                    }}>
                                                    <FontAwesomeIcon icon={faEye} className={`${showPassword ? 'hidden' : ''} w-4 h-4 text-black cursor-pointer`} />
                                                    <FontAwesomeIcon icon={faEyeSlash} className={`${showPassword ? '' : 'hidden'} w-4 h-4 text-green-500 cursor-pointer`} />
                                                </div>
                                            </div>
                                            <div id="error-password" className="mt-1 text-xs text-red-500 font-semibold"></div>
                                        </div>
                                        {!isLoading && (
                                            <div className="w-full">
                                                <ReCAPTCHA
                                                    className='flex items-center justify-center'
                                                    ref={recaptchaRef}
                                                    sitekey="6LfFuEIpAAAAAKKQkSqEzQsWCOyC8sol7LxZkGzj"
                                                    onChange={onReCAPTCHAChange}
                                                />
                                            </div>
                                        )}

                                        <div className={`${isServerOnline ? 'text-green-400' : 'text-orange-400'} font-bold text-center tracking-wider`}>
                                            Server sedang {isServerOnline ? 'Online' : 'Offline'}
                                        </div>

                                        <div className="w-full flex items-center justify-center">
                                            <button
                                                disabled={isLoading}
                                                type='submit'
                                                className="w-full bg-slate-100 text-black hover:text-white rounded px-3 py-2 focus:outline-none transition-all duration-300 hover:bg-green-500 flex items-center justify-center cursor-pointer">
                                                <FontAwesomeIcon icon={faSignInAlt} className="w-4 h-4 mr-2" />
                                                <div className="font-bold tracking-widest">
                                                    MASUK
                                                </div>
                                            </button>
                                        </div>
                                        <hr />
                                        <div className="">
                                            <div className="text-center text-white">
                                                Masuk Menggunakan :
                                            </div>
                                            <div className="mt-2 flex items-center justify-center">
                                                <button
                                                    disabled={isLoading}
                                                    type='button'
                                                    onClick={() => {
                                                        if (isServerOnline === false) {
                                                            showSweetAlert('error', 'Error', 'Server sedang offline', 'OK', 'Batal', () => { });
                                                            return;
                                                        }
                                                        signIn('google');
                                                    }}
                                                    className="flex items-center justify-center gap-2 bg-white hover:bg-slate-100 hover:text-blue-900 px-3 py-2 rounded shadow cursor-pointer">
                                                    <img src="/assets/images/google.png"
                                                        className="h-[20px] mx-auto cursor-pointer" alt="Logo Ogan Ilir" />
                                                    <div className="font-bold cursor-pointer">
                                                        Google
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
}

Login.getLayout = (page: any) => {
    return <AuthLayout>{page}</AuthLayout>;
};
export default Login;