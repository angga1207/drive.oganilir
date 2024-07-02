import { PropsWithChildren, useEffect, useState } from 'react';
import App from '@/App';
import { useRouter } from 'next/router';

const DefaultLayout = ({ children }: PropsWithChildren) => {
    const router = useRouter();
    return (
        <App>
            <div>
                {children}
            </div>
        </App>
    );
}

export default DefaultLayout;