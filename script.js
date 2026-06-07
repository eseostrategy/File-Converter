let originalFileName = '';

document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        originalFileName = file.name.split('.').slice(0, -1).join('.');
        document.getElementById('filename').textContent = `Selected file: ${file.name}`;
        document.getElementById('errorMessage').style.display = 'none';
    }
});

function convertFile() {
    const fileInput = document.getElementById('fileInput');
    const formatSelect = document.getElementById('formatSelect');
    const downloadLink = document.getElementById('downloadLink');
    const errorMessage = document.getElementById('errorMessage');

    if (!fileInput.files[0]) {
        errorMessage.textContent = 'Please select a file first!';
        errorMessage.style.display = 'block';
        return;
    }

    const file = fileInput.files[0];
    const selectedFormat = formatSelect.value;

    // Convert to image (works for image files)
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                const dataUrl = canvas.toDataURL(`image/${selectedFormat}`);
                downloadLink.href = dataUrl;
                downloadLink.download = `${originalFileName}.${selectedFormat}`;
                downloadLink.textContent = `Download ${originalFileName}.${selectedFormat}`;
                downloadLink.style.display = 'block';
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        errorMessage.textContent = 'Non-image files require server-side conversion!';
        errorMessage.style.display = 'block';
    }
}

function submitUrlForIndexing() {
    const urlInput = document.getElementById('urlInput');
    const searchEngineSelect = document.getElementById('searchEngineSelect');
    const successMessage = document.getElementById('indexSuccessMessage');
    const errorMessage = document.getElementById('indexErrorMessage');

    // Reset messages
    successMessage.style.display = 'none';
    errorMessage.style.display = 'none';

    const url = urlInput.value.trim();
    const engine = searchEngineSelect.value;
    const engineName = searchEngineSelect.options[searchEngineSelect.selectedIndex].text;

    if (!url) {
        errorMessage.querySelector('span').textContent = 'Please enter a URL first!';
        errorMessage.style.display = 'flex';
        return;
    }

    try {
        new URL(url);
    } catch (e) {
        errorMessage.querySelector('span').textContent = 'Please enter a valid URL (e.g., https://example.com)!';
        errorMessage.style.display = 'flex';
        return;
    }

    // Simulate API call for indexing
    setTimeout(() => {
        successMessage.querySelector('span').textContent = `URL successfully submitted to ${engineName} for indexing!`;
        successMessage.style.display = 'flex';
    }, 800);
}
