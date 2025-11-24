// Get references to the 3 specific inputs
const inputTL = document.getElementById("input-tl");
const inputTR = document.getElementById("input-tr");
const inputBL = document.getElementById("input-bl");

const processBtn = document.getElementById("process-btn");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// State to keep track of selected files.
// Index 0 = Top-Left, 1 = Top-Right, 2 = Bottom-Left
let filesState = [null, null, null];

// --- Event Listeners for Inputs ---

// Helper function to handle input changes
function handleFileSelect(index, event) {
  const file = event.target.files[0];
  // Store the file object (or null if they cancelled selection) in the state array
  filesState[index] = file ? file : null;

  // Check if all 3 files are present to enable the button
  checkButtonState();
}

inputTL.addEventListener("change", (e) => handleFileSelect(0, e));
inputTR.addEventListener("change", (e) => handleFileSelect(1, e));
inputBL.addEventListener("change", (e) => handleFileSelect(2, e));

// Check if the merge button should be enabled
function checkButtonState() {
  // .every() returns true only if all items in the array are NOT null
  const allFilesSelected = filesState.every((file) => file !== null);

  if (allFilesSelected) {
    processBtn.classList.add("active");
    processBtn.disabled = false;
  } else {
    processBtn.classList.remove("active");
    processBtn.disabled = true;
  }
}

// --- Main Merge Function ---

processBtn.addEventListener("click", async () => {
  // Final safety check before processing
  if (filesState.includes(null)) return;

  // Change button text to indicate processing
  const originalBtnText = processBtn.innerText;
  processBtn.innerText = "Processing...";
  processBtn.disabled = true;

  // 1. Clear Canvas to ensure transparent background
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 2. Define Positions [x, y] for the 1024x1024 quadrants
  const positions = [
    { x: 0, y: 0 }, // Index 0: Top-Left
    { x: 1024, y: 0 }, // Index 1: Top-Right
    { x: 0, y: 1024 } // Index 2: Bottom-Left
  ];

  try {
    // 3. Loop through the 3 file slots
    for (let i = 0; i < 3; i++) {
      // Use the modern createImageBitmap API for efficient loading
      const imgBitmap = await createImageBitmap(filesState[i]);

      // Draw the image into its designated 1024x1024 quadrant.
      // drawImage(image, destinationX, destinationY, destinationWidth, destinationHeight)
      ctx.drawImage(imgBitmap, positions[i].x, positions[i].y, 1024, 1024);
    }

    // 4. Trigger Download automatically
    const link = document.createElement("a");
    link.download = "merged-grid-2048.png";
    // Convert canvas data to a PNG data URL
    link.href = canvas.toDataURL("image/png");
    document.body.appendChild(link); // Required for Firefox
    link.click();
    document.body.removeChild(link); // Clean up
  } catch (err) {
    console.error("Error during image processing:", err);
    alert(
      "An error occurred. Please ensure the uploaded files are valid images."
    );
  } finally {
    // Reset button state
    processBtn.innerText = originalBtnText;
    processBtn.disabled = false;
  }
});
