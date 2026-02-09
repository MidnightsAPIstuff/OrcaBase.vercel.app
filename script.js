lucide.createIcons();

const dropZone = document.getElementById('dropZone');

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#22d3ee';
    dropZone.style.boxShadow = '0 0 40px rgba(34, 211, 238, 0.2)';
});

dropZone.addEventListener('dragleave', () => {
    dropZone.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    dropZone.style.boxShadow = 'none';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    const files = e.dataTransfer.items;
    
    if (files) {
        console.log("OrcaBase: Initializing folder upload...");
        for (let i = 0; i < files.length; i++) {
            const item = files[i].webkitGetAsEntry();
            if (item) {
                scanFiles(item);
            }
        }
    }
});

function scanFiles(item, indent = "") {
    if (item.isFile) {
        console.log(indent + "File found: " + item.name);
    } else if (item.isDirectory) {
        console.log(indent + "Folder found: " + item.name);
        let directoryReader = item.createReader();
        directoryReader.readEntries((entries) => {
            entries.forEach((entry) => scanFiles(entry, indent + "  "));
        });
    }
}