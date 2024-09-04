function attachEventListeners() {
    document.querySelectorAll('.folder').forEach(folder => {
        folder.onclick = function() {
            const path = this.getAttribute('data-path');
            updateFileList(path);
        };
    });
}

document.addEventListener('DOMContentLoaded', function() {
    attachEventListeners();
});