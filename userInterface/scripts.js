// ==================== DOM Elements ====================
const dropZone   = document.getElementById("drop-zone");
const fileInput  = document.getElementById("fileInput");
const uploadBtn  = document.getElementById("uploadBtn");
const fileName   = document.getElementById("fileName");
const form       = document.getElementById("queryForm");
const result     = document.getElementById("result");
const audio      = document.getElementById("audio");
const opts       = document.querySelectorAll("#language_name option");
const audioTag   = document.getElementById("audio-tag");
const loadingStory = document.getElementById("loading-story");
const loadingAudio = document.getElementById("loading-audio");
const resultBox = document.querySelector(".result-box");

// ==================== Utility Functions ====================

// Update fileInput with manually or drag-dropped file
function handleFile(file) {
  if (file) {
    fileName.textContent = `Selected file: ${file.name}`;
    
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.files = dataTransfer.files;
  }
}

// Get language code from selected value
function getLanguageCode() {
  const selectedValue = document.getElementById("language").value;
  for (let opt of opts) {
    if (opt.value === selectedValue) {
      return opt.getAttribute("data-code") || "en";
    }
  }
  return "en";
}

// Show/hide elements
function show(el) {
  el.style.display = "block";
}
function hide(el) {
  el.style.display = "none";
}

// Reset UI
function resetOutput() {
  result.innerHTML = "";
  audio.src = "";
  audio.controls = false;
  hide(resultBox);
  hide(audio);
  hide(loadingStory);
  hide(loadingAudio);
}

// ==================== Event Listeners ====================

// Form submission
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  resetOutput();

  const file = fileInput.files[0];
  if (!file) {
    alert("Please select a file to upload.");
    return;
  }
  const lang_code = getLanguageCode();
  
  const formData = new FormData();
  formData.append("image", file);
  formData.append("language", lang_code);
  show(resultBox);

  try {
    // === STORY LOADING ===
    show(loadingStory);

    const res = await fetch("http://localhost:5000/generate_story", {
      method: "POST",
      body: formData,
    });

    hide(loadingStory);

    if (!res.ok) {
      throw new Error("Failed to generate story.");
    }

    const data = await res.json();
    if (!data.story || !data.moral) {
      throw new Error("Incomplete response: story or moral missing.");
    }

    result.innerHTML = `
      <p class="text">${'\u2003\u2003\u2003\u2003'}${data.story}</p>
      <h2>Moral:</h2><p class="text">${data.moral}</p>
    `;

    // === AUDIO LOADING ===
    show(audioTag);
    show(loadingAudio);

    const audioForm = new FormData();
    audioForm.append("story", data.story);
    audioForm.append("moral", data.moral);

    const audioRes = await fetch("http://localhost:5000/get_audio", {
      method: "POST",
      body: audioForm,
    });

    hide(loadingAudio);

    if (!audioRes.ok) {
      throw new Error("Failed to generate audio.");
    }

    const audioBlob = await audioRes.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    audio.src = audioUrl;
    audio.controls = true;
    show(audio);

  } catch (err) {
    hide(loadingStory);
    hide(loadingAudio);
    console.error("Error:", err);
    alert(err.message || "An unexpected error occurred. Please try again.");
  }
});

// Drag events
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");

  const file = e.dataTransfer.files[0];
  handleFile(file);
});

// Button triggers file input
uploadBtn.addEventListener("click", (e) => {
  e.preventDefault();
  fileInput.click();
});

// Manual file selection
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  handleFile(file);
});
