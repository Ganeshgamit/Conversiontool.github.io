/* ============== Config ============== */
const COMPANY_NAME = "Lariya Design Hub";

/* ============== State ============== */
let originalImage = null;   // data URL of originally uploaded image
let workingImage  = null;   // current image (after edits)
let currentFormat = "png";  // track format for smart saves

/* ============== Utilities ============== */
const $ = (sel, el = document) => el.querySelector(sel);

function addMessage(sender, html) {
  const chatBox = $("#chatBox");
  const div = document.createElement("div");
  div.className = `message ${sender}`;
  div.innerHTML = html;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
  return div;
}

function addBot(text) { return addMessage("bot", text); }
function addUser(text) { return addMessage("user", text); }

function addBotButtons(text, buttons = []) {
  const card = addMessage("bot", `<div>${text}</div><div class="btnline"></div>`);
  const line = card.querySelector(".btnline");
  buttons.forEach(b => {
    const btn = document.createElement("button");
    btn.textContent = b.text;
    btn.dataset.role   = "action";
    if (b.action) btn.dataset.action = b.action;
    if (b.format) btn.dataset.format = b.format;
    if (b.width)  btn.dataset.width  = b.width;
    if (b.height) btn.dataset.height = b.height;
    if (b.quality)btn.dataset.quality= b.quality;
    if (b.ratio)  btn.dataset.ratio  = b.ratio;
    if (b.id)     btn.id             = b.id;
    if (b.className) btn.className = b.className;
    line.appendChild(btn);
  });
  return card;
}

function addPreview(dataUrl, caption) {
  const card = addBot(caption ? `<div>${caption}</div>` : "<div>Preview</div>");
  const img = document.createElement("img");
  img.src = dataUrl; img.className = "preview";
  card.appendChild(img);
  return card;
}

function addDownloadLink(dataUrl, filename) {
  const link = document.createElement("a");
  link.href = dataUrl; link.download = filename;
  link.innerText = "⬇ Download Image";
  link.className = "dl";
  $("#chatBox").appendChild(link);
}

function guessFormatFromDataURL(dataUrl) {
  if (dataUrl.startsWith("data:image/jpeg")) return "jpeg";
  if (dataUrl.startsWith("data:image/webp")) return "webp";
  if (dataUrl.startsWith("data:image/png"))  return "png";
  return "png";
}

function bytesFromDataURL(dataUrl) {
  const base64 = dataUrl.split(",")[1] || "";
  const padding = (base64.match(/=+$/) || [""])[0].length;
  return Math.floor(base64.length * 3 / 4) - padding;
}

function prettyBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1048576) return `${(n/1024).toFixed(1)} KB`;
  return `${(n/1048576).toFixed(2)} MB`;
}

/* ============== Auth (left bottom) ============== */
function initials(name) {
  return name.trim().split(/\s+/).slice(0,2).map(s=>s[0].toUpperCase()).join("") || "U";
}
function renderAuthBox() {
  const box = $("#authBox");
  const name = localStorage.getItem("userName");
  const email = localStorage.getItem("userEmail");
  if (name && email) {
    box.innerHTML = `
      <div class="user-card">
        <div class="user-avatar">${initials(name)}</div>
        <div class="user-meta">
          <b>${name}</b>
          <small>${email}</small>
        </div>
      </div>
      <button class="signout" id="signOut">Sign out</button>
    `;
    $("#signOut").addEventListener("click", ()=> {
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      renderAuthBox();
      addBot(`Signed out. Bye!`);
    });
  } else {
    box.innerHTML = `
      <h3>Sign in</h3>
      <div class="auth-row"><input id="inName" placeholder="Your name"/></div>
      <div class="auth-row"><input id="inEmail" placeholder="Email"/></div>
      <button id="signIn">Continue</button>
    `;
    $("#signIn").addEventListener("click", ()=> {
      const n = $("#inName").value.trim();
      const e = $("#inEmail").value.trim();
      if (!n || !e) return;
      localStorage.setItem("userName", n);
      localStorage.setItem("userEmail", e);
      renderAuthBox();
      addBot(`Welcome, <b>${n}</b>!`);
    });
  }
}

/* ============== Workflow ============== */
function resetChat() {
  originalImage = null;
  workingImage  = null;
  currentFormat = "png";
  $("#chatBox").innerHTML = `<div class="message bot">Hello! Please upload an image to get started.</div>`;
}

function onUploadFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    originalImage = reader.result;
    workingImage  = reader.result;
    currentFormat = guessFormatFromDataURL(workingImage);
    addUser(`Uploaded ${file.name}`);
    addPreview(workingImage, `✅ You uploaded a ${currentFormat.toUpperCase()} image.`);
    showMainMenuBot();
  };
  reader.readAsDataURL(file);
}

/* ===== Menus as Chat Messages ===== */
function showMainMenuBot() {
  addBotButtons("What would you like to do?", [
    { text: "Convert", action: "menu-convert" },
    { text: "Resize",  action: "menu-resize" },
    { text: "Crop",    action: "menu-crop"   },
    { text: "Compress",action: "menu-compress" },
    { text: "Download Current", action: "download" },
    { text: "Revert to Original", action: "revert" },
    { text: "Upload Another", action: "upload" }
  ]);
}

function showConvertMenu() {
  addBotButtons("Choose a format:", [
    { text: "JPG",  action:"convert", format:"jpeg" },
    { text: "PNG",  action:"convert", format:"png"  },
    { text: "WEBP", action:"convert", format:"webp" },
    { text: "⬅ Back", action:"menu-main", className:"ghost" }
  ]);
}

function showResizeMenu() {
  addBotButtons("Pick a size:", [
    { text: "Full HD (1920×1080)", action:"resize", width:1920, height:1080 },
    { text: "4K (3840×2160)", action:"resize", width:3840, height:2160 },
    { text: "Custom…", action:"resize-custom" },
    { text: "⬅ Back", action:"menu-main", className:"ghost" }
  ]);
}

function showCompressMenu() {
  addBotButtons("Choose compression level:", [
    { text: "Normal",    action:"compress", format:"jpeg", quality:0.8 },
    { text: "High",      action:"compress", format:"jpeg", quality:0.6 },
    { text: "Very High", action:"compress", format:"jpeg", quality:0.4 },
    { text: "WEBP 0.6",  action:"compress", format:"webp", quality:0.6 },
    { text: "⬅ Back", action:"menu-main", className:"ghost" }
  ]);
}

function showCustomResizePrompt() {
  const card = addMessage("bot", `
    <div>Enter custom dimensions:</div>
    <div class="btnline">
      <input id="cw" type="number" placeholder="Width (px)" style="padding:8px;border:1px solid #9ca3af;border-radius:8px;width:120px;">
      <input id="ch" type="number" placeholder="Height (px)" style="padding:8px;border:1px solid #9ca3af;border-radius:8px;width:120px;">
      <button data-role="action" data-action="apply-custom-resize">Apply</button>
      <button data-role="action" data-action="menu-resize" class="ghost">⬅ Back</button>
    </div>
  `);
}

/* ===== Crop UI ===== */
let cropCtx = null;
let cropState = null; // { id, img, ratio, start, current, scale }

const CROP_PRESETS = [
  { label: "Free", ratio: "" },
  { label: "1:1", ratio: "1:1" },
  { label: "4:5", ratio: "4:5" },
  { label: "3:4", ratio: "3:4" },
  { label: "2:3", ratio: "2:3" },
  { label: "Passport 35×45", ratio: "35:45" },
  { label: "2×2 inch", ratio: "1:1" }
];

function showCropUI() {
  if (!workingImage) { addBot("⚠️ Please upload an image first."); return; }

  const id = `crop-${Date.now()}`;
  const presetTags = CROP_PRESETS.map((p,i)=>`<span class="tag ${i===0?'active':''}" data-role="crop-ratio" data-ratio="${p.ratio}">${p.label}</span>`).join("");

  const card = addMessage("bot", `
    <div class="crop-card">
      <div class="crop-toolbar">${presetTags}</div>
      <div class="crop-canvas-wrap">
        <canvas id="${id}" class="crop-canvas"></canvas>
      </div>
      <div class="note">Tip: click and drag to draw a selection. Presets lock the aspect ratio.</div>
      <div class="crop-actions">
        <button data-role="action" data-action="apply-crop" data-cropid="${id}">Apply Crop</button>
        <button data-role="action" data-action="reset-crop" data-cropid="${id}">Reset Selection</button>
        <button data-role="action" data-action="menu-main" class="ghost">Cancel</button>
      </div>
    </div>
  `);

  const canvas = document.getElementById(id);
  const ctx = canvas.getContext("2d");
  const img = new Image();
  img.onload = () => {
    // Fit image into canvas with max width 680
    const maxW = 680;
    const scale = Math.min(1, maxW / img.width);
    canvas.width  = Math.floor(img.width * scale);
    canvas.height = Math.floor(img.height * scale);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    cropState = { id, ctx, img, scale, ratio: "", start: null, current: null };
    cropCtx = ctx;
  };
  img.src = workingImage;
}

function parseRatio(r) {
  if (!r || r === "") return null;
  const [a,b] = r.split(":").map(Number);
  if (!a || !b) return null;
  return a/b;
}

function drawCropOverlay() {
  const { ctx, start, current, img, scale } = cropState;
  const c = ctx.canvas;
  // redraw image
  ctx.clearRect(0,0,c.width,c.height);
  ctx.drawImage(img, 0, 0, c.width, c.height);

  if (!start || !current) return;
  const x = Math.min(start.x, current.x);
  const y = Math.min(start.y, current.y);
  const w = Math.abs(current.x - start.x);
  const h = Math.abs(current.y - start.y);

  // darken outside
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fillRect(0,0,c.width,c.height);
  ctx.clearRect(x,y,w,h);

  // border
  ctx.strokeStyle = "#22c55e";
  ctx.lineWidth = 2;
  ctx.strokeRect(x,y,w,h);
}

function startCropListeners() {
  document.addEventListener("mousedown", cropMouseDown);
  document.addEventListener("mousemove", cropMouseMove);
  document.addEventListener("mouseup", cropMouseUp);
}
function stopCropListeners() {
  document.removeEventListener("mousedown", cropMouseDown);
  document.removeEventListener("mousemove", cropMouseMove);
  document.removeEventListener("mouseup", cropMouseUp);
}

function withinCanvas(e, canvas) {
  const r = canvas.getBoundingClientRect();
  const x = e.clientX - r.left;
  const y = e.clientY - r.top;
  if (x < 0 || y < 0 || x > canvas.width || y > canvas.height) return null;
  return { x, y };
}

function cropMouseDown(e) {
  if (!cropState) return;
  const { ctx } = cropState;
  const pos = withinCanvas(e, ctx.canvas);
  if (!pos) return;
  cropState.start = pos;
  cropState.current = pos;
  drawCropOverlay();
}

function cropMouseMove(e) {
  if (!cropState || !cropState.start) return;
  const { ctx } = cropState;
  const pos = withinCanvas(e, ctx.canvas);
  if (!pos) return;
  const r = parseRatio(cropState.ratio);
  if (!r) {
    cropState.current = pos;
  } else {
    // lock aspect: determine w/h from drag
    let dx = pos.x - cropState.start.x;
    let dy = pos.y - cropState.start.y;
    const signX = Math.sign(dx) || 1;
    const signY = Math.sign(dy) || 1;
    dx = Math.abs(dx); dy = Math.abs(dy);

    // compute constrained size
    if (dx / dy > r) { // too wide -> adjust dx
      dx = dy * r;
    } else {          // too tall -> adjust dy
      dy = dx / r;
    }
    cropState.current = { x: cropState.start.x + signX * dx, y: cropState.start.y + signY * dy };
  }
  drawCropOverlay();
}

function cropMouseUp() {
  if (!cropState) return;
  // leave selection; wait for Apply or Reset
}

/* ============== Processing ============== */
function processImage({ action, format = currentFormat, width = null, height = null, quality = 0.9 }) {
  if (!workingImage) { addBot("⚠️ Please upload an image first."); return; }

  const img = new Image();
  img.onload = () => {
    let targetW = width || img.width;
    let targetH = height || img.height;

    // draw to canvas
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = targetW;
    canvas.height = targetH;
    ctx.drawImage(img, 0, 0, targetW, targetH);

    // choose mime
    let outFormat = (action === "resize") ? currentFormat : (format || "png");
    const mime = `image/${outFormat}`;

    const beforeBytes = bytesFromDataURL(workingImage);
    const dataUrl = canvas.toDataURL(mime, action === "compress" ? (quality ?? 0.8) : 0.92);
    const afterBytes = bytesFromDataURL(dataUrl);

    workingImage  = dataUrl;
    currentFormat = outFormat;

    addPreview(dataUrl);
    addDownloadLink(dataUrl, `output.${outFormat}`);

    if (action === "compress") {
      const delta = beforeBytes - afterBytes;
      const pct = beforeBytes ? ((delta / beforeBytes) * 100).toFixed(1) : 0;
      addBot(`📦 Compressed from <b>${prettyBytes(beforeBytes)}</b> to <b>${prettyBytes(afterBytes)}</b> (${pct}% smaller).`);
    } else {
      addBot(`📥 Your ${outFormat.toUpperCase()} image is ready.`);
    }

    showMainMenuBot();
  };
  img.src = workingImage;
}

/* ============== Event Delegation for Buttons ============== */
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-role='action']");
  if (!btn) return;
  const action = btn.dataset.action;

  if (action === "menu-main") return showMainMenuBot();
  if (action === "menu-convert") return showConvertMenu();
  if (action === "menu-resize") return showResizeMenu();
  if (action === "menu-compress") return showCompressMenu();
  if (action === "download") return workingImage && addDownloadLink(workingImage, "current-image");
  if (action === "revert") {
    if (originalImage) {
      workingImage = originalImage;
      currentFormat = guessFormatFromDataURL(workingImage);
      addBot("↩️ Reverted to the originally uploaded image.");
      addPreview(workingImage);
    }
    return showMainMenuBot();
  }
  if (action === "upload") return $("#imageUpload").click();

  if (action === "convert") {
    addUser(`Convert → ${btn.dataset.format.toUpperCase()}`);
    return processImage({ action: "convert", format: btn.dataset.format });
  }

  if (action === "resize") {
    addUser(`Resize → ${btn.dataset.width}×${btn.dataset.height}`);
    return processImage({
      action: "resize",
      width: parseInt(btn.dataset.width),
      height: parseInt(btn.dataset.height)
    });
  }

  if (action === "resize-custom") return showCustomResizePrompt();

  if (action === "apply-custom-resize") {
    const w = parseInt($("#cw").value);
    const h = parseInt($("#ch").value);
    if (w > 0 && h > 0) {
      addUser(`Resize → ${w}×${h}`);
      return processImage({ action: "resize", width: w, height: h });
    }
  }

  if (action === "compress") {
    const fmt = btn.dataset.format || "jpeg";
    const q = parseFloat(btn.dataset.quality || "0.8");
    addUser(`Compress → ${fmt.toUpperCase()} @ ${q}`);
    return processImage({ action: "compress", format: fmt, quality: q });
  }

  if (action === "menu-crop") return showCropUI();

  if (action === "apply-crop") {
    if (!cropState || !cropState.start || !cropState.current) {
      return addBot("Select an area by dragging on the image first.");
    }
    // map selection back to original pixels
    const { start, current, img, scale } = cropState;
    const x = Math.min(start.x, current.x) / scale;
    const y = Math.min(start.y, current.y) / scale;
    const w = Math.abs(current.x - start.x) / scale;
    const h = Math.abs(current.y - start.y) / scale;

    const c2 = document.createElement("canvas");
    c2.width = Math.round(w);
    c2.height = Math.round(h);
    const cx = c2.getContext("2d");
    cx.drawImage(img, Math.round(x), Math.round(y), Math.round(w), Math.round(h), 0, 0, Math.round(w), Math.round(h));

    const out = c2.toDataURL(`image/${currentFormat}`, 0.92);
    workingImage = out;

    addPreview(out, "✂️ Cropped image:");
    addDownloadLink(out, `cropped.${currentFormat}`);
    addBot("Crop applied.");
    showMainMenuBot();
    cropState = null; cropCtx = null; stopCropListeners();
  }

  if (action === "reset-crop") {
    if (cropState) {
      cropState.start = null;
      cropState.current = null;
      drawCropOverlay();
    }
  }
});

/* Aspect ratio preset clicks inside crop toolbar */
document.addEventListener("click", (e) => {
  const tag = e.target.closest("[data-role='crop-ratio']");
  if (!tag || !cropState) return;
  const wrap = tag.parentElement;
  wrap.querySelectorAll(".tag").forEach(t => t.classList.remove("active"));
  tag.classList.add("active");
  cropState.ratio = tag.dataset.ratio || "";
});

/* Canvas mouse listeners for crop */
document.addEventListener("mousedown", (e) => {
  if (!cropState) return;
  const { ctx } = cropState;
  const pos = withinCanvas(e, ctx.canvas);
  if (pos) startCropListeners();
});
/* Note: actual mouse handlers are defined above and attached via startCropListeners(). */

/* ============== DOM Init ============== */
document.addEventListener("DOMContentLoaded", () => {
  // company name
  $("#companyName").textContent = COMPANY_NAME;

  // buttons
  $("#resetBtn").addEventListener("click", resetChat);
  $("#uploadBtn").addEventListener("click", () => $("#imageUpload").click());
  $("#imageUpload").addEventListener("change", (e) => {
    const f = e.target.files[0];
    if (f) onUploadFile(f);
  });

  renderAuthBox();
  resetChat();
});
