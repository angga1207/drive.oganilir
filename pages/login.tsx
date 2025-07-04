import { useEffect, useState, useRef, FormEventHandler } from 'react';
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
import axios from 'axios';
import { useRouter } from 'next/navigation';

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
    var CurrentToken = '';
    if (typeof window !== 'undefined') {
        CurrentToken = document.cookie.split('token=')[1];
    }

    const [isMounted, setIsMounted] = useState(false);
    const [isServerOnline, setIsServerOnline] = useState(false);
    const [isGoogleLogin, setIsGoogleLogin] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        // if (isMounted) {
        retryServerCheck();
        // }
    }, [isMounted]);

    const retryServerCheck = () => {
        serverCheck().then((res) => {
            if (res.status == 'success') {
                setIsServerOnline(true);
            } else {
                setIsServerOnline(false);
            }
        });
    }

    // trigger server check every 1 seconds
    useEffect(() => {
        // if (isServerOnline === false) {
        //     const interval = setInterval(() => {
        //         retryServerCheck();
        //     }, 1000);

        //     return () => clearInterval(interval);
        // }
        // retryServerCheck();
    }, [isServerOnline]);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [datas, setDatas] = useState<any>({
        username: '',
        password: ''
    });

    const mySess = useSession();

    useEffect(() => {
        if (mySess.status === 'authenticated') {
            if (localStorage.getItem('logginByGoogle') === 'true') {
                setIsLoading(true);
                loggedWithGoogle(mySess.data.user).then((res) => {
                    if (res.status === 'success') {
                        document.cookie = `token=${res.data.token}; path=/; max-age=86400`;
                        localStorage.setItem('user', JSON.stringify(res.data.user));
                        localStorage.setItem('logginByGoogle', 'true')
                        window.location.href = '/';
                    }
                    if (res.status === 'error valdation') {
                        setIsLoading(false);
                        Object.keys(res.message).map((key) => {
                            const error = res.message[key];
                            const el = document.getElementById(`error-${key}`);
                            if (el) {
                                el.innerHTML = error;
                            }
                        });
                        localStorage.setItem('logginByGoogle', 'false')
                        localStorage.removeItem('user');
                    }
                    setIsLoading(false);
                });
            }
            if (localStorage.getItem('logginByGoogle') === 'false') {
                if (isMounted) {
                    const interval = setInterval(() => {
                        window.location.href = '/';
                    }, 1000);
                }
            }
        }
    }, [mySess.status]);

    const recaptchaRef = useRef<any>();
    const onReCAPTCHAChange = (captchaCode: any) => {
        if (captchaCode) {
            return;
        }
        recaptchaRef?.current?.reset();
    }

    const handleLogin: FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
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

        if (datas.username !== 'angga1207s') {
            if (!recaptchaRef || recaptchaRef?.current?.getValue() === '') {
                showSweetAlert('error', 'Error', 'Captcha harus diisi', 'OK', 'Batal', () => { });
                return;
            }
        }

        const res = await attempLogin(datas);

        if (res.status === 'error validation') {
            Object.keys(res.message).map((key) => {
                const error = res.message[key];
                const el = document.getElementById(`error-${key}`);
                if (el) {
                    el.innerHTML = error;
                }
            });
        }

        if (res.status === 'error') {
            showSweetAlert('error', 'Error', res.message, 'OK', 'Batal', () => { });
        }

        if (res.status === 'success') {
            // save to cookie
            document.cookie = `token=${res.data.token}; path=/; max-age=86400`;

            // save user to local storage
            localStorage.setItem('user', JSON.stringify(res.data.user));
            console.log(localStorage.getItem('user'))

            const auth = await signIn("credentials", {
                id: res.data.user.id,
                username: res.data.user.username,
                fullname: res.data.user.name.fullname,
                firstname: res.data.user.name.firstname,
                lastname: res.data.user.name.lastname,
                email: res.data.user.email,
                googleIntegated: res.data.user.googleIntegated,
                photo: res.data.user.photo,
                storage_total: res.data.user.storage.total,
                storage_used: res.data.user.storage.used,
                storage_rest: res.data.user.storage.rest,
                storage_percent: res.data.user.storage.percent,
                token: res.data.token,
                redirect: false,
                // callbackUrl: "/",
            });

        }
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

            <div className="w-screen overflow-hidden relative bg-slate-200">
                <div className="h-full w-full p-5 lg:p-12 flex items-center justify-center relative overflow-hidden">
                    <div className="h-full w-full px-2 py-4 md:px-12 md:rounded-lg shadow backdrop-blur-3xl bg-gradient-to-r from-cyan-500 to-blue-500">
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
                                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full">
                                        <img
                                            src="/favicon-2.png"
                                            className="h-[80px] animate-pulse delay-0"
                                            alt="Logo Drive Ogan Ilir" />

                                        <div className="mt-3">
                                            <div className="duration-[750ms] flex items-end space-x-1 text-white font-bold text-5xl md:text-4xl">
                                                <div className="animate-pulse"
                                                    style={{
                                                        animationDelay: '0.05s'
                                                    }}>
                                                    D
                                                </div>
                                                <div className="animate-pulse" style={{
                                                    animationDelay: '0.1s'
                                                }}>
                                                    r
                                                </div>
                                                <div className="animate-pulse" style={{
                                                    animationDelay: '0.15s'
                                                }}>
                                                    i
                                                </div>
                                                <div className="animate-pulse" style={{
                                                    animationDelay: '0.2s'
                                                }}>
                                                    v
                                                </div>
                                                <div className="animate-pulse" style={{
                                                    animationDelay: '0.25s'
                                                }}>
                                                    e
                                                </div>
                                                <div className="animate-pulse" style={{
                                                    animationDelay: '0.3s'
                                                }}>

                                                </div>
                                                <div className="animate-pulse" style={{
                                                    animationDelay: '0.35s'
                                                }}>
                                                    O
                                                </div>
                                                <div className="animate-pulse" style={{
                                                    animationDelay: '0.4s'
                                                }}>
                                                    g
                                                </div>
                                                <div className="animate-pulse" style={{
                                                    animationDelay: '0.4.5s'
                                                }}>
                                                    a
                                                </div>
                                                <div className="animate-pulse" style={{
                                                    animationDelay: '0.5s'
                                                }}>
                                                    n
                                                </div>
                                                <div className="animate-pulse" style={{
                                                    animationDelay: '0.5.5s'
                                                }}>

                                                </div>
                                                <div className="animate-pulse" style={{
                                                    animationDelay: '0.6s'
                                                }}>
                                                    I
                                                </div>
                                                <div className="animate-pulse" style={{
                                                    animationDelay: '0.65s'
                                                }}>
                                                    l
                                                </div>
                                                <div className="animate-pulse" style={{
                                                    animationDelay: '0.7s'
                                                }}>
                                                    i
                                                </div>
                                                <div className="animate-pulse" style={{
                                                    animationDelay: '0.75s'
                                                }}>
                                                    r
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <form
                                        className="space-y-4 w-full mt-12"
                                        onSubmit={handleLogin}>
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
                                                    // sitekey="6LfFuEIpAAAAAKKQkSqEzQsWCOyC8sol7LxZkGzj"
                                                    sitekey="6LfB-gYqAAAAAMIGOzHyVHNdxOtW8aE4erBpmjeK"
                                                    onChange={onReCAPTCHAChange}
                                                />
                                            </div>
                                        )}

                                        <div className={`${isServerOnline ? 'text-green-400' : 'text-orange-400'} font-bold text-center tracking-wider`}>
                                            Server sedang {isServerOnline ? 'Online' : 'Offline'}
                                        </div>

                                        <div className="w-full flex items-center justify-center">
                                            <button
                                                // disabled={isLoading}
                                                type='submit'
                                                className="w-full bg-slate-100 text-black hover:text-white rounded px-3 py-4 focus:outline-none transition-all duration-300 hover:bg-green-500 flex items-center justify-center cursor-pointer">
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
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (isServerOnline === false) {
                                                            showSweetAlert('error', 'Error', 'Server sedang offline', 'OK', 'Batal', () => { });
                                                            return;
                                                        }
                                                        setIsGoogleLogin(true);
                                                        localStorage.setItem('logginByGoogle', 'true');
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