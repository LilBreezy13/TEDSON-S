import {
  collection,
  getDocs,
  addDoc,
  doc,
  runTransaction,
  serverTimestamp,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { db, auth } from "./firebase.js";

let products = {};
let salesCount = {};

window.addEventListener("DOMContentLoaded", () => {
  const productSelect = document.getElementById("product");
  const priceEl = document.getElementById("price");
  const qtyEl = document.getElementById("qty");
  const totalEl = document.getElementById("total");
  const errorEl = document.getElementById("error");
  const salesHistoryEl = document.getElementById("salesHistory");
  const topProductEl = document.getElementById("topProduct");

  // ---------- LOAD PRODUCTS ----------
  async function loadProducts() {
    const snap = await getDocs(collection(db, "products"));

    productSelect.innerHTML =
      `<option value="">Select product</option>`;

    snap.forEach(d => {
      const data = d.data();
      if (typeof data.price !== "number") return;

      products[d.id] = data;

      productSelect.innerHTML += `
        <option value="${d.id}">
          ${data.name} (Stock: ${data.stock})
        </option>
      `;
    });
  }

  // ---------- UPDATE TOTAL ----------
  function updateTotal() {
    const p = products[productSelect.value];
    const qty = Number(qtyEl.value);

    if (!p) {
      priceEl.textContent = "₵0.00";
      totalEl.textContent = "₵0.00";
      return;
    }

    priceEl.textContent = `₵${p.price.toFixed(2)}`;
    totalEl.textContent =
      qty > 0 ? `₵${(qty * p.price).toFixed(2)}` : "₵0.00";
  }

  productSelect.addEventListener("change", updateTotal);
  qtyEl.addEventListener("input", updateTotal);

  // ---------- SUBMIT SALE ----------
  window.submitSale = async function () {
    errorEl.classList.add("hidden");

    const productId = productSelect.value;
    const qty = Number(qtyEl.value);

    if (!productId || qty <= 0) {
      return showError("Select product and quantity");
    }

    const productRef = doc(db, "products", productId);
    let saleData;

    try {
      await runTransaction(db, async tx => {
        const snap = await tx.get(productRef);
        const p = snap.data();

        if (p.stock < qty) throw "Not enough stock";

        tx.update(productRef, {
          stock: p.stock - qty
        });

        saleData = {
          productId,
          qty,
          price: p.price,
          total: qty * p.price,
          userEmail: auth.currentUser?.email || "unknown",
          createdAt: serverTimestamp()
        };
      });

      await addDoc(collection(db, "sales"), saleData);

      qtyEl.value = "";
      alert("Sale completed");
      location.reload();

    } catch (e) {
      showError(String(e));
    }
  };

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.classList.remove("hidden");
  }

  // ---------- SALES HISTORY ----------
  async function loadSalesHistory() {
    const snap = await getDocs(
      query(collection(db, "sales"), orderBy("createdAt", "desc"))
    );

    let lastDate = "";
    salesHistoryEl.innerHTML = "";
    salesCount = {};

    snap.forEach(d => {
      const s = d.data();
      if (!s.createdAt) return;

      const date = s.createdAt.toDate();
      const dateStr = date.toDateString();
      const timeStr = date.toLocaleTimeString();

      if (dateStr !== lastDate) {
        salesHistoryEl.innerHTML += `
          <div class="bg-gray-100 px-4 py-2 text-xs font-semibold">
            ${dateStr}
          </div>
        `;
        lastDate = dateStr;
      }

      salesHistoryEl.innerHTML += `
        <div class="p-4 flex justify-between text-sm border-b">
          <div>
            <p class="font-medium">
              ${products[s.productId]?.name || "Unknown"}
            </p>
            <p class="text-xs text-gray-500">${timeStr}</p>
          </div>
          <p class="font-semibold">₵${s.total.toFixed(2)}</p>
        </div>
      `;

      salesCount[s.productId] =
        (salesCount[s.productId] || 0) + s.qty;
    });

    updateTopProduct();
  }

  function updateTopProduct() {
    const topId = Object.keys(salesCount)
      .sort((a, b) => salesCount[b] - salesCount[a])[0];

    if (!topId) return;

    topProductEl.textContent =
      `${products[topId].name} (${salesCount[topId]} sold)`;
  }

  // ---------- INIT ----------
  auth.onAuthStateChanged(async user => {
    if (!user) return;
    await loadProducts();
    await loadSalesHistory();
  });
});
