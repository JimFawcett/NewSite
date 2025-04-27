/*
 * PagesTest.js - Builds thread page list
 * ver 1.0 - 19 Dec 2024
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>Help Bites Pages</div>\
    <div class='menuBody'>\
      <a href='Help_VSCode.html'>VSCode</a>\
      <a href='Help_Cargo.html'>Rust Cargo</a>\
      <a href='Help_CMake.html'>CMake</a>\
      <a class='undef' href='javascript:;'>MsBuild</a>\
      <a href='Help_DotNet.html'>DotNet</a>\
      <a href='Help_Git.html'>Git</a>\
      <a class='undef' href='javascript:;'>GitHub</a>\
      <a href='Help_PowerShell.html'>PowerShell</a>\
      <a href='Help_ChatGPT.html'>ChatGPT</a>\
      <a class='undef' href='javascript:;'>CompilerExplorer</a>\
      <a href='Help_SiteNav.html'>SiteNav</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
