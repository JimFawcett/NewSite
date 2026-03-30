/*
 * PagesTest.js - Builds thread page list
 * ver 1.0 - 19 Dec 2024
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>Thread Pages</div>\
    <div class='menuBody'>\
      <a href='RepoCSharp_PubSub.html'>CsPublisherSubscriber</a>\
      <a href='RepoCSharp_Parser.html'>CsParser</a>\
      <a class='undef' href='javascript:;'>Basic Demos</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
