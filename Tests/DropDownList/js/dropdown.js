/* ============= Utilities ============= */
function $(id) { return document.getElementById(id); }

/* ============= Click Dropdown (any number) =============
 * Opens on click, closes on outside click or menu mouseleave.
 * Usage: createClickDropdown({ buttonId: "...", menuId: "..." })
 */
function createClickDropdown({ buttonId, menuId }) {
  const btn  = $(buttonId);
  const menu = $(menuId);
  if (!btn || !menu) return;

  function setOpen(open) {
    menu.style.display = open ? "block" : "none";
    menu.setAttribute("data-open", open ? "true" : "false");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  }

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = menu.getAttribute("data-open") === "true";
    setOpen(!isOpen);
  });

  // Close on outside click
  window.addEventListener("click", (e) => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) setOpen(false);
  });

  // Close when leaving the content
  menu.addEventListener("mouseleave", () => setOpen(false));

  // Optional keyboard: Esc closes
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });
}

/* ============= Hover Dropdown (any number, stateful) =============
 * Opens on mouseenter (button/menu), closes after grace period
 * when leaving button or content (but remains open if the other
 * element is entered within the grace window).
 * Usage: createHoverDropdown({ wrapId: "...", buttonId: "...", menuId: "...", graceMs?: 180 })
 */
function createHoverDropdown({ wrapId, buttonId, menuId, graceMs = 180 }) {
  const wrap = $(wrapId);
  const btn  = $(buttonId);
  const menu = $(menuId);
  if (!wrap || !btn || !menu) return;

  let hideTimer = null;

  function open() {
    clearTimeout(hideTimer);
    wrap.classList.add("open");
    btn.setAttribute("aria-expanded", "true");
  }
  function scheduleClose() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      wrap.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    }, graceMs);
  }

  // Keep open while over button or menu
  btn.addEventListener("mouseenter", open);
  menu.addEventListener("mouseenter", open);

  // Leaving the button schedules a close (grace lets us enter the menu)
  btn.addEventListener("mouseleave", scheduleClose);

  // Leaving the menu schedules a close
  menu.addEventListener("mouseleave", scheduleClose);

  // Optional keyboard accessibility
  btn.addEventListener("focus", open);
  btn.addEventListener("blur", scheduleClose);
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      wrap.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    }
  });
}
