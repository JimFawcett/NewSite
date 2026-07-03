/*
 * CodeStoryPages.js - Builds Code Story page list
 * ver 1.0 - 04 May 2026
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>Project Story Pages</div>\
    <div class='menuBody'>\
      <a href='ProjectStory_Prologue.html'>Prologue</a>\
      <a href='ProjectStory_Tools.html'>Chap 1 - Dev Tools</a>\
      <a href='ProjectStory_TextFinder.html'>Chap 2 - TextFinder</a>\
      <a href='ProjectStory_PageValidator.html'>Chap 3 - PageValidator</a>\
      <a href='ProjectStory_CodeTrack.html'>Chap 4 - Code Track Map</a>\
      <a href='ProjectStory_ExperimentArena.html'>Chap 5 - Experiment Arena</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
