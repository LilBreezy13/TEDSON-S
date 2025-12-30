import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDf-3n1RTKpHGdtLGjuKwe0lSSwTo2In1Y",
  authDomain: "parcel-capture-v2.firebaseapp.com",
  projectId: "parcel-capture-v2",
  storageBucket: "parcel-capture-v2.firebasestorage.app",
  messagingSenderId: "1019054702183",
  appId: "1:1019054702183:web:9574c5aa8b6848f17c9ec2"
};
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
