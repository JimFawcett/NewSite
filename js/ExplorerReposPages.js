/*
 * ExplorerReposPages.js - Builds thread page list
 * ver 1.0 - 06 May 2026
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>Explore Repos Pages</div>\
    <div class='menuBody'>\
      <a target='_parent' href='../Rust/ExploreReposRust.html'>Rust</a>\
      <a target='_parent' href='../Cpp/ExploreReposCpp.html'>C++</a>\
      <a target='_parent' href='../CSharp/ExploreReposCSharp.html'>C#</a>\
      <a target='_parent' href='../Python/ExploreReposPython.html'>Python</a>\
      <a target='_parent' href='../WebDev/ExploreReposWebDev.html'>WebDev</a>\
      <a target='_parent' href='../SWDev/ExploreReposSWDev.html'>SWDev</a>\
      <a target='_parent' href='../Code/ExploreReposCode.html'>Code</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
