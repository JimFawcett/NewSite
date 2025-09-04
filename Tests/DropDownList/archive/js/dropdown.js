/* =========================
   Resources (click-to-toggle)
   ========================= */
const resourcesBtn  = document.getElementById("dropdownButton");
const resourcesMenu = document.getElementById("dropdownMenu");

function setResourcesOpen(open) {
  resourcesMenu.style.display = open ? "block" : "none";
  resourcesMenu.setAttribute("data-open", open ? "true" : "false");
  resourcesBtn.setAttribute("aria-expanded", open ? "true" : "false");
}

resourcesBtn.addEventListener("click", () => {
  const isOpen = resourcesMenu.style.display === "block";
  setResourcesOpen(!isOpen);
});

// Close on outside click
window.addEventListener("click", (e) => {
  if (!resourcesBtn.contains(e.target) && !resourcesMenu.contains(e.target)) {
    setResourcesOpen(false);
  }
});

// Close when leaving the Resources content
resourcesMenu.addEventListener("mouseleave", () => setResourcesOpen(false));

// Optional keyboard: Esc closes
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") setResourcesOpen(false);
});


/* =====================================
   More Links (stateful "hover" behavior)
   ===================================== */
const hoverWrap  = document.getElementById("hoverWrap");
const hoverBtn   = document.getElementById("hoverButton");
const hoverMenu  = document.getElementById("hoverMenu");
const moreHoverWrap  = document.getElementById("moreHoverWrap");
const moreHoverBtn   = document.getElementById("moreHoverButton");
const moreHoverMenu  = document.getElementById("moreHoverMenu");

let hoverHideTimer = null;
const GRACE_MS = 180;

function openHover() {
  clearTimeout(hoverHideTimer);
  hoverWrap.classList.add("open");
  hoverBtn.setAttribute("aria-expanded", "true");
}

function scheduleCloseHover() {
  clearTimeout(hoverHideTimer);
  hoverHideTimer = setTimeout(() => {
    hoverWrap.classList.remove("open");
    hoverBtn.setAttribute("aria-expanded", "false");
  }, GRACE_MS);
}

function openMoreHover() {
  clearTimeout(hoverHideTimer);
  moreHoverWrap.classList.add("open");
  moreHoverBtn.setAttribute("aria-expanded", "true");
}

function scheduleCloseMoreHover() {
  clearTimeout(hoverHideTimer);
  hoverHideTimer = setTimeout(() => {
    moreHoverWrap.classList.remove("open");
    moreHoverBtn.setAttribute("aria-expanded", "false");
  }, GRACE_MS);
}

// Open when entering button or menu; keep open while inside either
hoverBtn.addEventListener("mouseenter", openHover);
hoverMenu.addEventListener("mouseenter", openHover);
moreHoverBtn.addEventListener("mouseenter", openHover);
moreHoverMenu.addEventListener("mouseenter", openHover);

// Do NOT close immediately when leaving the button—only schedule
hoverBtn.addEventListener("mouseleave", scheduleCloseHover);

// Close when leaving the content (with grace to allow crossing seam)
hoverMenu.addEventListener("mouseleave", scheduleCloseHover);

// Do NOT close immediately when leaving the button—only schedule
moreHoverBtn.addEventListener("mouseleave", scheduleCloseHover);

// Close when leaving the content (with grace to allow crossing seam)
moreHoverMenu.addEventListener("mouseleave", scheduleCloseHover);

// Optional keyboard support
hoverBtn.addEventListener("focus", openHover);
hoverBtn.addEventListener("blur", scheduleCloseHover);
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    hoverWrap.classList.remove("open");
    hoverBtn.setAttribute("aria-expanded", "false");
  }
});
