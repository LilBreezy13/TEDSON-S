import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { auth, db } from "./firebase.js";

const errorEl = document.getElementById("error");

/* EMAIL LOGIN */
window.login = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    await checkAccess(res.user);
  } catch (err) {
    showError("Invalid email or password");
  }
};

/* GOOGLE LOGIN */
window.loginWithGoogle = async function () {
  const provider = new GoogleAuthProvider();

  try {
    const res = await signInWithPopup(auth, provider);
    await checkAccess(res.user);
  } catch (err) {
    showError("Google login failed");
  }
};

/* ACCESS CHECK */
async function checkAccess(user) {
  const email = user.email;

  const ref = doc(db, "allowed_users", email);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await signOut(auth);
    showError("Access denied. Contact admin.");
    return;
  }

  // Access allowed
  window.location.href = "dashboard.html";
}

/* AUTH GUARD */
onAuthStateChanged(auth, (user) => {
  if (!user && !location.pathname.endsWith("index.html")) {
    window.location.href = "index.html";
  }
});

/* ERROR HANDLER */
function showError(message) {
  errorEl.textContent = message;
  errorEl.classList.remove("hidden");
}
