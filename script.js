// This ensures the script waits for the HTML to load
document.addEventListener('DOMContentLoaded', () => {
    console.log("OrcaBase Engine: Online");
    lucide.createIcons();

    const dropZone = document.getElementById('dropZone');
    const uploadBtn = document.getElementById('uploadBtn');
    const fileInput = document.getElementById('fileInput');
    const shareOverlay = document.getElementById('shareOverlay');

    // 1. Manual Click Trigger
    if (uploadBtn && fileInput) {
        uploadBtn.addEventListener('click', () => {
            fileInput.click();
        });
    }

    // 2. File Input Selection
    fileInput.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            alert(`Preparing to submerge ${files.length} files...`);
            let folderData = [];
            for (let file of files) {
                const content = await file.text();
                folderData.push({ name: file.name, path: file.webkitRelativePath || file.name, content: content });
            }
            generateShareableLink(folderData);
        }
    });

    // 3. Drag and Drop Mechanics
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = "#22d3ee";
        dropZone.style.background = "rgba(34, 211, 238, 0.05)";
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = "rgba(255, 255, 255, 0.1)";
        dropZone.style.background = "transparent";
    });

    dropZone.addEventListener('drop', async (e) => {
        e.preventDefault();
        console.log("Drop detected");
        
        const items = e.dataTransfer.items;
        let folderData = [];

        for (let i = 0; i < items.length; i++) {
            const entry = items[i].webkitGetAsEntry();
            if (entry) await parseEntry(entry, folderData);
        }

        if (folderData.length > 0) {
            generateShareableLink(folderData);
        } else {
            alert("No files detected in the drop.");
        }
    });
});

// Recursive folder walker
async function parseEntry(entry, list, path = "") {
    if (entry.isFile) {
        const file = await new Promise(r => entry.file(r));
        const content = await file.text();
        list.push({ name: entry.name, path: path + entry.name, content: content });
    } else if (entry.isDirectory) {
        let reader = entry.createReader();
        let entries = await new Promise(r => reader.readEntries(r));
        for (let e of entries) await parseEntry(e, list, path + entry.name + "/");
    }
}

function generateShareableLink(data) {
    const jsonStr = JSON.stringify(data);
    const encodedData = btoa(unescape(encodeURIComponent(jsonStr)));
    const url = window.location.origin + window.location.pathname + '#' + encodedData;
    
    document.getElementById('shareLink').innerText = url;
    document.getElementById('shareOverlay').classList.remove('hidden');
}

// Global scope for the HTML button
window.closeOverlay = function() {
    const overlay = document.getElementById('shareOverlay');
    overlay.classList.add('hidden');
    window.location.reload(); 
};
