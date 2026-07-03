/*
 * SWDevUMLPages.js - page list for UML diagram narratives
 * ver 1.0 - 02 Jul 2026
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if (isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>UML Diagram Pages</div>\
    <div class='menuBody'>\
      <a href='SWDev_UML_Introduction.html'>Introduction</a>\
      <a href='SWDev_UML_Package.html'>Package</a>\
      <a href='SWDev_UML_Class.html'>Class</a>\
      <a href='SWDev_UML_Sequence.html'>Sequence</a>\
      <a href='SWDev_UML_Activity.html'>Activity</a>\
      <a href='SWDev_UML_Component.html'>Component</a>\
      <a href='SWDev_UML_State.html'>State</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
