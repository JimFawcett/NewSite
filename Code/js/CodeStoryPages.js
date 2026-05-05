/*
 * CodeStoryPages.js - Builds Code Story page list
 * ver 1.0 - 04 May 2026
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>Story Pages</div>\
    <div class='menuBody'>\
      <a href='CodeStory_Prologue.html'>Prologue</a>\
      <a href='CodeStory_ExperimentArena.html'>Chap 1 - Experiment Arena</a>\
      <a href='CodeStory_ChatBots.html'>Chap 2 - Chat Bots</a>\
      <a href='CodeStory_CLI.html'>Chap 3 - Code AI CLI</a>\
      <a href='CodeStory_LLM_API.html'>Chap 4 - LLM API</a>\
      <a href='CodeStory_AgentAI.html'>Chap 5 - Agent AI</a>\
      <a href='CodeStory_AgenticAI.html'>Chap 6 - Agentic AI</a>\
      <a href='CodeStory_SkillsAI.html'>Chap 7 - Skills AI</a>\
      <a href='CodeStory_SpecDev.html'>Chap 8 - Spec-Driven Dev</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
