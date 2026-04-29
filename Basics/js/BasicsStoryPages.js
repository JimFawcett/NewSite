/*
 * BasicsStoryPages.js - Builds Basics Story page list
 * ver 1.0 - 29 Apr 2026
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>Basics Story Pages</div>\
    <div class='menuBody'>\
      <a href='BasicsStory_Prologue.html'>Prologue</a>\
      <a href='BasicsStory_Hardware.html'>Chap 1 - Hardware</a>\
      <a href='BasicsStory_Software.html'>Chap 2 - Software</a>\
      <a href='BasicsStory_Languages.html'>Chap 3 - Languages</a>\
      <a href='BasicsStory_Tooling.html'>Chap 4 - Tooling</a>\
      <a href='BasicsStory_DataStructures.html'>Chap 5 - Data Structures</a>\
      <a href='BasicsStory_Concurrency.html'>Chap 6 - Concurrency</a>\
      <a href='BasicsStory_Deployment.html'>Chap 7 - Deployment</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
