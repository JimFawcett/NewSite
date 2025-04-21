/*
 * CppBitesPages.js - Builds thread page list
 * ver 1.0 - 06 Jan 2025
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>C++ Bites Pages</div>\
    <div class='menuBody'>\
      <a href='CppBites_Intro.html'>Introduction</a>\
      <a href='CppBites_HelloCpp.html'>Hello</a>\
      <a href='CppBites_Data.html'>Data</a>\
      <a class='undef' href='javascript:;'>Objects</a>\
      <a class='undef' href='javascript:;'>Generics</a>\
      <a class='undef' href='javascript:;'>Iteration</a>\
      <a href='CppBites_STR.html'>STR</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
