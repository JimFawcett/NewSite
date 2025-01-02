/*
 * PagesTest.js - Builds thread page list
 * ver 1.0 - 19 Dec 2024
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem menuHeader' onclick='togglePages()'>Track Pages</div>\
    <div class='menuBody'>\
      <a href='Rust/RustHome.html'>Rust</a>\
      <a href='Cpp/CppHome.html'>C++</a>\
      <a href='CSharp/CSharpHome.html'>C#</a>\
      <a href='Python/PythonHome.html'>Python</a>\
      <a href='WebDev/WebDevHome.html'>WebDev</a>\
      <a href='SWDev/SWDevHome.html'>SWDev</a>\
      <a href='Basics/BasicsHome.html'>Rust</a>\
      <a href='CodeHome.html'>Code</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
