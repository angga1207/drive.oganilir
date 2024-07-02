import { IRootState } from '@/store'
import { toggleSidebar } from '@/store/themeConfigSlice'
import { PropsWithChildren, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import App from '@/App';
import Footer from './Footer'
import Header from './Header';
import Sidebar from './Sidebar';
import { useRouter } from 'next/router';

import { getMessaging, onMessage } from 'firebase/messaging';
import firebaseApp from '@/utils/firebase/firebase';
import useFcmToken from '@/utils/hooks/useFcmToken';
import { BaseUri } from '@/pages/api/serverIP';

const DefaultLayout = ({ children }: PropsWithChildren) => {
    const router = useRouter();
    const { fcmToken, notificationPermissionStatus } = useFcmToken();
    const baseUri = BaseUri();
    const [currentUser, setCurrentUser] = useState<any>([]);

    useEffect(() => {
        if (localStorage.getItem('user')) {
            setCurrentUser(localStorage.getItem('user'));
        }
        const currentToken = localStorage.getItem('token') ?? null;
        if (currentUser && currentToken) {
            fetch(`${baseUri}/fcm`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${currentToken}`,
                },
                body: JSON.stringify({
                    fcmToken: fcmToken,
                }),
            })
                .then((response) => {
                })
                .then((data) => {
                })
                .catch((error) => {
                });
        }
        if (notificationPermissionStatus === 'denied') {
            // showAlert('warning', 'Aktifkan notifikasi untuk mendapatkan informasi terbaru');
        }
    }, [fcmToken]);

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
            const messaging = getMessaging(firebaseApp);
            const fireNotif = onMessage(messaging, (payload: any) => {
                // show notification
                if (Notification.permission === 'granted') {
                    const notification = new Notification(payload.notification.title, {
                        body: payload.notification.body,
                    });
                    notification.onshow = () => {
                        setTimeout(() => {
                            // setNotifications((notifications: any) => notifications.filter((notif: any) => notif.id !== newMessage?.id));
                        }, 5000);
                    }
                }

            });
            return () => {
                fireNotif(); // triggerNotif from the onMessage event
            };
        }
    }, []);

    return (
        <App>
            <div>
                <Header />
                <div className="container">
                    {children}
                </div>
                <Footer />
            </div>
        </App>
    );
}

export default DefaultLayout;