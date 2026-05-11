/*
 * BasicsDecCodeStoryPages.js - Builds Basics Declarative Code Story page list
 * ver 1.0 - 11 May 2026
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>Dec Code Story Pages</div>\
    <div class='menuBody'>\
      <a href='BasicsDecCodeStory_Prologue.html'>Prologue</a>\
      <a href='BasicsDecCodeStory_Expressions.html'>Chap 1 - Expressions &amp; Values</a>\
      <a href='BasicsDecCodeStory_Types.html'>Chap 2 - Types &amp; Inference</a>\
      <a href='BasicsDecCodeStory_Patterns.html'>Chap 3 - Pattern Matching</a>\
      <a href='BasicsDecCodeStory_Functions.html'>Chap 4 - Functions as Values</a>\
      <a href='BasicsDecCodeStory_Recursion.html'>Chap 5 - Recursion</a>\
      <a href='BasicsDecCodeStory_Combinators.html'>Chap 6 - Combinators</a>\
      <a href='BasicsDecCodeStory_Lazy.html'>Chap 7 - Lazy Evaluation</a>\
      <a href='BasicsDecCodeStory_Monads.html'>Chap 8 - Monads &amp; Effects</a>\
      <a href='BasicsDecCodeStory_TypeClasses.html'>Chap 9 - Type Classes</a>\
      <a href='BasicsDecCodeStory_Persistence.html'>Chap 10 - Persistent Data</a>\
      <a href='BasicsDecCodeStory_Concurrency.html'>Chap 11 - Dec Concurrency</a>\
      <a href='BasicsDecCodeStory_Queries.html'>Chap 12 - Queries &amp; Rules</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
