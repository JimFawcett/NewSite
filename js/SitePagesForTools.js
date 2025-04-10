/*
 * SitePagesForTool.js - Builds thread page list
 * ver 1.0 - 13 Jan 2025
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>Track Pages</div>\
    <div class='menuBody'>\
      <a href='../Site/SiteHome.html'>Site Home</a>\
      <a href='../Rust/RustHome.html'>Rust</a>\
      <a href='../Cpp/CppHome.html'>C++</a>\
      <a href='../CSharp/CSharpHome.html'>C#</a>\
      <a href='../Python/PythonHome.html'>Python</a>\
      <a href='../WebDev/WebDevHome.html'>WebDev</a>\
      <a href='../SWDev/SWDevHome.html'>SWDev</a>\
      <a href='../Basics/BasicsHome.html'>Basics</a>\
      <a href='../GridExplorer/GridExplorer.html'>Viewer</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
