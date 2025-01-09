/*
 * PagesTest.js - Builds thread page list
 * ver 1.0 - 19 Dec 2024
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem menuHeader' onclick='togglePages()'>C# Bites Pages</div>\
    <div class='menuBody'>\
      <a href='CSharpHome.html'>Track Summary</a>\
      <a href='CSharpBites_Intro.html'>Introduction</a>\
      <a href='CSharpBites_Hello.html'>Hello</a>\
      <a href='CSharpBites_Data.html'>Data</a>\
      <a class='undef' href='javascript:;'>Objects</a>\
      <a class='undef' href='javascript:;'>Generics</a>\
      <a class='undef' href='javascript:;'>Iteration</a>\
      <a class='undef' href='javascript:;'>Execution</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
