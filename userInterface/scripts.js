const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const fileName = document.getElementById("fileName");
const form = document.getElementById("queryForm");
const opts = document.querySelectorAll("#language_name option")

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = fileInput.files[0];
  if(!file) {
    alert("Please select a file to upload.");
    return;
  }
  let val = document.getElementById("language").value;
  let lang_code = 'en';
  opts.forEach(opt => {
    if (opt.value === val) {
      lang_code = opt.getAttribute("data-code");
    }
  })
  // console.log(lang_code);
  const formData = new FormData();
  formData.append("image", file);
  formData.append("language", lang_code);
  try {
    let res = await fetch('http://localhost:5000/generate_story', {
    method: 'POST',
    // headers: {
      // 'Content-Type': 'multipart/form-data' // Do not set this header, it will be set automatically by the browser
    // },
    body: formData,
  })
  const data = await res.json();
  console.log(data.story)
  console.log(data.moral)
  // to-do: display the story and moral in the UI
  const audioForm = new FormData();
  audioForm.append("story", data.story);
  audioForm.append("moral", data.moral);
  let audio_res = await fetch('http://localhost:5000/get_audio', {
    method: 'POST',
    body: audioForm
  })
  let audioBlob = await audio_res.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  
  document.getElementById("audio").src = audioUrl;
  }
  catch (err) {
    console.error("Error uploading file:", err);
    alert("An error occurred while uploading the file. Please try again.");
  }
})

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
