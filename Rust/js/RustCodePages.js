/*
 * PagesTest.js - Builds thread page list
 * ver 1.0 - 19 Dec 2024
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>Rust Code Pages</div>\
    <div class='menuBody'>\
      <a href='RustBasics_Code.html'>RustBasics</a>\
      <a class='undef' href='javascript:;'>Hello World</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
