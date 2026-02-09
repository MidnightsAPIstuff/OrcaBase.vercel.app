lucide.createIcons();

const dropZone = document.getElementById('dropZone');
const shareOverlay = document.getElementById('shareOverlay');
const shareLink = document.getElementById('shareLink');

dropZone.addEventListener('drop', async (e) => {
    e.preventDefault();
    const items = e.dataTransfer.items;
    let folderData = [];

    for (let i = 0; i < items.length; i++) {
        const entry = items[i].webkitGetAsEntry();
        if (entry) {
            await parseEntry(entry, folderData);
        }
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
        for (let e of entries) {
            await parseEntry(e, list, path + entry.name + "/");
        }
    }
}

function generateShareableLink(data) {
    const jsonStr = JSON.stringify(data);
    const encodedData = btoa(unescape(encodeURIComponent(jsonStr)));
    
    const url = window.location.origin + window.location.pathname + '#' + encodedData;
    
    shareLink.innerText = url;
    shareOverlay.classList.remove('hidden');
}

window.addEventListener('load', () => {
    const hash = window.location.hash.substring(1);
    if (hash) {
        try {
            const decodedData = JSON.parse(decodeURIComponent(escape(atob(hash))));
            renderSharedRepository(decodedData);
        } catch (e) {
            console.error("OrcaBase: Invalid or corrupted link.");
        }
    }
});

function renderSharedRepository(files) {
    const fileTree = document.querySelector('.file-tree');
    fileTree.innerHTML = '<p class="label">Shared Repository</p>';

    files.forEach(file => {
        const div = document.createElement('div');
        div.className = 'tree-item';
        div.innerHTML = `<i data-lucide="file-code"></i> <span>${file.path}</span>`;
        div.onclick = () => {
            document.getElementById('codeBlock').innerText = file.content;
            document.querySelector('.file-status').innerText = `VIEWING: ${file.path}`;
        };
        fileTree.appendChild(div);
    });
    
    lucide.createIcons();
    // Hide upload UI for viewers
    document.querySelector('.workspace').classList.add('viewer-mode');
}
