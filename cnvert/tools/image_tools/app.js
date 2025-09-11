// Same JS as master/app.js
let originalImage = null;
let workingImage  = null;

function addMessage(sender, text) {
  const chatBox = document.getElementById('chatBox');
  const div = document.createElement('div');
  div.className = `message ${sender}`;
  div.innerText = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function addPreview(src, caption) {
  const chatBox = document.getElementById('chatBox');
  const img = document.createElement('img');
  img.src = src; img.className = 'preview';
  chatBox.appendChild(img);
  if (caption) addMessage('bot', caption);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function setControls(html) { document.getElementById('controls').innerHTML = html; }

function resetChat() {
  originalImage = null; workingImage = null;
  document.getElementById('chatBox').innerHTML =
    '<div class="message bot">Hello! Please upload an image to get started.</div>';
  setControls(`
    <label for="imageUpload" class="upload-btn">📂 Upload Image</label>
    <input type="file" id="imageUpload" accept="image/*" onchange="handleUpload(event)"/>
  `);
}

function handleUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    originalImage = reader.result;
    workingImage  = reader.result;
    addMessage('user', `Uploaded ${file.name}`);
    addPreview(workingImage, `✅ You uploaded a ${file.type.split('/')[1].toUpperCase()} image.`);
    showMainMenu();
  };
  reader.readAsDataURL(file);
}

function showMainMenu() {
  setControls(`
    <button onclick="handleOption('Convert')">Convert</button>
    <button onclick="handleOption('Resize')">Resize</button>
    <button onclick="handleOption('Crop')">Crop</button>
    <button onclick="handleOption('Compress')">Compress</button>
    <button class="ghost" onclick="showMoreMenu()">More ▾</button>
  `);
}

function showMoreMenu() {
  setControls(`
    <button onclick="downloadCurrent()">Download Current</button>
    <button onclick="revertToOriginal()">Revert to Original</button>
    <label for="imageUpload" class="upload-btn">Upload Another</label>
    <input type="file" id="imageUpload" accept="image/*" onchange="handleUpload(event)"/>
    <button class="ghost" onclick="showMainMenu()">⬅ Back</button>
  `);
}

function showConvertOptions() {
  addMessage('bot', 'Choose a format to convert to:');
  setControls(`
    <button onclick="selectSubOption('convert','jpeg')">JPG</button>
    <button onclick="selectSubOption('convert','png')">PNG</button>
    <button onclick="selectSubOption('convert','webp')">WEBP</button>
    <button class="ghost" onclick="showMainMenu()">⬅ Back</button>
  `);
}

function showResizeOptions() {
  addMessage('bot', 'Choose a predefined size:');
  setControls(`
    <button onclick="selectSubOption('resize', null, 1920, 1080)">Full HD</button>
    <button onclick="selectSubOption('resize', null, 3840, 2160)">4K</button>
    <button onclick="customResize()">Custom</button>
    <button class="ghost" onclick="showMainMenu()">⬅ Back</button>
  `);
}

function showCompressOptions() {
  addMessage('bot', 'Choose compression level:');
  setControls(`
    <button onclick="selectSubOption('compress','jpeg',null,null,0.8)">Normal</button>
    <button onclick="selectSubOption('compress','jpeg',null,null,0.6)">High</button>
    <button onclick="selectSubOption('compress','jpeg',null,null,0.4)">Very High</button>
    <button class="ghost" onclick="showMainMenu()">⬅ Back</button>
  `);
}

function handleOption(option) {
  addMessage('user', option);
  if (!workingImage) { addMessage('bot', '⚠️ Please upload an image first.'); return; }

  if (option === 'Convert')      showConvertOptions();
  else if (option === 'Resize')  showResizeOptions();
  else if (option === 'Crop')   { addMessage('bot', '✂️ Crop tool not implemented yet.'); showPostActionMenu(); }
  else if (option === 'Compress') showCompressOptions();
}

function customResize() {
  addMessage('bot', 'Enter custom dimensions:');
  setControls(`
    <input type="number" id="width" placeholder="Width (px)" style="width:120px;">
    <input type="number" id="height" placeholder="Height (px)" style="width:120px;">
    <button onclick="applyCustomResize()">Apply</button>
    <button class="ghost" onclick="showResizeOptions()">⬅ Back</button>
  `);
}

function applyCustomResize() {
  const w = parseInt(document.getElementById('width').value);
  const h = parseInt(document.getElementById('height').value);
  if (w > 0 && h > 0) selectSubOption('resize', null, w, h);
}

function selectSubOption(action, format = null, width = null, height = null, quality = 0.9) {
  const fmtLabel = format ? format.toUpperCase() : '—';
  const sizeLabel = (width && height) ? `${width}x${height}` : '';
  addMessage('user', `${action.toUpperCase()} → ${fmtLabel} ${sizeLabel}`);
  processImage({ action, format, width, height, quality });
}

function processImage({ action, format = 'png', width = null, height = null, quality = 0.9 }) {
  if (!workingImage) { addMessage('bot', '⚠️ Please upload an image first.'); return; }

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = width || img.width;
    canvas.height = height || img.height;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const outFormat = (action === 'resize')
      ? guessFormatFromDataURL(workingImage)
      : (format || 'png');

    const mimeType = `image/${outFormat}`;
    const dataUrl = canvas.toDataURL(
      mimeType,
      action === 'compress' ? (quality ?? 0.8) : 0.92
    );

    workingImage = dataUrl;

    addPreview(dataUrl);
    addDownloadLink(dataUrl, `output.${outFormat}`);
    addMessage('bot', `📥 Your ${outFormat.toUpperCase()} image is ready.`);
    showPostActionMenu();
  };
  img.src = workingImage;
}

function addDownloadLink(href, filename) {
  const chatBox = document.getElementById('chatBox');
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  link.innerText = '⬇ Download Image';
  link.style.display = 'block';
  link.style.marginTop = '5px';
  chatBox.appendChild(link);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function guessFormatFromDataURL(dataUrl) {
  if (!dataUrl) return 'png';
  if (dataUrl.startsWith('data:image/jpeg')) return 'jpeg';
  if (dataUrl.startsWith('data:image/webp')) return 'webp';
  if (dataUrl.startsWith('data:image/png'))  return 'png';
  return 'png';
}

function showPostActionMenu() {
  setControls(`
    <button onclick="handleOption('Convert')">Do Another → Convert</button>
    <button onclick="handleOption('Resize')">Do Another → Resize</button>
    <button onclick="handleOption('Compress')">Do Another → Compress</button>
    <button onclick="downloadCurrent()">Download Current</button>
    <button onclick="revertToOriginal()">Revert to Original</button>
    <label for="imageUpload" class="upload-btn">Upload Another</label>
    <input type="file" id="imageUpload" accept="image/*" onchange="handleUpload(event)"/>
  `);
}

function downloadCurrent() { if (workingImage) addDownloadLink(workingImage, 'current-image'); }

function revertToOriginal() {
  if (!originalImage) return;
  workingImage = originalImage;
  addMessage('bot', '↩️ Reverted to the originally uploaded image.');
  addPreview(workingImage);
  showMainMenu();
}

document.addEventListener('DOMContentLoaded', resetChat);
