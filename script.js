import QrScanner from "./qr-scanner.min.js";

// DOM elements
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

// Variables
let scanCount = 0;
const maxScanCount = 10;
let lastScanTime;
let scannedResult = null;

// Check if the device has cameras
navigator.mediaDevices.enumerateDevices().then(devices => {
    const cameras = devices.filter(device => device.kind === 'videoinput');
    const hasCamera = cameras.length > 0;

    // Display camera information
    camHasCamera.textContent = hasCamera ? 'Có' : 'Không';
    camHasFlash.textContent = cameras.some(device => device.getCapabilities && device.getCapabilities().torch) ? 'Có' : 'Không';

    // Populate the camera list
    cameras.forEach((device, index) => {
        const option = document.createElement('option');
        option.value = device.deviceId;
        option.textContent = device.label || `Camera ${index + 1}`;
        camList.appendChild(option);
    });
}).catch(err => {
    console.error('Error enumerating devices:', err);
    camHasCamera.textContent = 'Không thể phát hiện thiết bị camera';
});

// Functions
const updateFlashAvailability = () => {
    scanner.hasFlash().then(hasFlash => {
        camHasFlash.textContent = hasFlash ? "Có" : "Không";
        flashToggle.style.display = hasFlash ? 'inline-block' : 'none';
    });
};

const setResult = (element, result) => {
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
    element.textContent = result.data;
    camQrResultTimestamp.textContent = new Date().toLocaleTimeString();

    scanCount++;

    // Stop the scanner if max scan count reached
    if (scanCount >= maxScanCount) {
        scanner.stop();
        alert("Maximum scan limit reached. Please reset to scan again.");
        startBtn.disabled = false;
    }
};

// Web Cam Scanning
const scanner = new QrScanner(video, result => setResult(camQrResult, result), {
    onDecodeError: error => {
        camQrResult.textContent = `Error: ${error}`;
        camQrResult.style.color = 'red';
    },
    highlightScanRegion: true,
    highlightCodeOutline: true,
    returnDetailedScanResult: true, // Return detailed scan result
    maxScansPerSecond: 15, // Increase scan rate for faster detection
    preferredResolution: 1920, // High resolution for better accuracy
});

// Initialize Camera
const initCamera = () => {
    QrScanner.listCameras(true).then(cameras => {
        if (cameras.length > 0) {
            scanner.setCamera(cameras[0].id); // Use the first (default) camera
            cameras.forEach(camera => {
                const option = document.createElement('option');
                option.value = camera.id;
                option.text = camera.label;
                camList.appendChild(option);
            });
        } else {
            alert("No cameras found.");
        }
    });
};

// Start Scanner
const startScanner = () => {
    scanner.start().then(() => {
        updateFlashAvailability();
    });
};

// Handle camera switch
camList.addEventListener('change', event => {
    scanner.setCamera(event.target.value).then(updateFlashAvailability);
});

// Toggle flash
flashToggle.addEventListener('click', () => {
    const stream = videoContainer.srcObject;
    if (stream && stream.getVideoTracks().length > 0) {
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities();
        if (capabilities.torch) {
            const isFlashOn = flashState.textContent === 'bật';
            track.applyConstraints({ advanced: [{ torch: !isFlashOn }] })
                .then(() => {
                    flashState.textContent = isFlashOn ? 'tắt' : 'bật';
                }).catch(err => {
                    console.error('Error toggling flash:', err);
                });
        }
    } // Delay to prevent UI lag
});

// Handle start/stop buttons
startBtn.addEventListener('click', startScanner);
document.getElementById('stop-button').addEventListener('click', () => {
    scanner.stop();
});

// File Scanning
const handleFileScan = (file) => {
    QrScanner.scanImage(file, { returnDetailedScanResult: true })
        .then(result => {
            scannedResult = result;
            setResult(fileQrResult, result); // Display result
        })
        .catch(e => {
            scannedResult = null;
            setResult(fileQrResult, { data: `Error: ${e || 'No QR code found'}` });
        });
};

fileSelector.addEventListener('change', event => {
    const file = fileSelector.files[0];
    if (file) handleFileScan(file);
});

// Camera Constraints
const constraints = {
    video: {
        facingMode: { ideal: "environment" }, // Prefer rear camera
        width: { ideal: 1280 },
        height: { ideal: 720 }
    }
};

// Access the camera and start the scanner
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            video.srcObject = stream;
            initCamera(); // Initialize cameras once stream is available
        })
        .catch(error => {
            console.error("Camera access error:", error);
            alert("Unable to access camera. Please ensure you have the necessary permissions.");
        });
} else {
    alert("Your browser does not support camera access.");
}

// Reset scanning process
resetBtn.addEventListener('click', () => {
    scannedResult = null;
    fileQrResult.textContent = '';
    fileSelector.value = '';
    scanCount = 0;
    qrResultsTable.innerHTML = '';
    startBtn.disabled = false;
    scanner.start();
});

// Initialize the scanner
startScanner();