/*
 * ChangePages.js - Builds Change thread
 * ver 1.0 - 26 Jun 2025
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' style='text-align:center' onclick='togglePages()'>Change Pages</div>\
    <div class='menuBody'>\
      <a href='../Site/SiteChanges.html'>Site</a>\
      <a href='../Rust/RustChanges.html'>Rust</a>\
      <a href='../Cpp/CppChanges.html'>C++</a>\
      <a href='../CSharp/CSharpChanges.html'>C#</a>\
      <a href='../Python/PythonChanges.html'>Python</a>\
      <a href='../WebDev/WebDevChanges.html'>WebDev</a>\
      <a href='../SWDev/SWDevChanges.html'>SWDev</a>\
      <a href='../Basics/BasicsChanges.html'>Basics</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
