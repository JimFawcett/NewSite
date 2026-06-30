/*
 * SWDevPatternsPages.js - Builds SWDev Patterns story page list
 * ver 1.0 - 29 Jun 2026
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>Design Patterns Pages</div>\
    <div class='menuBody'>\
      <a href='SWDevPatterns_Prologue.html'>Prologue</a>\
      <a href='SWDevPatterns_Behavioral.html'>Chap 1 - Behavioral Patterns</a>\
      <a href='SWDevPatterns_Creational.html'>Chap 2 - Creational Patterns</a>\
      <a href='SWDevPatterns_Structural.html'>Chap 3 - Structural Patterns</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
