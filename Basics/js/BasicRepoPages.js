/*
 * BasicRepoPages.js - Builds Basics repo page list
 * ver 1.0 - 28 Apr 2026
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>Basics Repo Pages</div>\
    <div class='menuBody'>\
      <a href='RepoBasic_Prototype.html'>Prototype</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
