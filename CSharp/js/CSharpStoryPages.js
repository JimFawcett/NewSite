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
      <a href='CSharpStory_LibraryCollections.html'>Chap 10 - Collections</a>\
      <a href='CSharpStory_LibraryStreams.html'>Chap 11 - Streams</a>\
      <a href='CSharpStory_LibraryFileSystem.html'>Chap 12 - FileSystem</a>\
      <a href='CSharpStory_LibraryThreads.html'>Chap 13 - Threads</a>\
      <a href='CSharpStory_Network.html'>Chap 14 - Network</a>\
      <a href='CSharpStory_Interesting.html'>Chap 15 - Interesting</a>\
      <a href='CSharpStory_NewThings.html'>Chap 16 - New Things</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
