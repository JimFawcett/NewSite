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
      <a href='RustRepos.html'>Rust Repos</a>\
        <a class='undef' href='javascript:;'>C++ Repos</a>\
        <a class='undef' href='javascript:;'>C# Repos</a>\
        <a class='undef' href='javascript:;'>Python Repos</a>\
        <a class='undef' href='javascript:;'>WebDev Repos</a>\
        <a class='undef' href='javascript:;'>Other Repos</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
