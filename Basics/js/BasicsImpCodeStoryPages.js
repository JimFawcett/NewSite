/*
 * BasicsImpCodeStoryPages.js - Builds Basics Code Story page list
 * ver 1.0 - 11 May 2026
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>Imperative Code Story Pages</div>\
    <div class='menuBody'>\
      <a href='BasicsImpCodeStory_Prologue.html'>Prologue</a>\
      <a href='BasicsImpCodeStory_Data.html'>Chap 1 - Data</a>\
      <a href='BasicsImpCodeStory_Variables.html'>Chap 2 - Variables &amp; Binding</a>\
      <a href='BasicsImpCodeStory_Operators.html'>Chap 3 - Operators</a>\
      <a href='BasicsImpCodeStory_ControlFlow.html'>Chap 4 - Control Flow</a>\
      <a href='BasicsImpCodeStory_Functions.html'>Chap 5 - Functions</a>\
      <a href='BasicsImpCodeStory_Lambdas.html'>Chap 6 - Lambdas &amp; Closures</a>\
      <a href='BasicsImpCodeStory_ErrorHandling.html'>Chap 7 - Error Handling</a>\
      <a href='BasicsImpCodeStory_Memory.html'>Chap 8 - Memory Management</a>\
      <a href='BasicsImpCodeStory_Modules.html'>Chap 9 - Modules &amp; Namespaces</a>\
      <a href='BasicsImpCodeStory_Concurrency.html'>Chap 10 - Concurrency</a>\
      <a href='BasicsImpCodeStory_Generics.html'>Chap 11 - Generics &amp; Polymorphism</a>\
      <a href='BasicsImpCodeStory_Metaprogramming.html'>Chap 12 - Metaprogramming</a>\
      <a href='BasicsImpCodeStory_Projects.html'>Chap 13 - Projects</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
