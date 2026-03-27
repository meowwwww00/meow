import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD-bvmNnYsdEikkeKPFSeakatlhyRH7XEg",
  authDomain: "meow-e7846.firebaseapp.com",
  projectId: "meow-e7846",
  storageBucket: "meow-e7846.firebasestorage.app",
  messagingSenderId: "543672734125",
  appId: "1:743672734125:web:7d9f6fb1cac5b18ef48124"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
