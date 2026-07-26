/*
 * AIBitesPages.js - Builds AI Bites page list
 * ver 1.0 - 10 May 2026
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>AI Bites Pages</div>\
    <div class='menuBody'>\
      <a href='BasicsAIStory_Prologue.html'>Prologue</a>\
      <a href='BasicsAIStory_Concepts.html'>Chap 1 - AI Concepts</a>\
      <a href='BasicsAIStory_Tokens.html'>Chap 2 - Tokens &amp; Context</a>\
      <a href='BasicsAIStory_Prompts.html'>Chap 3 - Prompting</a>\
      <a href='BasicsAIStory_Models.html'>Chap 4 - Models</a>\
      <a href='BasicsAIStory_API.html'>Chap 5 - Messages API</a>\
      <a href='BasicsAIStory_Output.html'>Chap 6 - Structured Output</a>\
      <a href='BasicsAIStory_Streaming.html'>Chap 7 - Streaming</a>\
      <a href='BasicsAIStory_Caching.html'>Chap 8 - Prompt Caching</a>\
      <a href='BasicsAIStory_Tools.html'>Chap 9 - Tool Use</a>\
      <a href='BasicsAIStory_Agents.html'>Chap 10 - Agents</a>\
      <a href='BasicsAIStory_Reliability.html'>Chap 11 - Reliability</a>\
      <a href='BasicsAIStory_Context.html'>Chap 12 - Context</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
