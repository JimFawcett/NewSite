/*
 * WebDevBitesPages.js - Builds thread page list
 * ver 1.0 - 19 Dec 2024
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>WebDev Comp Pages</div>\
    <div class='menuBody'>\
      <a href='WebDevBites_Components.html'>Introduction</a>\
      <a href='WebDevBites_CompViewImage.html'>Image Viewer</a>\
      <a href='WebDevBites_CompViewCode.html'>Code Viewer</a>\
      <a href='WebDevBites_CompViewSplitterBar.html'>SplitterBar Viewer</a>\
      <a href='WebDevBites_CompViewComparator.html'>Comparator</a>\
      <a href='WebDevBites_CompTwoPanelViewer.html'>Two Panel Viewer</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
