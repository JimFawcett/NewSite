/*
 * SpecDrivenDesignPages.js - Builds Spec-Driven Design page list
 * ver 1.0 - 10 Sep 2026
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>Spec-Driven Design</div>\
    <div class='menuBody'>\
      <a href='Spec_Driven_Design_Introduction.html'>1. Introduction</a>\
      <a href='Spec_Driven_Design_Entry.html'>2. Entry Binary</a>\
      <a href='Spec_Driven_Design_Cmdline.html'>3. Cmdline</a>\
      <a href='Spec_Driven_Design_Dirnav.html'>4. Dirnav</a>\
      <a href='Spec_Driven_Design_Output.html'>5. Output</a>\
      <a href='Spec_Driven_Design_Testing.html'>6. Testing</a>\
      <a href='Spec_Driven_Design_Demonstration.html'>7. Demonstration</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
