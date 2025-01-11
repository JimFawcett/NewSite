/*
 * PagesTest.js - Builds thread page list
 * ver 1.0 - 19 Dec 2024
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem menuHeader' onclick='togglePages()'>Code Bites Pages</div>\
    <div class='menuBody'>\
      <a href='CodeHome.html'>Track Summary</a>\
      <a class='undefined' href='javascript:;'>Introduction</a>\
      <a class='undefined' href='javascript:;'>Building PowerShell Scripts</a>\
      <a class='undefined' href='javascript:;'>Building Bash Scripts</a>\
      <a class='undefined' href='javascript:;'>Building Projects</a>\
      <a class='undef' href='javascript:;'>more</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
