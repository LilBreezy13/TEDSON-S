import { collection, getDocs }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "./firebase.js";

const list = document.getElementById("productList");

const snap = await getDocs(collection(db, "products"));

snap.forEach(doc => {
  const p = doc.data();
  list.innerHTML += `<div class="bg-white p-3 mb-2 rounded shadow">
    ${p.name} - Stock: ${p.stock}
  </div>`;
});
