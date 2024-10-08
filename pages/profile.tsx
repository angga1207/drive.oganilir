import { Fragment, useEffect, useRef, useState } from "react";
import { Dialog, Transition } from '@headlessui/react';
import { getProfile, updateProfile, getActivities } from "@/pages/api/api_users";

import { faArrowLeft, faArrowRight, faArrowsAlt, faCloudDownloadAlt, faCloudUploadAlt, faCog, faFolderPlus, faInfoCircle, faPen, faPlus, faShareAltSquare, faSignInAlt, faTimes, faUserEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faEye, faEyeSlash, faSave, faShareFromSquare, faTrashAlt } from "@fortawesome/free-regular-svg-icons";
import Tippy from "@tippyjs/react";
import 'tippy.js/dist/tippy.css';

import Swal from 'sweetalert2';
import Head from "next/head";
const showSweetAlert = async (icon: any, title: any, text: any, confirmButtonText: any) => {
    Swal.fire({
        icon: icon,
        title: title,
        html: text,
        confirmButtonText: confirmButtonText ?? 'OK',
    });
}

const showAlert = async (icon: any, title: any, text: any) => {
    const toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 5000,
    });
    toast.fire({
        icon: icon,
        title: text,
        padding: '10px 20px',
    });
}

const Profile = () => {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
        return () => { setIsMounted(false) };
    }, []);

    const [profile, setProfile] = useState<any>({});
    const [profileInput, setProfileInput] = useState<any>({
        firstname: '',
        lastname: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
        photo: '',
    });
    const [showPassword, setShowPassword] = useState(false);

    const [activities, setActivities] = useState<any>([]);
    const [activitiesPage, setActivitiesPage] = useState(1);
    const [activitiesTotalPage, setActivitiesTotalPage] = useState(1);

    useEffect(() => {
        if (isMounted) {
            getProfile().then((data) => {
                if (data.status === 'success') {
                    setProfile(data.data);
                    setProfileInput({
                        firstname: data.data.firstname,
                        lastname: data.data.lastname,
                        username: data.data.username,
                        email: data.data.email,
                        photo: '',
                        password: '',
                        password_confirmation: '',
                    });
                }
                if (data.status === 'error') {
                    showSweetAlert('error', 'Error', data.message, 'Tutup');
                }
            });

            getActivities().then((data) => {
                if (data.status === 'success') {
                    setActivities(data.data.data);
                    setActivitiesTotalPage(data.data.last_page);
                }
                if (data.status === 'error') {
                    showSweetAlert('error', 'Error', data.message, 'Tutup');
                }
            });
        }
    }, [isMounted]);

    useEffect(() => {
        if (isMounted) {
            getActivities(activitiesPage).then((data) => {
                if (data.status === 'success') {
                    setActivities(data.data.data);
                    setActivitiesTotalPage(data.data.last_page);
                }
                if (data.status === 'error') {
                    showSweetAlert('error', 'Error', data.message, 'Tutup');
                }
            });
        }
    }, [activitiesPage]);

    const __saveProfile = () => {
        updateProfile(profileInput).then((data) => {
            if (data.status === 'success') {
                showAlert('success', 'Berhasil', data.message);
                getProfile().then((data) => {
                    if (data.status === 'success') {
                        setProfile(data.data);
                        setProfileInput({
                            firstname: data.data.firstname,
                            lastname: data.data.lastname,
                            username: data.data.username,
                            email: data.data.email,
                            photo: '',
                            password: '',
                            password_confirmation: '',
                        });
                    }
                });

                getActivities(activitiesPage).then((data) => {
                    if (data.status === 'success') {
                        setActivities(data.data.data);
                        setActivitiesTotalPage(data.data.last_page);
                    }
                    if (data.status === 'error') {
                        showSweetAlert('error', 'Error', data.message, 'Tutup');
                    }
                });
            }

            if (data.status === 'error') {
                showSweetAlert('error', 'Error', data.message, 'Tutup');
            }

            if (data.status === 'error validation') {
                Object.keys(data.message).map((key) => {
                    const error = data.message[key];
                    const el = document.getElementById(`error-profile-${key}`);
                    if (el) {
                        el.innerHTML = error;
                    }
                });
            }
        });
    }

    return (
        <>
            <Head>
                <title>
                    {profile.fullname} | Drive Ogan Ilir
                </title>
                <meta
                    name="description"
                    content={`Profile ${profile.fullname} | Drive Ogan Ilir`}
                    key="description"
                />
                <meta
                    property="og:image"
                    content={profile.photo}
                    key="og:image"
                />
                <meta
                    property="og:description"
                    content={`Profile ${profile.fullname} | Drive Ogan Ilir`}
                    key="og:description"
                />
                <meta
                    property="og:title"
                    content={profile.fullname}
                    key="og:title"
                />
                <meta
                    property="og:site_name"
                    content="Drive Ogan Ilir"
                    key="og:site_name"
                />
                <meta
                    property="og:url"
                    content={process.env.NEXT_PUBLIC_CLIENT_DOMAIN + '/profile'}
                    key="og:url"
                />
                <meta
                    property="og:type"
                    content="profile"
                    key="og:type"
                />
                <meta
                    property="profile:username"
                    content={profile.username}
                    key="profile:username"
                />
                <meta name="twitter:card" content="summary" key="twitter:card" />
                <meta name="twitter:site" content="@driveoganilir" key="twitter:site" />
                <meta name="twitter:creator" content="@driveoganilir" key="twitter:creator" />
                <meta name="twitter:title" content={profile.fullname} key="twitter:title" />
                <meta name="twitter:description" content={`Profile ${profile.fullname} | Drive Ogan Ilir`} key="twitter:description" />
                <meta name="twitter:image" content={profile.photo} key="twitter:image" />
            </Head>

            <div className="grid grid-cols-12 gap-6">

                <div className="col-span-12 lg:col-span-4 my-6 p-4 bg-white shadow rounded lg:h-[calc(100vh-180px)]">
                    <div className="font-semibold mb-2 pb-2 text-lg text-center border-b">
                        Informasi Saya
                    </div>

                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center">
                            <div className="mr-3">
                                {profileInput?.photoPreview ? (
                                    <img src={profileInput?.photoPreview} alt="Avatar" className="w-20 h-20 rounded-full" />
                                ) : (
                                    <img src={profile?.photo} alt="Avatar" className="w-20 h-20 rounded-full" />
                                )}
                                <div id="error-profile-photo" className="text-xs text-red-500"></div>
                            </div>
                            <div className="">
                                <div className="text-lg font-semibold">
                                    {profile?.fullname}
                                </div>
                                <div className="text-slate-500">
                                    {profile?.email}
                                </div>
                                {profile?.googleIntegated && (
                                    <div className="text-slate-500 mt-2 flex items-center">
                                        <img src="/assets/images/google.png" alt="Google" className="w-3 h-3 mr-0.5" />
                                        <span className="whitespace-nowrap text-xs text-green-600 font-semibold">
                                            oogle Integrated
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="w-10 h-full">
                            <Tippy content="Ubah Foto Profil" placement="top">
                                <div className="relative">
                                    <FontAwesomeIcon icon={faCloudUploadAlt} className="w-7 h-7 cursor-pointer" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={(e: any) => {
                                            const file = e.target.files[0];
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setProfileInput({
                                                    ...profileInput,
                                                    photo: file,
                                                    photoPreview: reader.result
                                                });
                                            }
                                            reader.readAsDataURL(file);
                                        }} />
                                </div>
                            </Tippy>
                        </div>
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            __saveProfile();
                        }}
                        className="grid grid-cols-2 gap-4">

                        <div className="col-span-2 lg:col-span-1">
                            <label className="text-xs font-semibold text-slate-600">
                                Nama Depan
                            </label>
                            <input
                                value={profileInput?.firstname}
                                onChange={(e) => setProfileInput({ ...profileInput, firstname: e.target.value })}
                                type="text"
                                placeholder="Nama Depan"
                                className="w-full p-2 border rounded ring-0 focus:ring-0 outline-0" />
                            <div id="error-profile-firstname" className="text-xs text-red-500"></div>
                        </div>

                        <div className="col-span-2 lg:col-span-1">
                            <label className="text-xs font-semibold text-slate-600">
                                Nama Belakang
                            </label>
                            <input
                                value={profileInput?.lastname}
                                onChange={(e) => setProfileInput({ ...profileInput, lastname: e.target.value })}
                                type="text"
                                placeholder="Nama Belakang"
                                className="w-full p-2 border rounded ring-0 focus:ring-0 outline-0" />
                            <div id="error-profile-lastname" className="text-xs text-red-500"></div>
                        </div>

                        <div className="col-span-2">
                            <label className="text-xs font-semibold text-slate-600">
                                Nama Pengguna
                            </label>
                            <input
                                value={profileInput?.username}
                                onChange={(e) => setProfileInput({ ...profileInput, username: e.target.value })}
                                type="text"
                                placeholder="Nama Pengguna"
                                className="w-full p-2 border rounded ring-0 focus:ring-0 outline-0" />
                            <div id="error-profile-username" className="text-xs text-red-500"></div>
                        </div>

                        <div className="col-span-2">
                            <label className="text-xs font-semibold text-slate-600">
                                Email
                            </label>
                            <input
                                value={profileInput?.email}
                                onChange={(e) => setProfileInput({ ...profileInput, email: e.target.value })}
                                type="email"
                                placeholder="email"
                                className="w-full p-2 border rounded ring-0 focus:ring-0 outline-0" />
                            <div id="error-profile-email" className="text-xs text-red-500"></div>
                        </div>

                        <div className="col-span-2">
                            <hr />
                        </div>

                        <div className="col-span-2 lg:col-span-1">
                            <label className="text-xs font-semibold text-slate-600">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    value={profileInput?.password}
                                    onChange={(e) => setProfileInput({ ...profileInput, password: e.target.value })}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Password"
                                    className="w-full p-2 border rounded ring-0 focus:ring-0 outline-0" />

                                <div className="absolute top-0 right-0 w-10 h-full flex items-center justify-center bg-slate-100 rounded-r">
                                    <FontAwesomeIcon
                                        icon={showPassword ? faEye : faEyeSlash}
                                        className="h-4 w-4 cursor-pointer"
                                        onClick={() => setShowPassword(!showPassword)} />
                                </div>
                            </div>
                            <div id="error-profile-password" className="text-xs text-red-500"></div>
                        </div>

                        <div className="col-span-2 lg:col-span-1">
                            <label className="text-xs font-semibold text-slate-600">
                                Konfirmasi Password
                            </label>
                            <div className="relative">
                                <input
                                    value={profileInput?.password_confirmation}
                                    onChange={(e) => setProfileInput({ ...profileInput, password_confirmation: e.target.value })}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Password"
                                    className="w-full p-2 border rounded ring-0 focus:ring-0 outline-0" />

                                <div className="absolute top-0 right-0 w-10 h-full flex items-center justify-center bg-slate-100 rounded-r">
                                    <FontAwesomeIcon
                                        icon={showPassword ? faEye : faEyeSlash}
                                        className="h-4 w-4 cursor-pointer"
                                        onClick={() => setShowPassword(!showPassword)} />
                                </div>
                            </div>
                            <div id="error-profile-password_confirmation" className="text-xs text-red-500"></div>
                        </div>

                        <div className="col-span-2">
                            <div className="flex items-center justify-center mt-5">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center transition-all duration-500">
                                    <FontAwesomeIcon icon={faSave} className="w-4 h-4 mr-2" />
                                    Simpan
                                </button>
                            </div>
                        </div>

                    </form>
                </div>

                <div className="col-span-12 lg:col-span-8 my-6 p-4 bg-white shadow rounded lg:h-[calc(100vh-180px)]">
                    <div className="font-semibold mb-2 pb-2 text-lg text-center border-b">
                        Aktivitas Saya
                    </div>

                    <div className="relative w-full lg:h-[calc(100vh-300px)] lg:overflow-auto">
                        <table className="w-full">
                            <thead className="sticky top-0 left-0 w-full">
                                <tr>
                                    <th className="p-4 bg-slate-500 text-white rounded-tl w-[250px]">
                                        <div className="flex items-center">
                                            <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4 mr-2" />
                                            <span>
                                                Tanggal
                                            </span>
                                        </div>
                                    </th>
                                    <th className="p-4 bg-slate-500 text-white rounded-tr">
                                        <div className="flex items-center">
                                            <FontAwesomeIcon icon={faInfoCircle} className="w-4 h-4 mr-2" />
                                            <span>
                                                Aktivitas
                                            </span>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {activities?.map((activity: any, index: number) => (
                                    <tr className="border-b">
                                        <td className="p-4">
                                            <span className="mr-1">
                                                {new Date(activity.created_at).toLocaleString('id-ID', {
                                                    dateStyle: 'medium',
                                                })}
                                            </span>
                                            <span>
                                                - {new Date(activity.created_at).toLocaleTimeString('id-ID', {
                                                    timeStyle: 'short',
                                                })} WIB
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div>

                                                    {activity.event == 'update-profile' && (
                                                        <FontAwesomeIcon icon={faUserEdit} className="w-4 h-4 text-purple-500" />
                                                    )}

                                                    {['login', 'google-login', 'login-google'].includes(activity.event) && (
                                                        <FontAwesomeIcon icon={faSignInAlt} className="w-4 h-4 text-purple-500" />
                                                    )}

                                                    {['share-file/folder', 'share-file/file', 'publicity-file', 'publicity-folder'].includes(activity.event) && (
                                                        <FontAwesomeIcon icon={faShareFromSquare} className="w-4 h-4 text-pink-500" />
                                                    )}

                                                    {['make-folder', 'create-folder-folder'].includes(activity.event) && (
                                                        <FontAwesomeIcon icon={faFolderPlus} className="w-4 h-4 text-indigo-500" />
                                                    )}

                                                    {['rename-folder', 'rename-file'].includes(activity.event) && (
                                                        <FontAwesomeIcon icon={faPen} className="w-4 h-4 text-sky-400" />
                                                    )}

                                                    {['upload-file'].includes(activity.event) && (
                                                        <FontAwesomeIcon icon={faCloudUploadAlt} className="w-4 h-4 text-green-500" />
                                                    )}

                                                    {['move-item'].includes(activity.event) && (
                                                        <FontAwesomeIcon icon={faArrowsAlt} className="w-4 h-4 text-orange-500" />
                                                    )}

                                                    {['delete-item'].includes(activity.event) && (
                                                        <FontAwesomeIcon icon={faTrashAlt} className="w-4 h-4 text-red-500" />
                                                    )}

                                                    {['download-file'].includes(activity.event) && (
                                                        <FontAwesomeIcon icon={faCloudDownloadAlt} className="w-4 h-4 text-green-500" />
                                                    )}



                                                </div>
                                                <div className="">
                                                    {activity.description}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                            </tbody>
                        </table>

                    </div>
                    <div className="w-full p-4 bg-white border-t">
                        <div className="flex items-center justify-between">
                            <div>
                                Halaman {activities.length > 0 ? activitiesPage : 0} dari {activitiesTotalPage}
                            </div>

                            <div className="flex items-center gap-x-2">
                                <div>
                                    <button
                                        onClick={() => {
                                            if (activitiesPage > 1) {
                                                setActivitiesPage(activitiesPage - 1);
                                            }
                                        }}
                                        className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center transition-all duration-500">
                                        <span>
                                            <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
                                        </span>
                                    </button>
                                </div>

                                <div>
                                    <button
                                        onClick={() => {
                                            if (activitiesPage < activitiesTotalPage) {
                                                setActivitiesPage(activitiesPage + 1);
                                            }
                                        }}
                                        className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center transition-all duration-500">
                                        <span>
                                            <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
                                        </span>
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}

export default Profile;