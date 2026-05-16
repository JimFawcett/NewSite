/*
 * PythonStoryPages.js - Builds Python Story page list
 * ver 1.0 - 26 Apr 2026
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>Story Pages</div>\
    <div class='menuBody'>\
      <a href='PythonStory_Prologue.html'>Prologue</a>\
      <a href='PythonStory_Models.html'>Chap 1 - Models</a>\
      <a href='PythonStory_Survey.html'>Chap 2 - Survey</a>\
      <a href='PythonStory_Data.html'>Chap 3 - Data</a>\
      <a href='PythonStory_Operations.html'>Chap 4 - Operations</a>\
      <a href='PythonStory_Classes.html'>Chap 5 - Classes</a>\
      <a href='PythonStory_ClassRelationships.html'>Chap 6 - Class Relships</a>\
      <a href='PythonStory_Generics.html'>Chap 7 - Generics</a>\
      <a href='PythonStory_Libraries.html'>Chap 8 - Libraries</a>\
      <a href='PythonStory_LibraryIO.html'>Chap 9 - I/O Library</a>\
      <a href='PythonStory_LibraryCollections.html'>Chap 10 - Collections</a>\
      <a href='PythonStory_3rdPartyLibraries.html'>Chap 11 - 3rd Party Libs</a>\
      <a href='PythonStory_Interesting.html'>Chap 12 - Interesting</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
