/*
 * SitePagesForTool.js - Builds thread page list
 * ver 1.0 - 13 Jan 2025
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>Track Summary Pages</div>\
    <div class='menuBody'>\
      <a target=_parent href='../Site/Explore.html?src=SiteHome.html'>Site Home</a>\
      <a target=_parent href='../Rust/ExploreRust.html?src=RustHome.html'>Rust</a>\
      <a target=_parent href='../Cpp/ExploreCpp.html?src=CppHome.html'>C++</a>\
      <a target=_parent href='../CSharp/ExploreCSharp.html?src=CSharpHome.html'>C#</a>\
      <a target=_parent href='../Python/ExplorePython.html?src=PythonHome.html'>Python</a>\
      <a target=_parent href='../WebDev/ExploreWebDev.html?src=WebDevHome.html'>WebDev</a>\
      <a target=_parent href='../SWDev/ExploreSWDev.html?src=SWDevHome.html'>SWDev</a>\
      <a target=_parent href='../Basics/ExploreBasics.html?src=BasicsHome.html'>Basics</a>\
      <a target=_parent href='../Code/ExploreCode.html?src=CodeHome.html'>Code</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
