/*
 * PagesTest.js - Builds thread page list
 * ver 1.0 - 19 Dec 2024
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem menuHeader' onclick='togglePages()'>Basics Track Pages</div>\
    <div class='menuBody'>\
      <a href='Basic_Platform.html'>Platform</a>\
      <a class='undef' href='javascript:;'>Platform memory</a>\
      <a class='undef' href='javascript:;'>many more</a>\
      <hr style='margin:0.5rem 0rem;'>\
      <a href='BasicsHome.html'>Basics Track Summary</a>\
    </div>\
    <div style='height:0.5em;'></div>";
  }
}
