const STORAGE_KEY = "campusfind.items.v1";

const starterItems = [
  {
    id: "seed-1",
    status: "lost",
    title: "Sony wireless earbuds",
    category: "Electronics",
    location: "Student Union, 1st floor",
    date: "2026-10-25",
    description: "Black case with a small silver sticker on the back.",
    contact: "sam.student@example.edu",
    emoji: "🎧",
    color: "#e9e6d9"
  },
  {
    id: "seed-2",
    status: "found",
    title: "Green canvas tote bag",
    category: "Bags",
    location: "Outside the main library",
    date: "2026-10-26",
    description: "Found on the bench by the east entrance.",
    contact: "maya.student@example.edu",
    emoji: "👜",
    color: "#e7ebdf"
  },
  {
    id: "seed-3",
    status: "lost",
    title: "Set of brass keys",
    category: "Keys",
    location: "Science building, Room 204",
    date: "2026-10-24",
    description: "Three keys on a red woven keychain.",
    contact: "alex.student@example.edu",
    emoji: "🔑",
    color: "#f0e5d7"
  },
  {
    id: "seed-4",
    status: "found",
    title: "Blue insulated bottle",
    category: "Other",
    location: "Athletics center, front desk",
    date: "2026-10-26",
    description: "Stainless steel bottle, left after morning practice.",
    contact: "jordan.student@example.edu",
    emoji: "🧴",
    color: "#e0eaf0"
  },
  {
    id: "seed-5",
    status: "lost",
    title: "Gray zip-up hoodie",
    category: "Clothing",
    location: "Arts quad, near the fountain",
    date: "2026-10-23",
    description: "Medium size, small embroidered mountain on the sleeve.",
    contact: "taylor.student@example.edu",
    emoji: "🧥",
    color: "#ece4e0"
  },
  {
    id: "seed-6",
    status: "found",
    title: "Calculus notebook",
    category: "Other",
    location: "Engineering hall, study lounge",
    date: "2026-10-25",
    description: "Green spiral notebook with handwritten notes inside.",
    contact: "riley.student@example.edu",
    emoji: "📗",
    color: "#e6eadb"
  }
];

const emojiByCategory = {
  Electronics: "🎧",
  Bags: "🎒",
  Keys: "🔑",
  Clothing: "🧥",
  Other: "📦"
};
const colorByCategory = {
  Electronics: "#e9e6d9",
  Bags: "#e7ebdf",
  Keys: "#f0e5d7",
  Clothing: "#ece4e0",
  Other: "#e6eadb"
};

const grid = document.querySelector("#listingGrid");
const emptyState = document.querySelector("#emptyState");
const searchInput = document.querySelector("#searchInput");
const statusFilter = document.querySelector("#statusFilter");
const categoryFilter = document.querySelector("#categoryFilter");
const reportDialog = document.querySelector("#reportDialog");
const reportForm = document.querySelector("#reportForm");
let toastTimer;

function loadItems() {
  try {
    const savedItems = localStorage.getItem(STORAGE_KEY);
    if (savedItems === null) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(starterItems));
      return [...starterItems];
    }

    const items = JSON.parse(savedItems);
    if (!Array.isArray(items)) throw new Error("Saved listing data is not a list.");
    return items;
  } catch (error) {
    console.error("Could not load Campus Find listings.", error);
    showToast("Could not load saved listings. Please check your browser storage.");
    return [...starterItems];
  }
}

let items = loadItems();

function saveItems() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return true;
  } catch (error) {
    console.error("Could not save Campus Find listings.", error);
    showToast("Your browser could not save this update. Check available storage.");
    return false;
  }
}

function readableDate(dateValue) {
  const date = new Date(`${dateValue}T12:00:00`);
  if (Number.isNaN(date.getTime())) return dateValue;
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
}

function addTextElement(parent, tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  element.textContent = text;
  parent.append(element);
  return element;
}

function createItemCard(item) {
  const card = document.createElement("article");
  card.className = "item-card";

  const visual = document.createElement("div");
  visual.className = "item-visual";
  visual.style.setProperty("--visual-bg", item.color || colorByCategory[item.category] || colorByCategory.Other);
  addTextElement(visual, "span", `item-tag ${item.status}`, item.status === "lost" ? "Lost item" : "Found item");
  addTextElement(visual, "span", "item-emoji", item.emoji || emojiByCategory[item.category] || emojiByCategory.Other).setAttribute("aria-hidden", "true");
  card.append(visual);

  const content = document.createElement("div");
  content.className = "item-card-content";
  const titleRow = document.createElement("div");
  titleRow.className = "item-title-row";
  addTextElement(titleRow, "h3", "item-title", item.title);
  addTextElement(titleRow, "span", "item-category", item.category);
  content.append(titleRow);

  const meta = document.createElement("div");
  meta.className = "item-meta";
  const location = document.createElement("span");
  addTextElement(location, "span", "meta-icon", "⌖").setAttribute("aria-hidden", "true");
  location.append(document.createTextNode(item.location));
  const date = document.createElement("span");
  addTextElement(date, "span", "meta-icon", "◷").setAttribute("aria-hidden", "true");
  date.append(document.createTextNode(readableDate(item.date)));
  meta.append(location, date);
  content.append(meta);

  addTextElement(content, "p", "item-description", item.description || "No additional details provided.");
  const footer = document.createElement("div");
  footer.className = "item-card-footer";
  const contact = document.createElement("a");
  contact.className = "contact-link";
  contact.href = `mailto:${encodeURIComponent(item.contact)}`;
  contact.textContent = "Get in touch ↗";
  footer.append(contact);

  if (item.status === "found") {
    const returned = document.createElement("button");
    returned.type = "button";
    returned.className = "resolve-button";
    returned.textContent = "Mark returned";
    returned.addEventListener("click", () => markReturned(item.id));
    footer.append(returned);
  }
  content.append(footer);
  card.append(content);
  return card;
}

function updateCounts() {
  const lostCount = items.filter((item) => item.status === "lost").length;
  const foundCount = items.filter((item) => item.status === "found").length;
  document.querySelector("#listingCount").textContent = items.length;
  document.querySelector("#allChipCount").textContent = items.length;
  document.querySelector("#lostChipCount").textContent = lostCount;
  document.querySelector("#foundChipCount").textContent = foundCount;
}

function renderItems() {
  const searchTerm = searchInput.value.trim().toLocaleLowerCase();
  const selectedStatus = statusFilter.value;
  const selectedCategory = categoryFilter.value;
  const filteredItems = items.filter((item) => {
    const searchableText = `${item.title} ${item.location} ${item.description} ${item.category}`.toLocaleLowerCase();
    return (selectedStatus === "all" || item.status === selectedStatus)
      && (selectedCategory === "all" || item.category === selectedCategory)
      && searchableText.includes(searchTerm);
  });

  grid.replaceChildren(...filteredItems.map(createItemCard));
  emptyState.hidden = filteredItems.length > 0;
  grid.hidden = filteredItems.length === 0;
  updateCounts();

  document.querySelectorAll("[data-quick-filter]").forEach((button) => {
    button.classList.toggle("selected", button.dataset.quickFilter === selectedStatus);
  });
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 3500);
}

function markReturned(itemId) {
  const originalItems = items;
  items = items.filter((item) => item.id !== itemId);
  if (!saveItems()) {
    items = originalItems;
    return;
  }
  renderItems();
  showToast("Marked as returned. Thanks for helping!");
}

document.querySelectorAll("[data-open-report]").forEach((button) => {
  button.addEventListener("click", () => {
    if (!reportForm.elements.date.value) {
      reportForm.elements.date.value = new Date().toISOString().slice(0, 10);
    }
    reportDialog.showModal();
  });
});

document.querySelectorAll("[data-close-report]").forEach((button) => {
  button.addEventListener("click", () => reportDialog.close());
});

reportDialog.addEventListener("click", (event) => {
  if (event.target === reportDialog) reportDialog.close();
});

reportForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!reportForm.reportValidity()) return;

  const formData = new FormData(reportForm);
  const status = formData.get("status");
  const category = formData.get("category");
  const newItem = {
    id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    status,
    title: String(formData.get("title")).trim(),
    category: String(category),
    location: String(formData.get("location")).trim(),
    date: String(formData.get("date")),
    description: String(formData.get("description")).trim(),
    contact: String(formData.get("contact")).trim(),
    emoji: emojiByCategory[category] || emojiByCategory.Other,
    color: colorByCategory[category] || colorByCategory.Other
  };
  items = [newItem, ...items];
  if (!saveItems()) {
    items = items.filter((item) => item.id !== newItem.id);
    return;
  }

  reportForm.reset();
  reportDialog.close();
  statusFilter.value = "all";
  categoryFilter.value = "all";
  searchInput.value = "";
  renderItems();
  showToast("Your item is on the board. Thanks for looking out!");
  document.querySelector("#browse").scrollIntoView({ behavior: "smooth" });
});

searchInput.addEventListener("input", renderItems);
statusFilter.addEventListener("change", renderItems);
categoryFilter.addEventListener("change", renderItems);
document.querySelectorAll("[data-quick-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    statusFilter.value = button.dataset.quickFilter;
    renderItems();
  });
});

renderItems();
