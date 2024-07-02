import { useRouter } from 'next/router';
import Sharer from '@/pages/components/Sharer';
import MainNavbar from '@/pages/components/MainNavbar';
import A12 from './components/a12';
import AuthLayout from '@/components/Layouts/AuthLayout';
import Link from 'next/link';

const Index = () => {

    const router = useRouter();

    return (
        <>

            <nav
                className="flex-no-wrap relative flex w-full items-center justify-between bg-gradient-to-b from-sky-700 via-sky-500 to-sky-100 via-70% to-150% py-2 shadow-lg lg:flex-wrap lg:justify-start lg:py-4">
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
                                src="https://drive.oganilirkab.go.id/images/logo.png"
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
                        </div>
                    </div>
                </div>
                <div className="absolute -bottom-0.5 left-0 w-full h-1">
                    <div className="relative w-full h-1">
                        <div className="h-full flex items-center gap-4 animate-marquee">
                            <div className="flex-none w-32 h-1 rounded-full bg-sky-400/50 shadow-xl shadow-black"></div>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="container">
                <A12 />
                <Sharer />
            </div>
        </>
    );
}

Index.getLayout = (page: any) => {
    return <AuthLayout>{page}</AuthLayout>;
};
export default Index;