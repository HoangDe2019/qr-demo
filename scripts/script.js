import QrScanner from "./qr-scanner.min.js";

// DOM elements
const video = document.getElementById('qr-video');
// const videoContainer = document.getElementById('video-container');
// const camHasCamera = document.getElementById('cam-has-camera');
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

// Initialize cameras and set default to rear camera
navigator.mediaDevices.enumerateDevices().then(devices => {
    const cameras = devices.filter(device => device.kind === 'videoinput');

    if (cameras.length > 0) {
        let bestCamera = cameras[0]; // Mặc định chọn camera đầu tiên
        let rearCamera = cameras.find(camera => camera.label.toLowerCase().includes("back"));

        if (rearCamera) {
            bestCamera = rearCamera; // Ưu tiên camera sau nếu có
        }
        startCamera(bestCamera.deviceId); // Default to rear camera

        cameras.forEach((device, index) => {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.textContent = device.label || `Camera ${index + 1}`;
            camList.appendChild(option);
        });

        camList.addEventListener('change', event => {
            startCamera(event.target.value);
        });
    } else {
        Swal.fire({
            icon: "warning",
            title: "Không tìm thấy máy ảnh!",
            text: "Thiết bị của bạn không có camera hoặc bị lỗi.",
            confirmButtonText: "OK"
        });
    }
}).catch(err => {
    console.error("Error enumerating devices:", err);
    Swal.fire({
        icon: "error",
        title: "Lỗi Truy Cập!",
        text: "Không thể lấy danh sách camera.",
        confirmButtonText: "OK"
    });
});

// Functions
const updateFlashAvailability = () => {
    scanner.hasFlash().then(hasFlash => {
        camHasFlash.textContent = hasFlash ? "Có" : "Không";
        flashToggle.style.display = hasFlash ? 'inline-block' : 'none';
    });
};

const setResult = async (element, result) => {
    const now = Date.now();
    if (now - lastScanTime < 500) return; // Prevent excessive updates
    lastScanTime = now;

    const deviceInfo = getDeviceInfo(); // Lấy thông tin thiết bị
    const userIP = await getUserIP(); // Lấy địa chỉ IP
    // Chuẩn bị thông tin hiển thị
    const deviceDetails = `
        <b>Thiết Bị:</b> ${deviceInfo.device} <br>
        <b>Hệ Điều Hành:</b> ${deviceInfo.os} <br>
        <b>Trình Duyệt:</b> ${deviceInfo.browser} <br>
        <b>Độ Phân Giải:</b> ${deviceInfo.screenResolution} <br>
        <b>Ngôn Ngữ:</b> ${deviceInfo.browserLanguage}
    `;

    // Add the result to the table
    const row = qrResultsTable.insertRow();
    row.innerHTML = `
        <td>${scanCount + 1}</td>
        <td>${result.data}</td>
        <td>${new Date().toLocaleTimeString()}</td>
        <td>${deviceDetails}</td>
        <td>${userIP}</td>
    `;

    element.textContent = result.data;
    camQrResultTimestamp.textContent = new Date().toLocaleTimeString();
    scanCount++;

    // Dừng scanner nếu đạt giới hạn
    if (scanCount >= maxScanCount) {
        scanner.stop();
        Swal.fire({
            title: "Đã đạt giới hạn quét!",
            text: "Vui lòng đặt lại để quét tiếp!",
            icon: "warning",
            confirmButtonText: "OK"
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
            // Luôn tìm camera sau (rear camera)
            let rearCamera = cameras.find(camera =>
                camera.label.toLowerCase().includes("back") ||
                camera.label.toLowerCase().includes("rear") ||
                camera.label.toLowerCase().includes("environment")
            ) || cameras[0]; // Nếu không tìm thấy, dùng camera đầu tiên

            scanner.setCamera(rearCamera.id); // Chọn camera sau mặc định

            camList.innerHTML = ""; // Xóa danh sách cũ trước khi cập nhật mới
            cameras.forEach(camera => {
                const option = document.createElement('option');
                option.value = camera.id;
                option.text = camera.label || "Camera " + (camList.length + 1);
                camList.appendChild(option);
            });

            camList.value = rearCamera.id; // Đặt mặc định là camera sau

            // Sự kiện thay đổi camera
            camList.addEventListener("change", event => {
                scanner.setCamera(event.target.value);
            });
        } else {
            Swal.fire({
                icon: "warning",
                title: "Không tìm thấy máy ảnh!",
                text: "Thiết bị của bạn không có camera hoặc bị lỗi.",
                confirmButtonText: "OK"
            });

        }
    });
};

// Start Scanner
const startScanner = () => {
    scanner.start().then(() => {
        updateFlashAvailability();
    });
};

// // Handle camera switch
// camList.addEventListener('change', event => {
//     scanner.setCamera(event.target.value).then(updateFlashAvailability);
// });

// Toggle flash
flashToggle.addEventListener('click', () => {
    const stream = video.srcObject; // Corrected from `videoContainer.srcObject`

    if (!stream || stream.getVideoTracks().length === 0) {
        Swal.fire({
            icon: "error",
            title: "Lỗi Camera!",
            text: "Không tìm thấy luồng video hợp lệ.",
            confirmButtonText: "OK"
        });
        return;
    }

    const track = stream.getVideoTracks()[0];
    const capabilities = track.getCapabilities();

    if (!capabilities.torch) {
        Swal.fire({
            icon: "info",
            title: "Không hỗ trợ Flash!",
            text: "Camera của bạn không hỗ trợ bật/tắt đèn flash.",
            confirmButtonText: "OK"
        });
        return;
    }

    // Get the current state from applyConstraints
    const isFlashOn = flashState.textContent === 'bật';

    track.applyConstraints({ advanced: [{ torch: !isFlashOn }] })
        .then(() => {
            flashState.textContent = !isFlashOn ? 'bật' : 'tắt';
        })
        .catch(err => {
            Swal.fire({
                icon: "warning",
                title: "Không thể bật/tắt đèn flash!",
                text: `Lỗi: ${err.message || err}`,
                confirmButtonText: "OK"
            });
        });
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
            videoTrack = stream.getVideoTracks()[0]; // Assign the correct track

            if (videoTrack) {
                const capabilities = videoTrack.getCapabilities();
                if (capabilities.zoom) {
                    zoomControl.min = capabilities.zoom.min;
                    zoomControl.max = capabilities.zoom.max;
                    zoomControl.step = 0.1;
                    zoomControl.value = capabilities.zoom.min; // Default zoom
                    zoomValue.textContent = `${capabilities.zoom.min}x`;
                    zoomControl.style.display = 'block';
                } else {
                    zoomControl.style.display = 'none'; // Hide zoom if not supported
                }
            } else {
                console.error("Video track is undefined, zoom will not work.");
                Swal.fire({
                    icon: 'info',
                    title: 'Không hỗ trợ Zoom!',
                    text: 'Camera của bạn không hỗ trợ chức năng phóng to.',
                    confirmButtonText: 'Đóng'
                });
            }

            initCamera(); // Initialize cameras after assigning track
        })
        .catch(error => {
            Swal.fire({
                icon: "error",
                title: "Lỗi Truy Cập Camera!",
                text: "Không thể truy cập camera. Vui lòng cấp quyền.",
                confirmButtonText: "Đóng"
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
        let zoomValueFixed = Math.max(zoomControl.min, Math.min(zoomControl.max, parseFloat(zoomLevel)));

        videoTrack.applyConstraints({ advanced: [{ zoom: zoomValueFixed }] })
            .then(() => {
                zoomValue.textContent = `${zoomValueFixed.toFixed(1)}x`; // Update display
                zoomControl.value = zoomValueFixed; // Sync with slider
            })
            .catch(err => {
                console.error(err)
            });
    } else {
        Swal.fire({
            icon: "error",
            title: "Lỗi Zoom",
            text: `Không tìm thấy đoạn video nào, không thể áp dụng thu phóng`,
            confirmButtonText: "Đóng"
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

// Function to start the selected camera
const startCamera = (deviceId) => {
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop()); // Stop old stream
    }

    navigator.mediaDevices.getUserMedia({
        video: { deviceId: deviceId ? { exact: deviceId } : undefined },
        width: { ideal: 9999 }, // Chọn max width
        height: { ideal: 9999 }, // Chọn max height
        frameRate: { ideal: 60, max: 120 } // Chọn FPS cao nếu có
    })
        .then(stream => {
            video.srcObject = stream;
            videoTrack = stream.getVideoTracks()[0];

            if (videoTrack) {
                const capabilities = videoTrack.getCapabilities();
                camHasFlash.textContent = capabilities.torch ? 'Có' : 'Không';

                if (capabilities.zoom) {
                    zoomControl.min = capabilities.zoom.min;
                    zoomControl.max = capabilities.zoom.max;
                    zoomControl.step = 0.1;
                    zoomControl.value = capabilities.zoom.min;
                    zoomValue.textContent = `${capabilities.zoom.min}x`;
                    zoomControl.style.display = 'block';
                } else {
                    zoomControl.style.display = 'none';
                }
            }
        })
        .catch(err => {
            console.error("Camera access error:", err);
            Swal.fire({
                icon: "error",
                title: "Lỗi Truy Cập Camera!",
                text: "Không thể truy cập camera. Vui lòng cấp quyền.",
                confirmButtonText: "OK"
            });
        });
};

const getDeviceInfo = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    let device = "Không xác định";
    let os = "Không xác định";
    let browser = "Không xác định";

    // Xác định thiết bị
    if (/android/.test(userAgent)) device = "Android";
    if (/iphone|ipad|ipod/.test(userAgent)) device = "iOS";
    if (/windows/.test(userAgent)) device = "Windows PC";
    if (/macintosh|mac os x/.test(userAgent)) device = "MacOS";
    if (/linux/.test(userAgent)) device = "Linux";

    // Xác định hệ điều hành
    if (/windows nt 10/.test(userAgent)) os = "Windows 10";
    if (/windows nt 6.3/.test(userAgent)) os = "Windows 8.1";
    if (/windows nt 6.1/.test(userAgent)) os = "Windows 7";
    if (/mac os x/.test(userAgent)) os = "MacOS";
    if (/android/.test(userAgent)) os = "Android";
    if (/iphone|ipad|ipod/.test(userAgent)) os = "iOS";
    if (/linux/.test(userAgent)) os = "Linux";

    // Xác định trình duyệt
    if (userAgent.includes("edg")) browser = "Microsoft Edge";
    if (userAgent.includes("opr") || userAgent.includes("opera")) browser = "Opera";
    if (userAgent.includes("chrome") && !userAgent.includes("edg")) browser = "Google Chrome";
    if (userAgent.includes("safari") && !userAgent.includes("chrome")) browser = "Safari";
    if (userAgent.includes("firefox")) browser = "Mozilla Firefox";
    if (userAgent.includes("msie") || userAgent.includes("trident")) browser = "Internet Explorer";

    // Lấy độ phân giải màn hình
    const screenResolution = `${window.screen.width} x ${window.screen.height}`;

    // Lấy ngôn ngữ trình duyệt
    const browserLanguage = navigator.language || navigator.userLanguage;

    return {
        device,
        os,
        browser,
        screenResolution,
        browserLanguage
    };
};

const getUserIP = async () => {
    try {
        let response = await fetch("https://api64.ipify.org?format=json");
        let data = await response.json();
        return data.ip;
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Lỗi Truy Cập Camera!",
            text: "Không thể truy cập camera. Vui lòng cấp quyền." + error,
            confirmButtonText: "OK"
        });

        return "Không xác định";
    }
};



