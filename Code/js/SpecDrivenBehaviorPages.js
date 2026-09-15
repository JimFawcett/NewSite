/*
 * SpecDrivenBehaviorPages.js - Builds the Spec-Driven Behavior thread page list
 * ver 1.0 - 15 Sep 2026
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>Spec-Driven: Behavior</div>\
    <div class='menuBody'>\
      <a href='Spec_Driven_Design_Behavior_Overview.html'>0. Overview</a>\
      <a href='Spec_Driven_Design_Behavior_CommandLine.html'>1. Command Line</a>\
      <a href='Spec_Driven_Design_Behavior_Traversal.html'>2. Traversal</a>\
      <a href='Spec_Driven_Design_Behavior_Matching.html'>3. Matching</a>\
      <a href='Spec_Driven_Design_Behavior_Contracts.html'>4. Contracts</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
