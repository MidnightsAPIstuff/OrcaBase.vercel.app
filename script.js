lucide.createIcons();

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const shareOverlay = document.getElementById('shareOverlay');
const shareLink = document.getElementById('shareLink');
const codeViewer = document.getElementById('codeViewer');
const codeBlock = document.getElementById('codeBlock');
let currentFiles = [];

// 1. Handle Uploads
fileInput.addEventListener('change', (e) => handleFiles(e.target.files));
dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', async (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const items = e.dataTransfer.items;
    let folderData = [];
    for (let i = 0; i < items.length; i++) {
        const entry = items[i].webkitGetAsEntry();
        if (entry) await parseEntry(entry, folderData);
    }
    generateShareableLink(folderData);
});

async function parseEntry(entry, list, path = "") {
    if (entry.isFile) {
        const file = await new Promise(res => entry.file(res));
        const content = await file.text();
        list.push({ name: entry.name, path: path + entry.name, content: content });
    } else if (entry.isDirectory) {
        let reader = entry.createReader();
        let entries = await new Promise(res => reader.readEntries(res));
        for (let e of entries) await parseEntry(e, list, path + entry.name + "/");
    }
}

// 2. Generate functioning link
function generateShareableLink(data) {
    const jsonStr = JSON.stringify(data);
    const encodedData = btoa(unescape(encodeURIComponent(jsonStr)));
    const url = window.location.origin + window.location.pathname + '#' + encodedData;
    shareLink.innerText = url;
    shareOverlay.classList.remove('hidden');
}

// 3. Render View
function renderRepo(files) {
    currentFiles = files;
    const tree = document.querySelector('.file-tree');
    tree.innerHTML = '<p class="label">Shared Repository</p>';
    
    files.forEach(file => {
        const div = document.createElement('div');
        div.className = 'tree-item';
        div.style.padding = "10px"; div.style.cursor = "pointer";
        div.innerHTML = `<span>${file.path}</span>`;
        div.onclick = () => {
            codeBlock.innerText = file.content;
            document.querySelector('.file-status').innerText = `VIEWING: ${file.path}`;
        };
        tree.appendChild(div);
    });
    document.querySelector('.workspace').classList.add('viewer-mode');
    document.getElementById('downloadZipBtn').style.display = 'flex';
}

// 4. Initialization & Download
window.addEventListener('load', () => {
    const hash = window.location.hash.substring(1);
    if (hash) {
        const decoded = JSON.parse(decodeURIComponent(escape(atob(hash))));
        renderRepo(decoded);
    }
});

document.getElementById('downloadZipBtn').addEventListener('click', () => {
    const zip = new JSZip();
    currentFiles.forEach(f => zip.file(f.path, f.content));
    zip.generateAsync({type:"blob"}).then(content => saveAs(content, "OrcaBase_Repo.zip"));
});

function closeOverlay() {
    window.location.reload(); // Refresh to trigger the hash reader
}

document.getElementById('copyBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(shareLink.innerText);
    alert("Link Copied!");
});
