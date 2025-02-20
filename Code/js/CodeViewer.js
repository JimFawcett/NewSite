/*-----------------------------------------------
  Code to manage two-panel display
*/
let view = new Object();

view.originalLPanelFlex = document.getElementById('lpanel').style.flex || "none";
view.originalRPanelFlex = document.getElementById('rpanel').style.flex || "1";
view.originalLPanelWidth = document.getElementById('lpanel').style.width || "auto";
view.originalLPanelDisplay = document.getElementById('lpanel').style.display || "flex";
view.originalRPanelDisplay = document.getElementById('rpanel').style.display || "flex";

// Function to increase #lpanel width incrementally
view.leftBigger = function() {
  const container = document.getElementById('rpanel');
  const lpanel = document.getElementById('left-content-panel');
  const rpanel = document.getElementById('right-content-panel');

  // Get computed styles
  const containerWidth = parseFloat(window.getComputedStyle(container).width);
  const lpanelWidth = parseFloat(window.getComputedStyle(lpanel).width);

  // Define the increment (adjust as needed)
  const increment = 5*22; // Increase by 20px each step

  console.log(`Container Width: ${containerWidth}px`);
  console.log(`LPanel Width Before: ${lpanelWidth}px`);

  if (lpanelWidth + increment < containerWidth) {
    // Increase lpanel's width
    lpanel.style.flex = "none"; // Disable flex-grow temporarily
    lpanel.style.width = `${lpanelWidth + increment}px`;

    // Reduce rpanel's flex to accommodate lpanel growth
    rpanel.style.flex = "1"; // Keeps shrinking
  } else {
    // Max out lpanel to full width
    lpanel.style.width = `${containerWidth}px`;
    lpanel.style.flex = "1"; // Allow it to take full space

    // Hide or collapse rpanel
    rpanel.style.display = "none";
  }

  console.log(`LPanel Width After: ${lpanel.style.width}`);
  this.restoreOriginalLayout();
}

// Function to restore original flex layout
view.restoreOriginalLayout = function() {
  const lpanel = document.getElementById('left-content-panel');
  const rpanel = document.getElementById('right-content-panel');

  // Restore original values
  lpanel.style.flex = this.originalLPanelFlex;
  lpanel.style.display = this.originalLPanelDisplay;
  // lpanel.style.width = this.originalLPanelWidth;
  rpanel.style.flex = this.originalRPanelFlex;
  rpanel.style.display = this.originalRPanelDisplay;

  console.log("Layout restored to original settings.");
}

view.leftSmaller = function() {
  const container = document.getElementById('rpanel');
  const lpanel = document.getElementById('left-content-panel');
  const rpanel = document.getElementById('right-content-panel');

  // Get computed styles
  const lpanelWidth = parseFloat(window.getComputedStyle(lpanel).width);
  const decrement = 5*22; // Reduce width by 20px each step

  console.log(`LPanel Width Before: ${lpanelWidth}px`);

  if (lpanelWidth - decrement > 0) {
    // Reduce lpanel's width
    lpanel.style.flex = "none"; // Disable flex-grow temporarily
    lpanel.style.width = `${lpanelWidth - decrement}px`;

    // Expand rpanel dynamically
    rpanel.style.flex = "1";
    rpanel.style.display = "flex"; // Ensure it remains visible
  } else {
    // Minimize lpanel completely
    lpanel.style.width = "0px";
    lpanel.style.flex = "0"; // Collapse completely
    lpanel.style.display = "none"; // Hide it

    // Allow rpanel to take full width
    rpanel.style.flex = "1";
  }
  this.restoreOriginalLayout();
  console.log(`LPanel Width After: ${lpanel.style.width}`);
}
view.doCenter = function() {
  let lpanel = document.getElementById('left-content-panel');
  lpanel.style.width = "calc(50% - 0.1rem)";
  console.log('centered');
}
view.doFullRight = function() {
  let lpanel = document.getElementById('left-content-panel');
  lpanel.style.width = "0%";
  console.log('full screen');
}

view.doFullLeft = function() {
  console.log('doFullLeft()');
  const lpanel = document.getElementById('left-content-panel');
  lpanel.style.flex = "none";
  const rpanel = document.getElementById('right-content-panel');
  rpanel.style.flex = "1";
  rpanel.style.display = "none";
  const container = document.getElementById('rpanel');
  const containerWidth = parseFloat(window.getComputedStyle(container).width);
  lpanel.style.width = `${containerWidth}px`;
  this.restoreOriginalLayout();
}
