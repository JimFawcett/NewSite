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
      <a href='CodeStory_CodeTrack.html'>Chap 1 - Code Track Map</a>\
      <a href='CodeStory_ExperimentArena.html'>Chap 2 - Experiment Arena</a>\
      <a href='CodeStory_TextFinder.html'>Chap 3 - TextFinder</a>\
      <a href='CodeStory_PageValidator.html'>Chap 4 - PageValidator</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
