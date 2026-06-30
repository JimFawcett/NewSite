/*
 * SWDevImpPatternsPages.js - Builds SWDev Implementation Patterns story page list
 * ver 1.0 - 29 Jun 2026
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>Impl Patterns Pages</div>\
    <div class='menuBody'>\
      <a href='SWDevImpPatterns_Prologue.html'>Prologue</a>\
      <a href='SWDevImpPatterns_Clarity.html'>Chap 1 - Clarity and Structure</a>\
      <a href='SWDevImpPatterns_Objects.html'>Chap 2 - Objects and State</a>\
      <a href='SWDevImpPatterns_Behavior.html'>Chap 3 - Behavior and Dispatch</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
