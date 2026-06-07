async function startBulkIndexing() {
    const urlInput = document.getElementById('urlInput');
    const searchEngineSelect = document.getElementById('searchEngineSelect');
    const submitBtn = document.getElementById('submitBtn');
    const errorMessage = document.getElementById('indexErrorMessage');
    const progressContainer = document.getElementById('progressContainer');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const logContainer = document.getElementById('logContainer');
    const logList = document.getElementById('logList');

    // Reset UI state
    errorMessage.style.display = 'none';
    progressContainer.style.display = 'none';
    logContainer.style.display = 'none';
    logList.innerHTML = '';
    progressFill.style.width = '0%';

    // Parse and filter URLs
    const rawUrls = urlInput.value.split('\n');
    const urls = [];

    for (const url of rawUrls) {
        const trimmedUrl = url.trim();
        if (trimmedUrl) {
            try {
                new URL(trimmedUrl);
                urls.push(trimmedUrl);
            } catch (e) {
                // Ignore invalid URLs silently or we could choose to show an error
                // For bulk, let's just skip invalid lines
            }
        }
    }

    if (urls.length === 0) {
        errorMessage.querySelector('span').textContent = 'Please enter at least one valid URL (e.g., https://example.com)!';
        errorMessage.style.display = 'flex';
        return;
    }

    const engineName = searchEngineSelect.options[searchEngineSelect.selectedIndex].text;

    // Prepare UI for processing
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Indexing...';

    progressContainer.style.display = 'block';
    logContainer.style.display = 'block';

    // Process URLs
    for (let i = 0; i < urls.length; i++) {
        const url = urls[i];

        // Update progress text
        progressText.textContent = `Processing ${i + 1} of ${urls.length} URLs...`;

        // Simulate API call delay (e.g., 800ms per URL)
        await new Promise(resolve => setTimeout(resolve, 800));

        // Create log entry
        const li = document.createElement('li');
        li.className = 'log-item';

        // 5% chance of simulated failure for realism, or just always succeed
        const success = Math.random() > 0.05;

        if (success) {
            li.innerHTML = `<i class="fas fa-check-circle log-success"></i> <span>Submitted ${url} to ${engineName}</span>`;
        } else {
            li.innerHTML = `<i class="fas fa-times-circle log-error"></i> <span>Failed to submit ${url} (Timeout)</span>`;
        }

        logList.appendChild(li);

        // Scroll log to bottom
        logContainer.scrollTop = logContainer.scrollHeight;

        // Update progress bar width
        const percentage = ((i + 1) / urls.length) * 100;
        progressFill.style.width = `${percentage}%`;
    }

    // Finished
    progressText.textContent = `Completed ${urls.length} URLs!`;
    submitBtn.disabled = false;
    submitBtn.style.opacity = '1';
    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Start Bulk Indexing';
}