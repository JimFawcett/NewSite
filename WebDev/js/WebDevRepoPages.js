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
      <a href='RepoWebDev_ViewImageComponent.html'>Image View</a>\
      <a href='RepoWebDev_ViewCodeComponent.html'>Code View</a>\
      <a href='RepoWebDev_ViewSplitterBarComponent.html'>Splitter View</a>\
      <a href='RepoWebDev_ViewComparatorComponent.html'>Comparator View</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
