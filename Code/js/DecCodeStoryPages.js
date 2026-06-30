/*
 * BasicsDecCodeStoryPages.js - Builds Basics Declarative Code Story page list
 * ver 1.0 - 11 May 2026
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>Declarative Code Story Pages</div>\
    <div class='menuBody'>\
      <a href='DecCodeStory_Prologue.html'>Prologue</a>\
      <a href='DecCodeStory_Expressions.html'>Chap 1 - Expressions &amp; Values</a>\
      <a href='DecCodeStory_Types.html'>Chap 2 - Types &amp; Inference</a>\
      <a href='DecCodeStory_Patterns.html'>Chap 3 - Pattern Matching</a>\
      <a href='DecCodeStory_Functions.html'>Chap 4 - Functions as Values</a>\
      <a href='DecCodeStory_Recursion.html'>Chap 5 - Recursion</a>\
      <a href='DecCodeStory_Combinators.html'>Chap 6 - Combinators</a>\
      <a href='DecCodeStory_Lazy.html'>Chap 7 - Lazy Evaluation</a>\
      <a href='DecCodeStory_Monads.html'>Chap 8 - Monads &amp; Effects</a>\
      <a href='DecCodeStory_TypeClasses.html'>Chap 9 - Type Classes</a>\
      <a href='DecCodeStory_Persistence.html'>Chap 10 - Persistent Data</a>\
      <a href='DecCodeStory_Concurrency.html'>Chap 11 - Dec Concurrency</a>\
      <a href='DecCodeStory_Queries.html'>Chap 12 - Queries &amp; Rules</a>\
      <a href='DecCodeStory_Projects.html'>Chap 13 - Projects</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
