/*
 * PagesTest.js - Builds thread page list
 * ver 1.0 - 19 Dec 2024
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>Code Bites Pages</div>\
      <div class='menuBody'>\
        <a href='AIBites_Introduction.html'>Introduction</a>\
        <a href='AIBites_AI_Self_Assessment.html'>AI self assessment</a>\
        <a href='AIBites_Useage_Examples.html'>example uses</a>\
        <a href='AIBites_ChatBotAI.html'>AI chat bots</a>\
        <a href='AIBites_CodeAI.html'>AI consoles</a>\
        <a href='AIBites_PromptPatterns.html'>prompt patterns</a>\
        <a href='AIBites_AgentAI.html'>AI agents</a>\
        <a href='AIBites_AgenticAI.html'>agentic AI</a>\
        <a href='AIBites_SpecDev.html'>spec-driven dev</a>\
        <a href='AIBites_SkillsAI.html'>AI Skills</a>\
        <a href='AIBites_LLM_API.html'>LLM API</a>\
        <a href='AIBites_AI_Links.html'>AI Links</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
