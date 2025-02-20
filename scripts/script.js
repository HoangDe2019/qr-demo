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

const zoomControl = document.getElementById('zoom-control');
const zoomValue = document.getElementById('zoom-value');
const zoomInBtn = document.getElementById('zoom-in');
const zoomOutBtn = document.getElementById('zoom-out');
let videoTrack; // Store video track

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
    camHasCamera.textContent = 'Không thể phát hiện thiết bị camera';
    Swal.showValidationMessage(`
        hiết bị của bạn không có camera hoặc bị lỗi: ${err}
    `);
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
        Swal.fire({
            title: "Đã đạt giới hạn quét!",
            text: "Vui lòng đặt lại để quét tiếp!",
            icon: "warning",
            showCancelButton: false,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Xác nhận đóng"
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: "Đóng thành công!",
                    text: "Yêu cầu đã được thực hiện",
                    icon: "success"
                });
            }
        });
        startBtn.disabled = false;
    }
};

// Webcam Scanning
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
            Swal.showValidationMessage(`Không tìm thấy máy ảnh`);
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
            track.applyConstraints({advanced: [{torch: !isFlashOn}]})
                .then(() => {
                    flashState.textContent = isFlashOn ? 'tắt' : 'bật';
                }).catch(err => {
                Swal.showValidationMessage(`Lỗi chuyển đổi flash: ${err}`);
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
    QrScanner.scanImage(file, {returnDetailedScanResult: true})
        .then(result => {
            scannedResult = result;
            setResult(fileQrResult, result); // Display result
        })
        .catch(e => {
            scannedResult = null;
            setResult(fileQrResult, {data: `Error: ${e || 'No QR code found'}`});
        });
};

fileSelector.addEventListener('change', event => {
    const file = fileSelector.files[0];
    if (file) handleFileScan(file);
});

// Camera Constraints
const constraints = {
    video: {
        facingMode: {ideal: "environment"}, // Prefer rear camera
        width: {ideal: 1280},
        height: {ideal: 720}
    }
};

// Access the camera and start the scanner
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            video.srcObject = stream;
            videoTrack = stream.getVideoTracks()[0]; // Correctly assign the video track

            if (videoTrack) {
                var capabilities = videoTrack.getCapabilities();
                if (capabilities.zoom) {
                    zoomControl.min = capabilities.zoom.min;
                    zoomControl.max = capabilities.zoom.max;
                    zoomControl.step = 0.1;
                    zoomControl.value = capabilities.zoom.min; // Default zoom
                    zoomValue.textContent = `${capabilities.zoom.min}x`;
                    zoomControl.style.display = 'block';
                } else {
                    zoomControl.style.display = 'none'; // Hide zoom controls if unsupported
                }
            } else {
                Swal.fire({
                    icon: 'info',
                    title: 'Không hỗ trợ Zoom!',
                    text: 'Camera của bạn không hỗ trợ chức năng phóng to.',
                    confirmButtonText: 'OK'
                });
            }

            initCamera(); // Initialize cameras once stream is available
        })
        .catch(error => {
            // console.error("Camera access error:", error);
            Swal.fire({
                icon: "error",
                title: "Lỗi Truy Cập Camera!",
                text: "Không thể truy cập camera. Vui lòng cấp quyền.",
                confirmButtonText: "OK"
            });
        });
} else {
    let timerInterval;
    Swal.fire({
        html: "Trình duyệt của bạn không hỗ trợ truy cập máy ảnh.",
        timer: 2000,
        timerProgressBar: true,
        didOpen: () => {
            Swal.showLoading();
            const timer = Swal.getPopup().querySelector("b");
            timerInterval = setInterval(() => {
                timer.textContent = `${Swal.getTimerLeft()}`;
            }, 100);
        },
        willClose: () => {
            clearInterval(timerInterval);
        }
    }).then((result) => {
        /* Read more about handling dismissals below */
        if (result.dismiss === Swal.DismissReason.timer) {
            // console.log("I was closed by the timer");
        }
    });
}

zoomControl.addEventListener('input', (event) => {
    updateZoom(event.target.value);
});


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

const updateZoom = (zoomLevel) => {
    if (videoTrack) {
        let zoomValueFixed = Math.min(2, Math.max(1, parseFloat(zoomLevel))); // Limit between 1x and 2x

        videoTrack.applyConstraints({advanced: [{zoom: zoomValueFixed}]})
            .then(() => {
                zoomValue.textContent = `${zoomValueFixed.toFixed(1)}x`; // Update display
                zoomControl.value = zoomValueFixed;
            })
            .catch(err => Swal.fire({
                icon: "error",
                title: "Lỗi Zoom",
                text: `Không thể điều chỉnh zoom: ${err}`,
                confirmButtonText: "OK"
            }));
    } else {
        Swal.showValidationMessage({
            icon: 'error',
            title: 'Zoom bị lỗi!',
            text: 'Không tìm thấy đoạn video nào, không thể áp dụng thu phóng.',
            confirmButtonText: 'Đóng'
        });
    }
};


zoomInBtn.addEventListener('click', () => {
    let newZoom = parseFloat(zoomControl.value) + 0.2;
    updateZoom(newZoom);
});

zoomOutBtn.addEventListener('click', () => {
    let newZoom = parseFloat(zoomControl.value) - 0.2;
    updateZoom(newZoom);
});

// Initialize the scanner
startScanner();