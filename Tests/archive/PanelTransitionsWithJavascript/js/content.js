/*-----------------------------------------------
  show and hide left panel in container
*/
let isLPanelOpen = true; // Track panel state

function toggleLeftPanel() {
  const lpanel = document.getElementById("lpanel");
  const rpanel = document.getElementById("rpanel");

  const lpanelExpandedWidth = 192; // 12rem in pixels
  const lpanelCollapsedWidth = 0;

  const containerWidth = document.getElementById("container").clientWidth;

  let targetLWidth = isLPanelOpen ? lpanelCollapsedWidth : lpanelExpandedWidth;
  let targetRWidth = isLPanelOpen ? containerWidth : containerWidth - lpanelExpandedWidth;

  if (!isLPanelOpen) {
    // **Step 1: Remove `.hidden` Immediately**
    lpanel.classList.remove("hidden");

    // **Step 2: Force a Browser Reflow**
    void lpanel.offsetWidth; // Forces layout update before transition

    // **Step 3: Set the starting width**
    lpanel.style.width = "0px";
  }

  // **Step 4: Animate Both Panels Simultaneously**
  let startTime = performance.now();

  function animate(time) {
    let elapsed = time - startTime;
    let progress = Math.min(elapsed / 800, 1); // 800ms duration

    let lWidth = (1 - progress) * (isLPanelOpen ? lpanelExpandedWidth : lpanelCollapsedWidth) + progress * targetLWidth;
    let rWidth = (1 - progress) * (isLPanelOpen ? containerWidth - lpanelExpandedWidth : containerWidth) + progress * targetRWidth;

    lpanel.style.width = `${lWidth}px`;
    rpanel.style.width = `${rWidth}px`;

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      lpanel.style.width = `${targetLWidth}px`;
      rpanel.style.width = `${targetRWidth}px`;

      if (targetLWidth === 0) {
        lpanel.classList.add("hidden"); // Fully hide after animation
      }

      isLPanelOpen = !isLPanelOpen; // Toggle state
    }
  }

  requestAnimationFrame(animate);
}
