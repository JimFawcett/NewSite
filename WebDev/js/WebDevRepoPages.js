/*
 * WebDevRepoPages.js - Builds WebDev repo page list
 * ver 1.0 - 28 Apr 2026
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>WebDev Repo Pages</div>\
    <div class='menuBody'>\
      <a href='RepoWebDev_Summary.html'>Repo Summary</a>\
      <a href='RepoWebDev_SplitterComponent.html'>Splitter</a>\
      <a href='RepoWebDev_ImageViewerComponent.html'>ImageViewer</a>\
      <a href='RepoWebDev_CodeViewerComponent.html'>CodeViewer</a>\
      <a href='RepoWebDev_TextViewerComponent.html'>TextViewer</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
