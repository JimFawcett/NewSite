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
    // **Step 1: Restore visibility before expanding**
    lpanel.style.display = "table-cell";
    void lpanel.offsetWidth; // Force browser to apply changes
  }

  // **Step 2: Animate Width Changes**
  lpanel.style.width = `${targetLWidth}px`;
  rpanel.style.width = `${targetRWidth}px`;

  if (isLPanelOpen) {
    // **Step 3: Fully Hide After Animation**
    setTimeout(() => {
      lpanel.style.display = "none";
    }, 800);
  }

  isLPanelOpen = !isLPanelOpen; // Toggle state
}
