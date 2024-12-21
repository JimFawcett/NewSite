/*
 * PagesTest.js - Builds thread page list
 * ver 1.0 - 19 Dec 2024
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem menuHeader' onclick='togglePages()'>Thread Pages</div>\
    <div class='menuBody'>\
      <a href='SiteHome.html'>Site Home</a>\
      <a href='SiteMap.html'>Site Map</a>\
      <a href='SiteDemo.html'>Site Demo</a>\
      <a href='SiteDesign.html'>Site Design</a>\
      <a href='SiteReferences.html'>References</a>\
      <a href='Test5.html'>Test5</a>\
      <a href='Test6.html'>Test6</a>\
      <a href='Test7.html'>Test7</a>\
      <a href='Test8.html'>Test8</a>\
      <a href='Test9.html'>Test9</a>\
      <a href='Test8.html'>Test8</a>\
      <a href='Test7.html'>Test7</a>\
      <a href='Test6.html'>Test6</a>\
      <a href='Test5.html'>Test5</a>\
      <a href='Test4.html'>Test4</a>\
      <a href='Test3.html'>Test3</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
