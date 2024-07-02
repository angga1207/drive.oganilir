// eslint-disable-next-line no-undef
importScripts('https://www.gstatic.com/firebasejs/8.8.0/firebase-app.js');
// eslint-disable-next-line no-undef
importScripts('https://www.gstatic.com/firebasejs/8.8.0/firebase-messaging.js');

const firebaseConfig = {
    apiKey: "AIzaSyDzBv37v0XaU-7nn3R1tHCsKEH_HcVNEHM",
    authDomain: "angga1.firebaseapp.com",
    databaseURL: "https://angga1-default-rtdb.firebaseio.com",
    projectId: "angga1",
    storageBucket: "angga1.appspot.com",
    messagingSenderId: "280982190589",
    appId: "1:280982190589:web:5fe33f8e2db62dafeac194",
    measurementId: "G-RNE9YRDV4P"
};
// eslint-disable-next-line no-undef
firebase.initializeApp(firebaseConfig);
// eslint-disable-next-line no-undef
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log(
        '[firebase-messaging-sw.js] Received background message ',
        payload
    );
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: './next.svg',
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});
