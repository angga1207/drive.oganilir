import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { serverCheck } from "../api/serverIP";

const A12 = () => {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [usersExist, setUsersExist] = useState(true);
    const [isServerOnline, setIsServerOnline] = useState(true);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isMounted) {
            serverCheck().then((res) => {
                if (res.status == 'success') {
                    setIsServerOnline(true);
                    localStorage.setItem('user', JSON.stringify(res.data));

                    if (res.data == null) {
                        setUsersExist(false);
                        localStorage.removeItem('token');
                        // deleteCookie('token');
                        localStorage.removeItem('user');
                        // router.push('/login');
                    }
                } else {
                    setIsServerOnline(false);
                }
            });
        }
    }, [isMounted]);

    return (
        <>
        </>
    );
}

export default A12;