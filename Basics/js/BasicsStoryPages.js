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
      <a href='BasicsStory_Networks.html'>Chap 3 - Networks</a>\
      <a href='BasicsStory_Internet.html'>Chap 4 - Internet &amp; Wi-Fi</a>\
      <a href='BasicsStory_DataCenters.html'>Chap 5 - Data Centers</a>\
      <a href='BasicsStory_Languages.html'>Chap 6 - Languages</a>\
      <a href='BasicsStory_Tooling.html'>Chap 7 - Tooling</a>\
      <a href='BasicsStory_DataStructures.html'>Chap 8 - Data Structures</a>\
      <a href='BasicsStory_Concurrency.html'>Chap 9 - Concurrency</a>\
      <a href='BasicsStory_Deployment.html'>Chap 10 - Deployment</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
