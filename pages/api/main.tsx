import { useRouter } from "next/router";
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from "axios";
import { BaseUri } from "./serverIP";
import { setCookie, getCookie, hasCookie, deleteCookie } from 'cookies-next';

const baseUri = BaseUri();
const CurrentToken = getCookie('token');


export async function getItems(slug: any = null, sort: any = 'created_at', order: any = 'asc') {
    try {
        const res = await axios.get(`${baseUri}/getItems`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${CurrentToken}`,
            },
            params: {
                slug: slug,
                sort: sort,
                order: order
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

export async function getItemsSharer(slug: any) {
    try {
        const res = await axios.get(`${baseUri}/getItemsSharer`, {
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

export async function getFolders(slug: any = null) {
    try {
        const res = await axios.get(`${baseUri}/getFolders`, {
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

export async function postRename(slug: any = null, name: any = null) {
    try {
        const res = await axios.post(`${baseUri}/rename/${slug}`, {
            slug: slug,
            name: name
        }, {
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

export async function postPublicity(slug: any = null, formData: any = null) {
    try {
        const res = await axios.post(`${baseUri}/publicity/${slug}`, {
            slug: slug,
            data: formData
        }, {
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

export async function postUpload(folderSlug: any, files: any) {
    try {
        const formData = new FormData();
        formData.append('folderSlug', folderSlug);
        for (let i = 0; i < files.files.length; i++) {
            formData.append('files[]', files.files[i]);
        }

        const res = await axios.post(`${baseUri}/upload/${folderSlug}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
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

export async function postFolder(data: any) {
    try {
        if (data.inputType == 'create') {
            const res = await axios.post(`${baseUri}/folder`, {
                name: data.name,
                parent_slug: data.parent_slug
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${CurrentToken}`,
                }
            });
            const response = await res.data;
            return response;
        }
    } catch (error) {
        return {
            status: 'error',
            message: error
        }
    }
}

export async function getUploadQueue() {
    try {
        const res = await axios.get(`${baseUri}/getUploadQueue`, {
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

export async function postMoveItems(data: any) {
    try {
        const res = await axios.post(`${baseUri}/moveItem`, {
            sourceIds: data.sourceIds,
            targetId: data.targetId
        }, {
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

export async function postDelete(ids: any) {
    try {
        const res = await axios.post(`${baseUri}/delete`, {
            ids: ids
        }, {
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

export async function getSearch(search: any) {
    try {
        const res = await axios.get(`${baseUri}/search`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${CurrentToken}`,
            },
            params: {
                search: search
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

export async function postDownload(id: number) {
    try {
        const res = await axios.post(`${baseUri}/download`, {
            id: id
        }, {
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