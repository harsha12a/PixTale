const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const fileName = document.getElementById("fileName");

// Highlight on drag over
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});

// Remove highlight on drag leave
dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragover");
});

// Handle file drop
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");

  const file = e.dataTransfer.files[0];
  handleFile(file);
});

// Optional: Trigger file input on button click
uploadBtn.addEventListener("click", (e) => {
  e.preventDefault();
  fileInput.click();
});

// Handle manual file selection
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  handleFile(file);
});

function handleFile(file) {
  console.log("I was called");
  if (file) {
    fileName.textContent = `Selected file: ${file.name}`;
    // You can send it to server using FormData + fetch/AJAX
  }
}
