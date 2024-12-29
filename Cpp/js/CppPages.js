/*
 * PagesTest.js - Builds thread page list
 * ver 1.0 - 19 Dec 2024
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem menuHeader' onclick='togglePages()'>Thread Pages</div>\
    <div class='menuBody'>\
      <a href='RustHome.html'>Rust Home</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
