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
