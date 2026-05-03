const state = {
  token: localStorage.getItem("token"),
  user: null,
  view: "dashboard",
  menuItems: [],
  tables: [],
  statuses: [],
  ingredients: [],
  pendingOrderItems: []
};
const actionLocks = new Map();
const ACTION_COOLDOWN_MS = 3000;

const views = [
  "dashboard",
  "orders",
  "menu",
  "clients",
  "inventory",
  "tables",
  "payments",
  "users",
  "analytics"
];

const viewMeta = {
  dashboard: { title: "Сводка", subtitle: "Мониторинг ключевых показателей системы" },
  orders: { title: "Заказы", subtitle: "Создание заказов и контроль статусов обслуживания" },
  menu: { title: "Меню", subtitle: "Управление категориями и позициями меню" },
  clients: { title: "Клиенты", subtitle: "Учет клиентов и истории заказов" },
  inventory: { title: "Ингредиенты", subtitle: "Управление ингредиентами и рецептурами позиций" },
  tables: { title: "Столы", subtitle: "Контроль занятости и добавление столов" },
  payments: { title: "Оплаты", subtitle: "Проведение и контроль финансовых операций" },
  users: { title: "Пользователи", subtitle: "Учетные записи сотрудников и роли доступа" },
  analytics: { title: "Аналитика", subtitle: "Сводные показатели по заказам и загруженности" }
};

const messageBox = document.getElementById("messages");
const loginForm = document.getElementById("login-form");
const userPanel = document.getElementById("user-panel");
const userName = document.getElementById("user-name");
const viewTitle = document.getElementById("view-title");
const viewSubtitle = document.getElementById("view-subtitle");

function byId(id) {
  return document.getElementById(id);
}

function on(id, event, handler) {
  const el = byId(id);
  if (el) el.addEventListener(event, handler);
}

function fmtDate(value) {
  return value ? new Date(value).toLocaleString() : "—";
}

function normalizeText(value) {
  return String(value || "").trim();
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function setFieldValidity(input, errorText) {
  if (!input) return;
  input.setCustomValidity(errorText || "");
  input.classList.toggle("field-invalid", Boolean(errorText));
}

function bindFieldValidation(inputId, validator) {
  const input = byId(inputId);
  if (!input) return;
  const run = () => {
    const message = validator(input.value);
    setFieldValidity(input, message);
  };
  input.addEventListener("input", run);
  input.addEventListener("blur", run);
  run();
}

function withActionCooldown(actionKey, fn, control) {
  const now = Date.now();
  const lockedUntil = actionLocks.get(actionKey) || 0;
  if (lockedUntil > now) {
    const waitSeconds = Math.ceil((lockedUntil - now) / 1000);
    showMessage(`Подождите ${waitSeconds} сек. перед повтором действия.`, "err");
    return;
  }

  actionLocks.set(actionKey, now + ACTION_COOLDOWN_MS);
  const button = control || null;
  const originalLabel = button ? button.textContent : "";
  if (button) {
    button.disabled = true;
  }

  const timer = setInterval(() => {
    if (!button) return;
    const left = Math.max(0, actionLocks.get(actionKey) - Date.now());
    const sec = Math.ceil(left / 1000);
    button.textContent = sec > 0 ? `Подождите ${sec}с` : originalLabel;
  }, 250);

  setTimeout(() => {
    if (button) {
      button.disabled = false;
      button.textContent = originalLabel;
    }
    clearInterval(timer);
  }, ACTION_COOLDOWN_MS + 50);

  Promise.resolve(fn()).catch((error) => {
    showMessage(error.message || "Ошибка действия", "err");
  });
}

function showMessage(text, type = "ok") {
  if (!messageBox) return;
  messageBox.className = `panel ${type === "err" ? "err" : "ok"}`;
  messageBox.textContent = text;
}

function showLoading(text = "Загрузка...") {
  if (!messageBox) return;
  messageBox.className = "panel muted";
  messageBox.textContent = text;
}

async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json" };
  if (options.headers) Object.assign(headers, options.headers);
  if (state.token) headers.Authorization = `Bearer ${state.token}`;

  const response = await fetch(path, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Ошибка запроса");
  return data;
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
  const meta = viewMeta[view];
  if (meta && viewTitle && viewSubtitle) {
    viewTitle.textContent = meta.title;
    viewSubtitle.textContent = meta.subtitle;
  }

  views.forEach((v) => {
    const el = byId(`view-${v}`);
    if (el) el.classList.toggle("hidden", v !== view);
  });

  document.querySelectorAll(".menu-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === view);
  });
}

function renderRows(elId, headers, rows) {
  const el = byId(elId);
  if (!el) return;
  el.innerHTML = "";
  const cols = `repeat(${headers.length}, minmax(90px, 1fr))`;

  const header = document.createElement("div");
  header.className = "row header";
  header.style.gridTemplateColumns = cols;
  header.innerHTML = headers.map((h) => `<div>${h}</div>`).join("");
  el.appendChild(header);

  rows.forEach((cells) => {
    const row = document.createElement("div");
    row.className = "row";
    row.style.gridTemplateColumns = cols;
    row.innerHTML = cells.map((value) => `<div>${value ?? "—"}</div>`).join("");
    el.appendChild(row);
  });
}

async function loadReferenceData() {
  const [menuItems, tables, statuses, categories, ingredients] = await Promise.all([
    api("/api/menu/items"),
    api("/api/reference/tables"),
    api("/api/reference/statuses"),
    api("/api/menu/categories"),
    api("/api/inventory/ingredients")
  ]);

  state.menuItems = menuItems;
  state.tables = tables;
  state.statuses = statuses;
  state.ingredients = ingredients;

  const tableSelect = byId("order-table");
  if (tableSelect) {
    tableSelect.innerHTML = state.tables.map((t) => `<option value="${t.id}">Стол ${t.number}</option>`).join("");
  }

  const itemSelect = byId("order-item");
  if (itemSelect) {
    itemSelect.innerHTML = state.menuItems
      .filter((x) => x.isAvailable)
      .map((m) => `<option value="${m.id}">${m.name} (${m.price} ₽)</option>`)
      .join("");
  }

  const catSelect = byId("menu-item-category");
  if (catSelect) {
    catSelect.innerHTML = categories.map((c) => `<option value="${c.id}">${c.name}</option>`).join("");
  }

  const recipeMenuSelect = byId("recipe-menu-item");
  if (recipeMenuSelect) {
    recipeMenuSelect.innerHTML = state.menuItems.map((m) => `<option value="${m.id}">${m.name}</option>`).join("");
  }

  const recipeIngredientSelect = byId("recipe-ingredient");
  if (recipeIngredientSelect) {
    recipeIngredientSelect.innerHTML = state.ingredients.map((i) => `<option value="${i.id}">${i.name}</option>`).join("");
  }
}

function renderPendingItems() {
  const wrap = byId("pending-items");
  if (!wrap) return;
  wrap.innerHTML = state.pendingOrderItems
    .map((it, i) => `<div class="chip">${it.name} x${it.quantity} <button class="btn-xs" data-remove-item="${i}">x</button></div>`)
    .join("");
}

async function loadDashboard() {
  const data = await api("/api/reports/summary");
  byId("ordersCount").textContent = data.ordersCount;
  byId("openOrdersCount").textContent = data.openOrdersCount;
  byId("revenue").textContent = `${Number(data.revenue || 0).toFixed(2)} ₽`;
  byId("topItems").innerHTML = data.topItems.map((x) => `<li>${x.name}: ${x.quantity}</li>`).join("");
}

async function loadOrders() {
  const rows = await api("/api/orders");
  renderRows("orders-list", ["ID", "Клиент", "Стол", "Статус", "Сумма", "Действия"], rows.map((o) => {
    const statusOptions = state.statuses
      .map((s) => `<option ${o.status?.id === s.id ? "selected" : ""} value="${s.code}">${s.name}</option>`)
      .join("");

    return [
      o.id,
      o.client?.fullName || "Гость",
      o.table?.number || "—",
      o.status?.name || "—",
      `${Number(o.totalAmount || 0).toFixed(2)} ₽`,
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

async function loadClients() {
  const rows = await api("/api/clients");
  renderRows("clients-list", ["ID", "ФИО", "Телефон", "Заказов", "Комментарий", "Создан"], rows.map((c) => [
    c.id,
    c.fullName,
    c.phone || "—",
    c._count?.orders || 0,
    c.notes || "—",
    fmtDate(c.createdAt)
  ]));
}

async function loadInventory() {
  const [ingredients, recipes] = await Promise.all([api("/api/inventory/ingredients"), api("/api/inventory/recipes")]);
  state.ingredients = ingredients;
  renderRows("ingredients-list", ["ID", "Ингредиент", "Ед. изм.", "Остаток"], ingredients.map((i) => [
    i.id,
    i.name,
    i.unit,
    i.stockAmount
  ]));

  renderRows("recipes-list", ["ID", "Позиция меню", "Ингредиент", "Количество"], recipes.map((r) => [
    r.id,
    r.menuItem?.name || "—",
    r.ingredient?.name || "—",
    r.amount
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

async function loadPayments() {
  const rows = await api("/api/payments");
  renderRows("payments-list", ["ID", "Заказ", "Стол", "Метод", "Сумма", "Время"], rows.map((p) => [
    p.id,
    p.orderId,
    p.order?.table?.number || "—",
    p.paymentMethod?.name || "—",
    `${Number(p.amount || 0).toFixed(2)} ₽`,
    fmtDate(p.paidAt)
  ]));
}

async function loadUsers() {
  const rows = await api("/api/users");
  renderRows("users-list", ["ID", "ФИО", "Email", "Роль", "Активен", "Создан"], rows.map((u) => [
    u.id,
    u.fullName,
    u.email,
    u.role?.name || "—",
    u.isActive ? "Да" : "Нет",
    fmtDate(u.createdAt)
  ]));
}

async function loadAnalytics() {
  const [byStatus, byTables] = await Promise.all([
    api("/api/reports/orders-by-status"),
    api("/api/reports/tables-load")
  ]);

  renderRows("analytics-statuses", ["Статус", "Код", "Количество"], byStatus.map((s) => [
    s.statusName,
    s.statusCode,
    s.count
  ]));

  renderRows("analytics-tables", ["Стол", "Мест", "Занят", "Заказов"], byTables.map((t) => [
    t.number,
    t.seats,
    t.isOccupied ? "Да" : "Нет",
    t.ordersCount
  ]));
}

async function loadCurrentUser() {
  const me = await api("/api/auth/me");
  state.user = me;
  if (userName) userName.textContent = `${me.fullName} (${me.role.name})`;
  loginForm.classList.add("hidden");
  userPanel.classList.remove("hidden");
}

async function loadViewData(view) {
  if (!requireAuth()) return;
  showLoading("Загрузка раздела...");
  if (view === "dashboard") return loadDashboard();
  if (view === "orders") return loadOrders();
  if (view === "menu") return loadMenu();
  if (view === "clients") return loadClients();
  if (view === "inventory") return loadInventory();
  if (view === "tables") return loadTables();
  if (view === "payments") return loadPayments();
  if (view === "users") return loadUsers();
  if (view === "analytics") return loadAnalytics();
  return null;
}

document.querySelectorAll(".menu-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    setView(btn.dataset.view);
    try {
      await loadViewData(btn.dataset.view);
      showMessage("Раздел готов к работе.");
    } catch (error) {
      showMessage(error.message, "err");
    }
  });
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const button = e.submitter || e.target.querySelector('button[type="submit"]');
  withActionCooldown("auth-login", async () => {
    const email = normalizeText(byId("email").value).toLowerCase();
    const password = byId("password").value;

    if (!isValidEmail(email)) {
      throw new Error("Введите корректный email.");
    }
    if (!password || password.length < 6) {
      throw new Error("Пароль должен содержать минимум 6 символов.");
    }

    const data = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });

    state.token = data.token;
    localStorage.setItem("token", data.token);
    await loadCurrentUser();
    await loadReferenceData();
    await loadDashboard();
    showMessage("Успешный вход. Система готова к работе.");
  }, button);
});

on("logout-btn", "click", () => {
  state.token = null;
  state.user = null;
  localStorage.removeItem("token");
  userPanel.classList.add("hidden");
  loginForm.classList.remove("hidden");
  showMessage("Вы вышли из системы.");
});

on("add-order-item", "click", () => {
  if (!requireAuth()) return;
  const id = Number(byId("order-item").value);
  const quantity = Number(byId("order-qty").value);
  const menu = state.menuItems.find((x) => x.id === id);
  if (!menu) return showMessage("Позиция не выбрана", "err");
  state.pendingOrderItems.push({ menuItemId: id, quantity, name: menu.name });
  renderPendingItems();
});

on("pending-items", "click", (e) => {
  const idx = e.target.dataset.removeItem;
  if (idx === undefined) return;
  state.pendingOrderItems.splice(Number(idx), 1);
  renderPendingItems();
});

on("create-order-form", "submit", async (e) => {
  e.preventDefault();
  if (!requireAuth()) return;
  if (!state.pendingOrderItems.length) return showMessage("Добавьте минимум одну позицию", "err");
  const button = e.submitter || e.target.querySelector('button[type="submit"]');
  withActionCooldown("create-order", async () => {
    const tableId = Number(byId("order-table").value);
    if (!Number.isInteger(tableId) || tableId <= 0) {
      throw new Error("Выберите корректный стол.");
    }

    await api("/api/orders", {
      method: "POST",
      body: JSON.stringify({
        tableId,
        items: state.pendingOrderItems.map((x) => ({ menuItemId: x.menuItemId, quantity: x.quantity }))
      })
    });
    state.pendingOrderItems = [];
    renderPendingItems();
    await Promise.all([loadOrders(), loadTables(), loadDashboard()]);
    showMessage("Заказ успешно создан");
  }, button);
});

on("orders-list", "change", async (e) => {
  const orderId = e.target.dataset.statusOrder;
  if (!orderId) return;
  withActionCooldown(`order-status-${orderId}`, async () => {
    await api(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ statusCode: e.target.value })
    });
    await Promise.all([loadOrders(), loadTables(), loadDashboard()]);
    showMessage(`Статус заказа #${orderId} обновлен`);
  });
});

on("menu-list", "click", async (e) => {
  const id = e.target.dataset.toggleItem;
  if (!id) return;
  withActionCooldown(`menu-toggle-${id}`, async () => {
    const current = e.target.dataset.current === "true";
    await api(`/api/menu/items/${id}/availability`, {
      method: "PATCH",
      body: JSON.stringify({ isAvailable: !current })
    });
    await Promise.all([loadMenu(), loadReferenceData()]);
    showMessage("Доступность позиции обновлена");
  });
});

on("tables-list", "click", async (e) => {
  const id = e.target.dataset.toggleTable;
  if (!id) return;
  withActionCooldown(`table-toggle-${id}`, async () => {
    const current = e.target.dataset.current === "true";
    await api(`/api/reference/tables/${id}/occupancy`, {
      method: "PATCH",
      body: JSON.stringify({ isOccupied: !current })
    });
    await Promise.all([loadTables(), loadDashboard()]);
    showMessage("Статус стола обновлен");
  });
});

on("create-menu-item-form", "submit", async (e) => {
  e.preventDefault();
  const button = e.submitter || e.target.querySelector('button[type="submit"]');
  withActionCooldown("create-menu-item", async () => {
    const name = normalizeText(byId("menu-item-name").value);
    const price = Number(byId("menu-item-price").value);
    const categoryId = Number(byId("menu-item-category").value);
    if (name.length < 2) throw new Error("Название позиции слишком короткое.");
    if (!Number.isFinite(price) || price <= 0) throw new Error("Цена должна быть больше 0.");
    if (!Number.isInteger(categoryId) || categoryId <= 0) throw new Error("Выберите категорию.");

    await api("/api/menu/items", {
      method: "POST",
      body: JSON.stringify({ name, price, categoryId })
    });
    e.target.reset();
    await Promise.all([loadMenu(), loadReferenceData()]);
    showMessage("Позиция меню добавлена");
  }, button);
});

on("create-client-form", "submit", async (e) => {
  e.preventDefault();
  const button = e.submitter || e.target.querySelector('button[type="submit"]');
  withActionCooldown("create-client", async () => {
    const fullName = normalizeText(byId("client-name-input").value);
    const phone = normalizeText(byId("client-phone-input").value);
    const notes = normalizeText(byId("client-notes-input").value);
    if (fullName.length < 2) throw new Error("Введите корректное имя клиента.");
    if (phone && phone.length < 5) throw new Error("Телефон слишком короткий.");

    await api("/api/clients", {
      method: "POST",
      body: JSON.stringify({
        fullName,
        phone: phone || undefined,
        notes: notes || undefined
      })
    });
    e.target.reset();
    await loadClients();
    showMessage("Клиент добавлен");
  }, button);
});

on("create-ingredient-form", "submit", async (e) => {
  e.preventDefault();
  const button = e.submitter || e.target.querySelector('button[type="submit"]');
  withActionCooldown("create-ingredient", async () => {
    const name = normalizeText(byId("ingredient-name-input").value);
    const unit = normalizeText(byId("ingredient-unit-input").value);
    const stockAmount = Number(byId("ingredient-stock-input").value);
    if (name.length < 2) throw new Error("Название ингредиента слишком короткое.");
    if (!unit) throw new Error("Укажите единицу измерения.");
    if (!Number.isFinite(stockAmount) || stockAmount < 0) throw new Error("Остаток должен быть 0 или больше.");

    await api("/api/inventory/ingredients", {
      method: "POST",
      body: JSON.stringify({ name, unit, stockAmount })
    });
    e.target.reset();
    await Promise.all([loadInventory(), loadReferenceData()]);
    showMessage("Ингредиент добавлен");
  }, button);
});

on("create-recipe-form", "submit", async (e) => {
  e.preventDefault();
  const button = e.submitter || e.target.querySelector('button[type="submit"]');
  withActionCooldown("create-recipe", async () => {
    const menuItemId = Number(byId("recipe-menu-item").value);
    const ingredientId = Number(byId("recipe-ingredient").value);
    const amount = Number(byId("recipe-amount").value);
    if (!Number.isInteger(menuItemId) || menuItemId <= 0) throw new Error("Выберите позицию меню.");
    if (!Number.isInteger(ingredientId) || ingredientId <= 0) throw new Error("Выберите ингредиент.");
    if (!Number.isFinite(amount) || amount <= 0) throw new Error("Количество должно быть больше 0.");

    await api("/api/inventory/recipes", {
      method: "POST",
      body: JSON.stringify({ menuItemId, ingredientId, amount })
    });
    e.target.reset();
    await loadInventory();
    showMessage("Рецептура обновлена");
  }, button);
});

on("create-table-form", "submit", async (e) => {
  e.preventDefault();
  const button = e.submitter || e.target.querySelector('button[type="submit"]');
  withActionCooldown("create-table", async () => {
    const number = Number(byId("table-number").value);
    const seats = Number(byId("table-seats").value);
    if (!Number.isInteger(number) || number <= 0) throw new Error("Номер стола должен быть положительным.");
    if (!Number.isInteger(seats) || seats <= 0) throw new Error("Количество мест должно быть положительным.");

    await api("/api/reference/tables", {
      method: "POST",
      body: JSON.stringify({ number, seats })
    });
    e.target.reset();
    await Promise.all([loadTables(), loadReferenceData()]);
    showMessage("Стол добавлен");
  }, button);
});

on("create-user-form", "submit", async (e) => {
  e.preventDefault();
  const button = e.submitter || e.target.querySelector('button[type="submit"]');
  withActionCooldown("create-user", async () => {
    const fullName = normalizeText(byId("user-name-input").value);
    const email = normalizeText(byId("user-email-input").value).toLowerCase();
    const password = byId("user-password-input").value;
    const roleCode = byId("user-role-input").value;

    if (fullName.length < 2) throw new Error("ФИО слишком короткое.");
    if (!isValidEmail(email)) throw new Error("Введите корректный email сотрудника.");
    if (!password || password.length < 6) throw new Error("Пароль сотрудника должен быть минимум 6 символов.");
    if (!roleCode) throw new Error("Выберите роль сотрудника.");

    await api("/api/users", {
      method: "POST",
      body: JSON.stringify({ fullName, email, password, roleCode })
    });
    e.target.reset();
    await loadUsers();
    showMessage("Пользователь добавлен");
  }, button);
});

on("payment-form", "submit", async (e) => {
  e.preventDefault();
  const button = e.submitter || e.target.querySelector('button[type="submit"]');
  withActionCooldown("create-payment", async () => {
    const orderId = Number(byId("payment-order-id").value);
    const paymentMethodCode = byId("payment-method").value;
    if (!Number.isInteger(orderId) || orderId <= 0) throw new Error("Введите корректный ID заказа.");
    if (!paymentMethodCode) throw new Error("Выберите способ оплаты.");

    await api("/api/payments", {
      method: "POST",
      body: JSON.stringify({ orderId, paymentMethodCode })
    });
    await Promise.all([loadPayments(), loadOrders(), loadDashboard()]);
    showMessage("Оплата проведена");
  }, button);
});

on("refresh-orders", "click", () => loadOrders().catch((e) => showMessage(e.message, "err")));
on("refresh-menu", "click", () => loadMenu().catch((e) => showMessage(e.message, "err")));
on("refresh-clients", "click", () => loadClients().catch((e) => showMessage(e.message, "err")));
on("refresh-inventory", "click", () => loadInventory().catch((e) => showMessage(e.message, "err")));
on("refresh-tables", "click", () => loadTables().catch((e) => showMessage(e.message, "err")));
on("refresh-payments", "click", () => loadPayments().catch((e) => showMessage(e.message, "err")));
on("refresh-users", "click", () => loadUsers().catch((e) => showMessage(e.message, "err")));
on("refresh-analytics", "click", () => loadAnalytics().catch((e) => showMessage(e.message, "err")));

bindFieldValidation("email", (value) => {
  const cleaned = normalizeText(value);
  if (cleaned.length < 6) return "Email слишком короткий";
  if (!isValidEmail(cleaned)) return "Неверный формат email";
  return "";
});
bindFieldValidation("password", (value) => {
  if (!value || value.length < 6) return "Минимум 6 символов";
  return "";
});
bindFieldValidation("user-email-input", (value) => {
  const cleaned = normalizeText(value);
  if (cleaned.length < 6) return "Email слишком короткий";
  if (!isValidEmail(cleaned)) return "Неверный формат email";
  return "";
});
bindFieldValidation("user-password-input", (value) => {
  if (!value || value.length < 6) return "Минимум 6 символов";
  return "";
});
bindFieldValidation("client-name-input", (value) => {
  if (normalizeText(value).length < 2) return "Минимум 2 символа";
  return "";
});
bindFieldValidation("client-phone-input", (value) => {
  const cleaned = normalizeText(value);
  if (cleaned && cleaned.length < 5) return "Телефон слишком короткий";
  return "";
});
bindFieldValidation("menu-item-name", (value) => {
  if (normalizeText(value).length < 2) return "Минимум 2 символа";
  return "";
});

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
    console.error(error);
  }
})();
