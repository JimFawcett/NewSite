/*
 * PagesTest.js - Builds thread page list
 * ver 1.0 - 19 Dec 2024
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>Code Repo Pages</div>\
      <div class='menuBody'>\
        <a href='RepoCode_ReadmeAgent.html'>Readme Agent</a>\
        <a href='RepoCode_Webifier.html'>CodeWebifier</a>\
        <a href='RepoCode_Projects.html'>Language Comparison Projects</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
