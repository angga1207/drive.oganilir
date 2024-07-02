import { useRouter } from "next/router";
import { Fragment, useEffect, useRef, useState } from "react";
import { Dialog, Transition } from '@headlessui/react';
import { faCalendarAlt, faCaretSquareLeft, faCheckSquare, faEye, faFile, faFileArchive, faFileAudio, faFileExcel, faFilePdf, faFilePowerpoint, faFileWord, faFileZipper, faFolder, faFolderBlank, faFolderOpen, faImage, faPlusSquare, faSave, faShareSquare, faTrashAlt, faWindowMaximize, faWindowMinimize } from "@fortawesome/free-regular-svg-icons";
import { faArrowsAlt, faCaretRight, faCheck, faCloudDownloadAlt, faCloudUploadAlt, faFolderPlus, faImagePortrait, faLink, faLock, faMinimize, faPen, faSearch, faShareAlt, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Tippy from "@tippyjs/react";
import 'tippy.js/dist/tippy.css';

import { BaseUri, ClientDomain } from "@/pages/api/serverIP";
import { getItems, getSearch, postFolder, postMoveItems, postPublicity, postRename, postUpload, postDelete, postDownload } from "@/pages/api/main";
import { getPath } from "@/pages/api/navbar";

// Queueing Listeners Start
import { getMessaging, onMessage } from 'firebase/messaging';
import firebaseApp from '@/utils/firebase/firebase';
import useFcmToken from '@/utils/hooks/useFcmToken';
import { getUploadQueue } from '@/pages/api/main';
// Queueing Listeners End

import Swal from 'sweetalert2';
import Head from "next/head";
import axios from "axios";

const showSweetAlert = async (icon: any, title: any, text: any, confirmButtonText: any) => {
    Swal.fire({
        icon: icon,
        title: title,
        text: text,
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

const Main = () => {

    const [ID, setID] = useState<any>(0);
    const [readyToLoad, setReadyToLoad] = useState<boolean>(false);
    const [isMounted, setIsMounted] = useState<boolean>(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);
    const router = useRouter();

    const [user, setUser] = useState<any>(null);
    const [storageData, setStorageData] = useState<any>(null);

    useEffect(() => {
        if (localStorage.getItem('user')) {
            const unRaw = JSON.parse(localStorage.getItem('user') ?? '{}');
            setUser(unRaw);
            setStorageData(unRaw.storage);
        }
    }, [isMounted]);


    // Queueing Listeners Start
    const [isLoaded, setIsLoaded] = useState(false);
    const isLoadingText = 'Sedang Memuat...';
    const [isQueueing, setIsQueueing] = useState(false);
    const [isInQueue, setIsInQueue] = useState(false);
    const [hideQueue, setHideQueue] = useState(false);
    const [queueData, setQueueData] = useState<any>([]);
    const [queueFilesCount, setQueueFilesCount] = useState(0);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            const messaging = getMessaging(firebaseApp);
            const unsubscribe = onMessage(messaging, (payload) => {
                // showAlert('info', payload?.notification?.body);
            });
            return () => {
                unsubscribe(); // Unsubscribe from the onMessage event
            };
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            // const audio = new Audio('/assets/audio/notification.mp3');
            const messaging = getMessaging(firebaseApp);
            const fireNotif = onMessage(messaging, (payload: any) => {
                // show notification
                if (Notification.permission === 'granted') {
                    const notification = new Notification(payload.notification.title, {
                        body: payload.notification.body,
                    });
                    notification.onshow = () => {
                    }
                    // fetchQueue();
                    reloadItems();
                }
            });
            return () => {
                fireNotif(); // triggerNotif from the onMessage event
            };
        }
    }, []);
    // Queueing Listeners End

    const [pickedItem, setPickedItem] = useState<any>(null);
    const [selectState, setSelectState] = useState<boolean>(false);

    const [dropdownNew, setDropdownNew] = useState<boolean>(false);
    const dropdownNewRef = useRef<any>(null);

    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (dropdownNewRef.current && !dropdownNewRef.current.contains(event.target)) {
                setDropdownNew(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownNewRef]);

    const [paths, setPaths] = useState<any>([]);
    const [isPathLoaded, setIsPathLoaded] = useState<boolean>(true);
    const [currentPath, setCurrentPath] = useState<any>(null); // [1]

    useEffect(() => {
        if (router.query._id) {
            setID(router.query._id);
        } else {
            router.query._id = '0';
        }
        setReadyToLoad(true);
    }, [router.query._id, ID]);

    useEffect(() => {
        if (readyToLoad) {
            setIsPathLoaded(false);
            getPath(router.query._id).then((res) => {
                if (res.status == 'success') {
                    setPaths(res.data.paths);
                    setCurrentPath(res.data.current);
                    setIsPathLoaded(true);
                }
            });
        }
    }, [router.query._id]);

    const pickFolder = (item: number) => {
        setDatas([]);
        router.query._id = item.toString();
        router.push(router, undefined, { shallow: true })
    };

    const unPickFolder = () => {
        router.query._id = '';
        router.push(router, undefined, { shallow: true })
    }

    const goToFile = (item: any) => {
        if (item.type == 'folder') {
            pickFolder(item.slug);
        }
        if (item.type == 'file') {
            if (item.parent_slug != ID) {
                pickFolder(item.parent_slug);
            }

            setTimeout(() => {
                __scrollToFile(item);
            }, 500);
        }
    }

    const __scrollToFile = (item: any) => {
        if (item.parent_slug.toString() == ID) {
            const el = document.getElementById(`listitem-${item.slug}`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
            }

            setPickedItem(item);
        }
    }

    const [modalPreview, setModalPreview] = useState<boolean>(false);
    const [modalPreviewType, setModalPreviewType] = useState<any>('preview');

    const openFile = (item: any, previewType: any = 'preview') => {
        setModalPreviewType('preview')
        if (item) {
            setModalPreview(true);
            setPickedItem(item);
            setModalPreviewType(previewType);
        }
    }

    const closeModalPreview = () => {
        setModalPreview(false);
    }

    const [showPanel, setShowPanel] = useState<boolean>(false);

    const [selectedItems, setSelectedItems] = useState<any>([]);
    const [onDragState, setOnDragState] = useState<boolean>(false);
    const [ExternalDrag, setExternalDrag] = useState<boolean>(true);

    const [datas, setDatas] = useState<any>([]);

    useEffect(() => {
        if (readyToLoad) {
            setIsLoaded(true);
            getItems(router.query._id).then((res) => {
                if (res.status === 'success') {
                    setDatas(res.data);
                }
                else if (res.status === 'error') {
                    showSweetAlert('info', 'Peringatan', res?.message, 'Tutup');
                }
                setIsLoaded(false);
            });
        }
    }, [router.query._id]);

    const reloadItems = () => {
        // setIsLoaded(true);
        getItems(router.query._id).then((res) => {
            if (res.status === 'success') {
                setDatas(res.data);
            }
            else if (res.status === 'error') {
                showSweetAlert('info', 'Peringatan', res?.message, 'Tutup');
            }
            // setIsLoaded(false);
        });
    }

    const [search, setSearch] = useState<any>(null);
    const [searchedItems, setSearchedItems] = useState<any>([]);
    const [isOpenSearchBar, setIsOpenSearchBar] = useState<boolean>(false);

    const __getSearch = () => {
        if (search) {
            getSearch(search).then((res) => {
                if (res.status == 'success') {
                    setSearchedItems(res.data);
                    setIsOpenSearchBar(true);
                }
                else if (res.status === 'error') {
                    showSweetAlert('info', 'Peringatan', res?.message, 'Tutup');
                }
            });
        }
    }

    const searchBarRef = useRef<any>(null);

    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
                setIsOpenSearchBar(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [searchBarRef]);

    useEffect(() => {
        if (!search) {
            setSearchedItems([])
            setIsOpenSearchBar(false);
        }
    }, [search])

    const [files, setFiles] = useState<any>({
        folderId: ID,
        files: []
    });
    const [fileEnter, setFileEnter] = useState(false);
    const [onUpload, setOnUpload] = useState<boolean>(false);

    useEffect(() => {
        if (files?.files?.length > 0) {
            setOnUpload(true);
            setOnDragState(false);

            for (let i = 0; i < files.files.length; i++) {
                const newQueue = {
                    id: i + 1,
                    name: files.files[i].name,
                    size: files.files[i].size,
                    progress: 0,
                    status: 'uploading',
                }
                setQueueData((prev: any) => [
                    ...prev,
                    newQueue
                ]);
            }

            AxiosUploads(files.files).then((res: any) => {
                if (res?.status == 'success') {
                    showAlert('success', 'Berhasil', res?.message);
                }
                else if (res?.status === 'error') {
                    showSweetAlert('info', 'Peringatan', res?.message, 'Tutup');
                } else {
                    showAlert('success', 'Berhasil', 'Berkas berhasil diunggah!');
                }

                // if (res?.data?.parent_slug == ID) {
                reloadItems();
                // }
                setOnUpload(false);
                setQueueData([]);
            });
            setFiles({
                folderId: ID,
                files: []
            });
        }
    }, [files.files]);

    const AxiosUploads = async (files: any) => {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileName = file.name;
            const fileSize = file.size;
            const formData = new FormData();
            formData.append('files[]', file);
            formData.append('folderId', ID);
            try {
                const res = await axios.post(`${BaseUri()}/upload/${ID}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    onUploadProgress: (progressEvent: any) => {
                        const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                        setQueueData((prev: any) => {
                            return prev.map((item: any) => {
                                if (item?.id == i + 1) {
                                    if (item?.name == fileName) {
                                        item.progress = progress;
                                    }
                                    if (item?.progress == 100) {
                                        item.status = 'uploaded';
                                    }
                                    return item;
                                }
                            });
                        });
                    }
                });
                // const response = await res.data;
                // return response;
            } catch (error) {
                return {
                    status: 'error',
                    message: error
                }
            }
        }
    }

    const [formFolder, setFormFolder] = useState<any>({
        inputType: 'create',
        id: null,
        name: '',
        parent_slug: ID,
    });
    const [modalFolder, setModalFolder] = useState<boolean>(false);

    const openModalFolder = () => {
        setFormFolder({
            inputType: 'create',
            id: null,
            name: '',
            parent_slug: ID,
        });
        setModalFolder(true);
    }

    const closeModalFolder = () => {
        setFormFolder({
            inputType: 'create',
            id: null,
            name: '',
            parent_slug: ID,
        });
        setModalFolder(false);
    }

    const __postFolder = () => {
        postFolder(formFolder).then((res) => {
            if (res.status == 'success') {
                reloadItems();
                closeModalFolder();
                showAlert('success', 'Berhasil', res?.message);
            }
            else if (res.status === 'error') {
                closeModalFolder();
                showSweetAlert('info', 'Peringatan', res?.message, 'Tutup');
            }
            else if (res.status == 'error validation') {
                Object.keys(res.message).map((key) => {
                    const error = res.message[key];
                    const el = document.getElementById(`error-folder-${key}`);
                    if (el) {
                        el.innerHTML = error;
                    }
                });
            }
        });
    }

    const [editItem, setEditItem] = useState<any>(null);
    const [modalEdit, setModalEdit] = useState<boolean>(false);

    const goEdit = (item: any) => {
        setEditItem(item);
        setModalEdit(true);
    }

    const closeEdit = () => {
        setEditItem(null);
        setModalEdit(false);
    }

    const __rename = () => {
        postRename(editItem.slug, editItem.name).then((res) => {
            if (res.status == 'success') {
                reloadItems();
                closeEdit();
                showAlert('success', 'Berhasil', res?.message);
            } else if (res.status == 'error validation') {
                Object.keys(res.message).map((key) => {
                    const error = res.message[key];
                    const el = document.getElementById(`error-rename-${key}`);
                    if (el) {
                        el.innerHTML = error;
                    }
                });
            }
        });
    }

    const [dropTargetId, setDropTargetId] = useState<any>(null);
    const [formMoveItems, setFormMoveItems] = useState<any>({
        targetId: null,
        sourceIds: [],
    });

    const __moveTo = (sourceId: any, targetId: any) => {
        if (targetId !== sourceId) {
            setFormMoveItems({
                targetId: targetId ?? 0,
                sourceIds: [sourceId],
            });
        }
    }

    const __moveMassTo = (targetId: any) => {
        const sourceIds = selectedItems;
        if (!sourceIds.includes(targetId)) {
            setFormMoveItems({
                targetId: targetId ?? 0,
                sourceIds: sourceIds,
            });
        }
        setSelectedItems([]);
        setSelectState(false);
    }

    const [modalMoveItems, setModalMoveItems] = useState<boolean>(false);

    const __moveMass = () => {
        setModalMoveItems(true);
    }

    const closeModalMoveItems = () => {
        setModalMoveItems(false);
    }

    useEffect(() => {
        if (formMoveItems.targetId || formMoveItems.targetId == 0) {
            postMoveItems(formMoveItems).then((res) => {
                if (res.status == 'success') {
                    reloadItems();
                    setFormMoveItems({
                        targetId: null,
                        sourceIds: [],
                    });
                    showAlert('success', 'Berhasil', res?.message);
                } else {
                    showAlert('error', 'Gagal', res?.message);
                }
            });
        }
    }, [formMoveItems.targetId, formMoveItems.sourceIds]);

    const __confirmDeleteSingle = (id: number) => {
        Swal.fire({
            title: 'Apakah Anda Yakin?',
            text: 'Anda tidak akan dapat mengembalikan ini!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                postDelete([id]).then((res) => {
                    if (res.status == 'success') {
                        reloadItems();
                        showAlert('success', 'Berhasil', res?.message);
                    } else {
                        showAlert('error', 'Gagal', res?.message);
                    }
                });
            }
        });
    }

    const __confirmDeleteMass = () => {
        if (selectState) {
            Swal.fire({
                title: `${selectedItems.length} Item Akan Dihapus`,
                text: 'Anda tidak akan dapat mengembalikan ini!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Ya, Hapus!',
                cancelButtonText: 'Batal',
            }).then((result) => {
                if (result.isConfirmed) {
                    postDelete(selectedItems).then((res) => {
                        if (res.status == 'success') {
                            reloadItems();
                            setSelectedItems([]);
                            setSelectState(false);
                            showAlert('success', 'Berhasil', res?.message);
                        } else {
                            showAlert('error', 'Gagal', res?.message);
                        }
                    });
                }
            });
        } else {
            showAlert('error', 'Gagal', 'Tidak ada item yang dipilih');
        }
    }

    const [modalShare, setModalShare] = useState<boolean>(false);
    const [showShareLink, setShowShareLink] = useState<boolean>(false);

    const goShare = (item: any) => {
        setEditItem(item);
        if (item.publicity.status == 'public') {
            setShowShareLink(true);
        }
        setModalShare(true);
    }

    const closeShare = () => {
        setEditItem(null);
        setModalShare(false);
        setShowShareLink(false);
    }

    const __postPublicity = () => {
        postPublicity(editItem.slug, editItem).then((res) => {
            if (res.status == 'success') {
                reloadItems();
                // closeShare();
                showAlert('success', 'Berhasil', res?.message);
                setShowShareLink(true);
            } else if (res.status == 'error validation') {
                Object.keys(res.message).map((key) => {
                    const error = res.message[key];
                    const el = document.getElementById(`error-publicity-${key}`);
                    if (el) {
                        el.innerHTML = error;
                    }
                });
            }
        });
    }

    const __isoFileSize = (bytes: number) => {
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes == 0) return '0 Byte';
        const i = parseInt(String(Math.floor(Math.log(bytes) / Math.log(1024))));
        return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
    }

    const [isOnDownload, setIsOnDownload] = useState<boolean>(false);
    const [onDownloadId, setOnDownloadId] = useState<any>(null);

    const __confirmDownload = (item: any) => {
        if (isOnDownload == false) {
            Swal.fire({
                title: 'Apakah Anda Yakin?',
                text: 'Anda akan mengunduh ini!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Ya, Unduh!',
                cancelButtonText: 'Batal',
            }).then((result) => {
                if (result.isConfirmed) {
                    setOnDownloadId(item.slug);
                    setIsOnDownload(true);
                    postDownload(item.slug).then((res) => {
                        if (res.status == 'success') {
                            showAlert('success', 'Berhasil', res?.message);
                            window.open(res.data, '_blank');
                        } else {
                            showAlert('error', 'Gagal', res?.message);
                        }
                        setIsOnDownload(false);
                        setOnDownloadId(null);
                    });
                }
            });
        }
        if (isOnDownload == true) {
            showAlert('info', 'Sedang Mengunduh', 'Mohon tunggu hingga proses selesai');
        }
    }
    // setContextMenu
    const [contextMenu, setContextMenu] 



    return (
        <>
            <Head>
                <title>
                    {currentPath?.name ?? 'Root'} | Drive Ogan Ilir
                </title>
                <meta
                    name="description"
                    content={`${currentPath?.name ?? 'Root'} | Drive Ogan Ilir`}
                    key="description"
                />
                <meta
                    property="og:description"
                    content={`${currentPath?.name ?? 'Root'} | Drive Ogan Ilir`}
                    key="og:description"
                />
                <meta
                    property="og:title"
                    content={currentPath?.name ?? 'Root'}
                    key="og:title"
                />
                <meta
                    property="og:site_name"
                    content="Drive Ogan Ilir"
                    key="og:site_name"
                />
                <meta
                    property="og:url"
                    content={ClientDomain() + '?_id=' + ID}
                    key="og:url"
                />
                <meta
                    property="og:type"
                    content="filemanager"
                    key="og:type"
                />
                <meta name="twitter:card" content="summary" key="twitter:card" />
                <meta name="twitter:site" content="@driveoganilir" key="twitter:site" />
                <meta name="twitter:creator" content="@driveoganilir" key="twitter:creator" />
                <meta name="twitter:title" content={`${currentPath?.name ?? 'Root'} | Drive Ogan Ilir`} key="twitter:title" />
                <meta name="twitter:description" content={`${currentPath?.name ?? 'Root'} | Drive Ogan Ilir`} key="twitter:description" />
            </Head>

            <div onDragOver={() => {
                setOnDragState(true);
            }}>
                {/* NavBar Start */}
                <div className="mt-8">
                    <div className="flex flex-wrap gap-y-4 sm:flex-nowrap items-center justify-between">

                        {isPathLoaded == true ? (
                            <div className="flex items-center gap-x-2">

                                <div className="">
                                    {selectedItems.length > 0 && (
                                        <div>
                                            {selectedItems.length} item terpilih
                                        </div>
                                    )}
                                </div>

                                <Tippy content="Pilih Folder / Berkas" delay={300}>
                                    <div className={`${selectState ? 'bg-red-400 text-white' : 'bg-sky-200 text-sky-600'}  hover:bg-sky-400 hover:text-white transition-all duration-200 px-3 py-1.5 rounded flex items-center justify-center gap-1 cursor-pointer`}
                                        onClick={() => {
                                            setSelectState(!selectState);
                                            if (selectState) {
                                                setSelectedItems([]);
                                            }
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faCheckSquare} className="w-4 h-4" />
                                        {selectState ? 'BATAL PILIH' : 'PILIH'}
                                    </div>
                                </Tippy>

                                {selectState && (
                                    <>
                                        <Tippy content="Pindahkan Folder / Berkas" delay={300}>
                                            <div
                                                onClick={(e) => {
                                                    if (selectState) {
                                                        if (selectedItems?.length > 0) {
                                                            __moveMass();
                                                        }
                                                    }
                                                }}
                                                className="bg-orange-200 text-orange-600 hover:bg-orange-400 hover:text-white transition-all duration-200 px-3 py-2 rounded flex items-center justify-center gap-1 cursor-pointer">
                                                <FontAwesomeIcon icon={faArrowsAlt} className="w-4 h-4" />
                                            </div>
                                        </Tippy>

                                        <Tippy content="Hapus Folder / Berkas" delay={300}>
                                            <div
                                                onClick={(e) => {
                                                    if (selectState) {
                                                        if (selectedItems?.length > 0) {
                                                            __confirmDeleteMass()
                                                        }
                                                    }
                                                }}
                                                className="bg-red-200 text-red-600 hover:bg-red-400 hover:text-white transition-all duration-200 px-3 py-2 rounded flex items-center justify-center gap-1 cursor-pointer">
                                                <FontAwesomeIcon icon={faTrashAlt} className="w-4 h-4" />
                                            </div>
                                        </Tippy>
                                    </>
                                )}

                            </div>
                        ) : (
                            <div className="h-9 w-[100px] bg-sky-200 rounded animate-pulse"></div>
                        )}

                        {isPathLoaded == true ? (
                            <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-2">
                                <div className="relative">
                                    <form className="relative"
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            __getSearch();
                                        }}>
                                        <div className="absolute left-0 top-0 w-10 h-full flex items-center justify-center">
                                            <FontAwesomeIcon icon={faSearch} className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            type="search"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            onFocus={() => {
                                                setIsOpenSearchBar(true);
                                            }}
                                            className={`${isOpenSearchBar ? 'w-[400px]' : 'w-[200px]'} max-w-[calc(100vw-150px)] border border-gray-300 rounded-xl px-3 py-2 pl-10 focus:outline-none transition-all duration-300`}
                                            placeholder="Pencarian..." />
                                    </form>

                                    {isOpenSearchBar && (
                                        <div ref={searchBarRef}
                                            className="absolute z-30 mt-2 right-0 w-[400px] max-w-full bg-white shadow p-4 rounded">
                                            <div className="flex items-center justify-between">
                                                <div className="text-xs font-bold text-slate-500">
                                                    Daftar Hasil Pencarian :
                                                </div>
                                                <div className="text-xs font-bold text-slate-500">
                                                    {searchedItems?.length} item
                                                </div>
                                            </div>
                                            <div className="max-h-[400px] relative overflow-auto space-y-3 mt-4 select-none">
                                                {searchedItems.length == 0 && (
                                                    <div className="text-center text-slate-500">
                                                        Tidak ada item yang ditemukan
                                                    </div>
                                                )}

                                                {searchedItems?.map((item: any, index: number) => (

                                                    <div key={`searched-item-${index}`}
                                                        className="px-3 py-2 hover:bg-sky-100 rounded cursor-pointer"
                                                        onClick={() => {
                                                            goToFile(item);
                                                        }}>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-none w-4 h-4">
                                                                <FontAwesomeIcon icon={item.type == 'folder' ? faFolder : faFile} className="w-4 h-4 text-blue-800" />
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold line-clamp-2 select-none">
                                                                    {item.type == 'folder' ? (
                                                                        <>
                                                                            {item.name}
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            {item.name}.{item.extension}
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-x-3 border-t pt-1 mt-1.5 mx-1">
                                                            <div className="flex items-center text-gray-400">
                                                                <FontAwesomeIcon icon={faFolder} className="w-3 h-3 mr-1" />
                                                                <div className="whitespace-nowrap text-xs">
                                                                    {item.parent_name}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center text-gray-400">
                                                                <FontAwesomeIcon icon={faCalendarAlt} className="w-3 h-3 mr-1" />
                                                                <div className="whitespace-nowrap text-xs">
                                                                    {new Date(item.created_at).toLocaleString('id-ID', {
                                                                        day: 'numeric',
                                                                        month: 'short',
                                                                        year: 'numeric',
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {onUpload == false && (
                                    <div ref={dropdownNewRef} className="flex items-center gap-x-2">
                                        <div className="relative"
                                            onClick={() => {
                                                setDropdownNew(!dropdownNew);
                                            }}>
                                            <div className={`${dropdownNew ? 'bg-gradient-to-r from-blue-500 to-blue-300 text-white' : 'bg-sky-200 text-sky-600'} hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-300 hover:text-white shadow transition-all duration-300 px-5 py-2 rounded flex items-center justify-center gap-1 cursor-pointer font-semibold`}>
                                                <FontAwesomeIcon icon={faPlusSquare} className="w-3 h-3" />
                                                UNGGAH
                                            </div>

                                            <div className={`${dropdownNew ? 'block' : 'hidden'} absolute rounded bg-white shadow border min-w-[200px] right-0 mt-2 z-10`}>

                                                <div
                                                    onClick={(e) => {
                                                        openModalFolder();
                                                    }}
                                                    className="px-4 py-3 flex items-center group/item hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-300 rounded-t cursor-pointer transition-all duration-300">
                                                    <FontAwesomeIcon icon={faFolderPlus} className="w-4 h-4 mr-2 text-blue-800 group-hover/item:text-white" />
                                                    <span className="font-semibold text-blue-800 group-hover/item:text-white">
                                                        FOLDER
                                                    </span>
                                                </div>

                                                <div className="relative group/item hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-300 rounded-b cursor-pointer transition-all duration-300">
                                                    <div className="px-4 py-3 flex items-center">
                                                        <FontAwesomeIcon icon={faCloudUploadAlt} className="w-4 h-4 mr-2 text-blue-800 group-hover/item:text-white" />
                                                        <span className="font-semibold text-blue-800 group-hover/item:text-white">
                                                            BERKAS
                                                        </span>
                                                    </div>
                                                    <input className="opacity-0 w-full h-full absolute top-0 left-0 cursor-pointer"
                                                        type="file"
                                                        multiple

                                                        onChange={(e) => {
                                                            setFiles((prev: any) => {
                                                                const files = e.target.files;
                                                                const updated = { ...prev };
                                                                updated['files'] = files;
                                                                return updated;
                                                            });
                                                        }} />
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-2">
                                <div className="h-9 w-[200px] bg-slate-200 rounded animate-pulse"></div>
                                <div className="h-9 w-[120px] bg-sky-200 rounded animate-pulse"></div>
                            </div>
                        )}

                    </div>

                    {/* Capacity Bar Start */}
                    {isPathLoaded == true ? (
                        <div className="mt-2 hidden xl:block">
                            {/* storageData */}
                            <Tippy content={`Kapasitas Drive Anda Tersisa ${storageData?.rest ?? 0}`} delay={300}>
                                <div className="relative bg-gray-200 h-4 w-full xl:w-[300px] rounded-full overflow-hidden cursor-pointer group">
                                    <div className="bg-gradient-to-r from-blue-500 to-blue-300 animate-pulse h-full"
                                        style={
                                            {
                                                width: `${storageData?.percent ?? 0}%`
                                            }
                                        }>
                                    </div>
                                    <div className="absolute left-1 top-0 z-10 h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                        <div className="font-semibold text-[10px]">
                                            {storageData?.used}
                                        </div>
                                    </div>
                                    <div className="absolute right-1 top-0 z-10 h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                        <div className="font-semibold text-[10px]">
                                            {storageData?.total}
                                        </div>
                                    </div>
                                </div>
                            </Tippy>
                        </div>
                    ) : (
                        <div className="mt-2 h-4 w-[300px] bg-slate-200 rounded-xl animate-pulse"></div>
                    )}
                    {/* Capacity Bar End */}

                    {/* Navigation Start */}
                    <div className="flex items-center gap-2 justify-start max-w-full overflow-auto mt-3 pb-3 select-none">

                        {isPathLoaded == true && (
                            <>
                                <div
                                    onClick={() => {
                                        if (selectState == false) {
                                            router.query._id = '0';
                                            router.push(router);
                                        }
                                    }}
                                    className="cursor-pointer font-semibold hover:text-sky-600 flex items-center">
                                    <FontAwesomeIcon icon={faFolder} className="w-3 h-3 mr-1" />
                                    <span className="whitespace-nowrap">
                                        Root
                                    </span>
                                </div>

                                {paths?.map((path: any, index: number) => (
                                    <div
                                        key={'path-' + index}
                                        onClick={() => {
                                            if (selectState == false) {
                                                router.query._id = path.slug;
                                                router.push(router);
                                            }
                                        }}
                                        className="cursor-pointer font-semibold hover:text-sky-600 flex items-center">
                                        <FontAwesomeIcon icon={faCaretRight} className="w-3 h-3 text-gray-400 mr-1" />
                                        <FontAwesomeIcon icon={faFolder} className="w-3 h-3 mr-1" />
                                        <span className="whitespace-nowrap">
                                            {path.name}
                                        </span>
                                    </div>
                                ))}

                                {currentPath && (
                                    <div
                                        className="cursor-pointer font-semibold hover:text-sky-600 flex items-center">
                                        <FontAwesomeIcon icon={faCaretRight} className="w-3 h-3 text-gray-400 mr-1" />
                                        <FontAwesomeIcon icon={faFolderOpen} className="w-3 h-3 mr-1" />
                                        <span className="whitespace-nowrap">
                                            {currentPath.name}
                                        </span>
                                    </div>
                                )}
                            </>
                        )}

                        {isPathLoaded == false && (
                            <div className="h-4 w-[300px] bg-slate-200 rounded animate-pulse"></div>
                        )}

                    </div>
                    {/* Navigation End */}

                </div >
                {/* NavBar Start */}


                {/* Main Start */}
                <div className="grid grid-cols-10 gap-4">
                    <div className={`col-span-10 ${showPanel ? 'xl:col-span-7' : 'xl:col-span-10'} mt-0 relative overflow-auto max-w-full h-[calc(100vh-280px)]`}>

                        {isLoaded && (
                            <div className="w-full h-full flex justify-center items-center rounded shadow-lg bg-white">
                                <div className="flex items-center justify-center flex-col gap-y-3">
                                    <div className="w-24 h-24 p-4 rounded-full bg-sky-300 animate-bounce shadow-2xl">
                                        <img src="/favicon.png" alt="Loading" className="" />
                                    </div>
                                    <div className="text-3xl">
                                        {isLoadingText}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            {ID !== '0' && (
                                <div
                                    onClick={() => {
                                        if (selectState == false) {
                                            if (currentPath) {
                                                pickFolder(currentPath?.parent_slug?.toString() ?? '0');
                                            }
                                        }
                                    }}
                                    onDragOver={
                                        (e) => {
                                            e.preventDefault();
                                            setOnDragState(true);
                                            setDropTargetId(currentPath?.parent_slug ? currentPath?.parent_slug : 0);
                                        }
                                    }
                                    className="px-5 py-6 shadow bg-slate-100 hover:bg-sky-100 rounded flex flex-col xl:flex-row xl:items-center justify-between gap-y-3 group/item cursor-pointer select-none">
                                    <div className="flex items-center group-hover/item:text-sky-500">
                                        <FontAwesomeIcon icon={faCaretSquareLeft} className="w-4 h-4 mr-2" />
                                        <div className="font-semibold">
                                            Kembali
                                        </div>
                                    </div>
                                </div>
                            )}

                            {datas?.map((item: any, index: number) => (

                                <div key={`item-${item?.id}`}
                                    className={`${onDragState ? '' : ''} ${pickedItem?.slug == item?.slug ? '!bg-slate-100' : ''} ${selectedItems.includes(item.slug) ? '!bg-slate-100' : ''} px-5 shadow bg-white hover:bg-slate-100 rounded flex flex-col xl:flex-row xl:items-center justify-between gap-y-3 group/item cursor-pointer select-none relative`}
                                    id={`listitem-${item.slug}`}
                                    onDragOver={
                                        (e) => {
                                            e.preventDefault();
                                            setOnDragState(true);
                                            // setExternalDrag(false);
                                            setDropTargetId(item.slug);
                                        }
                                    }
                                    onDragStartCapture={(e) => {
                                        setExternalDrag(false);
                                    }}
                                    onDragLeave={
                                        () => {
                                            setOnDragState(false);
                                        }
                                    }
                                    onDragEnd={
                                        (e: any) => {
                                            setOnDragState(false);
                                            setExternalDrag(true);
                                            if (selectState) {
                                                __moveMassTo(dropTargetId);
                                            }
                                            else if (selectState == false) {
                                                __moveTo(item.slug, dropTargetId);
                                            }
                                        }
                                    }

                                    // on right click
                                    onContextMenu={(e) => {
                                        e.preventDefault();
                                        // show context menu
                                        setContextMenu({
                                            top: e.clientY,
                                            left: e.clientX,
                                            show: true,
                                            item: item,
                                        });
                                    }}
                                    
                                    draggable={true}>

                                    {selectState && (
                                        <div className="flex-none w-8">
                                            <input
                                                type="checkbox"
                                                value={item.slug}
                                                checked={selectedItems.includes(item.slug)}
                                                onChange={() => {
                                                    if (selectedItems.includes(item.slug)) {
                                                        setSelectedItems(selectedItems.filter((i: number) => i !== item.slug));
                                                    } else {
                                                        setSelectedItems([...selectedItems, item.slug]);
                                                    }
                                                }}
                                                className="form-checkbox" />
                                        </div>
                                    )}

                                    <div className="grow flex items-center py-6"
                                        onClick={() => {
                                            if (selectState) {
                                                if (selectedItems.includes(item.slug)) {
                                                    setSelectedItems(selectedItems.filter((i: number) => i !== item.slug));
                                                } else {
                                                    setSelectedItems([...selectedItems, item.slug]);
                                                }
                                            }
                                            else {
                                                setPickedItem(item);
                                            }
                                        }}
                                        onDoubleClick={() => {
                                            if (selectState == false) {
                                                if (item.type == 'folder') {
                                                    pickFolder(item.slug);
                                                }
                                                if (item.type == 'file') {
                                                    openFile(item);
                                                }
                                            }
                                        }}>
                                        <div className="mr-3">
                                            {item.type == 'folder' && (
                                                <>
                                                    <FontAwesomeIcon icon={faFolder} className="w-6 h-6 text-blue-800 block group-hover/item:hidden" />
                                                    <FontAwesomeIcon icon={faFolderOpen} className="w-6 h-6 text-blue-800 hidden group-hover/item:block" />
                                                </>
                                            )}
                                            {item.type == 'file' && (
                                                <div className="w-6 h-6">
                                                    {item.extension == 'pdf' && (
                                                        <FontAwesomeIcon icon={faFilePdf} className="w-6 h-6 text-blue-800 group-hover/item:rotate-12" />
                                                    )}

                                                    {['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'z'].includes(item.extension) && (
                                                        <FontAwesomeIcon icon={faFileZipper} className="w-6 h-6 text-blue-800 group-hover/item:rotate-12" />
                                                    )}

                                                    {['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'tiff', 'ico', 'psd', 'ai', 'indd', 'raw', 'webp', 'svg'].includes(item.extension) && (
                                                        <FontAwesomeIcon icon={faImage} className="w-6 h-6 text-blue-800 group-hover/item:rotate-12" />
                                                    )}

                                                    {['mp3', 'wav', 'ogg', 'wma', 'm4a', 'flac', 'aac'].includes(item.extension) && (
                                                        <FontAwesomeIcon icon={faFileAudio} className="w-6 h-6 text-blue-800 group-hover/item:rotate-12" />
                                                    )}

                                                    {['mp4', 'mkv', 'webm', 'flv', 'vob', 'ogv', 'ogg', 'drc', 'gifv', 'mng', 'avi', 'mts', 'm2ts', 'mov', 'qt', 'wmv', 'yuv', 'rm', 'rmvb', 'asf', 'amv', 'mpg', 'mp2', 'mpeg', 'mpe', 'mpv', 'm4p', 'm4v', 'svi', '3gp', '3g2', 'mxf', 'roq', 'nsv', 'flv', 'f4v', 'f4p', 'f4a', 'f4b'].includes(item.extension) && (
                                                        <FontAwesomeIcon icon={faFileAudio} className="w-6 h-6 text-blue-800 group-hover/item:rotate-12" />
                                                    )}

                                                    {(item.extension == 'doc'
                                                        || item.extension == 'docx') && (
                                                            <FontAwesomeIcon icon={faFileWord} className="w-6 h-6 text-blue-800 group-hover/item:rotate-12" />
                                                        )}

                                                    {(item.extension == 'xls'
                                                        || item.extension == 'xlsx'
                                                        || item.extension == 'csv') && (
                                                            <FontAwesomeIcon icon={faFileExcel} className="w-6 h-6 text-blue-800 group-hover/item:rotate-12" />
                                                        )}

                                                    {(item.extension == 'ppt'
                                                        || item.extension == 'pptx') && (
                                                            <FontAwesomeIcon icon={faFilePowerpoint} className="w-6 h-6 text-blue-800 group-hover/item:rotate-12" />
                                                        )}
                                                    {['html', 'json', 'dmg', 'exe'].includes(item.extension) && (
                                                        <FontAwesomeIcon icon={faFile} className="w-6 h-6 text-blue-800 group-hover/item:rotate-12" />
                                                    )}

                                                </div>
                                            )}
                                        </div>
                                        <div className="">
                                            <div className="flex items-center gap-2">
                                                <div className="line-clamp-2 font-semibold">
                                                    {item.type == 'folder' && (
                                                        <>
                                                            {item.name}
                                                        </>
                                                    )}
                                                    {item.type == 'file' && (
                                                        <>
                                                            {`${item.name}.${item.extension}`}
                                                        </>
                                                    )}

                                                </div>
                                                <div className="">
                                                    {item.publicity.status == 'public' && (
                                                        <FontAwesomeIcon icon={faShareAlt} className="w-3 h-3 text-green-500" />
                                                    )}
                                                    {item.publicity.status == 'private' && (
                                                        <FontAwesomeIcon icon={faLock} className="w-3 h-3 text-blue-500" />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-slate-400 text-xs flex items-center mt-1">
                                                <div className="text-xs text-slate-400 mr-2">
                                                    {/* {item.type == 'file' && (
                                                        <span className="mr-2">
                                                            {item.full_mime}
                                                        </span>
                                                    )} */}
                                                    {item.type === 'file' && (
                                                        <span>
                                                            {item.size}
                                                        </span>
                                                    )}
                                                    {item.type === 'folder' && (
                                                        <span>{item.childs} berkas</span>
                                                    )}
                                                </div>
                                                <FontAwesomeIcon icon={faCalendarAlt} className="w-2.5 h-2.5 mr-1" />
                                                <span>
                                                    {new Date(item.created_at).toLocaleString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: 'numeric',
                                                        minute: 'numeric',
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between xl:justify-normal gap-x-4 w-full xl:w-auto">
                                        {selectState == false && (
                                            <div className="flex items-center gap-x-2 transition-all duration-200 xl:opacity-0 xl:group-hover/item:opacity-100">

                                                {item.type == 'file' && (
                                                    <Tippy content={
                                                        <div className="p-1 flex flex-col gap-2">

                                                            <div
                                                                onClick={(e) => {
                                                                    openFile(item, 'preview');
                                                                }}
                                                                className="flex items-center text-sm cursor-pointer">
                                                                <FontAwesomeIcon icon={faEye} className="w-3 h-3 mr-2" />
                                                                <span>
                                                                    Preview
                                                                </span>
                                                            </div>

                                                            {['xls', 'xlsx'].includes(item.extension) && (
                                                                <div
                                                                    onClick={(e) => {
                                                                        openFile(item, 'spreadsheet');
                                                                    }}
                                                                    className="flex items-center text-sm cursor-pointer">
                                                                    <FontAwesomeIcon icon={faFileExcel} className="w-3 h-3 mr-2" />
                                                                    <span>
                                                                        Spreadsheet
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {['doc', 'docx'].includes(item.extension) && (
                                                                <div
                                                                    onClick={(e) => {
                                                                        openFile(item, 'doc');
                                                                    }}
                                                                    className="flex items-center text-sm cursor-pointer">
                                                                    <FontAwesomeIcon icon={faFileWord} className="w-3 h-3 mr-2" />
                                                                    <span>
                                                                        Google Doc
                                                                    </span>
                                                                </div>
                                                            )}

                                                        </div>
                                                    }
                                                        allowHTML={true}
                                                        interactive={true}
                                                        delay={300}>
                                                        <div
                                                            className="rounded-full hover:bg-slate-200 p-1.5 cursor-pointer">
                                                            <FontAwesomeIcon icon={faEye} className="w-4 h-4 text-slate-400 hover:text-slate-500" />
                                                        </div>
                                                    </Tippy>
                                                )}

                                                <Tippy content="Bagikan" delay={300}>
                                                    <div
                                                        onClick={() => {
                                                            goShare(item);
                                                        }}
                                                        className="rounded-full hover:bg-green-200 p-1.5 cursor-pointer">
                                                        <FontAwesomeIcon icon={faShareSquare} className="w-4 h-4 text-green-400 hover:text-green-500" />
                                                    </div>
                                                </Tippy>

                                                {item.type == 'file' && (
                                                    <Tippy content="Unduh" delay={300}>
                                                        <div
                                                            onClick={() => {
                                                                __confirmDownload(item);
                                                            }}
                                                            className="rounded-full hover:bg-sky-200 p-1.5 cursor-pointer">
                                                            <FontAwesomeIcon icon={faCloudDownloadAlt} className="w-4 h-4 text-sky-400 hover:text-sky-500" />
                                                        </div>
                                                    </Tippy>
                                                )}

                                                <Tippy content="Sunting" delay={300}>
                                                    <div
                                                        onClick={() => {
                                                            goEdit(item);
                                                        }}
                                                        className="rounded-full hover:bg-blue-200 p-2 cursor-pointer">
                                                        <FontAwesomeIcon icon={faPen} className="w-3 h-3 text-blue-400 hover:text-blue-500" />
                                                    </div>
                                                </Tippy>

                                                <Tippy content="Hapus" delay={300}>
                                                    <div
                                                        onClick={(e) => {
                                                            __confirmDeleteSingle(item.slug);
                                                        }}
                                                        className="rounded-full hover:bg-red-200 p-2 cursor-pointer">
                                                        <FontAwesomeIcon icon={faTrashAlt} className="w-3 h-3 text-red-400 hover:text-red-500" />
                                                    </div>
                                                </Tippy>

                                            </div>
                                        )}
                                    </div>

                                    {isOnDownload && onDownloadId == item.slug && (
                                        <>
                                            <div className="absolute top-0 left-0 w-full h-full bg-sky-300 rounded">
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <div className="relative z-20 text-2xl font-bold text-sky-300 tracking-widest">
                                                        SEDANG MENGUNDUNG
                                                    </div>
                                                    <div className="absolute top-0 left-0 flex items-center w-full h-full animate-marquee z-10">
                                                        <div className="w-80 h-full bg-white/50 -skew-x-12"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                            ))}

                        </div>

                    </div>
                    <div className={`${showPanel ? 'xl:col-span-3' : 'hidden'} p-4 bg-white rounded shadow-lg`}>
                        <div className="flex items-center justify-between">
                            <div className="font-semibold">
                                {editItem?.name}
                            </div>
                            <div className="">
                                <FontAwesomeIcon icon={faTimes}
                                    className="w-4 h-4 cursor-pointer hover:text-red-500 transition-all duration-200"
                                    onClick={() => {
                                        setShowPanel(false);
                                    }} />
                            </div>
                        </div>
                    </div>
                </div>
                {/* Main Start */}


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
                                        className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-[80%] md:max-w-[40%] my-8 bg-white text-black">
                                        <div className="p-6">
                                            <form className="space-y-4 font-normal"
                                                onSubmit={(e) => {
                                                    e.preventDefault();
                                                    __rename();
                                                }}>
                                                <div className="">
                                                    <label className="font-semibold text-sm mb-1 text-slate-400">
                                                        {editItem?.type == 'folder' ? 'Nama Folder' : 'Nama Berkas'}
                                                    </label>
                                                    <input className="w-full p-2 border rounded ring-0 focus:ring-0 outline-0"
                                                        value={editItem?.name}
                                                        onChange={(e) => {
                                                            setEditItem({
                                                                ...editItem,
                                                                name: e.target.value
                                                            });
                                                        }}
                                                        placeholder={editItem?.type == 'folder' ? 'Masukkan Nama Folder' : 'Masukkan Nama Berkas'} />
                                                    <div id="error-rename-name" className="text-xs text-red-500"></div>
                                                </div>
                                                <div className="w-full flex items-center justify-end gap-2">
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

                <Transition appear show={modalShare} as={Fragment}>
                    <Dialog
                        as="div"
                        open={modalShare}
                        onClose={() => closeShare()}>
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
                                        className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-[80%] md:max-w-[40%] my-8 bg-white text-black">
                                        <div className="flex items-center justify-between px-5 py-3">
                                            <h5 className="font-bold text-lg">
                                                {editItem?.name}
                                            </h5>
                                            <button
                                                type="button"
                                                className="text-white-dark hover:text-dark"
                                                onClick={() => closeShare()}>
                                                <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="p-6">
                                            <form className="space-y-4 font-normal"
                                                onSubmit={(e) => {
                                                    e.preventDefault();
                                                    __postPublicity();
                                                }}>
                                                <div className="">
                                                    <label className="font-semibold text-sm mb-1 text-slate-400">
                                                        Status Publikasi
                                                    </label>
                                                    <div className="relative">
                                                        <div className="absolute left-0 top-0 w-10 h-full flex items-center justify-center bg-blue-100 rounded-l">
                                                            <FontAwesomeIcon icon={faShareAlt} className="w-4 h-4 text-green-700" />
                                                        </div>
                                                        <select
                                                            value={editItem?.publicity?.status}
                                                            onChange={(e) => {
                                                                setEditItem({
                                                                    ...editItem,
                                                                    publicity: {
                                                                        ...editItem?.publicity,
                                                                        status: e.target.value
                                                                    }
                                                                });
                                                            }}
                                                            className="w-full p-2 pl-10 border rounded ring-0 focus:ring-0 outline-0">
                                                            <option value="public">
                                                                Publik
                                                            </option>
                                                            <option value="private">
                                                                Pribadi
                                                            </option>
                                                        </select>
                                                        <div id="error-publicity-data.publicity.shared" className="text-xs text-red-500"></div>
                                                    </div>
                                                </div>
                                                {editItem?.publicity?.status == 'public' && (
                                                    <>
                                                        {editItem?.publicity?.forever == false && (
                                                            <div className="">
                                                                <label className="font-semibold text-sm mb-1 text-slate-400">
                                                                    Tanggal Kadaluarsa
                                                                </label>
                                                                <input className="w-full p-2 border rounded ring-0 focus:ring-0 outline-0"
                                                                    type="datetime-local"
                                                                    value={editItem?.publicity?.expired_at}
                                                                    onChange={(e) => {
                                                                        setEditItem({
                                                                            ...editItem,
                                                                            publicity: {
                                                                                ...editItem?.publicity,
                                                                                expired_at: e.target.value
                                                                            }
                                                                        });
                                                                    }}
                                                                    min={new Date().toISOString().split('T')[0] + 'T00:00'}
                                                                    placeholder="Tanggal Kadaluarsa" />
                                                                <div id="error-publicity-data.publicity.expired_at" className="text-xs text-red-500"></div>
                                                            </div>
                                                        )}

                                                        <div className="">
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    onChange={(e) => {
                                                                        setEditItem({
                                                                            ...editItem,
                                                                            publicity: {
                                                                                ...editItem?.publicity,
                                                                                expired_at: e.target.checked ? '9999-12-31 23:59:59' : null,
                                                                                forever: e.target.checked
                                                                            }
                                                                        });
                                                                    }}
                                                                    id="forever"
                                                                    type="checkbox"
                                                                    checked={editItem?.publicity?.forever}
                                                                    value="true"
                                                                    className="form-checkbox cursor-pointer" />
                                                                <label htmlFor="forever" className="text-sm text-slate-400 font-semibold cursor-pointer">
                                                                    Selamanya
                                                                </label>
                                                            </div>
                                                            <div id="error-publicity-data.publicity.forever" className="text-xs text-red-500"></div>
                                                        </div>
                                                    </>
                                                )}

                                                <div className="flex justify-between items-center">
                                                    <div className="">
                                                        {showShareLink && (
                                                            <button type="button" className="bg-blue-200 hover:bg-blue-400 px-2 py-1 rounded text-blue-600 hover:text-white text-sm transition-all duration-200 flex items-center justify-center"
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(ClientDomain() + '/sharer?_id=' + editItem?.slug);
                                                                    showAlert('success', 'Berhasil', 'Tautan Berhasil Disalin');
                                                                }}>
                                                                <FontAwesomeIcon icon={faLink} className="w-3 h-3 mr-1" />
                                                                <span>
                                                                    Salin Tautan
                                                                </span>
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center justify-end gap-2">
                                                        <div className="">
                                                            <button
                                                                type="button"
                                                                onClick={() => closeShare()}
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
                                                </div>

                                            </form>
                                        </div>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition>

                <Transition appear show={modalFolder} as={Fragment}>
                    <Dialog
                        as="div"
                        open={modalFolder}
                        onClose={() => closeModalFolder()}>
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
                                        className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-[80%] md:max-w-[40%] my-8 bg-white text-black">
                                        <div className="flex items-center justify-between px-5 py-3">
                                            <h5 className="font-bold text-lg">
                                                {formFolder?.inputType == 'create' ? 'Buat Folder' : 'Ubah Nama Folder'}
                                            </h5>
                                            <button
                                                type="button"
                                                className="text-white-dark hover:text-dark"
                                                onClick={() => closeModalFolder()}>
                                                <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="p-6">
                                            <form className="space-y-4 font-normal"
                                                onSubmit={(e) => {
                                                    e.preventDefault();
                                                    __postFolder();
                                                }}>
                                                <div className="">
                                                    <div className="">
                                                        <label className="font-semibold text-sm mb-1 text-slate-400">
                                                            Nama Folder
                                                        </label>
                                                        <input className="w-full p-2 border rounded ring-0 focus:ring-0 outline-0"
                                                            type="text"
                                                            value={formFolder?.name}
                                                            onChange={(e) => {
                                                                setFormFolder({
                                                                    ...formFolder,
                                                                    name: e.target.value
                                                                });
                                                            }}
                                                            placeholder="Masukkan Nama Folder" />
                                                        <div id="error-folder-name" className="text-xs text-red-500"></div>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <div className="">

                                                    </div>
                                                    <div className="flex items-center justify-end gap-2">
                                                        <div className="">
                                                            <button
                                                                type="button"
                                                                onClick={() => closeModalFolder()}
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
                                                </div>

                                            </form>
                                        </div>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition>

                <Transition appear show={modalMoveItems} as={Fragment}>
                    <Dialog
                        as="div"
                        open={modalMoveItems}
                        onClose={() => closeModalMoveItems()}>
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
                                        className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-[80%] md:max-w-[60%] h-auto min-h-[200px] my-8 bg-white text-black relative">
                                        <div className="flex items-center justify-between px-5 py-3">
                                            <h5 className="font-bold text-lg">
                                                Pindahkan Item
                                            </h5>
                                            <button
                                                type="button"
                                                className="text-white-dark hover:text-dark"
                                                onClick={() => closeModalMoveItems()}>
                                                <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-center w-full h-full">

                                        </div>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition>

                <Transition appear show={modalPreview} as={Fragment}>
                    <Dialog
                        as="div"
                        open={modalPreview}
                        onClose={() => closeModalPreview()}>
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
                                        className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-[100%] md:max-w-[80%] h-[calc(100vh-70px)] my-8 bg-white text-black relative">
                                        <div className="flex items-center justify-between px-5 py-3">
                                            <h5 className="font-bold text-lg">
                                                {pickedItem?.name}.{pickedItem?.extension}
                                            </h5>
                                            <button
                                                type="button"
                                                className="text-white-dark hover:text-dark"
                                                onClick={() => closeModalPreview()}>
                                                <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {pickedItem?.sv_in === 1 && (
                                            <div className="flex items-center justify-center w-full h-[calc(100vh-100px)]">

                                                {(['image', 'video'].includes(pickedItem?.mime)) ||
                                                    (['ppt', 'pptx'].includes(pickedItem?.extension)) ||
                                                    (['csv', 'xls', 'xlsx'].includes(pickedItem?.extension)) ||
                                                    (['doc', 'docx'].includes(pickedItem?.extension)) ||
                                                    (['application/pdf'].includes(pickedItem?.full_mime)) ?
                                                    (
                                                        <>
                                                            {modalPreviewType == 'preview' && (
                                                                <embed src={`https://drive.google.com/file/d/${pickedItem?.path}/preview`}
                                                                    className="w-full h-full" />
                                                            )}
                                                            {modalPreviewType == 'spreadsheet' && (
                                                                <iframe src={`https://docs.google.com/spreadsheets/d/${pickedItem.path}/edit?usp=sharing`}
                                                                    className="w-full h-full"></iframe>
                                                            )}
                                                            {modalPreviewType == 'doc' && (
                                                                <iframe src={`https://docs.google.com/document/d/${pickedItem.path}/edit?usp=sharing`}
                                                                    className="w-full h-full"></iframe>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div className="flex items-center justify-center flex-col w-full h-full">
                                                            <FontAwesomeIcon icon={faFile} className="w-16 h-16 text-slate-400" />
                                                            <div className="mt-2 text-slate-400">
                                                                Tidak dapat menampilkan berkas ini
                                                            </div>
                                                            <button className="mt-5 flex items-center rounded px-4 py-2 bg-slate-200 shadow">
                                                                <FontAwesomeIcon icon={faCloudDownloadAlt} className="w-8 h-8 text-slate-700 mr-2" />
                                                                <div className="text-md text-slate-700">
                                                                    Unduh Berkas
                                                                </div>
                                                            </button>
                                                        </div>
                                                    )}

                                            </div>
                                        )}

                                        {pickedItem?.sv_in === 2 && (
                                            <div className="flex items-center justify-center h-[calc(100vh-100px)] w-full p-10">

                                                {(['image'].includes(pickedItem?.mime)) &&
                                                    (
                                                        <img src={pickedItem?.path}
                                                            className="w-full h-full object-contain" />
                                                    )}

                                                {(['video'].includes(pickedItem?.mime)) &&
                                                    (
                                                        <video src={pickedItem?.path}
                                                            className="w-full h-full object-contain" controls></video>
                                                    )}

                                                {(['audio'].includes(pickedItem?.mime)) &&
                                                    (
                                                        <audio src={pickedItem?.path}
                                                            className="w-full h-full" controls></audio>
                                                    )}

                                                {['pdf'].includes(pickedItem?.extension) && (
                                                    <iframe src={`${pickedItem?.path}`}
                                                        className="w-full h-full"></iframe>
                                                )}

                                                {['ppt', 'pptx'].includes(pickedItem?.extension) && (
                                                    <iframe src={`https://view.officeapps.live.com/op/embed.aspx?src=${pickedItem.path}`}
                                                        className="w-full h-full"></iframe>
                                                )}

                                                {['csv', 'xls', 'xlsx'].includes(pickedItem?.extension) && (
                                                    <iframe src={`https://view.officeapps.live.com/op/embed.aspx?src=${pickedItem.path}`}
                                                        className="w-full h-full"></iframe>
                                                )}

                                                {['doc', 'docx'].includes(pickedItem?.extension) && (
                                                    <iframe src={`https://view.officeapps.live.com/op/embed.aspx?src=${pickedItem.path}`}
                                                        className="w-full h-full"></iframe>
                                                )}

                                                {['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'html', 'php', 'css', 'js', 'json'].includes(pickedItem?.extension) && (
                                                    <div className="flex items-center justify-center flex-col w-full h-full">
                                                        <FontAwesomeIcon icon={faFileArchive} className="w-16 h-16 text-slate-400" />
                                                        <div className="mt-2 text-slate-400">
                                                            Tidak dapat menampilkan berkas ini
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                __confirmDownload(pickedItem);
                                                            }}
                                                            className="mt-5 flex items-center rounded px-4 py-2 bg-slate-200 shadow">
                                                            <FontAwesomeIcon icon={faCloudDownloadAlt} className="w-8 h-8 text-slate-700 mr-2" />
                                                            <div className="text-md text-slate-700">
                                                                Unduh Berkas
                                                            </div>
                                                        </button>
                                                    </div>
                                                )}

                                            </div>
                                        )}

                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition>

                {onUpload == false && (
                    <div
                        className={`${(ExternalDrag == true && onDragState == true) ? 'block' : 'hidden'} fixed inset-0 bg-[black]/50 z-[999]`}>
                        <div className="absolute top-0 right-0 m-4">
                            <button
                                onClick={() => setOnDragState(false)}
                                className="px-3 py-2 bg-white text-black rounded-lg hover:bg-red-500 hover:text-white transition-all duration-200 flex items-center">
                                <FontAwesomeIcon icon={faTimes} className="w-3 h-3 mr-2" />
                                <span>
                                    Tutup
                                </span>
                            </button>
                        </div>
                        <div className="w-full h-full flex items-center justify-center">
                            <div
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setFileEnter(true);
                                }}
                                onDragLeave={(e) => {
                                    setFileEnter(false);
                                }}
                                onDragEnd={(e) => {
                                    e.preventDefault();
                                    setFileEnter(false);
                                }}
                                onDrop={(e: any) => {
                                    e.preventDefault();
                                    setFileEnter(false);
                                    // setFiles(e.dataTransfer.files);

                                    setFiles((prev: any) => {
                                        const files = e.dataTransfer.files;
                                        const updated = { ...prev };
                                        updated['files'] = files;
                                        return updated;
                                    });
                                }}
                                className={`${fileEnter ? "border-4" : "border-2"
                                    } mx-auto  bg-white flex flex-col w-[calc(100vw-100px)] h-[calc(100vh-100px)] border-dashed items-center justify-center`}
                            >
                                <label
                                    htmlFor="file"
                                    className="h-full flex flex-col justify-center text-center"
                                >
                                    Tarik dan lepas berkas di sini
                                </label>
                                <input
                                    id="file"
                                    type="file"
                                    className="hidden"
                                    multiple={true}
                                    onChange={(e: any) => {
                                        setFiles(e.target.files);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}

            </div >


            <div className={`${queueData.length > 0 ? 'fixed z-20' : 'hidden'} bottom-3 right-4 sm:bottom-[80px] xl:bottom-[30px] sm:right-1 pb-2 px-5 bg-white shadow-lg rounded max-h-[300px] w-[400px] max-w-[90%] overflow-x-auto`}>
                <div className="relative">
                    <div
                        onClick={(e) => {
                            e.preventDefault();
                            setHideQueue(!hideQueue);
                        }}
                        className="sticky top-0 left-0 bg-white z-10 flex items-center justify-between cursor-pointer py-2 border-b">
                        <div className="font-bold text-sm underline">
                            Daftar Upload
                        </div>
                        <div className="flex items-center gap-4">

                            <div className={`${hideQueue ? 'flex items-center justify-center' : 'hidden'}`}>
                                <div className="text-xs">
                                    {queueFilesCount ?? 0} Berkas
                                </div>
                                <div className="relative w-6 h-6 animate-pulse flex items-center justify-center ml-1">
                                    <div className="w-3 h-3 border-l border-green-500 rounded-full animate-spin"></div>
                                </div>
                            </div>

                            <div>
                                <Tippy content={`${hideQueue ? 'Buka' : 'Kecilkan'}`} delay={300}>
                                    <>
                                        {hideQueue ? (
                                            <FontAwesomeIcon icon={faWindowMaximize} className="w-4 h-4 cursor-pointer hover:text-slate-500" />
                                        ) : (
                                            <FontAwesomeIcon icon={faWindowMinimize} className="w-4 h-4 cursor-pointer hover:text-slate-500" />
                                        )}
                                    </>
                                </Tippy>
                            </div>

                            <div>
                                <Tippy content='Tutup' delay={300}>
                                    <FontAwesomeIcon
                                        onClick={() => {
                                            setQueueData([]);
                                        }}
                                        icon={faTimes}
                                        className="w-4 h-4 cursor-pointer hover:text-slate-500" />
                                </Tippy>
                            </div>

                        </div>
                    </div>
                    <div className={`${hideQueue ? 'hidden' : ''}`}>
                        {queueData?.map((file: any, index: number) => (
                            <div className="border-b py-4">
                                <div className="flex items-center justify-between">
                                    <div className="">
                                        <div className='font-semibold line-clamp-2 max-w-[250px]'>
                                            {file?.name}.{file?.extension}
                                        </div>
                                        <div className="text-[10px] text-slate-500">
                                            {__isoFileSize(file?.size)}
                                        </div>
                                    </div>

                                    {file?.progress < 100 && (
                                        <div className="relative w-8 h-8 animate-pulse">
                                            <div className="text-[8px] h-8 w-8 flex items-center justify-center">
                                                <div className="">
                                                    {`${file?.progress}%`}
                                                </div>
                                            </div>
                                            <div className="absolute top-0 left-0 w-8 h-8 border-l border-green-500 rounded-full animate-spin"></div>
                                            <div className="absolute top-0 left-0 w-8 h-8 border-b border-r border-sky-500 rounded-full animate-spin"></div>
                                        </div>
                                    )}

                                    {file?.progress == 100 && (

                                        <div className="relative w-8 h-8 animate-pulse">
                                            <div className="text-[8px] h-8 w-8 flex items-center justify-center">
                                                <div className="w-8 h-8 rounded-full border border-green-500 flex items-center justify-center">
                                                    <FontAwesomeIcon icon={faCheck} className="w-4 h-4 text-green-500" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {file?.progress < 100 && (
                                    <div className="relative w-full h-2 rounded-xl bg-slate-200 mt-1">
                                        <div
                                            style={{ width: `${file?.progress}%` }}
                                            className="h-2 bg-green-500 rounded-xl"></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </>
    );
};

export default Main;