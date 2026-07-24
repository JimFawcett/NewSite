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
      <a href='AIBites_Prologue.html'>Prologue</a>\
      <a href='AIBites_Concepts.html'>Chap 1 - AI Concepts</a>\
      <a href='AIBites_Tokens.html'>Chap 2 - Tokens &amp; Context</a>\
      <a href='AIBites_Prompts.html'>Chap 3 - Prompting</a>\
      <a href='AIBites_Models.html'>Chap 4 - Models</a>\
      <a href='AIBites_API.html'>Chap 5 - Messages API</a>\
      <a href='AIBites_Output.html'>Chap 6 - Structured Output</a>\
      <a href='AIBites_Streaming.html'>Chap 7 - Streaming</a>\
      <a href='AIBites_Caching.html'>Chap 8 - Prompt Caching</a>\
      <a href='AIBites_Tools.html'>Chap 9 - Tool Use</a>\
      <a href='AIBites_Agents.html'>Chap 10 - Agents</a>\
      <a href='AIBites_Reliability.html'>Chap 11 - Reliability</a>\
      <a href='AIBites_Context.html'>Chap 12 - Context</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
