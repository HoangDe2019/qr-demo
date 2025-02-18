let qrScanner;
let scanFailures = 0;

// 🟢 Initialize QR Scanner
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
                { fps: 10, qrbox: { width: 250, height: 250 } },
                handleScanSuccess,
                (error) => handleScanFailure(error, scanFailures++)
            );
        })
        .catch(() => displayMessage("❌ Quyền truy cập camera bị từ chối!", "error"));
}

// ✅ Handle Successful Scan
function handleScanSuccess(decodedText) {
    try {
        let qrData = JSON.parse(decodedText);
        displayMessage("✅ Mã QR hợp lệ!", "success");
        fillCCCDInfo(qrData);
    } catch (error) {
        console.warn("Invalid QR Data", error);
        displayMessage("❌ QR Code không hợp lệ!", "error");
    }
    stopQRScanner();
}

// ❌ Handle Scan Failures
function handleScanFailure(error, scanFailures) {
    console.warn("Scan failed:", error);

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

// 🖼 OCR - Extract Text from Image & Clear Previous File
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
                extractInfo(text);
            })
            .catch(() => displayMessage("❌ Lỗi nhận diện văn bản!", "error"));
    };
    reader.readAsDataURL(image);
});

// 📌 Fill CCCD Information from QR Code
function fillCCCDInfo(qrData) {
    document.getElementById("fullName").textContent = qrData["fullName"] || "---";
    document.getElementById("dob").textContent = qrData["dob"] || "---";
    document.getElementById("idNumber").textContent = qrData["idNumber"] || "---";
}

// 🟡 Extract Information from OCR Text
function extractInfo(text) {
    let fullNameMatch = text.match(/Họ và tên[:\s]+([^\n]+)/i);
    let dobMatch = text.match(/Ngày sinh[:\s]+([\d/]+)/i);
    let idMatch = text.match(/(?:Số CCCD|Số CMND)[:\s]+([\d]+)/i);

    document.getElementById("fullName").textContent = fullNameMatch ? fullNameMatch[1].trim() : "---";
    document.getElementById("dob").textContent = dobMatch ? dobMatch[1].trim() : "---";
    document.getElementById("idNumber").textContent = idMatch ? idMatch[1].trim() : "---";
}

// 🔔 Display UI Messages
function displayMessage(message, type) {
    let messageBox = document.getElementById("qrResult");
    messageBox.textContent = message;
    messageBox.className = `alert alert-${type}`;
}

// 🚀 Event Listeners
document.getElementById("startScan").addEventListener("click", startQRScanner);
document.getElementById("stopScan").addEventListener("click", stopQRScanner);