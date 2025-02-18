import QrScanner from "./qr-scanner.min.js";

const video = document.getElementById('qr-video');
const videoContainer = document.getElementById('video-container');
const camHasCamera = document.getElementById('cam-has-camera');
const camList = document.getElementById('cam-list');
const camHasFlash = document.getElementById('cam-has-flash');
const flashToggle = document.getElementById('flash-toggle');
const flashState = document.getElementById('flash-state');
const camQrResult = document.getElementById('cam-qr-result');
const camQrResultTimestamp = document.getElementById('cam-qr-result-timestamp');
const fileSelector = document.getElementById('file-selector');
const fileQrResult = document.getElementById('file-qr-result');
const resetBtn = document.getElementById('reset-button');
const qrResultsTable = document.getElementById('qr-results-table').getElementsByTagName('tbody')[0];
const startBtn = document.getElementById('start-button');

let scanCount = 0;
const maxScanCount = 10;
let lastScanTime;

QrScanner.listCameras(true).then(cameras => {
    if (cameras.length > 0) {
        scanner.setCamera(cameras[0].id); // Use the first (default) camera
    }
});


function setResult(label, result) {
    const now = Date.now();
    if (now - lastScanTime < 500) return; // Prevent excessive updates
    lastScanTime = now;

    // Add the result to the table
    const row = qrResultsTable.insertRow();
    const cellIndex = row.insertCell(0);
    const cellQrCode = row.insertCell(1);
    const cellTimestamp = row.insertCell(2);

    cellIndex.textContent = scanCount;
    cellQrCode.textContent = result.data;
    cellTimestamp.textContent = new Date().toLocaleTimeString();

    // Update QR result on the UI
    camQrResult.textContent = result.data;
    camQrResultTimestamp.textContent = new Date().toLocaleTimeString();

    scanCount++;

    // If scan count reaches 10, stop the camera and disable further scans
    if (scanCount >= maxScanCount) {
        scanner.stop();
        alert("Maximum scan limit reached. Please reset to scan again.");
        startBtn.disabled = false;
    }
}


// ####### Web Cam Scanning #######

const scanner = new QrScanner(video, result => setResult(camQrResult, result), {
    onDecodeError: error => {
        camQrResult.textContent = error;
        camQrResult.style.color = 'inherit';
    },
    highlightScanRegion: true,
    highlightCodeOutline: true,
    returnDetailedScanResult: true, // Get more details about the QR detection
    maxScansPerSecond: 15, // Increase scan rate for faster detection
    preferredResolution: 1920, // Higher resolution for better accuracy
});

const updateFlashAvailability = () => {
    scanner.hasFlash().then(hasFlash => {
        camHasFlash.textContent = hasFlash;
        flashToggle.style.display = hasFlash ? 'inline-block' : 'none';
    });
};

scanner.start().then(() => {
    updateFlashAvailability();
    // List cameras after the scanner started to avoid listCamera's stream and the scanner's stream being requested
    // at the same time which can result in listCamera's unconstrained stream also being offered to the scanner.
    // Note that we can also start the scanner after listCameras, we just have it this way around in the demo to
    // start the scanner earlier.
    QrScanner.listCameras(true).then(cameras => cameras.forEach(camera => {
        const option = document.createElement('option');
        option.value = camera.id;
        option.text = camera.label;
        camList.add(option);
    }));
});

QrScanner.hasCamera().then(hasCamera => camHasCamera.textContent = hasCamera);

// for debugging
window.scanner = scanner;

document.getElementById('scan-region-highlight-style-select').addEventListener('change', (e) => {
    videoContainer.className = e.target.value;
    scanner._updateOverlay(); // reposition the highlight because style 2 sets position: relative
});

document.getElementById('show-scan-region').addEventListener('change', (e) => {
    const input = e.target;
    const label = input.parentNode;
    label.parentNode.insertBefore(scanner.$canvas, label.nextSibling);
    scanner.$canvas.style.display = input.checked ? 'block' : 'none';
});

document.getElementById('inversion-mode-select').addEventListener('change', event => {
    scanner.setInversionMode(event.target.value);
});

camList.addEventListener('change', event => {
    scanner.setCamera(event.target.value).then(updateFlashAvailability);
});

let flashToggleTimeout;
flashToggle.addEventListener('click', () => {
    clearTimeout(flashToggleTimeout);
    flashToggleTimeout = setTimeout(() => {
        scanner.toggleFlash().then(() => {
            flashState.textContent = scanner.isFlashOn() ? 'on' : 'off';
        });
    }, 300); // Delay to prevent UI lag
});

document.getElementById('start-button').addEventListener('click', () => {
    scanner.start();
});

document.getElementById('stop-button').addEventListener('click', () => {
    scanner.stop();
});

// ####### File Scanning #######
let scannedResult = null; // Store the scanned result
fileSelector.addEventListener('change', event => {
    const file = fileSelector.files[0];
    if (!file) {
        return;
    }
    QrScanner.scanImage(file, { returnDetailedScanResult: true })
        .then(result => {
            scannedResult = result; // Save the result
            setResult(fileQrResult, result); // Display the result
        })
        .catch(e => {
            scannedResult = null; // Clear the result if scanning fails
            setResult(fileQrResult, { data: e || 'No QR code found.' });
        });
});

const constraints = {
    facingMode: { ideal: "environment" }, // Prefer rear camera, fallback to front camera
    width: { ideal: 1280 },
    height: { ideal: 720 }
};


if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(error => {
            console.error("Camera access error:", error);
            alert("Unable to access camera. Please ensure you have the necessary permissions.");
        });
} else {
    alert("Your browser does not support camera access.");
}
resetBtn.addEventListener('click', () => {
    scannedResult = null; // Clear the stored result
    fileQrResult.textContent = ''; // Clear displayed result
    fileSelector.value = ''; // Reset the file input

    scanCount = 0; // Reset scan count
    qrResultsTable.innerHTML = ''; // Clear the table
    startBtn.disabled = false; // Enable the start button
    scanner.start(); // Restart the scanner
});