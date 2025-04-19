/*
 * PagesTest.js - Builds thread page list
 * ver 1.0 - 19 Dec 2024
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>Cpp Story Pages</div>\
    <div class='menuBody'>\
      <a href='CppStory_Prologue.html'>Prologue</a>\
      <a href='CppStory_Models.html'>Models</a>\
      <a href='CppStory_Survey.html'>Survey</a>\
      <a href='CppStory_Data.html'>Data</a>\
      <a href='CppStory_Operations.html'>Operations</a>\
      <a href='CppStory_Classes.html'>Classes</a>\
      <a href='CppStory_ClassRelationships.html'>Class Relationships</a>\
      <a href='CppStory_Templates.html'>Templates</a>\
      <a href='CppStory_TemplateMetaprog.html'>Template Meta Prog&apos;g</a>\
      <a href='CppStory_Libraries.html'>Libraries</a>\
      <a href='CppStory_LibraryStreams.html'>Streams</a>\
      <a href='CppStory_LibrarySTL.html'>STL</a>\
      <a href='CppStory_Interesting.html'>Interesting</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
