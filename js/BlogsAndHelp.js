/*
 * BlogsAndHelp.js - Builds Blogs and Help dropdown list
 * ver 1.0 - 19 Dec 2024
 * Jim Fawcett
 */

// function getLeft(id) {
  
// }
// function moveLeft(id) {
//   const element = document.getElementById(id);
//   if(isDefined(element)) {
//     const currentLeft = parseFloat(getComputedStyle(element).left) || 0;
//     const remSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
//     const moveBy = 5 * remSize;
//     element.style.left = `${currentLeft - moveBy}px`;  
//   }
// }

function toggleBlogs() {
  console.log("in toggleBlogs()");
  const blg = document.getElementById('blogs');
  console.log(blg);
  if(isDefined(blg)) {
    hideHelp();
    hideRes();
    toggleElement('blogs');
    align('mblogs', 'blogs');
  }
}

function hideBlogs() {
  const blg = document.getElementById('blogs');
  if(isDefined(blg)) {
    hideElement('blogs');
  }
}

function showBlogs() {
  const blg = document.getElementById('blogs');
  if(isDefined(blg)) {
    showElement('blogs');
  }
}

function initBlogs() {
  const blg = document.getElementById('blogs');
  if(isDefined(blg)) {
    align('mblogs', 'blogs');
  }
}

function buildBlogs() {
  const blg = document.getElementById('blogs');
  if(isDefined(blg)) {
    blg.innerHTML =
    "<div class='darkItem menuHeader' onclick='hideBlogs()'>Blogs</div>\
    <div class='menuBody'>\
      <a href='../Site/Explore.html?src=../Blogs/Blog_Prototype.html'>Blog_Prototype</a>\
      <a href='../Site/Explore.html?src=../Blogs/Blog_CommCompare.html'>Comm Compare</a>\
      <a href='../Site/Explore.html?src=../Blogs/Blog.html'>First Things</a>\
      <a class='undef' href='javascript:;'>Rust Safety</a>\
      <div style='height:0.5em;'></div>\
    </div>";
    // blg.addEventListener('mouseleave', function(event) {
    //   blg.classList.add('hidden')
    // });  
  }
}

function toggleHelp() {
  const hlp = document.getElementById('help');
  if(isDefined(hlp)) {
    hideBlogs();
    hideRes();
    toggleElement('help');
    align('mhelp', 'help');
  }
}

function hideHelp() {
  const hlp = document.getElementById('help');
  if(isDefined(hlp)) {
    hideElement('help');
  }
}

function showHelp() {
  const hlp = document.getElementById('help');
  if(isDefined(hlp)) {
    showElement('help');
  }
}

function initHelp() {
  const hlp = document.getElementById('help');
  if(isDefined(hlp)) {
    align('mhelp', 'help');
  }
}

function buildHelp() {
  const hlp = document.getElementById('help');
  if(isDefined(hlp)) {
    hlp.innerHTML =
    "<div class='darkItem menuHeader' onclick='hideHelp()'>Help</div>\
    <div class='menuBody'>\
      <a target='rpanel' href='../Help/Help_VSCode.html'>VS Code</a>\
      <a target='rpanel' href='../Help/Help_Cargo.html'>Rust Cargo</a>\
      <a target='rpanel' href='../Help/Help_CMake.html'>CMake</a>\
      <a class='undef' target='_self' href='javascript:;'>MSBuild</a>\
      <a target='rpanel' href='../Help/Help_DotNet.html'>DotNet</a>\
      <a target='rpanel' href='../Help/Help_Git.html'>Git</a>\
      <a target='rpanel' href='../Help/Help_GitHub.html'>GitHub</a>\
      <a target='rpanel' href='../Help/Help_PowerShell.html'>PowerShell</a>\
      <a target='rpanel' href='../Help/Help_RegEx.html'>RegEx</a>\
      <a target='rpanel' href='../Help/Help_ChatGPT.html'>ChatGPT</a>\
      <a class='undef' target='_self' href='javascript:;'>Compiler Explorer</a>\
      <a target='rpanel' href='../Help/Help_SiteNav.html'>SiteNav</a>\
      <div style='height:1.0em;'></div>\
    </div>";
    // hlp.addEventListener('mouseleave', function(event) {
    //   hlp.classList.add('hidden')
    // });
  }
}


function toggleRes() {
  const res = document.getElementById('res');
  if(isDefined(res)) {
    hideBlogs();
    hideHelp();
    toggleElement('res');
    align('mres', 'res');
  }
}

function hideRes() {
  const res = document.getElementById('res');
  if(isDefined(res)) {
    hideElement('res');
  }
}

function showRes() {
  const res = document.getElementById('res');
  if(isDefined(res)) {
    showElement('res');
  }
}

function initRes() {
  const res = document.getElementById('res');
  if(isDefined(res)) {
    align('mres', 'res');
  }
}

function buildRes() {
  const res = document.getElementById('res');
  if(isDefined(res)) {
    res.innerHTML =
    "<div class='darkItem menuHeader' onclick='hideRes()'>Resources</div>\
    <div class='menuBody'>\
      <div class='category'>-documents-</div>\
      <details style='margin-left:0.5rem;'>\
        <summary>ChatGPT Topics</summary>\
        <a href='../documents/ChatGPT_Cookies.pdf'>Cookies</a>\
        <a href='../documents/ChatGPT_LocalStorage.pdf'>LocalStorage</a>\
        <a href='../documents/ChatGPT_Messaging.pdf'>Messaging</a>\
        <a href='../documents/ChatGPT_ParsePath.pdf'>ParsePath</a>\
        <a href='../documents/ChatGPT_PathRawVsURL.pdf'>PathRawVsURL</a>\
        <a href='../documents/ChatGPT_https.pdf'>https</a>\
        <div style='height:0.75rem;'></div>\
      </details>\
      <div class='category'>-coding tools-</div>\
      <details style='margin-left:0.5rem;'>\
        <summary>online execution</summary>\
        <a target='_blank' href='https://godbolt.org'>Compiler Explorer</a>\
        <a target='_blank' href='https://play.rust-lang.org'>Rust Playground</a>\
        <a target='_blank' href='https://dotnetfiddle.net'>dotnet fiddle</a>\
        <a target='_blank' href='https://python-fiddle.com'>Python fiddle</a>\
        <a target='_blank' href='https://runjs.app/play'>runjs</a>\
        <div style='height:0.25rem;'></div>\
      </details>\
      <a target='_blank' href='https://www.w3docs.com/'>w3docs</a>\
      <a target='_blank' href='https://www.rgbtohex.net/'>Dan's Tools</a>\
      <div style='height:0.25rem;'></div>\
      <div class='category'>-Tests-</div>\
      <details style='margin-left:0.5rem;'>\
        <summary>Web Tech Tests</summary>\
        <a target='_top' href='../Tests/GridExplorer/PrototypeExplore.html'>GridExplorer</a>\
        <a target='_top' href='../Tests/FigureSizer/ImageSizer.html'>FigureSizer</a>\
        <a target='_top' href='../Tests/link-navigator/linkNav.html'>linkNav</a>\
        <a target='_top' href='../Tests/PopUpWindow/PopUp.html'>PopUpWindow</a>\
        <a target='_top' href='../Tests/positionElements/PosElem.html'>PositionElements</a>\
        <a target='_top' href='../Tests/scrollingMenus/ScrollingMenus.html'>ScrollingMenus</a>\
        <a target='_top' href='../Tests/Clickables/Clickables2.html'>Clickables2</a>\
        <a target='_top' href='../Tests/DataMgr/DataMgr.html'>DataManager</a>\
        <a target='_top' href='../Tests/Colors/Colors.html'>Colors</a>\
        <a target='_top' href='../Tests/PanelTransitionsWithOverlay/PanelTransitionsWOverlay.html'>PanelTransitions</a>\
        <div style='height:0.25rem;'></div>\
      </details>\
      <div style='height:0.25rem;'></div>\
      <div class='category'>-presentations-</div>\
      <a target='_blank' href='https://jimfawcett.github.io/ChatGPT.html'>ChatGPT Demo</a>\
      <a target='_blank' href='https://jimfawcett.github.io/personalComputerSecurity.html'>Computer Security</a>\
      <div style='height:0.25rem;'></div>\
      <div class='category'>-neighborhoods-</div>\
      <a target='_blank' href='../../JimFawcett.github.io/index.html'>Old Site</a>\
      <a target='_blank' href='https://ecs.syr.edu/faculty/fawcett'>SU Site</a>\
      <a target='_blank' href='https://github.com/mwcorley79'>MWCorely Site</a>\
      <div style='height:1.0em;'></div>\
    </div>";
    // res.addEventListener('mouseleave', function(event) {
    //   res.classList.add('hidden')
    // });
  }
}
