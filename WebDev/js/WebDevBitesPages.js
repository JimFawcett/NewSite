/*
 * WebDevBitesPages.js - Builds thread page list
 * ver 1.0 - 19 Dec 2024
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>WebDev Bites Pages</div>\
    <div class='menuBody'>\
      <a href='WebDevBites_Html.html'>HTML</a>\
      <a href='WebDevBites_HtmlDom.html'>HTML DOM</a>\
      <a href='WebDevBites_Css.html'>CSS Styles</a>\
      <a href='WebDevBites_JavaScript.html'>JavaScript</a>\
      <a href='WebDevBites_WebComponents.html'>Web Components</a>\
      <a href='WebDevBites_Glossary.html'>Glossary</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
