// --- 1. Theme Toggler Logic ---
(function() {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'light') {
        body.classList.remove('dark-mode');
        themeToggle.checked = true;
    } else {
        body.classList.add('dark-mode');
        themeToggle.checked = false;
    }

    themeToggle.addEventListener('change', () => {
        if (themeToggle.checked) {
            body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        } else {
            body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        }
    });
})();

// --- 2. Developer Modal Logic ---
(function() {
    const openBtn = document.getElementById('open-modal-btn');
    const closeBtn = document.getElementById('close-modal-btn');
    const modalOverlay = document.getElementById('developer-modal-overlay');

    openBtn.addEventListener('click', () => modalOverlay.classList.add('open'));
    const closeModal = () => modalOverlay.classList.remove('open');
    closeBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
})();

// --- 3. Face Swap Tool Logic ---
const CONFIG = { FACESWAP_API_URL: "https://face-swap.haseeb-sahil.workers.dev/swap" };
let swappedImageBlob = null;

const resultSection = document.getElementById('resultSection');
const downloadBtn = document.getElementById('downloadBtn');
const outputImageContainer = document.getElementById('outputImageContainer');
const swapImage = document.getElementById('swapImage');
const swapButton = document.getElementById('swapButton');
const buttonText = document.getElementById('buttonText'); 
const buttonIcon = document.getElementById('buttonIcon'); 
const messageElement = document.getElementById('message');

function showMessage(text, typeClass) {
    messageElement.innerHTML = text;
    messageElement.className = 'message-box ' + (typeClass === 'loading' ? 'info' : typeClass);
    messageElement.classList.remove('hidden');
}

function showDownload() {
    downloadBtn.classList.remove('hidden');
    outputImageContainer.classList.add('loaded');
    resultSection.classList.remove('hidden');
}

async function performApiSwap(faceFile, targetFile) {
    const formData = new FormData();
    formData.append("source", faceFile);
    formData.append("target", targetFile);

    const response = await fetch(CONFIG.FACESWAP_API_URL, { method: 'POST', body: formData });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.blob();
}

window.processFaceSwap = async function() {
    const faceFile = document.getElementById('faceImageFile').files[0];
    const targetFile = document.getElementById('targetImageFile').files[0];

    if (!faceFile || !targetFile) {
        showMessage("❌ Please select both images.", 'error');
        return;
    }

    swapButton.disabled = true;
    buttonText.textContent = "Processing...";
    buttonIcon.classList.add('animate-spin');
    
    try {
        showMessage('🎭 AI Face Swap in progress...', 'loading');
        swappedImageBlob = await performApiSwap(faceFile, targetFile);
        
        const objectURL = URL.createObjectURL(swappedImageBlob);
        swapImage.src = objectURL;
        swapImage.onload = () => {
            showMessage('✅ SUCCESS! Face Swap Completed.', 'success');
            showDownload();
            URL.revokeObjectURL(objectURL);
        };
    } catch (error) {
        showMessage(`❌ Operation Failed: ${error.message}`, 'error');
    } finally {
        swapButton.disabled = false;
        buttonText.textContent = "🚀 Perform Face Swap";
        buttonIcon.classList.remove('animate-spin');
    }
}

window.downloadSwappedImage = function() {
    if (swappedImageBlob) {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(swappedImageBlob);
        a.download = 'face-swapped-HS.png';
        a.click();
    }
}

window.onload = () => showMessage("Select your source face and target images to start.", 'info');