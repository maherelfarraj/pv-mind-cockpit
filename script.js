const sidebar = document.querySelector(".sidebar");
const toggleButton = document.querySelector(".sidebar-toggle");
const overlay = document.querySelector(".overlay");

if (sidebar && toggleButton && overlay) {
  const setSidebarState = (open) => {
    sidebar.classList.toggle("open", open);
    overlay.hidden = !open;
    toggleButton.setAttribute("aria-expanded", String(open));
  };

  toggleButton.addEventListener("click", () => {
    setSidebarState(!sidebar.classList.contains("open"));
  });

  overlay.addEventListener("click", () => setSidebarState(false));

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
      setSidebarState(false);
    }
  });
}
