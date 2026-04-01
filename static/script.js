const form = document.getElementById("uploadForm");
const input = document.getElementById("imageInput");
const preview = document.getElementById("previewImage");

// New UI elements
const resultBox = document.getElementById("resultBox");
const statusText = document.querySelector(".status");
const badge = document.querySelector(".badge");
const confidenceBar = document.getElementById("confidenceBar");
const analysisText = document.getElementById("analysisText");

// 🔍 Image Preview
input.addEventListener("change", function () {
    const file = this.files[0];

    if (file) {
        preview.style.display = "block";
        preview.src = URL.createObjectURL(file);
    }
});

// 🚀 Form Submit
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const file = input.files[0];
    if (!file) return;

    let formData = new FormData();
    formData.append("image", file);

    // ⏳ Loading UI
    statusText.innerText = "Analyzing...";
    badge.innerText = "Processing";
    badge.style.background = "#374151";
    confidenceBar.style.width = "30%";
    analysisText.innerText = " analyzing the MRI scan...";

    try {
        const response = await fetch("/predict", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        const result = data.result;
        const confidence = data.confidence;

        // 🎯 Decide color + status
        let colorClass = "danger";
        let badgeText = "Tumor Detected";
        let analysis = `The MRI scan shows patterns consistent with ${result}. Further medical evaluation is recommended.`;

        if (result === "No Tumor") {
            colorClass = "safe";
            badgeText = "Healthy";
            analysis = "No abnormal tumor patterns detected. The scan appears normal.";
        }

        // ✅ Update UI
        statusText.innerText = result;
        statusText.className = "status " + colorClass;

        badge.innerText = badgeText;
        badge.style.background = (colorClass === "safe") ? "#16a34a" : "#dc2626";

        confidenceBar.style.width = confidence + "%";

        analysisText.innerText = analysis;

    } catch (error) {
        console.error(error);

        statusText.innerText = "Error";
        badge.innerText = "Failed";
        badge.style.background = "#dc2626";
        analysisText.innerText = "Something went wrong. Please try again.";
        confidenceBar.style.width = "0%";
    }
});