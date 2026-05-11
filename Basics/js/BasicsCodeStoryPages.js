/*
 * BasicsCodeStoryPages.js - Builds Basics Code Story page list
 * ver 1.0 - 11 May 2026
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>Code Story Pages</div>\
    <div class='menuBody'>\
      <a href='BasicsCodeStory_Prologue.html'>Prologue</a>\
      <a href='BasicsCodeStory_Data.html'>Chap 1 - Data</a>\
      <a href='BasicsCodeStory_Variables.html'>Chap 2 - Variables &amp; Binding</a>\
      <a href='BasicsCodeStory_Operators.html'>Chap 3 - Operators</a>\
      <a href='BasicsCodeStory_ControlFlow.html'>Chap 4 - Control Flow</a>\
      <a href='BasicsCodeStory_Functions.html'>Chap 5 - Functions</a>\
      <a href='BasicsCodeStory_Lambdas.html'>Chap 6 - Lambdas &amp; Closures</a>\
      <a href='BasicsCodeStory_ErrorHandling.html'>Chap 7 - Error Handling</a>\
      <a href='BasicsCodeStory_Memory.html'>Chap 8 - Memory Management</a>\
      <a href='BasicsCodeStory_Modules.html'>Chap 9 - Modules &amp; Namespaces</a>\
      <a href='BasicsCodeStory_Concurrency.html'>Chap 10 - Concurrency</a>\
      <a href='BasicsCodeStory_Generics.html'>Chap 11 - Generics &amp; Polymorphism</a>\
      <a href='BasicsCodeStory_Metaprogramming.html'>Chap 12 - Metaprogramming</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
