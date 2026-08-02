/*
 * ComparisonStoryPages_rs.js - Builds Rust Comparison Story page list
 * ver 1.2 - 02 Aug 2026
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>Rust Comparison Story</div>\
    <div class='menuBody'>\
      <a href='ComparisonStory_rs_textfinder_opt.html'>1. Introduction</a>\
      <a href='ComparisonStory_rs_textfinder_opt_CmdLine.html'>2. RustCmdLine</a>\
      <a href='ComparisonStory_rs_textfinder_opt_DirNav.html'>3. RustDirNav</a>\
      <a href='ComparisonStory_rs_textfinder_Output.html'>4. Output</a>\
      <a href='ComparisonStory_rs_textfinder_opt_TextFinder.html'>5. RustTextFinder</a>\
      <a href='ComparisonStory_rs_textfinder_opt_Conclusion.html'>6. Conclusion</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
