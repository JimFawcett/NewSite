/*
 * PagesTest.js - Builds thread page list
 * ver 1.0 - 19 Dec 2024
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>SWDev Bites Pages</div>\
    <div class='menuBody'>\
      <a href='SWDeployBites_Intro.html'>Introduction</a>\
      <a class='undef' href='javascript:;'>Process</a>\
      <a class='undef' href='javascript:;'>Scripting</a>\
      <a class='undef' href='javascript:;'>Config Mgmt</a>\
      <a class='undef' href='javascript:;'>Containers</a>\
      <a class='undef' href='javascript:;'>Platforms</a>\
      <a class='undef' href='javascript:;'>Publication</a>\
      <a class='undef' href='javascript:;'>Use Cases</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
