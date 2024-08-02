// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCdxUzaVeuODB-g4Di6jcGunIAysWf-NaQ",
  authDomain: "inventory-management-393b0.firebaseapp.com",
  projectId: "inventory-management-393b0",
  storageBucket: "inventory-management-393b0.appspot.com",
  messagingSenderId: "741733865874",
  appId: "1:741733865874:web:8d92c1000fd11c66f1c94b",
  measurementId: "G-7K8W2H1JWE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = getFirestore(app);

export {firestore};