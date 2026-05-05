/*
 * PythonRepoPages.js - Builds Python repo page list
 * ver 1.0 - 28 Apr 2026
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>Python Repo Pages</div>\
    <div class='menuBody'>\
      <a href='RepoPython_PyCodeMetrics.html'>PyCodeMetrics</a>\
      <a href='RepoPython_PyTextFinder.html'>PyTextFinder</a>\
      <a href='RepoPython_PyPageValidator.html'>PyPageValidator</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
