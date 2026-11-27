/*
 * SpecDrivenContextPages.js - Builds the Spec-Driven Context thread page list
 * ver 1.0 - 26 Nov 2026
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>Spec-Driven: Context</div>\
    <div class='menuBody'>\
      <a href='Spec_Driven_Design_Context.html'>0. Context</a>\
      <a href='LLM_ChatBots.html'>1. Chat Bots</a>\
      <a href='LLM_CLI.html'>2. CLI</a>\
      <a href='LLM_Agents.html'>3. Agents</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
