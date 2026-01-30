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
        <a href='CodeBites_Introduction.html'>Introduction</a>\
        <a href='CodeBites_AI_Self_Assessment.html'>AI self assessment</a>\
        <a href='CodeBites_Useage_Examples.html'>example uses</a>\
        <a href='CodeBites_ChatBotAI.html'>AI chat bots</a>\
        <a href='CodeBites_AgentAI.html'>AI agents</a>\
        <a href='CodeBites_CodeAI.html'>AI consoles</a>\
        <a href='CodeBites_LLM_API.html'>LLM API</a>\
        <a href='CodeBites_AgenticAI.html'>agentic AI</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
