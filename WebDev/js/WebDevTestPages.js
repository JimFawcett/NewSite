/*
 * WebDevBitesPages.js - Builds thread page list
 * ver 1.0 - 19 Dec 2024
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>WebDev Test Pages</div>\
    <div class='menuBody'>\
      <a href='WebDevBites_Tests.html'>Tests</a>\
      <a href='WebDevBites_Test_DropDownList.html'>DropDown List</a>\
      <a href='WebDevBites_Test_BookMarks.html'>BookMarks</a>\
      <a href='WebDevBites_Test_LinkNavigator.html'>Link Navigator</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
