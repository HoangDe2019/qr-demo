import QrScanner from "./qr-scanner.min.js";

$(document).ready(async function () {
    const video = $("#qr-video");
    const camList = $("#cam-list");
    const camHasFlash = $("#cam-has-flash");
    const flashToggle = $("#flash-toggle");
    const flashState = $("#flash-state");
    const camQrResult = $("#cam-qr-result");
    const camQrResultTimestamp = $("#cam-qr-result-timestamp");
    const fileSelector = $("#file-selector");
    const fileQrResult = $("#file-qr-result");
    const resetBtn = $("#reset-button");
    const qrResultsTable = $("#qr-results-table tbody");
    const startBtn = $("#start-button");
    const zoomControl = $("#zoom-control");
    const zoomValue = $("#zoom-value");
    const zoomInBtn = $("#zoom-in");
    const zoomOutBtn = $("#zoom-out");

    let videoTrack;
    let scanCount = 0;
    const maxScanCount = 10;
    let lastScanTime;
    let userIP = await getUserIP(); // Fetch user IP at load

    // 🟢 **Initialize Camera & Device Info**
    initCamera();

    function initCamera() {
        navigator.mediaDevices.enumerateDevices().then(devices => {
            const cameras = devices.filter(device => device.kind === 'videoinput');
            if (cameras.length <= 0) {
                showError("Không tìm thấy camera trên thiết bị của bạn.");
                return;
            }

            // Luôn tìm camera sau (rear camera)
            let rearCamera = cameras.find(camera =>
                camera.label.toLowerCase().includes("back") ||
                camera.label.toLowerCase().includes("rear") ||
                camera.label.toLowerCase().includes("environment")
            ) || cameras[0]; // Nếu không tìm thấy, dùng camera đầu tiên
            //
            startCamera(rearCamera.deviceId);

            camList.innerHTML = ""; // Xóa danh sách cũ trước khi cập nhật mới
            cameras.forEach(camera => {
                const option = document.createElement('option');
                option.value = camera.id;
                option.text = camera.label || "Camera " + (camList.length + 1);
                camList.appendChild(option);
            });

            camList.val(rearCamera.deviceId).change(() => startCamera(camList.val()));
        }).catch(err => showError(`Lỗi lấy danh sách camera: ${err}`));
    }

    // 🟢 **Start Camera**
    function startCamera(deviceId) {
        if (video[0].srcObject) video[0].srcObject.getTracks().forEach(track => track.stop());

        navigator.mediaDevices.getUserMedia({
            video: {
                deviceId: { exact: deviceId },
                width: { ideal: 9999 },
                height: { ideal: 9999 },
                frameRate: { ideal: 60, max: 120 }
            }
        }).then(stream => {
            video[0].srcObject = stream;
            videoTrack = stream.getVideoTracks()[0];

            let capabilities = videoTrack.getCapabilities();
            camHasFlash.text(capabilities.torch ? "Có" : "Không");
            if (capabilities.zoom) {
                zoomControl.attr({
                    min: capabilities.zoom.min,
                    max: capabilities.zoom.max,
                    step: 0.1,
                    value: capabilities.zoom.min
                }).show();
                zoomValue.text(`${capabilities.zoom.min}x`);
            } else {
                zoomControl.hide();
            }
        }).catch(err => showError(`Lỗi truy cập camera: ${err}`));
    }

    // 🟢 **QR Scanner**
    const scanner = new QrScanner(video[0], result => setResult(camQrResult, result), {
        onDecodeError: error => camQrResult.text(`Lỗi: ${error}`).css("color", "red"),
        highlightScanRegion: true,
        highlightCodeOutline: true,
        returnDetailedScanResult: true,
        maxScansPerSecond: 15,
        preferredResolution: 1920
    });

    // 🟢 **Set Result & Add To Table**
    async function setResult(element, result) {
        if (Date.now() - lastScanTime < 500) return;
        lastScanTime = Date.now();

        const deviceInfo = getDeviceInfo();
        const newRow = `
            <tr class="animate__animated animate__fadeIn">
                <td>${scanCount + 1}</td>
                <td>${result.data}</td>
                <td>${new Date().toLocaleTimeString()}</td>
                <td>${deviceInfo.device} - ${deviceInfo.browser} (${deviceInfo.os})</td>
                <td>${userIP}</td>
            </tr>`;
        qrResultsTable.append(newRow);
        camQrResult.text(result.data);
        camQrResultTimestamp.text(new Date().toLocaleTimeString());

        scanCount++;
        if (scanCount >= maxScanCount) {
            scanner.stop();
            showWarning("Đạt giới hạn quét, vui lòng đặt lại.");
            startBtn.prop("disabled", false);
        }
    }

    // 🟢 **Start Scanner**
    startBtn.click(() => {
        scanner.start();
        showSuccess("Bắt đầu quét!");
    });

    // 🟢 **Stop Scanner**
    $("#stop-button").click(() => {
        scanner.stop();
        showWarning("Dừng quét!");
    });

    // 🟢 **Flash Toggle**
    flashToggle.click(() => {
        if (!videoTrack) return;
        const isFlashOn = flashState.text() === "bật";
        videoTrack.applyConstraints({ advanced: [{ torch: !isFlashOn }] }).then(() => {
            flashState.text(!isFlashOn ? "bật" : "tắt");
            showSuccess(`Flash ${isFlashOn ? "Tắt" : "Bật"}!`);
        }).catch(err => showError(`Lỗi Flash: ${err}`));
    });

    // 🟢 **Zoom Controls**
    zoomControl.on("input", () => updateZoom(parseFloat(zoomControl.val())));
    zoomInBtn.click(() => updateZoom(parseFloat(zoomControl.val()) + 0.2));
    zoomOutBtn.click(() => updateZoom(parseFloat(zoomControl.val()) - 0.2));

    function updateZoom(zoomLevel) {
        if (!videoTrack) return;
        let newZoom = Math.max(zoomControl.attr("min"), Math.min(zoomControl.attr("max"), zoomLevel));
        videoTrack.applyConstraints({ advanced: [{ zoom: newZoom }] }).then(() => {
            zoomValue.text(`${newZoom.toFixed(1)}x`);
            zoomControl.val(newZoom);
        }).catch(err => showError(`Lỗi Zoom: ${err}`));
    }

    // 🟢 **Reset Scanner**
    resetBtn.click(() => {
        scanCount = 0;
        qrResultsTable.fadeOut(300, function () {
            $(this).empty().fadeIn(300);
        });
        fileQrResult.text("Chưa có");
        fileSelector.val("");
        startBtn.prop("disabled", false);
        scanner.start();
    });

    // 🟢 **Fetch User IP**
    async function getUserIP() {
        try {
            let response = await fetch("https://api64.ipify.org?format=json");
            let data = await response.json();
            return data.ip;
        } catch {
            return "Không xác định";
        }
    }

    // 🟢 **Get Device Info**
    function getDeviceInfo() {
        const userAgent = navigator.userAgent.toLowerCase();
        return {
            device: /android/.test(userAgent) ? "Android" : /iphone|ipad|ipod/.test(userAgent) ? "iOS" : "PC",
            os: /windows/.test(userAgent) ? "Windows" : /mac/.test(userAgent) ? "MacOS" : /linux/.test(userAgent) ? "Linux" : "Không xác định",
            browser: /chrome/.test(userAgent) ? "Chrome" : /firefox/.test(userAgent) ? "Firefox" : /safari/.test(userAgent) ? "Safari" : "Không xác định"
        };
    }

    // 🟢 **SweetAlert2 Helper Functions**
    function showSuccess(msg) { Swal.fire({ icon: "success", title: msg, showConfirmButton: false, timer: 1000 }); }
    function showWarning(msg) { Swal.fire({ icon: "warning", title: msg, showConfirmButton: false, timer: 1000 }); }
    function showError(msg) { Swal.fire({ icon: "error", title: "Lỗi!", text: msg, confirmButtonText: "OK" }); }

    AOS.init({ duration: 1000, once: true });
});
