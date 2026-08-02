/*
 * ComparisonStoryPages_Cpp.js - Builds C++ Comparison Story page list
 * ver 1.0 - 02 Aug 2026
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>C++ Comparison Story</div>\
    <div class='menuBody'>\
      <a href='ComparisonStory_CppTextFinder.html'>1. Introduction</a>\
      <a href='ComparisonStory_CppTextFinder_CmdLine.html'>2. CommandLine</a>\
      <a href='ComparisonStory_CppTextFinder_DirNav.html'>3. DirNav</a>\
      <a href='ComparisonStory_CppTextFinder_Output.html'>4. Output</a>\
      <a href='ComparisonStory_CppTextFinder_EntryPoint.html'>5. EntryPoint</a>\
      <a href='ComparisonStory_CppTextFinder_Conclusion.html'>6. Conclusion</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
