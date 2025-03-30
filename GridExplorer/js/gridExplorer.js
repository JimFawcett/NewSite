// Helper: update the grid columns based on a left-panel width (in pixels)
function updateGridColumns(leftWidthPx) {
  const iframe = document.getElementById('lpgframe');
  const container = document.getElementById('panel-container');
  const containerWidth = container.clientWidth;
  const rightWidthPx = containerWidth - leftWidthPx;
  container.style.gridTemplateColumns = leftWidthPx + 'px ' + rightWidthPx + 'px';
  iframe.style.width = leftWidthPx + 'px';
}

let RightPanelWidth = null;

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
  // let newLeftWidth = containerWidth - newRightWidth;
  updateGridColumns(newLeftWidth);


  // iframe.contentWindow.dispatchEvent(new Event("resize"));

  // updateGridColumns(newLeftWidth);
  // const iframe = document.getElementById('lpgframe');
  // try {
  //   const doc = iframe.contentDocument || iframe.contentWindow.document;
  //   doc.body.style.display = "none";
  //   // Let it breathe for a moment
  //   setTimeout(() => {
  //     doc.body.style.display = "";
  //   }, 0);
  // } catch (e) {
  //   console.warn("Could not access iframe content for reflow", e);
  // }
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
  const iframe = document.getElementById('lpgframe');
  iframe.style.width = containerWidth + 'px';  
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
  const iframe = document.getElementById('lpgframe');
  iframe.style.width = panelWidth + 'px';  
}
function selectRightPanelWidth() {
  console.debug('--- selectRightPanelWidth ---');
  console.debug('before select Right panel width: ' + RightPanelWidth);
  const rightPanel = document.getElementById('rightPanel');
  RightPanelWidth = rightPanel.clientWidth;
  console.debug('after select Right panel width: ' + RightPanelWidth);
}
function setRightPanelWidth() {
  console.debug('--- setRightPanelWidth ---')
  const container = document.getElementById('panel-container');
  if(RightPanelWidth === null) {
    RightPanelWidth = container.clientWidth / 2;
  }
  console.debug('before set Right panel width: ' + RightPanelWidth);
  let LtPanel = document.getElementById(leftPanel);
  let RtPanel = document.getElementById(rightPanel);
  let LeftPanelWidth = container.clientWidth - RightPanelWidth;

  if (LeftPanelWidth < 0.10 * container.clientWidth) {
    occupyRightPanel();
  }
  else if (RightPanelWidth < 0.10 * container.clientWidth) {
    occupyLeftPanel();
  }
  else {
    container.style.gridTemplateColumns = LeftPanelWidth + 'px ' + RightPanelWidth + 'px';
  }
  const iframe = document.getElementById('lpgframe');
  iframe.style.width = LeftPanelWidth + 'px';  
}  
function presetRightPanelWidth(fracWidth) {
  const container = document.getElementById('panel-container');
  let RtPanelWidth = container.clientWidth * fracWidth;
  let LtPanelWidth = container.clientWidth * (1 - fracWidth);
  container.style.gridTemplateColumns = LtPanelWidth + 'px ' + RtPanelWidth + 'px';
  const iframe = document.getElementById('lpgframe');
  iframe.style.width = LtPanelWidth + 'px';  
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