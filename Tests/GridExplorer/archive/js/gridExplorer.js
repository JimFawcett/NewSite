// Helper: update the grid columns based on a left-panel width (in pixels)
function updateGridColumns(leftWidthPx) {
  const container = document.getElementById('panel-container');
  const containerWidth = container.clientWidth;
  const rightWidthPx = containerWidth - leftWidthPx;
  container.style.gridTemplateColumns = leftWidthPx + 'px ' + rightWidthPx + 'px';
}

// const Controls = Object.freeze(
//   {
//     MLL: 0,
//     MRL: 1,
//     CNT: 2,
//     ALP: 3,
//     ARP: 4,
//     SPW: 5,
//     TGP: 6
//   }
// );

let rightWidth = null;

// Increase left panel's width by 100px
function makeLeftLarger() {
  // state = Controls.MLL;
  const container = document.getElementById('panel-container');
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
  // state = Controls.MRL;
  const container = document.getElementById('panel-container');
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
  // state = Controls.ALP;
  const container = document.getElementById('panel-container');
  const leftPanel = document.getElementById('leftPanel');
  const rightPanel = document.getElementById('rightPanel');
  
  let containerWidth = container.clientWidth;
  container.style.gridTemplateColumns = containerWidth + 'px ' + 0 + 'px';
}

function occupyRightPanel() {
  // state = Controls.ARP;
  const container = document.getElementById('panel-container');
  const leftPanel = document.getElementById('leftPanel');
  const rightPanel = document.getElementById('rightPanel');
  
  let containerWidth = container.clientWidth;
  container.style.gridTemplateColumns = 0 + 'px ' + containerWidth + 'px';
}
function centerPanels() {
  // state = Controls.CNT;
  const container = document.getElementById('panel-container');
  let panelWidth = container.clientWidth / 2;
  container.style.gridTemplateColumns = panelWidth + 'px ' + panelWidth + 'px';
}
function selectRightPanelWidth(fracWidth) {
  // state = Controls.SPW;
  const rightPanel = document.getElementById('rightPanel');
  rightWidth = rightPanel.clientWidth;
  // const container = document.getElementById('panel-container');
  // let RtPanelWidth = container.clientWidth * fracWidth;
  // let LtPanelWidth = container.clientWidth * (1 - fracWidth);
  // container.style.gridTemplateColumns = LtPanelWidth + 'px ' + RtPanelWidth + 'px';
}
function setRightPanelWidth(fracWidth) {
  // state = Controls.SPW;
  const container = document.getElementById('panel-container');
  let RtPanelWidth = container.clientWidth * fracWidth;
  let LtPanelWidth = container.clientWidth * (1 - fracWidth);
  container.style.gridTemplateColumns = LtPanelWidth + 'px ' + RtPanelWidth + 'px';
}

function togglePanel() {
  // const controls = document.getElementById('controls');
  // controls.classList.toggle('hidden'); 
  const panel = document.getElementById('control-panel');
  panel.classList.toggle('hidden');
  centerPanels();
  // cont = document.getElementById('panel-container');
  // cont.style.width = `{100%}px`;
  // switch(state) {
  //   case Controls.MLL:
  //     makeLeftLarger();
  //     break;
  //   case Controls.MRL:
  //     makeRightLarger();
  //     break;
  //   case Controls.CNT:
  //     centerPanels();
  //     break;
  //   case Controls.ALP:
  //     occupyLeftPanel();
  //     break;
  //   case Controls.ARP:
  //     occupyRightPanel();
  //     break;
  //   case Controls.SPW:
  //     setRightPanelWidth(0.4);
  //     break;
  //   default:
  // }
  // state = Controls.TGP;
}