/*
 * PagesTest.js - Builds thread page list
 * ver 1.0 - 19 Dec 2024
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem menuHeader' onclick='togglePages()'>Help Pages</div>\
    <div class='menuBody'>\
      <a href='Help_VSCode.html'>VS Code</a>\
      <a href='Help_Cargo.html'>Rust Cargo</a>\
      <a href='Help_CMake.html'>CMake</a>\
      <a href='Help_DotNet.html'>DotNet</a>\
      <a href='Help_Git.html'>Git</a>\
      <a href='Help_GitHub.html'>GitHub</a>\
      <a href='Help_PowerShell.html'>PowerShell</a>\
      <a href='Help_RegEx.html'>RegEx</a>\
      <a href='Help_ChatGPT.html'>ChatGPT</a>\
      <a href='Help_SiteNav.html'>SiteNav</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
