/*
 * PagesTest.js - Builds thread page list
 * ver 1.0 - 19 Dec 2024
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>Code Bites Pages</div>\
      <div class='menuBody'>\
        <a href='CodeBites_UseAI.html'>Using AI</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
