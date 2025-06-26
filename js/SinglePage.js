/*
 * PagesTest.js - Builds thread page list
 * ver 1.0 - 19 Dec 2024
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>No Thread Page</div>\
    <div class='menuBody'>\
      <div>Only page in Thread</div>\
      <a href='SiteMap.html'>Site Map</a>\
      <a href='SiteDemo.html'>Site Demo</a>\
      <a href='SiteDesign.html'>Site Design</a>\
      <a href='SiteRepos.html'>Site Repos</a>\
      <a class='undef' href='javascript:;'>Recent Changes</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
