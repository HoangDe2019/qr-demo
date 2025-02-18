let qrScanner;

// 🟢 Start QR Code Scanning
document.getElementById("startScan").addEventListener("click", function () {
    qrScanner = new Html5Qrcode("reader");

    let scanFailures = 0; // Count failed scans

    qrScanner.start(
        { facingMode: "environment" }, // Use back camera
        { fps: 10, qrbox: { width: 250, height: 250 } },
        function (decodedText) {
            scanFailures = 0; // Reset failure count on successful scan

            try {
                let qrData = JSON.parse(decodedText); // CCCD QR Code contains structured JSON
                document.getElementById("qrResult").textContent = decodedText;
                fillCCCDInfo(qrData); // Process structured data
            } catch (error) {
                console.warn("Invalid QR Data", error);
                document.getElementById("qrResult").textContent = "QR Code không hợp lệ!";
            }
            qrScanner.stop(); // Stop after scanning
        },
        function (error) {
            console.warn("Scan failed:", error);

            scanFailures++;

            if (scanFailures >= 5) { // If 5 consecutive failures occur
                document.getElementById("qrResult").textContent =
                    "⚠️ Di chuyển điện thoại gần hơn với mã QR!";
            }
        }
    );
});




// 🔴 Stop QR Scanning
document.getElementById("stopScan").addEventListener("click", function () {
    if (qrScanner) {
        qrScanner.stop();
    }
});

// 🖼 OCR - Extract Text from Image
document.getElementById("imageUpload").addEventListener("change", function (event) {
    let image = event.target.files[0];

    if (image) {
        let reader = new FileReader();
        reader.onload = function () {
            Tesseract.recognize(reader.result, "vie", { 
                logger: (m) => console.log(m) 
            }).then(({ data: { text } }) => {
                document.getElementById("ocrResult").value = text.trim();
                extractInfo(text); // Extract details from text
            });
        };
        reader.readAsDataURL(image);
    }
});

function fillCCCDInfo(qrData) {
    document.getElementById("fullName").textContent = qrData["fullName"] || "---";
    document.getElementById("dob").textContent = qrData["dob"] || "---";
    document.getElementById("idNumber").textContent = qrData["idNumber"] || "---";
}


// 🟡 Extract Relevant Information
function extractInfo(text) {
    let fullNameMatch = text.match(/Họ và tên[:\s]+([^\n]+)/i);
    let dobMatch = text.match(/Ngày sinh[:\s]+([\d/]+)/i);
    let idMatch = text.match(/(?:Số CCCD|Số CMND)[:\s]+([\d]+)/i); // Match both CCCD & old CMND

    document.getElementById("fullName").textContent = fullNameMatch ? fullNameMatch[1].trim() : "---";
    document.getElementById("dob").textContent = dobMatch ? dobMatch[1].trim() : "---";
    document.getElementById("idNumber").textContent = idMatch ? idMatch[1].trim() : "---";
}
