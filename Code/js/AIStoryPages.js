/*
 * AIStoryPages.js - Builds AI Story page list
 * ver 1.0 - 10 May 2026
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>AI Story Pages</div>\
    <div class='menuBody'>\
      <a href='AIStory_Prologue.html'>Prologue</a>\
      <a href='AIStory_Concepts.html'>Chap 1 - AI Concepts</a>\
      <a href='AIStory_Tokens.html'>Chap 2 - Tokens &amp; Context</a>\
      <a href='AIStory_Prompts.html'>Chap 3 - Prompting</a>\
      <a href='AIStory_Models.html'>Chap 4 - Models</a>\
      <a href='AIStory_API.html'>Chap 5 - Messages API</a>\
      <a href='AIStory_Output.html'>Chap 6 - Structured Output</a>\
      <a href='AIStory_Streaming.html'>Chap 7 - Streaming</a>\
      <a href='AIStory_Caching.html'>Chap 8 - Prompt Caching</a>\
      <a href='AIStory_Tools.html'>Chap 9 - Tool Use</a>\
      <a href='AIStory_Agents.html'>Chap 10 - Agents</a>\
      <a href='AIStory_Reliability.html'>Chap 11 - Reliability</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
