/*
 * AIWorkflowsPages.js - Builds thread page list
 * ver 1.0 - 18 Jul 2026
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>AI Workflow Pages</div>\
      <div class='menuBody'>\
        <a href='AIWorkflows_Introduction.html'>Introduction</a>\
        <a href='AIWorkflows_SmallTools.html'>small tools</a>\
        <a href='AIWorkflows_SpecDriven.html'>spec-driven impl</a>\
        <a href='AIWorkflows_Analysis.html'>analysis</a>\
        <a href='AIWorkflows_Refactoring.html'>refactoring</a>\
        <a href='AIWorkflows_Vulnerabilities.html'>vulnerabilities</a>\
        <a href='AIWorkflows_Dependency.html'>dependencies</a>\
        <a href='AIWorkflows_CodeOrg.html'>code organization</a>\
        <a href='AIWorkflows_Publish.html'>publish</a>\
        <a href='AIWorkflows_TextEditing.html'>text editing</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
