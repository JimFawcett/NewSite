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
      <a href='WebDevBites_CompImageViewer.html'>ImageView Demo</a>\
      <a href='WebDevBites_CompImageViewerDesign.html'>ImageView Design</a>\
      <a href='WebDevBites_CompImageViewerInterface.html'>ImageView Interface</a>\
      <a class='undef' href='javascript:;'>Text Viewer</a>\
      <a class='undef' href='javascript:;'>Splitter</a>\
      <a class='undef' href='javascript:;'>TwoPanel</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
