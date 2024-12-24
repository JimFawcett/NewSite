/*
 * BlogsAndHelp.js - Builds Blogs and Help dropdown list
 * ver 1.0 - 19 Dec 2024
 * Jim Fawcett
 */

function toggleBlogs() {
  const blg = document.getElementById('blogs');
  if(isDefined(blg)) {
    let hlp = document.getElementById('help');
    if(isDefined(hlp)) {
      hideHelp();
    }
    blg.classList.toggle('hidden');
  }
}

function hideBlogs() {
  const blg = document.getElementById('blogs');
  if(isDefined(blg)) {
    blg.classList.add('hidden');
  }
}

function buildBlogs() {
  alert('in buildBlogs()');
  const blg = document.getElementById('blogs');
  if(isDefined(blg)) {
    blg.innerHTML =
    "<div class='darkItem menuHeader' onclick='hideBlogs()'>Blogs</div>\
    <div class='menuBody'>\
      <a href='Blog1.html'>Blog1</a>\
      <a href='Blog1.html'>Blog2</a>\
      <div style='height:0.5em;'></div>\
    </div>";
    blg.addEventListener('mouseleave', function(event) {
      blg.classList.add('hidden')
    });  
  }
}

function toggleHelp() {
  const hlp = document.getElementById('help');
  if(isDefined(hlp)) {
    const blg = document.getElementById('blogs');
    hideBlogs();
    hlp.classList.toggle('hidden');
  }
}

function hideHelp() {
  const hlp = document.getElementById('help');
  if(isDefined(hlp)) {
    hlp.classList.add('hidden');
  }
}

function buildHelp() {
  alert('in buildHelp()');
  const hlp = document.getElementById('help');
  if(isDefined(hlp)) {
    hlp.innerHTML =
    "<div class='darkItem menuHeader' onclick='hideHelp()'>Help</div>\
    <div class='menuBody'>\
      <a target='_blank' href='../Rust/ExploreRust.html?src=../Help_VSCode.html'>VS Code</a>\
      <a target='_blank' href='../Rust/ExploreRust.html?src=../Help_Cargo.html'>Rust Cargo</a>\
      <a target='_blank' href='../Rust/ExploreRust.html?src=../Help_CMake.html'>CMake</a>\
      <a target='_blank' href='../Rust/ExploreRust.html?src=../Help_DotNet.html'>DotNet</a>\
      <a target='_blank' href='../Rust/ExploreRust.html?src=../Help_Git.html'>Git</a>\
      <a target='_blank' href='../Rust/ExploreRust.html?src=../Help_GitHub.html'>GitHub</a>\
      <a target='_blank' href='../Rust/ExploreRust.html?src=../Help_PowerShell.html'>PowerShell</a>\
      <a target='_blank' href='../Rust/ExploreRust.html?src=../Help_RegEx.html'>RegEx</a>\
      <a target='_blank' href='../Rust/ExploreRust.html?src=../Help_ChatGPT.html'>ChatGPT</a>\
      <a target='_blank' href='../Rust/ExploreRust.html?src=../Help_SiteNav.html'>SiteNav</a>\
      <div style='height:1.0em;'></div>\
    </div>";
    hlp.addEventListener('mouseleave', function(event) {
      hlp.classList.add('hidden')
    });
  }
}

