/*
 * PagesTest.js - Builds thread page list
 * ver 1.0 - 19 Dec 2024
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>Rust Story Pages</div>\
    <div class='menuBody'>\
      <a href='RustStory_Prologue.html'>Introduction</a>\
      <a href='RustStory_Models.html'>Models</a>\
      <a href='RustStory_Data.html'>Data</a>\
      <a href='RustStory_Operations.html'>Operations</a>\
      <a href='RustStory_Structures.html'>Structures</a>\
      <a href='RustStory_Libraries.html'>Libraries</a>\
      <a href='RustStory_References.html'>References</a>\
      <a href='RustStory_CodeIndex.html'>Code Index</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
