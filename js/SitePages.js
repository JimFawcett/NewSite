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
      <a href='SiteMap.html'>Site Map</a>\
      <a href='SiteDemo.html'>Site Demo</a>\
      <a href='SiteDesign.html'>Site Design</a>\
      <a class='undef' href='javascript:;'>References</a>\
      <a class='undef' href='javascript:;'>Recent Changes</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
