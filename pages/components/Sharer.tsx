import { useRouter } from "next/router";
import { Fragment, useEffect, useRef, useState } from "react";
import { Dialog, Transition } from '@headlessui/react';
import { faCalendarAlt, faCaretSquareLeft, faCheckSquare, faEye, faFile, faFileAudio, faFileExcel, faFilePdf, faFilePowerpoint, faFileWord, faFileZipper, faFolder, faFolderBlank, faFolderOpen, faImage, faPlusSquare, faSave, faShareSquare, faTrashAlt, faWindowMaximize, faWindowMinimize } from "@fortawesome/free-regular-svg-icons";
import { faArrowsAlt, faCaretRight, faCloudDownloadAlt, faCloudUploadAlt, faFolderPlus, faImagePortrait, faLink, faLock, faMinimize, faPen, faSearch, faShareAlt, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Tippy from "@tippyjs/react";
import 'tippy.js/dist/tippy.css';

import { ClientDomain } from "@/pages/api/serverIP";
import { getItemsSharer, postDownload } from "@/pages/api/main";
import { getPath } from "@/pages/api/navbar";

// Queueing Listeners Start
import { getMessaging, onMessage } from 'firebase/messaging';
import firebaseApp from '@/utils/firebase/firebase';
import useFcmToken from '@/utils/hooks/useFcmToken';
import { getUploadQueue } from '@/pages/api/main';
// Queueing Listeners End

import Swal from 'sweetalert2';
import Link from "next/link";
import Head from "next/head";
const showSweetAlert = async (icon: any, title: any, text: any, confirmButtonText: any) => {
    Swal.fire({
        icon: icon,
        title: title,
        html: text,
        showCloseButton: true,
        showCancelButton: false,
        focusConfirm: false,
        confirmButtonText: confirmButtonText ?? 'OK',
        padding: '2em',
        customClass: 'sweet-alerts',
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

    const [pickedItem, setPickedItem] = useState<any>(null);
    const [selectState, setSelectState] = useState<boolean>(false);

    useEffect(() => {
        if (router.query._id) {
            setID(router.query._id);
        }
        setReadyToLoad(true);
    }, [router.query._id, ID]);

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
    const [datas, setDatas] = useState<any>([]);

    useEffect(() => {
        if (readyToLoad && router.query._id) {
            getItemsSharer(router.query._id).then((res) => {
                setDatas(res.data);
            });
        }
    }, [router.query._id]);

    const reloadItems = () => {
        if (!router.query._id) {
            return false;
        }
        getItemsSharer(router.query._id).then((res) => {
            setDatas(res.data);
        });
    }

    const [paths, setPaths] = useState<any>([]);
    const [currentPath, setCurrentPath] = useState<any>(null); // [1]

    useEffect(() => {
        if (readyToLoad && router.query._id) {
            getPath(router.query._id).then((res) => {
                if (res.status == 'success') {
                    setPaths(res.data.paths);
                    setCurrentPath(res.data.current);
                }
            });
        }
    }, [router.query._id]);

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

    if (!router.query._id || router.query._id == '0' || ID == 0) {
        return (
            <>
                <div className="flex items-center justify-center w-full h-[calc(100vh-200px)]">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold">
                            404
                        </h1>
                        <p className="text-lg">
                            Halaman tidak ditemukan
                        </p>
                    </div>
                </div>
            </>
        )
    }

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

                {currentPath?.type === 'folder' && (
                    <meta
                        property="og:image"
                        content={ClientDomain() + '/favicon.png'}
                        key="og:image"
                    />
                )}

                {currentPath?.type === 'file' && (
                    <>
                        {['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'tiff', 'ico', 'psd', 'ai', 'indd', 'raw', 'webp', 'svg'].includes(currentPath?.extension) && (
                            <meta
                                property="og:image"
                                content={ClientDomain() + '/assets/images/file-1.png'}
                                key="og:image"
                            />
                        )}

                        {['pdf'].includes(currentPath?.extension) && (
                            <meta
                                property="og:image"
                                content={ClientDomain() + '/assets/images/pdf-1.png'}
                                key="og:image"
                            />
                        )}

                        {['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'z'].includes(currentPath?.extension) && (
                            <meta
                                property="og:image"
                                content={ClientDomain() + '/assets/images/zip-1.png'}
                                key="og:image"
                            />
                        )}

                        {['xls', 'xlsx', 'csv'].includes(currentPath?.extension) && (
                            <meta
                                property="og:image"
                                content={ClientDomain() + '/assets/images/xls-1.png'}
                                key="og:image"
                            />
                        )}

                        {['doc', 'docx'].includes(currentPath?.extension) && (
                            <meta
                                property="og:image"
                                content={ClientDomain() + '/assets/images/doc-1.png'}
                                key="og:image"
                            />
                        )}

                        {['mp3', 'wav', 'ogg', 'wma', 'm4a', 'flac', 'aac'].includes(currentPath?.extension) && (
                            <meta
                                property="og:image"
                                content={ClientDomain() + '/assets/images/mp3-1.png'}
                                key="og:image"
                            />
                        )}

                        {['mp4', 'mkv', 'webm', 'flv', 'vob', 'ogv', 'ogg', 'drc', 'gifv', 'mng', 'avi', 'mts', 'm2ts', 'mov', 'qt', 'wmv', 'yuv', 'rm', 'rmvb', 'asf', 'amv', 'mpg', 'mp2', 'mpeg', 'mpe', 'mpv', 'm4p', 'm4v', 'svi', '3gp', '3g2', 'mxf', 'roq', 'nsv', 'flv', 'f4v', 'f4p', 'f4a', 'f4b'].includes(currentPath?.extension) && (
                            <meta
                                property="og:image"
                                content={ClientDomain() + '/assets/images/mp4-1.png'}
                                key="og:image"
                            />
                        )}
                    </>
                )}

                <meta name="twitter:card" content="summary" key="twitter:card" />
                <meta name="twitter:site" content="@driveoganilir" key="twitter:site" />
                <meta name="twitter:creator" content="@driveoganilir" key="twitter:creator" />
                <meta name="twitter:title" content={`${currentPath?.name ?? 'Root'} | Drive Ogan Ilir`} key="twitter:title" />
                <meta name="twitter:description" content={`${currentPath?.name ?? 'Root'} | Drive Ogan Ilir`} key="twitter:description" />

                <link rel="canonical" href={ClientDomain() + '/sharer?_id=' + ID} />
            </Head>

            <div>
                {/* NavBar Start */}
                <div className="my-8">
                    <div className="flex flex-wrap gap-y-4 sm:flex-nowrap items-center justify-between">

                        {currentPath?.type === 'folder' && (
                            <div className="flex items-center gap-x-2">
                                <FontAwesomeIcon icon={faFolder} className="w-6 h-6" />
                                <div className="font-semibold text-xl">
                                    {currentPath?.name}
                                </div>
                            </div>
                        )}

                        {currentPath?.type === 'file' && (
                            <div className="flex items-center gap-x-2">
                                <div className="font-semibold text-xl">
                                    {currentPath?.name}
                                </div>
                            </div>
                        )}

                        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-2">
                            <div className="relative">

                            </div>

                            <div
                                onClick={() => {
                                    navigator.clipboard.writeText(`${ClientDomain()}/sharer/${router.query._id}`);
                                    showSweetAlert('success', 'Tautan Disalin', 'Tautan berhasil disalin ke clipboard', 'Tutup');
                                }}
                                className='bg-lime-200 text-green-600 hover:bg-gradient-to-r hover:from-purple-500 hover:to-purple-300 hover:text-white shadow transition-all duration-500 px-5 py-2 rounded flex items-center justify-center gap-1 cursor-pointer font-semibold'>
                                <FontAwesomeIcon icon={faLink} className="w-4 h-4 mr-1" />
                                Salin Tautan
                            </div>

                        </div>

                    </div>

                </div >
                {/* NavBar Start */}


                {/* Main Start */}
                <div className="grid grid-cols-10 gap-4">
                    <div className={`col-span-10 ${showPanel ? 'xl:col-span-7' : 'xl:col-span-10'} mt-0 relative overflow-auto max-w-full h-[calc(100vh-140px)]`}>

                        <div className="space-y-3">

                            {datas?.map((item: any, index: number) => (

                                <div key={`item-${item?.slug}`}
                                    className={`${pickedItem?.slug == item?.slug ? '!bg-slate-100' : ''} ${selectedItems.includes(item.slug) ? '!bg-slate-100' : ''} px-5 shadow bg-white hover:bg-slate-100 rounded flex flex-col xl:flex-row xl:items-center justify-between gap-y-3 group/item cursor-pointer select-none relative`}
                                    id={`listitem-${item.slug}`}>

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
                                            openFile(item, 'preview');
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
                                                    <span>
                                                        {item.size}
                                                    </span>
                                                    {item.type === 'folder' && (
                                                        <span> - ({item.childs}) berkas</span>
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

                                                        {/* {['xls', 'xlsx'].includes(item.extension) && (
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
                                                        )} */}

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
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <img src={item?.author?.photo} className="w-7 h-7 object-contain rounded-full" />
                                            <div className="font-normal">
                                                {item?.author?.firstname}
                                            </div>
                                        </div>
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
                                {/* {editItem?.name} */}
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
                                        className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-[80%] md:max-w-[80%] h-[calc(100vh-70px)] my-8 bg-white text-black relative">
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

                                            </div>
                                        )}

                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition>

            </div >

        </>
    );
};

export default Main;