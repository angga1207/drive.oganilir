import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { getPath } from "@/pages/api/navbar";

import { faCheckSquare, faFolderOpen, faPlusSquare, faTrashAlt } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowsAlt } from "@fortawesome/free-solid-svg-icons/faArrowsAlt";
import { faCaretRight, faCloudUploadAlt, faFolderPlus } from "@fortawesome/free-solid-svg-icons";
import { faSearch } from "@fortawesome/free-solid-svg-icons/faSearch";
import { faFolder } from "@fortawesome/free-regular-svg-icons/faFolder";
import Main from "./Main";

const MainNavbar = () => {

    const router = useRouter();

    const [pickedItems, setPickedItems] = useState<any>([]);
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
    const [currentPath, setCurrentPath] = useState<any>(null); // [1]
    const [ID, setID] = useState<any>(0); // [1]
    const [readyToLoad, setReadyToLoad] = useState<boolean>(false);

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
            getPath(router.query._id).then((res) => {
                if (res.status == 'success') {
                    setPaths(res.data.paths);
                    setCurrentPath(res.data.current);
                }
            });
        }
    }, [router.query._id]);

    return (
        <>
            <div className="mt-8">
                <div className="flex flex-wrap gap-y-4 sm:flex-nowrap items-center justify-between">
                    <div className="flex items-center gap-x-2">

                        <div className="">
                            {setPickedItems.length > 0 ?? (
                                <>
                                    {setPickedItems.length} item terpilih
                                </>
                            )}
                        </div>

                        <Tippy content="Pilih Folder / Berkas" delay={300} followCursor={true}>
                            <div className={`${selectState ? 'bg-sky-400 text-white' : 'bg-sky-200 text-sky-600'}  hover:bg-sky-400 hover:text-white transition-all duration-200 px-3 py-1.5 rounded flex items-center justify-center gap-1 cursor-pointer`}
                                onClick={() => {
                                    setSelectState(!selectState);
                                }}
                            >
                                <FontAwesomeIcon icon={faCheckSquare} className="w-4 h-4" />
                                PILIH
                            </div>
                        </Tippy>

                        <Tippy content="Pindahkan Folder / Berkas" delay={300} followCursor={true}>
                            <div className="bg-orange-200 text-orange-600 hover:bg-orange-400 hover:text-white transition-all duration-200 px-3 py-2 rounded flex items-center justify-center gap-1 cursor-pointer">
                                <FontAwesomeIcon icon={faArrowsAlt} className="w-4 h-4" />
                            </div>
                        </Tippy>

                        <Tippy content="Hapus Folder / Berkas" delay={300} followCursor={true}>
                            <div className="bg-red-200 text-red-600 hover:bg-red-400 hover:text-white transition-all duration-200 px-3 py-2 rounded flex items-center justify-center gap-1 cursor-pointer">
                                <FontAwesomeIcon icon={faTrashAlt} className="w-4 h-4" />
                            </div>
                        </Tippy>

                    </div>

                    <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-2">
                        <div className="relative">
                            <div className="absolute left-0 top-0 w-10 h-full flex items-center justify-center">
                                <FontAwesomeIcon icon={faSearch} className="h-4 w-4 text-gray-400" />
                            </div>
                            <input type="search" className="w-[200px] focus:w-[300px] max-w-full border border-gray-300 rounded-xl px-3 py-2 pl-10 focus:outline-none transition-all duration-300" placeholder="Pencarian..." />
                        </div>
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

                                    <div className="px-4 py-3 flex items-center group/item hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-300 rounded-t cursor-pointer transition-all duration-300">
                                        <FontAwesomeIcon icon={faFolderPlus} className="w-4 h-4 mr-2 text-blue-800 group-hover/item:text-white" />
                                        <span className="font-semibold text-blue-800 group-hover/item:text-white">
                                            FOLDER
                                        </span>
                                    </div>

                                    <div className="px-4 py-3 flex items-center group/item hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-300 rounded-b cursor-pointer transition-all duration-300">
                                        <FontAwesomeIcon icon={faCloudUploadAlt} className="w-4 h-4 mr-2 text-blue-800 group-hover/item:text-white" />
                                        <span className="font-semibold text-blue-800 group-hover/item:text-white">
                                            BERKAS
                                        </span>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Capacity Bar Start */}
                <div className="mt-2 hidden xl:block">
                    <Tippy content="Kapasitas Drive Anda Tersisa 2,5Gb" delay={300} followCursor={true}>
                        <div className="bg-gray-200 h-4 w-full xl:w-[300px] rounded-full overflow-hidden cursor-pointer">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-300 animate-pulse h-full w-1/3"></div>
                        </div>
                    </Tippy>
                </div>
                {/* Capacity Bar End */}

                {/* Navigation Start */}
                <div className="flex items-center gap-2 justify-start max-w-full overflow-auto mt-3 pb-3">

                    <div
                        onClick={() => {
                            router.query._id = '0';
                            router.push(router);
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
                                router.query._id = path.id;
                                router.push(router);
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

                </div>
                {/* Navigation End */}

            </div >

            <Main/>
        </>
    );
};

export default MainNavbar;