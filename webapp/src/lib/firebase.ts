// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA7y6j5sJdX-ZXDug6PabCyCuAjBoehFnw",
  authDomain: "dionysus-39efb.firebaseapp.com",
  projectId: "dionysus-39efb",
  storageBucket: "dionysus-39efb.appspot.com",
  messagingSenderId: "251666586331",
  appId: "1:251666586331:web:57036851f582f1ad0acafe",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
