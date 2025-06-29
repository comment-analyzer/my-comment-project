// js/modal.js
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.createElement("div");
  modal.id = "modal";
  modal.innerHTML = `
    <div class="modal-content">
      <span id="modal-close">&times;</span>
      <iframe id="modal-iframe" width="100%" height="500"></iframe>
    </div>
  `;
  document.body.appendChild(modal);

  const iframe = document.getElementById("modal-iframe");
  const closeBtn = document.getElementById("modal-close");

  window.openModal = (src) => {
    iframe.src = src;
    modal.style.display = "block";
  };

  closeBtn.onclick = () => {
    modal.style.display = "none";
    iframe.src = "";
  };

  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
      iframe.src = "";
    }
  };
});
