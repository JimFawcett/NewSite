/*
 * PagesTest.js - Builds thread page list
 * ver 1.0 - 19 Dec 2024
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>Python Bites Pages</div>\
    <div class='menuBody'>\
      <a href='PythonBites_Intro.html'>Introduction</a>\
      <a href='PythonBites_HelloPython.html'>Hello</a>\
      <a href='PythonBites_Data.html'>Data</a>\
      <a class='undef' href='javascript:;'>Objects</a>\
      <a class='undef' href='javascript:;'>Everything's Generic</a>\
      <a class='undef' href='javascript:;'>Iteration</a>\
      <a class='undef' href='javascript:;'>Libraries</a>\
      <a class='undef' href='javascript:;'>more bites</a>\
      <a href='PythonBites_Glossary.html'>Glossary</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
