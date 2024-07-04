import { setCookie, getCookie, hasCookie, deleteCookie } from 'cookies-next';
import { useSession, signIn, signOut } from 'next-auth/react';
import { faUser } from "@fortawesome/free-regular-svg-icons";
import { faBars, faHamburger, faSignOutAlt, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import Swal from 'sweetalert2';
import { useEffect, useState } from 'react';

const Header = () => {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const MySess = useSession();

    const logout = () => {
        if (isMounted) {
            // Swal confirm
            Swal.fire({
                title: 'Apakah Anda Yakin?',
                text: "Anda akan keluar dari aplikasi ini",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Ya, Keluar!',
                cancelButtonText: 'Batal'
            }).then((result) => {
                if (result.isConfirmed) {
                    if (localStorage.getItem('logginByGoogle') === 'true') {
                        signOut();
                    }
                    if (localStorage.getItem('logginByGoogle') === 'false') {
                        localStorage.removeItem('token');
                        deleteCookie('token');
                        window.location.href = '/login';
                    }
                }
            }).catch((error) => {
                console.log(error);
            });
        }
    }

    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        if (localStorage.getItem('user')) {
            const unRaw = localStorage.getItem('user');
            setUser(JSON.parse(unRaw ?? '{}'));
        }
    }, [isMounted]);

    useEffect(() => {
        if (isMounted) {
            if (localStorage.getItem('logginByGoogle') === 'true' && MySess.status === 'unauthenticated') {
                localStorage.removeItem('token');
                deleteCookie('token');
                // alert(123)
                window.location.href = '/login';
            }
        }
    }, [MySess.status]);

    return (
        <>
            <nav
                className="flex-no-wrap z-50 relative flex w-screen items-center justify-between bg-gradient-to-b from-sky-400 via-sky-700 to-sky-800 via-70% to-150% py-2 shadow-lg lg:flex-wrap lg:justify-start lg:py-4 overflow-hidden">
                <div className="flex w-full items-center justify-between px-3">

                    <div
                        className="!visible flex-grow basis-[100%] items-center flex lg:basis-auto">
                        <Link
                            className="mb-4 me-5 ms-2 mt-3 text-neutral-900 hover:text-neutral-900 focus:text-neutral-900 dark:text-neutral-200 dark:hover:text-neutral-400 dark:focus:text-neutral-400 lg:mb-0 lg:mt-0 flex items-center gap-2"
                            href="/">
                            {/* <img
                                src="https://oganilirkab.go.id/assets/resources/images/logo-oi.png"
                                className="h-[50px]"
                                alt="Logo Ogan Ilir" /> */}
                            <img
                                src="/logo.png"
                                className="h-[50px]"
                                alt="Logo Drive Ogan Ilir" />

                            <div className="">
                                <div className="duration-[750ms] flex items-end space-x-1 text-white">
                                    <div className="animate-pulse font-bold text-2xl"
                                        style={{
                                            animationDelay: '0s'
                                        }}>
                                        D
                                    </div>
                                    <div className="animate-pulse font-bold text-2xl" style={{
                                        animationDelay: '0.05s'
                                    }}>
                                        r
                                    </div>
                                    <div className="animate-pulse font-bold text-2xl" style={{
                                        animationDelay: '0.1s'
                                    }}>
                                        i
                                    </div>
                                    <div className="animate-pulse font-bold text-2xl" style={{
                                        animationDelay: '0.15s'
                                    }}>
                                        v
                                    </div>
                                    <div className="animate-pulse font-bold text-2xl" style={{
                                        animationDelay: '0.2s'
                                    }}>
                                        e
                                    </div>
                                    <div className="animate-pulse font-bold text-2xl" style={{
                                        animationDelay: '0.25s'
                                    }}>

                                    </div>
                                    <div className="animate-pulse font-bold text-2xl" style={{
                                        animationDelay: '0.3s'
                                    }}>
                                        O
                                    </div>
                                    <div className="animate-pulse font-bold text-2xl" style={{
                                        animationDelay: '0.35s'
                                    }}>
                                        g
                                    </div>
                                    <div className="animate-pulse font-bold text-2xl" style={{
                                        animationDelay: '0.4s'
                                    }}>
                                        a
                                    </div>
                                    <div className="animate-pulse font-bold text-2xl" style={{
                                        animationDelay: '0.45s'
                                    }}>
                                        n
                                    </div>
                                    <div className="animate-pulse font-bold text-2xl" style={{
                                        animationDelay: '0.5s'
                                    }}>

                                    </div>
                                    <div className="animate-pulse font-bold text-2xl" style={{
                                        animationDelay: '0.55s'
                                    }}>
                                        I
                                    </div>
                                    <div className="animate-pulse font-bold text-2xl" style={{
                                        animationDelay: '0.6s'
                                    }}>
                                        l
                                    </div>
                                    <div className="animate-pulse font-bold text-2xl" style={{
                                        animationDelay: '0.65s'
                                    }}>
                                        i
                                    </div>
                                    <div className="animate-pulse font-bold text-2xl" style={{
                                        animationDelay: '0.7s'
                                    }}>
                                        r
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>

                    <div className="flex-none relative flex items-center">

                        <div
                            className="relative group">

                            <div
                                className="hidden lg:flex items-center gap-x-2 whitespace-nowrap transition duration-150 cursor-pointer pb-2"
                                role="button">
                                <div className="text-end">
                                    <div className="mr-2 font-bold text-base text-white">
                                        Hai, {user?.name?.firstname ?? 'UserName'}
                                    </div>
                                    <div className={`${user?.googleIntegated ? 'text-green-300' : 'text-slate-200'} max-w-[200px] truncate text-xs`}>
                                        {user?.email}
                                    </div>
                                </div>
                                <img
                                    src={
                                        user?.photo ??
                                        'https://ui-avatars.com/api/?name=' + user?.name?.fullname
                                    }
                                    className="rounded-full bg-white p-1 w-[40px] h-[40px]"
                                    alt="Photo Profile" />
                            </div>

                            <button type='button' className="block lg:hidden cursor-pointer hover:rotate-90 focus:rotate-90 transition-all duration-300">
                                <FontAwesomeIcon icon={faBars} className="text-white h-8 w-8" />
                            </button>

                            <ul
                                className="fixed right-[20px] mt-0 z-50 hidden group-hover:block float-left m-0 min-w-max list-none overflow-hidden rounded-lg border-none bg-white bg-clip-padding text-left text-base shadow-lg dark:bg-neutral-700">

                                <li>
                                    <Link
                                        className="w-full whitespace-nowrap bg-transparent px-5 py-4 text-sm font-normal text-neutral-700 hover:bg-neutral-100 active:text-neutral-800 active:no-underline disabled:pointer-events-none disabled:bg-transparent disabled:text-neutral-400 dark:text-neutral-200 dark:hover:bg-white/30 flex items-center"
                                        href="/profile"
                                        data-twe-dropdown-item-ref
                                    >
                                        <FontAwesomeIcon icon={faUser} className="w-4 h-4 me-2" />
                                        <span>
                                            Profil Saya
                                        </span>
                                    </Link>
                                </li>

                                {[1, 4].includes(user?.id) && (
                                    <li>
                                        <Link
                                            className="w-full whitespace-nowrap bg-transparent px-5 py-4 text-sm font-normal text-neutral-700 hover:bg-neutral-100 active:text-neutral-800 active:no-underline disabled:pointer-events-none disabled:bg-transparent disabled:text-neutral-400 dark:text-neutral-200 dark:hover:bg-white/30 flex items-center"
                                            href="/users"
                                            data-twe-dropdown-item-ref
                                        >
                                            <FontAwesomeIcon icon={faUsers} className="w-4 h-4 me-2" />
                                            <span>
                                                Pengguna
                                            </span>
                                        </Link>
                                    </li>
                                )}

                                <li>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            logout();
                                        }}
                                        type="button"
                                        className="w-full whitespace-nowrap bg-transparent px-5 py-4 text-sm font-normal text-neutral-700 hover:bg-neutral-100 active:text-neutral-800 active:no-underline disabled:pointer-events-none disabled:bg-transparent disabled:text-neutral-400 dark:text-neutral-200 dark:hover:bg-white/30 flex items-center"
                                    >
                                        <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4 me-2" />
                                        <span>
                                            Keluar Aplikasi
                                        </span>
                                    </button>
                                </li>

                            </ul>

                        </div>
                    </div>

                </div>

                <div className="absolute -bottom-0.5 left-0 h-2 w-full">
                    <div className="relative h-2">
                        <div className="h-full flex items-center gap-4 animate-marquee">
                            <div className="flex-none w-32 h-1 rounded-full bg-sky-600 shadow-xl shadow-sky-800"></div>
                        </div>
                    </div>
                </div>

            </nav>
        </>
    );
}

export default Header;