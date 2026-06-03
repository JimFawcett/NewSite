/*
 * HtmlStoryPages.js - Builds HTML Story page list
 * ver 1.0 - 03 Jun 2026
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>Story Pages</div>\
    <div class='menuBody'>\
      <a href='HTMLStory_Prologue.html'>Prologue</a>\
      <a href='HTMLStory_Structure.html'>Chap 1 - Structure</a>\
      <a href='HTMLStory_Text.html'>Chap 2 - Text Content</a>\
      <a href='HTMLStory_Links.html'>Chap 3 - Links</a>\
      <a href='HTMLStory_Media.html'>Chap 4 - Media</a>\
      <a href='HTMLStory_Tables.html'>Chap 5 - Tables</a>\
      <a href='HTMLStory_Forms.html'>Chap 6 - Forms</a>\
      <a href='HTMLStory_Semantic.html'>Chap 7 - Semantic</a>\
      <a href='HTMLStory_Head.html'>Chap 8 - Head &amp; Metadata</a>\
      <a href='HTMLStory_Attributes.html'>Chap 9 - Attributes</a>\
      <a href='HTMLStory_Dom.html'>Chap 10 - DOM</a>\
      <a href='HTMLStory_Models.html'>Chap 11 - Models</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
