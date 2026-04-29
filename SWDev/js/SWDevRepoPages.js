/*
 * SWDevRepoPages.js - Builds SWDev repo page list
 * ver 1.0 - 28 Apr 2026
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>SWDev Repo Pages</div>\
    <div class='menuBody'>\
      <a href='RepoSWDev_Prototype.html'>Prototype</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
