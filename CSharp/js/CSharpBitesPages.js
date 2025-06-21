/*
 * PagesTest.js - Builds thread page list
 * ver 1.0 - 19 Dec 2024
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>C# Bites Pages</div>\
    <div class='menuBody'>\
      <a href='CSharpBites_Intro.html'>Introduction</a>\
      <a href='CSharpBites_Execution.html'>Execution</a>\
      <a href='CSharpBites_HelloCSharp.html'>Hello</a>\
      <a href='CSharpBites_Data.html'>Data</a>\
      <a href='CSharpBites_Objects.html'>Objects</a>\
      <a href='CSharpBites_Generics.html'>Generics</a>\
      <a href='CSharpBites_Iteration.html'>Iteration</a>\
      <a href='CSharpBites_Glossary.html'>Glossary</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
