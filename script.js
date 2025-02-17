let qrScanner;

// 🟢 Start QR Code Scanning
document.getElementById("startScan").addEventListener("click", function () {
    qrScanner = new Html5Qrcode("reader");

    qrScanner.start(
        { facingMode: "environment" }, // Use back camera
        { fps: 10, qrbox: { width: 250, height: 250 } },
        function (decodedText) {
            document.getElementById("qrResult").textContent = decodedText;
            extractInfo(decodedText); // Process extracted info
            qrScanner.stop(); // Stop after scanning
        },
        function (error) {
            console.warn(error);
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
            Tesseract.recognize(reader.result, "eng+vie", {
                logger: (m) => console.log(m),
            }).then(({ data: { text } }) => {
                document.getElementById("ocrResult").value = text.trim();
                extractInfo(text); // Process extracted info
            });
        };
        reader.readAsDataURL(image);
    }
});

// 🟡 Extract Relevant Information
function extractInfo(text) {
    let fullNameMatch = text.match(/Họ và tên[:\s]+(.+)/i);
    let dobMatch = text.match(/Ngày sinh[:\s]+([\d/]+)/i);
    let idMatch = text.match(/Số ID[:\s]+([\d]+)/i);

    document.getElementById("fullName").textContent = fullNameMatch ? fullNameMatch[1] : "---";
    document.getElementById("dob").textContent = dobMatch ? dobMatch[1] : "---";
    document.getElementById("idNumber").textContent = idMatch ? idMatch[1] : "---";
}
