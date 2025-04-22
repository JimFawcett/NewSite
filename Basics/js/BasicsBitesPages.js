/*
 * PagesTest.js - Builds thread page list
 * ver 1.0 - 19 Dec 2024
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>Basics Track Pages</div>\
      <div class='menuBody'>\
        <a href='Basics_Platform.html'>Platform</a>\
        <a href='Basics_Memory.html'>Virtual memory</a>\
        <a href='Basics_Scheduling.html'>Scheduling</a>\
        <a href='Basics_Processes.html'>Processes</a>\
        <a href='Basics_IO.html'>IO</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
