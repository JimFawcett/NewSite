/*
 * WebDevStoryPages.js - Builds WebDev Story page list
 * ver 1.0 - 28 Apr 2026
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>Story Pages</div>\
    <div class='menuBody'>\
      <a href='WebDevStory_Prologue.html'>Prologue</a>\
      <a href='WebDevStory_HtmlElements.html'>Chap 1 - HTML Elements</a>\
      <a href='WebDevStory_HtmlDom.html'>Chap 2 - HTML DOM</a>\
      <a href='WebDevStory_HtmlModels.html'>Chap 3 - HTML Models</a>\
      <a href='WebDevStory_HtmlForms.html'>Chap 4 - HTML Forms</a>\
      <a href='WebDevStory_JavaScript_Summary.html'>Chap 5 - JS Summary</a>\
      <a href='WebDevStory_JavaScript_Objects.html'>Chap 6 - JS Objects</a>\
      <a href='WebDevStory_JavaScript_Dom.html'>Chap 7 - JS DOM &amp; Styles</a>\
      <a href='WebDevStory_JavaScript_Async.html'>Chap 8 - JS Async</a>\
      <a href='WebDevStory_CSS_Summary.html'>Chap 9 - CSS Summary</a>\
      <a href='WebDevStory_CSS_Layout.html'>Chap 10 - CSS Layout</a>\
      <a href='WebDevStory_CSS_Features.html'>Chap 11 - CSS Features</a>\
      <a href='WebDevStory_CSS_Positioning.html'>Chap 12 - CSS Positioning</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
