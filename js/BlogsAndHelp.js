/*
 * BlogsAndHelp.js - Builds Blogs and Help dropdown list
 * ver 1.0 - 19 Dec 2024
 * Jim Fawcett
 */

function getLeft(id) {
  
}
function moveLeft(id) {
  const element = document.getElementById(id);
  if(isDefined(element)) {
    const currentLeft = parseFloat(getComputedStyle(element).left) || 0;
    const remSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const moveBy = 5 * remSize;
    element.style.left = `${currentLeft - moveBy}px`;  
  }
}

function toggleBlogs() {
  console.log("in toggleBlogs()");
  const blg = document.getElementById('blogs');
  console.log(blg);
  if(isDefined(blg)) {
    hideHelp();
    hideRes();
    // moveLeft('blogs');
    blg.classList.toggle('hidden');
    console.log(blg);
  }
}

function hideBlogs() {
  const blg = document.getElementById('blogs');
  if(isDefined(blg)) {
    blg.classList.add('hidden');
  }
}

function buildBlogs() {
  const blg = document.getElementById('blogs');
  if(isDefined(blg)) {
    // alert('in buildBlogs');
    blg.innerHTML =
    "<div class='darkItem menuHeader' onclick='hideBlogs()'>Blogs</div>\
    <div class='menuBody'>\
      <a href='../Site/Explore.html?src=../Blogs/Blog_Prototype.html'>Blog_Prototype</a>\
      <a href='../Site/Explore.html?src=../Blogs/Blog_CommCompare.html'>Comm Compare</a>\
      <a href='../Site/Explore.html?src=../Blogs/Blog.html'>First Things</a>\
      <a class='undef' href='javascript:;'>Rust Safety</a>\
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
    // const blg = document.getElementById('blogs');
    hideBlogs();
    hideRes();
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
  const hlp = document.getElementById('help');
  if(isDefined(hlp)) {
    hlp.innerHTML =
    "<div class='darkItem menuHeader' onclick='hideHelp()'>Help</div>\
    <div class='menuBody'>\
      <a target='_self' href='../Code/ExploreCode.html?src=../Help/Help_VSCode.html'>VS Code</a>\
      <a target='_self' href='../Code/ExploreCode.html?src=../Help/Help_Cargo.html'>Rust Cargo</a>\
      <a target='_self' href='../Code/ExploreCode.html?src=../Help/Help_CMake.html'>CMake</a>\
      <a class='undef' target='_self' href='javascript:;'>MSBuild</a>\
      <a target='_self' href='../Code/ExploreCode.html?src=../Help/Help_DotNet.html'>DotNet</a>\
      <a target='_self' href='../Code/ExploreCode.html?src=../Help/Help_Git.html'>Git</a>\
      <a target='_self' href='../Code/ExploreCode.html?src=../Help/Help_GitHub.html'>GitHub</a>\
      <a target='_self' href='../Code/ExploreCode.html?src=../Help/Help_PowerShell.html'>PowerShell</a>\
      <a target='_self' href='../Code/ExploreCode.html?src=../Help/Help_RegEx.html'>RegEx</a>\
      <a target='_self' href='../Code/ExploreCode.html?src=../Help/Help_ChatGPT.html'>ChatGPT</a>\
      <a class='undef' target='_self' href='javascript:;'>Compiler Explorer</a>\
      <a target='_self' href='../Site/Explore.html?src=../Help/Help_SiteNav.html'>SiteNav</a>\
      <div style='height:1.0em;'></div>\
    </div>";
    hlp.addEventListener('mouseleave', function(event) {
      hlp.classList.add('hidden')
    });
  }
}


function toggleRes() {
  const res = document.getElementById('res');
  if(isDefined(res)) {
    hideBlogs();
    hideHelp();
    res.classList.toggle('hidden');
  }
}

function hideRes() {
  const res = document.getElementById('res');
  if(isDefined(res)) {
    res.classList.add('hidden');
  }
}

function buildRes() {
  const res = document.getElementById('res');
  if(isDefined(res)) {
    res.innerHTML =
    "<div class='darkItem menuHeader' onclick='hideRes()'>Resources</div>\
    <div class='menuBody'>\
      <div class='category'>-online execution-</div>\
      <a target='_blank' href='https://godbolt.org'>Compiler Explorer</a>\
      <a target='_blank' href='https://play.rust-lang.org'>Rust Playground</a>\
      <a target='_blank' href='https://dotnetfiddle.net'>dotnet fiddle</a>\
      <a target='_blank' href='https://python-fiddle.com'>Python fiddle</a>\
      <a target='_blank' href='https://runjs.app/play'>runjs</a>\
      <div class='category'>-Tests-</div>\
      <a target='_self' href='../Tests/GridExplorer/PrototypeExplore.html'>GridExplorer</a>\
      <a target='_self' href='../Tests/FigureSizer/ImageSizer.html'>FigureSizer</a>\
      <a target='_self' href='../Tests/link-navigator/linkNav.html'>linkNav</a>\
      <a target='_self' href='../Tests/PopUpWindow/PopUp.html'>PopUpWindow</a>\
      <a target='_self' href='../Tests/PositionElements/PosElem.html'>PositionElements</a>\
      <a target='_self' href='../Tests/scrollingMenus/ScrollingMenus.html'>ScrollingMenus</a>\
      <a target='_self' href='../Tests/Clickables/Clickables2.html'>Clickables2</a>\
      <div class='category'>-presentations-</div>\
      <a target='_blank' href='https://jimfawcett.github.io/ChatGPT.html'>ChatGPT Demo</a>\
      <a target='_blank' href='https://jimfawcett.github.io/personalComputerSecurity.html'>Computer Security</a>\
      <div class='category'>-neighborhoods-</div>\
      <a target='_blank' href='https://jimfawcett.github.io/'>Old Site</a>\
      <a target='_blank' href='https://ecs.syr.edu/faculty/fawcett'>SU Site</a>\
      <div style='height:1.0em;'></div>\
    </div>";
    res.addEventListener('mouseleave', function(event) {
      res.classList.add('hidden')
    });
  }
}
