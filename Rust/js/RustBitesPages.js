/*
 * PagesTest.js - Builds thread page list
 * ver 1.0 - 19 Dec 2024
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem menuHeader' onclick='togglePages()'>Rust Bites Pages</div>\
    <div class='menuBody'>\
      <a href='RustBites_Intro.html'>Introduction</a>\
      <a href='RustBites_HelloRust.html'>Hello World</a>\
      <a href='RustBites_Data.html'>Data</a>\
      <a href='RustBites_Placeholder.html'>Placeholder</a>\
      <a class='undef' href='javascript:;'>Objects</a>\
      <a class='undef' href='javascript:;'>Generics</a>\
      <a class='undef' href='javascript:;'>Iteration</a>\
      <a class='undef' href='javascript:;'>Rust features</a>\
      <a class='undef' href='javascript:;'>Rust Safety</a>\
      <a class='undef' href='javascript:;'>many more coming</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
