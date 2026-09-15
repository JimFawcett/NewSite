/*
 * SpecDrivenProcessPages.js - Builds the Spec-Driven Process thread page list
 * ver 1.0 - 15 Sep 2026
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>Spec-Driven: Process</div>\
    <div class='menuBody'>\
      <a href='Spec_Driven_Design_Introduction.html'>0. Introduction</a>\
      <a href='Spec_Driven_Design_Process_Constitution.html'>1. Constitution</a>\
      <a href='Spec_Driven_Design_Process_Specification.html'>2. Specification</a>\
      <a href='Spec_Driven_Design_Process_Documents.html'>3. Documents</a>\
      <a href='Spec_Driven_Design_Process_Prose.html'>4. Prose</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
