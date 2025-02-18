let qrScanner;
let scanFailures = 0;

// 🟢 Start QR Scanner
function startQRScanner() {
    Html5Qrcode.getCameras()
        .then((cameras) => {
            if (cameras.length === 0) {
                displayMessage("❌ Không tìm thấy camera!", "error");
                return;
            }

            qrScanner = new Html5Qrcode("reader");
            scanFailures = 0; // Reset failure count

            qrScanner.start({ facingMode: "environment" }, // Use back camera
                { fps: 15, qrbox: { width: 300, height: 300 } }, // Larger QR scan area
                handleScanSuccess,
                (error) => handleScanFailure(error)
            );
        })
        .catch(() => displayMessage("❌ Quyền truy cập camera bị từ chối!", "error"));
}

// ✅ Handle Successful Scan
function handleScanSuccess(decodedText) {
    scanFailures = 0; // Reset failure count

    // ⚠️ CCCD QR may contain plain text instead of JSON, so we parse manually
    let qrData = parseCCCDText(decodedText);

    if (qrData) {
        displayMessage("✅ Mã QR CCCD hợp lệ!", "success");
        fillCCCDInfo(qrData);
    } else {
        displayMessage("❌ QR Code không hợp lệ!", "error");
    }

    stopQRScanner();
}

// ❌ Handle Scan Failures
function handleScanFailure(error) {
    scanFailures++;

    if (scanFailures >= 5) {
        displayMessage("⚠️ Hãy di chuyển điện thoại gần hơn với mã QR!", "warning");
    }
}

// 🔴 Stop QR Scanner
function stopQRScanner() {
    if (qrScanner) {
        qrScanner.stop().then(() => {
            qrScanner.clear();
        });
    }
}

// 📌 Extract CCCD Information from QR Text
function parseCCCDText(text) {
    let fullNameMatch = text.match(/Họ và tên[:\s]+([^\n]+)/i);
    let dobMatch = text.match(/Ngày sinh[:\s]+([\d/]+)/i);
    let idMatch = text.match(/(?:Số CCCD|Số CMND)[:\s]+([\d]+)/i);

    if (fullNameMatch && dobMatch && idMatch) {
        return {
            fullName: fullNameMatch[1].trim(),
            dob: dobMatch[1].trim(),
            idNumber: idMatch[1].trim(),
        };
    }

    return null;
}

// 🖼 OCR - Extract Text from Image
document.getElementById("imageUpload").addEventListener("change", function(event) {
    let image = event.target.files[0];
    if (!image) return;

    // Clear previous file selection
    event.target.value = "";

    let reader = new FileReader();
    reader.onload = function() {
        Tesseract.recognize(reader.result, "vie", { logger: (m) => console.log(m) })
            .then(({ data: { text } }) => {
                document.getElementById("ocrResult").value = text.trim();
                let extractedData = parseCCCDText(text);
                if (extractedData) {
                    fillCCCDInfo(extractedData);
                } else {
                    displayMessage("❌ Lỗi nhận diện văn bản!", "error");
                }
            })
            .catch(() => displayMessage("❌ Lỗi nhận diện văn bản!", "error"));
    };
    reader.readAsDataURL(image);
});

// 🔔 Display UI Messages
function displayMessage(message, type) {
    let messageBox = document.getElementById("qrResult");
    messageBox.textContent = message;
    messageBox.className = `alert alert-${type}`;
}

// 📌 Fill CCCD Information into UI
function fillCCCDInfo(qrData) {
    document.getElementById("fullName").textContent = qrData.fullName || "---";
    document.getElementById("dob").textContent = qrData.dob || "---";
    document.getElementById("idNumber").textContent = qrData.idNumber || "---";
}

// 🚀 Event Listeners
document.getElementById("startScan").addEventListener("click", startQRScanner);
document.getElementById("stopScan").addEventListener("click", stopQRScanner);