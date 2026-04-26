/*
 * CSharpStoryPages.js - Builds C# Story page list
 * ver 1.0 - 26 Apr 2026
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>Story Pages</div>\
    <div class='menuBody'>\
      <a href='CSharpStory_Prologue.html'>Prologue</a>\
      <a href='CSharpStory_Models.html'>Chap 1 - Models</a>\
      <a href='CSharpStory_Survey.html'>Chap 2 - Survey</a>\
      <a href='CSharpStory_Data.html'>Chap 3 - Data</a>\
      <a href='CSharpStory_Operations.html'>Chap 4 - Operations</a>\
      <a href='CSharpStory_Classes.html'>Chap 5 - Classes</a>\
      <a href='CSharpStory_ClassRelationships.html'>Chap 6 - Class Relships</a>\
      <a href='CSharpStory_Generics.html'>Chap 7 - Generics</a>\
      <a href='CSharpStory_Reflection.html'>Chap 8 - Reflection</a>\
      <a href='CSharpStory_Libraries.html'>Chap 9 - Libraries</a>\
      <a href='CSharpStory_LibraryStreams.html'>Chap 10 - Streams</a>\
      <a href='CSharpStory_LibraryCollections.html'>Chap 11 - Collections</a>\
      <a href='CSharpStory_Interesting.html'>Chap 12 - Interesting</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
