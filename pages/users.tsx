import { Fragment, useEffect, useRef, useState } from "react";
import Head from 'next/head';
import { Dialog, Transition } from '@headlessui/react';
import { getUsers, createUser, updateUser, updateUserAccess } from "@/pages/api/api_users";

import { faCog, faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faSave } from "@fortawesome/free-regular-svg-icons";

import Swal from 'sweetalert2';
const showSweetAlert = async (icon: any, title: any, text: any, confirmButtonText: any) => {
    Swal.fire({
        icon: icon,
        title: title,
        text: text,
        confirmButtonText: confirmButtonText,
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

const Users = () => {

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, [])

    const [datas, setDatas] = useState([]);
    const [totalData, setTotalData] = useState(0);
    const [pages, setPages] = useState<any>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [maxPage, setMaxPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (isMounted) {
            __getUsers();
        }
    }, [isMounted, currentPage])

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const __getUsers = () => {
        getUsers(search, currentPage).then((res) => {
            if (res.status === 'success') {
                setDatas(res.data.data);
                setMaxPage(res.data.last_page);
                setTotalData(res.data.total);
                setPages([]);
                for (let i = 1; i <= res.data.last_page; i++) {
                    setPages((pages: any) => [...pages, {
                        label: i,
                        page: i,
                    }]);
                }
            }
        })
    }

    const [modalEdit, setModalEdit] = useState(false);
    const [editItem, setEditItem] = useState<any>({
        'inputType': 'create',
    });
    const [showPassword, setShowPassword] = useState(false);

    const addUser = () => {
        setEditItem({
            inputType: 'create',
            firstname: '',
            lastname: '',
            username: '',
            email: '',
            password: '',
            password_confirmation: '',
            capacity: '',
            photoPreview: '',
            photo: null,
        });
        setModalEdit(true);
    }

    const openEdit = (data: any) => {
        setEditItem({
            inputType: 'update',
            id: data.id,
            firstname: data.firstname,
            lastname: data.lastname,
            username: data.username,
            email: data.email,
            password: '',
            password_confirmation: '',
            capacity: data.storage.total_raw,
            photoPreview: data.photo,
            photo: null,
        });
        setModalEdit(true);
    }

    const closeEdit = () => {
        setModalEdit(false);
        setEditItem({});
    }

    const __updateUser = () => {
        if (editItem.inputType === 'create') {
            createUser(editItem).then((res) => {
                if (res.status === 'success') {
                    closeEdit();
                    __getUsers();
                    showAlert('success', 'Berhasil', res.message);
                }
                if (res.status == 'error validation') {
                    Object.keys(res.message).map((key) => {
                        const errorElement = document.getElementById(`error-users-${key}`);
                        if (errorElement) {
                            errorElement.innerHTML = res.message[key][0];
                        }
                    });
                }
            })
        }

        if (editItem.inputType === 'update') {
            updateUser(editItem).then((res) => {
                if (res.status === 'success') {
                    closeEdit();
                    __getUsers();
                    showAlert('success', 'Berhasil', res.message);
                }
                if (res.status == 'error validation') {
                    Object.keys(res.message).map((key) => {
                        const errorElement = document.getElementById(`error-users-${key}`);
                        if (errorElement) {
                            errorElement.innerHTML = res.message[key][0];
                        }
                    });
                }
            })
        }
    }

    const __confirmChangeAccess = (id: any, access: any) => {
        Swal.fire({
            title: 'Apakah Anda Yakin?',
            text: access ? 'Ingin memberikan akses kepada pengguna ini?' : 'Ingin mencabut akses pengguna ini?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya',
            cancelButtonText: 'Tidak',
        }).then((result) => {
            if (result.isConfirmed) {
                updateUserAccess(id, access).then((res) => {
                    if (res.status === 'success') {
                        __getUsers();
                        showAlert('success', 'Berhasil', res.message);
                    }
                })
            }
        });
    }

    return (
        <>
            <Head>
                <title>
                    Daftar Pengguna | Drive Ogan Ilir
                </title>
                <meta
                    name="description"
                    content="Daftar Pengguna | Drive Ogan Ilir"
                    key="description"
                />
            </Head>
            <div className="my-6 p-4 bg-white shadow rounded">

                <div className="flex items-center justify-between">
                    <div className="font-semibold text-lg">
                        Daftar Pengguna
                    </div>
                    <div className="">
                        <button type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                addUser();
                            }}
                            className="rounded px-2 py-1 bg-green-500 text-green-100 cursor-pointer whitespace-nowrap flex items-center">
                            <FontAwesomeIcon icon={faPlus} className="w-4 h-4 mr-2" />
                            Tambah Pengguna
                        </button>
                    </div>
                </div>

                <div className="mt-5 h-[calc(100vh-280px)] overflow-auto">
                    <table className="w-full">

                        <thead className="">
                            <tr>
                                <th className="p-3 bg-slate-200 rounded-tl">
                                    Pengguna
                                </th>
                                <th className="p-3 bg-slate-200 w-[200px]">
                                    Tanggal Pendaftaran
                                </th>
                                <th className="p-3 bg-slate-200 w-[200px]">
                                    Akses
                                </th>
                                <th className="p-3 bg-slate-200 w-[200px]">
                                    Kapasitas
                                </th>
                                <th className="p-3 bg-slate-200 w-[200px] rounded-tr">
                                    <div className="flex justify-center items-center">
                                        <FontAwesomeIcon icon={faCog} className="w-4 h-4" />
                                    </div>
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {datas?.map((data: any, index: number) => (
                                <tr key={`user-${data.id}`}>
                                    <td className="p-3">
                                        <div className="flex items-center gap-2">
                                            <div className="">
                                                <img src={data.photo} className="w-10 h-10 rounded-full" />
                                            </div>
                                            <div className="">
                                                <div className="font-semibold flex items-center gap-x-2">
                                                    <div className="">
                                                        {data.fullname}
                                                    </div>
                                                    {data.googleIntegated && (
                                                        <img src="/assets/images/google.png" className="w-3 h-3 inline-block" />
                                                    )}
                                                </div>
                                                <div className="text-xs">
                                                    @{data.username}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="text-center">
                                            {new Date(data.created_at).toLocaleString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center justify-center">
                                            {data?.access ? (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        __confirmChangeAccess(data.id, data.access ? false : true);
                                                    }}
                                                    className="rounded px-2 py-1 text-xs bg-green-500 text-green-100 cursor-pointer whitespace-nowrap">
                                                    Punya Akses
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        __confirmChangeAccess(data.id, data.access ? false : true);
                                                    }}
                                                    className="rounded px-2 py-1 text-xs bg-red-500 text-red-100 cursor-pointer whitespace-nowrap">
                                                    Tidak Punya Akses
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="text-center">
                                            {data?.storage?.used} / {data?.storage?.total}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center justify-center gap-2">
                                            <div
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    openEdit(data);
                                                }}
                                                className="rounded px-2 py-1 text-xs bg-sky-200 text-sky-500 cursor-pointer whitespace-nowrap">
                                                Detail
                                            </div>
                                            <div className="rounded px-2 py-1 text-xs bg-red-200 text-red-500 cursor-pointer whitespace-nowrap">
                                                Hapus
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {pages?.length > 0 && (
                    <div className="w-full pt-2">
                        <div className="flex items-center justify-center">

                            <div
                                onClick={(e) => {
                                    e.preventDefault();
                                    setCurrentPage(currentPage - 1);
                                }}
                                className="px-2 py-1.5 mx-1 block rounded cursor-pointer bg-sky-200">
                                <span className="cursor-pointer"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setCurrentPage(currentPage - 1);
                                    }}>
                                    Sebelumnya
                                </span>
                            </div>

                            {pages.map((page: any, index: number) => (
                                <div key={`page-${index}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setCurrentPage(page.label);
                                    }}
                                    className="px-2 py-1.5 mx-1 block rounded cursor-pointer bg-sky-200">
                                    <span className="cursor-pointer"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setCurrentPage(page.label);
                                        }}>
                                        {page.label}
                                    </span>
                                </div>
                            ))}

                            <div
                                onClick={(e) => {
                                    e.preventDefault();
                                    setCurrentPage(currentPage + 1);
                                }}
                                className="px-2 py-1.5 mx-1 block rounded cursor-pointer bg-sky-200">
                                <span className="cursor-pointer"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setCurrentPage(currentPage + 1);
                                    }}>
                                    Selanjutnya
                                </span>
                            </div>

                        </div>
                    </div>
                )}

            </div>


            <Transition appear show={modalEdit} as={Fragment}>
                <Dialog
                    as="div"
                    open={modalEdit}
                    onClose={() => closeEdit()}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0" />
                    </Transition.Child>
                    <div className="fixed inset-0 bg-[black]/60 z-[999] overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen px-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel as="div"
                                    className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-[80%] md:max-w-[60%] my-8 bg-white text-black">
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-5">
                                            <div className="font-semibold text-lg">
                                                {editItem?.inputType === 'create' ? 'Tambah Pengguna' : 'Detail Pengguna'}
                                            </div>
                                            <div className="cursor-pointer"
                                                onClick={() => closeEdit()}>
                                                <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
                                            </div>
                                        </div>
                                        <form className="grid grid-cols-12 gap-4 font-normal"
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                __updateUser();
                                            }}>

                                            <div className="col-span-12 lg:col-span-6">
                                                <label className="font-semibold text-sm mb-1 text-slate-400 select-none">
                                                    Nama Depan
                                                </label>
                                                <input className="w-full p-2 border rounded ring-0 focus:ring-0 outline-0"
                                                    value={editItem?.firstname}
                                                    onChange={(e) => {
                                                        setEditItem({
                                                            ...editItem,
                                                            firstname: e.target.value
                                                        });
                                                    }}
                                                    placeholder='Masukkan Nama Depan' />
                                                <div id="error-users-firstname" className="text-xs text-red-500"></div>
                                            </div>

                                            <div className="col-span-12 lg:col-span-6">
                                                <label className="font-semibold text-sm mb-1 text-slate-400 select-none">
                                                    Nama Belakang
                                                </label>
                                                <input className="w-full p-2 border rounded ring-0 focus:ring-0 outline-0"
                                                    value={editItem?.lastname}
                                                    onChange={(e) => {
                                                        setEditItem({
                                                            ...editItem,
                                                            lastname: e.target.value
                                                        });
                                                    }}
                                                    placeholder='Masukkan Nama Belakang' />
                                                <div id="error-users-lastname" className="text-xs text-red-500"></div>
                                            </div>

                                            <div className="col-span-12 lg:col-span-6">
                                                <label className="font-semibold text-sm mb-1 text-slate-400 select-none">
                                                    Nama Pengguna
                                                </label>
                                                <input className="w-full p-2 border rounded ring-0 focus:ring-0 outline-0"
                                                    value={editItem?.username}
                                                    onChange={(e) => {
                                                        setEditItem({
                                                            ...editItem,
                                                            username: e.target.value
                                                        });
                                                    }}
                                                    disabled={editItem?.inputType === 'update' ? true : false}
                                                    placeholder='Masukkan Nama Pengguna' />
                                                <div id="error-users-username" className="text-xs text-red-500"></div>
                                            </div>

                                            <div className="col-span-12 lg:col-span-6">
                                                <label className="font-semibold text-sm mb-1 text-slate-400 select-none">
                                                    Email
                                                </label>
                                                <input className="w-full p-2 border rounded ring-0 focus:ring-0 outline-0"
                                                    value={editItem?.email}
                                                    onChange={(e) => {
                                                        setEditItem({
                                                            ...editItem,
                                                            email: e.target.value
                                                        });
                                                    }}
                                                    placeholder='Masukkan Email' />
                                                <div id="error-users-email" className="text-xs text-red-500"></div>
                                            </div>

                                            <div className="col-span-12 lg:col-span-6">
                                                <label className="font-semibold text-sm mb-1 text-slate-400 select-none">
                                                    Password
                                                </label>
                                                <div className="relative">
                                                    <input className="w-full p-2 border rounded ring-0 focus:ring-0 outline-0"
                                                        value={editItem?.password}
                                                        onChange={(e) => {
                                                            setEditItem({
                                                                ...editItem,
                                                                password: e.target.value
                                                            });
                                                        }}
                                                        type={showPassword ? 'text' : 'password'}
                                                        placeholder='Masukkan Password' />
                                                    <div className="absolute w-10 h-full right-0 top-0 cursor-pointer flex items-center justify-center bg-slate-100 border rounded-r"
                                                        onClick={() => setShowPassword(!showPassword)}>
                                                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye}
                                                            className={`${showPassword ? 'text-green-500' : ''} h-4 w-4`} />
                                                    </div>
                                                </div>
                                                <div id="error-users-password" className="text-xs text-red-500"></div>
                                            </div>

                                            <div className="col-span-12 lg:col-span-6">
                                                <label className="font-semibold text-sm mb-1 text-slate-400 select-none">
                                                    Konfirmasi Password
                                                </label>
                                                <div className="relative">
                                                    <input className="w-full p-2 border rounded ring-0 focus:ring-0 outline-0"
                                                        value={editItem?.password_confirmation}
                                                        onChange={(e) => {
                                                            setEditItem({
                                                                ...editItem,
                                                                password_confirmation: e.target.value
                                                            });
                                                        }}
                                                        type={showPassword ? 'text' : 'password'}
                                                        placeholder='Masukkan Konfirmasi Password' />
                                                    <div className="absolute w-10 h-full right-0 top-0 cursor-pointer flex items-center justify-center bg-slate-100 border rounded-r"
                                                        onClick={() => setShowPassword(!showPassword)}>
                                                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye}
                                                            className={`${showPassword ? 'text-green-500' : ''} h-4 w-4`} />
                                                    </div>
                                                </div>
                                                <div id="error-users-password_confirmation" className="text-xs text-red-500"></div>
                                            </div>

                                            <div className="col-span-12 lg:col-span-6">
                                                <label className="font-semibold text-sm mb-1 text-slate-400 select-none">
                                                    Kapasitas Drive
                                                </label>
                                                <div className="relative">
                                                    <input className="w-full p-2 border rounded ring-0 focus:ring-0 outline-0"
                                                        value={editItem?.capacity}
                                                        onChange={(e) => {
                                                            setEditItem({
                                                                ...editItem,
                                                                capacity: e.target.value
                                                            });
                                                        }}
                                                        type="number"
                                                        min={0}
                                                        placeholder='Masukkan Kapasitas Drive' />
                                                    <div className="absolute w-10 h-full right-0 top-0 cursor-pointer flex items-center justify-center bg-slate-100 border rounded-r text-xs font-semibold">
                                                        GB
                                                    </div>
                                                </div>
                                                <div id="error-users-capacity" className="text-xs text-red-500"></div>
                                            </div>


                                            <div className="col-span-12 w-full flex items-center justify-end gap-2">
                                                <div className="">
                                                    <button
                                                        type="button"
                                                        onClick={() => closeEdit()}
                                                        className="py-1 px-3 bg-slate-300 text-black rounded-lg hover:bg-slate-400 transition-all duration-200 flex items-center justify-center text-sm">
                                                        <FontAwesomeIcon icon={faTimes} className="w-3 h-3 mr-1" />
                                                        <span>
                                                            Batal
                                                        </span>
                                                    </button>
                                                </div>
                                                <div className="">
                                                    <button
                                                        type="submit"
                                                        className="py-1 px-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 flex items-center justify-center text-sm">
                                                        <FontAwesomeIcon icon={faSave} className="w-3 h-3 mr-1" />
                                                        <span>
                                                            Simpan
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

        </>
    )
}

export default Users;