// Helper: update the grid columns based on a left-panel width (in pixels)
function updateGridColumns(leftWidthPx) {
  const container = document.getElementById('container');
  const containerWidth = container.clientWidth;
  const rightWidthPx = containerWidth - leftWidthPx;
  container.style.gridTemplateColumns = leftWidthPx + 'px ' + rightWidthPx + 'px';
}

// Increase left panel's width by 100px
function makeLeftLarger() {

  const container = document.getElementById('container');
  const leftPanel = document.getElementById('leftPanel');
  const rightPanel = document.getElementById('rightPanel');
  // Ensure both panels are visible
  leftPanel.style.display = 'block';
  rightPanel.style.display = 'block';
  
  const currentLeftWidth = leftPanel.offsetWidth;
  const containerWidth = container.clientWidth;
  const increment = 100;
  let newLeftWidth = currentLeftWidth + increment;
  
  // If the new left width is within one increment of container width, occupy all with left
  if (containerWidth - newLeftWidth <= increment) {
    occupyLeftPanel();
    return;
  }
  
  updateGridColumns(newLeftWidth);
}

// Increase right panel's width by 100px.
// Since the grid has two columns, increasing the right panel is done by reducing the left panel's width.
function makeRightLarger() {

  const container = document.getElementById('container');
  const leftPanel = document.getElementById('leftPanel');
  const rightPanel = document.getElementById('rightPanel');
  // Ensure both panels are visible
  leftPanel.style.display = 'block';
  rightPanel.style.display = 'block';
  
  const containerWidth = container.clientWidth;
  const currentRightWidth = rightPanel.offsetWidth;
  const increment = 100;
  let newRightWidth = currentRightWidth + increment;
  
  // If the new right width is within one increment of container width, occupy all with right
  if (containerWidth - newRightWidth <= increment) {
    occupyRightPanel();
    return;
  }
  
  // New left width is the remainder
  let newLeftWidth = containerWidth - newRightWidth;
  updateGridColumns(newLeftWidth);
}

function occupyLeftPanel() {
  const container = document.getElementById('container');
  const leftPanel = document.getElementById('leftPanel');
  const rightPanel = document.getElementById('rightPanel');
  
  let containerWidth = container.clientWidth;
  container.style.gridTemplateColumns = containerWidth + 'px ' + 0 + 'px';
}

function occupyRightPanel() {
  const container = document.getElementById('container');
  const leftPanel = document.getElementById('leftPanel');
  const rightPanel = document.getElementById('rightPanel');
  
  let containerWidth = container.clientWidth;
  container.style.gridTemplateColumns = 0 + 'px ' + containerWidth + 'px';
}
function centerPanels() {
  const container = document.getElementById('container');
  let panelWidth = container.clientWidth / 2;
  container.style.gridTemplateColumns = panelWidth + 'px ' + panelWidth + 'px';
}
function setRightPanelWidth(fracWidth) {
  const container = document.getElementById('container');
  let RtPanelWidth = container.clientWidth * fracWidth;
  let LtPanelWidth = container.clientWidth * (1 - fracWidth);
  container.style.gridTemplateColumns = LtPanelWidth + 'px ' + RtPanelWidth + 'px';
}
