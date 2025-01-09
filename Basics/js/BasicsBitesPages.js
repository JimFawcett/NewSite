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
      <a href='BasicsHome.html'>Track Summary</a>\
      <a class='undefined' href='javascript:;'>Introduction</a>\
      <a class='undefined' href='javascript:;'>Platform</a>\
      <a class='undefined' href='javascript:;'>Platform memory</a>\
      <a class='undefined' href='javascript:;'>many more</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
