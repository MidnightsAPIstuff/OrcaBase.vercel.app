lucide.createIcons();

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.querySelector('.upload-btn-wide');
const shareOverlay = document.getElementById('shareOverlay');

// FIX 1: Click to Upload
if (uploadBtn) {
    uploadBtn.addEventListener('click', () => {
        console.log("OrcaBase: Manual upload triggered");
        fileInput.click();
    });
}

fileInput.addEventListener('change', (e) => {
    console.log("OrcaBase: Files selected via input");
    handleFileObjects(e.target.files);
});

// FIX 2: Drag and Drop Logic
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('dragover');
    
    console.log("OrcaBase: Drop event detected");
    
    const items = e.dataTransfer.items;
    let folderData = [];

    if (items) {
        for (let i = 0; i < items.length; i++) {
            const entry = items[i].webkitGetAsEntry();
            if (entry) {
                await parseEntry(entry, folderData);
            }
        }
        console.log("OrcaBase: Folder parsed, generating link...");
        generateShareableLink(folderData);
    }
});

// FIX 3: Recursive Parsing
async function parseEntry(entry, list, path = "") {
    if (entry.isFile) {
        const file = await new Promise(res => entry.file(res));
        const content = await file.text();
        list.push({ name: entry.name, path: path + entry.name, content: content });
    } else if (entry.isDirectory) {
        let reader = entry.createReader();
        let entries = await new Promise(res => reader.readEntries(res));
        for (let e of entries) {
            await parseEntry(e, list, path + entry.name + "/");
        }
    }
}

function generateShareableLink(data) {
    if (data.length === 0) return alert("No files found!");
    
    const jsonStr = JSON.stringify(data);
    const encodedData = btoa(unescape(encodeURIComponent(jsonStr)));
    const url = window.location.origin + window.location.pathname + '#' + encodedData;
    
    document.getElementById('shareLink').innerText = url;
    shareOverlay.classList.remove('hidden');
}

window.closeOverlay = function() {
    shareOverlay.classList.add('hidden');
    window.location.reload(); 
};
