let images = [];
let index = 0;

// Elements
const slideshowEl = document.getElementById("slideshow");
const gridEl = document.getElementById("grid");
const thumbsEl = document.getElementById("thumbs");

const mainImg = document.getElementById("mainImg");
const captionEl = document.getElementById("caption");
const counterEl = document.getElementById("counter");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

const viewSlideshowBtn = document.getElementById("viewSlideshowBtn");
const viewGridBtn = document.getElementById("viewGridBtn");

function normalizeImageEntry(entry) {
  // Supports either:
  // 1) "chart1.png"
  // 2) { "file": "chart1.png", "caption": "..." }
  if (typeof entry === "string") {
    return { file: entry, caption: entry };
  }
  return {
    file: entry.file,
    caption: entry.caption || entry.file,
  };
}

function setMode(mode) {
  const isSlide = mode === "slideshow";
  slideshowEl.classList.toggle("hidden", !isSlide);
  gridEl.classList.toggle("hidden", isSlide);

  viewSlideshowBtn.classList.toggle("btn-primary", isSlide);
  viewGridBtn.classList.toggle("btn-primary", !isSlide);

  viewSlideshowBtn.setAttribute("aria-pressed", String(isSlide));
  viewGridBtn.setAttribute("aria-pressed", String(!isSlide));
}

function renderSlide(i) {
  if (!images.length) return;
  index = (i + images.length) % images.length;

  const item = images[index];
  mainImg.src = `images/${encodeURIComponent(item.file)}`;
  mainImg.alt = item.caption || item.file;

  captionEl.textContent = item.caption || "";
  counterEl.textContent = `${index + 1} / ${images.length}`;
}

function renderGrid() {
  thumbsEl.innerHTML = "";

  images.forEach((item, i) => {
    const card = document.createElement("div");
    card.className = "thumb";
    card.tabIndex = 0;
    card.role = "button";
    card.ariaLabel = `Open image ${i + 1}`;

    const timg = document.createElement("div");
    timg.className = "timg";

    const img = document.createElement("img");
    img.loading = "lazy";
    img.src = `images/${encodeURIComponent(item.file)}`;
    img.alt = item.caption || item.file;

    const cap = document.createElement("div");
    cap.className = "tcap";
    cap.textContent = item.caption || item.file;

    timg.appendChild(img);
    card.appendChild(timg);
    card.appendChild(cap);

    const open = () => {
      setMode("slideshow");
      renderSlide(i);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    card.addEventListener("click", open);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") open();
    });

    thumbsEl.appendChild(card);
  });
}

function next() {
  renderSlide(index + 1);
}
function prev() {
  renderSlide(index - 1);
}

prevBtn.addEventListener("click", prev);
nextBtn.addEventListener("click", next);

viewSlideshowBtn.addEventListener("click", () => setMode("slideshow"));
viewGridBtn.addEventListener("click", () => setMode("grid"));

document.addEventListener("keydown", (e) => {
  if (slideshowEl.classList.contains("hidden")) return;
  if (e.key === "ArrowRight") next();
  if (e.key === "ArrowLeft") prev();
});

async function init() {
  try {
    const resp = await fetch("images.json", { cache: "no-store" });
    const raw = await resp.json();
    images = raw.map(normalizeImageEntry);

    if (!images.length) {
      captionEl.textContent =
        "No images found. Add files to /images and list them in images.json.";
      counterEl.textContent = "";
      return;
    }

    renderGrid();
    renderSlide(0);
    setMode("grid");
  } catch (err) {
    captionEl.textContent =
      "Couldn’t load images.json. Make sure it exists at the repo root.";
    counterEl.textContent = "";
    console.error(err);
  }
}

init();
