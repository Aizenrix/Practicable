const state = {
  token: localStorage.getItem("token"),
  user: null,
  view: "dashboard",
  menuItems: [],
  tables: [],
  statuses: [],
  pendingOrderItems: []
};

const views = ["dashboard", "orders", "menu", "tables", "payments", "users"];
const messageBox = document.getElementById("messages");
const loginForm = document.getElementById("login-form");
const userPanel = document.getElementById("user-panel");
const userName = document.getElementById("user-name");

function fmtDate(v) {
  return v ? new Date(v).toLocaleString() : "—";
}

function showMessage(text, type = "ok") {
  messageBox.className = `panel ${type === "err" ? "err" : "ok"}`;
  messageBox.textContent = text;
}

async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  const response = await fetch(path, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Ошибка запроса");
  return data;
}

function renderRows(elId, headers, rows) {
  const el = document.getElementById(elId);
  el.innerHTML = "";
  const header = document.createElement("div");
  header.className = "row header";
  header.innerHTML = headers.map((h) => `<div>${h}</div>`).join("");
  el.appendChild(header);
  rows.forEach((cells) => {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = cells.map((x) => `<div>${x}</div>`).join("");
    el.appendChild(row);
  });
}

function requireAuth() {
  if (!state.token) {
    showMessage("Сначала войдите в систему", "err");
    return false;
  }
  return true;
}

function setView(view) {
  state.view = view;
  views.forEach((v) => {
    document.getElementById(`view-${v}`).classList.toggle("hidden", v !== view);
  });
  document.querySelectorAll(".menu-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === view);
  });
}

async function loadReferenceData() {
  state.menuItems = await api("/api/menu/items");
  state.tables = await api("/api/reference/tables");
  state.statuses = await api("/api/reference/statuses");
  const tableSelect = document.getElementById("order-table");
  tableSelect.innerHTML = state.tables.map((t) => `<option value="${t.id}">Стол ${t.number}</option>`).join("");
  const itemSelect = document.getElementById("order-item");
  itemSelect.innerHTML = state.menuItems
    .filter((x) => x.isAvailable)
    .map((m) => `<option value="${m.id}">${m.name} (${m.price} ₽)</option>`)
    .join("");
  const catSelect = document.getElementById("menu-item-category");
  const categories = await api("/api/menu/categories");
  catSelect.innerHTML = categories.map((c) => `<option value="${c.id}">${c.name}</option>`).join("");
}

function renderPendingItems() {
  const wrap = document.getElementById("pending-items");
  wrap.innerHTML = state.pendingOrderItems.map((it, i) => (
    `<div class="chip">${it.name} x${it.quantity} <button class="btn-xs" data-remove-item="${i}">x</button></div>`
  )).join("");
}

async function loadDashboard() {
  const data = await api("/api/reports/summary");
  document.getElementById("ordersCount").textContent = data.ordersCount;
  document.getElementById("openOrdersCount").textContent = data.openOrdersCount;
  document.getElementById("revenue").textContent = `${Number(data.revenue || 0).toFixed(2)} ₽`;
  document.getElementById("topItems").innerHTML = data.topItems.map((x) => `<li>${x.name}: ${x.quantity}</li>`).join("");
}

async function loadOrders() {
  const rows = await api("/api/orders");
  renderRows("orders-list", ["ID", "Стол", "Статус", "Сумма", "Оплата", "Действия"], rows.map((o) => {
    const statusOptions = state.statuses.map((s) => `<option ${o.status?.id === s.id ? "selected" : ""} value="${s.code}">${s.name}</option>`).join("");
    return [
      o.id,
      o.table?.number || "—",
      o.status?.name || "—",
      `${Number(o.totalAmount || 0).toFixed(2)} ₽`,
      o.payment ? "Оплачен" : "Не оплачен",
      `<select class="btn-xs" data-status-order="${o.id}">${statusOptions}</select>`
    ];
  }));
}

async function loadMenu() {
  const rows = await api("/api/menu/items");
  state.menuItems = rows;
  renderRows("menu-list", ["ID", "Категория", "Название", "Цена", "Доступность", "Действия"], rows.map((m) => [
    m.id,
    m.category?.name || "—",
    m.name,
    `${m.price} ₽`,
    m.isAvailable ? "Да" : "Нет",
    `<button class="btn-xs" data-toggle-item="${m.id}" data-current="${m.isAvailable}">${m.isAvailable ? "Скрыть" : "Открыть"}</button>`
  ]));
}

async function loadTables() {
  const rows = await api("/api/reference/tables");
  state.tables = rows;
  renderRows("tables-list", ["ID", "Номер", "Мест", "Занят", "Описание", "Действия"], rows.map((t) => [
    t.id,
    t.number,
    t.seats,
    t.isOccupied ? "Да" : "Нет",
    t.description || "—",
    `<button class="btn-xs" data-toggle-table="${t.id}" data-current="${t.isOccupied}">${t.isOccupied ? "Освободить" : "Занять"}</button>`
  ]));
}

async function loadUsers() {
  const rows = await api("/api/users");
  renderRows("users-list", ["ID", "ФИО", "Email", "Роль", "Активен", "Создан"], rows.map((u) => [
    u.id, u.fullName, u.email, u.role?.name || "—", u.isActive ? "Да" : "Нет", fmtDate(u.createdAt)
  ]));
}

async function loadCurrentUser() {
  const me = await api("/api/auth/me");
  state.user = me;
  userName.textContent = `${me.fullName} (${me.role.name})`;
  loginForm.classList.add("hidden");
  userPanel.classList.remove("hidden");
}

async function loadViewData(view) {
  if (!requireAuth()) return;
  if (view === "dashboard") return loadDashboard();
  if (view === "orders") return loadOrders();
  if (view === "menu") return loadMenu();
  if (view === "tables") return loadTables();
  if (view === "users") return loadUsers();
  return null;
}

document.querySelectorAll(".menu-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    setView(btn.dataset.view);
    try {
      await loadViewData(btn.dataset.view);
    } catch (error) {
      showMessage(error.message, "err");
    }
  });
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const data = await api("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    state.token = data.token;
    localStorage.setItem("token", data.token);
    await loadCurrentUser();
    await loadReferenceData();
    await loadDashboard();
    showMessage("Успешный вход. Система готова к работе.");
  } catch (error) {
    showMessage(error.message, "err");
  }
});

document.getElementById("logout-btn").addEventListener("click", () => {
  state.token = null;
  state.user = null;
  localStorage.removeItem("token");
  userPanel.classList.add("hidden");
  loginForm.classList.remove("hidden");
  showMessage("Вы вышли из системы.");
});

document.getElementById("add-order-item").addEventListener("click", () => {
  if (!requireAuth()) return;
  const id = Number(document.getElementById("order-item").value);
  const quantity = Number(document.getElementById("order-qty").value);
  const menu = state.menuItems.find((x) => x.id === id);
  if (!menu) return showMessage("Позиция не выбрана", "err");
  state.pendingOrderItems.push({ menuItemId: id, quantity, name: menu.name });
  renderPendingItems();
});

document.getElementById("pending-items").addEventListener("click", (e) => {
  const idx = e.target.getAttribute("data-remove-item");
  if (idx === null) return;
  state.pendingOrderItems.splice(Number(idx), 1);
  renderPendingItems();
});

document.getElementById("create-order-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!requireAuth()) return;
  if (!state.pendingOrderItems.length) return showMessage("Добавьте минимум одну позицию", "err");
  try {
    const tableId = Number(document.getElementById("order-table").value);
    await api("/api/orders", {
      method: "POST",
      body: JSON.stringify({
        tableId,
        items: state.pendingOrderItems.map((x) => ({ menuItemId: x.menuItemId, quantity: x.quantity }))
      })
    });
    state.pendingOrderItems = [];
    renderPendingItems();
    await loadOrders();
    await loadTables();
    showMessage("Заказ успешно создан");
  } catch (error) {
    showMessage(error.message, "err");
  }
});

document.getElementById("orders-list").addEventListener("change", async (e) => {
  const orderId = e.target.getAttribute("data-status-order");
  if (!orderId) return;
  try {
    await api(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ statusCode: e.target.value })
    });
    showMessage(`Статус заказа #${orderId} обновлен`);
    await loadOrders();
    await loadTables();
  } catch (error) {
    showMessage(error.message, "err");
  }
});

document.getElementById("menu-list").addEventListener("click", async (e) => {
  const id = e.target.getAttribute("data-toggle-item");
  if (!id) return;
  try {
    const current = e.target.getAttribute("data-current") === "true";
    await api(`/api/menu/items/${id}/availability`, {
      method: "PATCH",
      body: JSON.stringify({ isAvailable: !current })
    });
    await loadMenu();
    await loadReferenceData();
    showMessage("Доступность позиции обновлена");
  } catch (error) {
    showMessage(error.message, "err");
  }
});

document.getElementById("tables-list").addEventListener("click", async (e) => {
  const id = e.target.getAttribute("data-toggle-table");
  if (!id) return;
  try {
    const current = e.target.getAttribute("data-current") === "true";
    await api(`/api/reference/tables/${id}/occupancy`, {
      method: "PATCH",
      body: JSON.stringify({ isOccupied: !current })
    });
    await loadTables();
    await loadReferenceData();
    showMessage("Статус стола обновлен");
  } catch (error) {
    showMessage(error.message, "err");
  }
});

document.getElementById("create-menu-item-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    await api("/api/menu/items", {
      method: "POST",
      body: JSON.stringify({
        name: document.getElementById("menu-item-name").value,
        price: Number(document.getElementById("menu-item-price").value),
        categoryId: Number(document.getElementById("menu-item-category").value)
      })
    });
    await loadMenu();
    await loadReferenceData();
    showMessage("Позиция меню добавлена");
    e.target.reset();
  } catch (error) {
    showMessage(error.message, "err");
  }
});

document.getElementById("create-table-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    await api("/api/reference/tables", {
      method: "POST",
      body: JSON.stringify({
        number: Number(document.getElementById("table-number").value),
        seats: Number(document.getElementById("table-seats").value)
      })
    });
    await loadTables();
    await loadReferenceData();
    showMessage("Стол добавлен");
    e.target.reset();
  } catch (error) {
    showMessage(error.message, "err");
  }
});

document.getElementById("create-user-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    await api("/api/users", {
      method: "POST",
      body: JSON.stringify({
        fullName: document.getElementById("user-name-input").value,
        email: document.getElementById("user-email-input").value,
        password: document.getElementById("user-password-input").value,
        roleCode: document.getElementById("user-role-input").value
      })
    });
    await loadUsers();
    showMessage("Пользователь добавлен");
    e.target.reset();
  } catch (error) {
    showMessage(error.message, "err");
  }
});

document.getElementById("payment-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    await api("/api/payments", {
      method: "POST",
      body: JSON.stringify({
        orderId: Number(document.getElementById("payment-order-id").value),
        paymentMethodCode: document.getElementById("payment-method").value
      })
    });
    await loadOrders();
    await loadDashboard();
    showMessage("Оплата проведена");
  } catch (error) {
    showMessage(error.message, "err");
  }
});

document.getElementById("refresh-orders").addEventListener("click", () => loadOrders().catch((e) => showMessage(e.message, "err")));
document.getElementById("refresh-menu").addEventListener("click", () => loadMenu().catch((e) => showMessage(e.message, "err")));
document.getElementById("refresh-tables").addEventListener("click", () => loadTables().catch((e) => showMessage(e.message, "err")));
document.getElementById("refresh-users").addEventListener("click", () => loadUsers().catch((e) => showMessage(e.message, "err")));

(async () => {
  showMessage("Войдите под администратором, чтобы активировать все модули.");
  setView("dashboard");
  if (!state.token) return;
  try {
    await loadCurrentUser();
    await loadReferenceData();
    await loadDashboard();
    showMessage("Сессия восстановлена.");
  } catch (error) {
    state.token = null;
    localStorage.removeItem("token");
    showMessage("Сессия истекла. Войдите снова.", "err");
  }
})();
