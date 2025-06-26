/*
 * PagesTest.js - Builds thread page list
 * ver 1.0 - 19 Dec 2024
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' style='text-align:center' onclick='togglePages()'>Repos Pages</div>\
    <div class='menuBody'>\
      <a href='../Rust/RustRepos.html'>Rust Repos</a>\
      <a href='../Cpp/CppRepos.html'>C++ Repos</a>\
      <a href='../CSharp/CSharpRepos.html'>C# Repos</a>\
      <a href='../Python/PythonRepos.html'>Python Repos</a>\
      <a href='../WebDev/WebDevRepos.html'>WebDev Repos</a>\
      <a href='../SWDev/SWDevRepos.html'>SWDev Repos</a>\
      <a href='../Basics/BasicsRepos.html'>Basics Repos</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
