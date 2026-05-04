/*
 * SWDevStoryPages.js - Builds SWDev Story page list
 * ver 1.0 - 03 May 2026
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>Story Pages</div>\
    <div class='menuBody'>\
      <a href='SWDevStory_Prologue.html'>Prologue</a>\
      <a href='SWDevStory_Design.html'>Chap 1 - Software Design</a>\
      <a href='SWDevStory_Structure.html'>Chap 2 - Design Structure</a>\
      <a href='SWDevStory_Patterns.html'>Chap 3 - Structural Patterns</a>\
      <a href='SWDevStory_AdvancedPatterns.html'>Chap 4 - Advanced Patterns</a>\
      <a href='SWDevStory_Process.html'>Chap 5 - Dev Process</a>\
      <a href='SWDevStory_Git.html'>Chap 6 - Config Management</a>\
      <a href='SWDevStory_Scripting.html'>Chap 7 - Scripting</a>\
      <a href='SWDevStory_Deployment.html'>Chap 8 - Deployment</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
