/*
 * BlogsAndHelp.js - Builds Blogs and Help dropdown list
 * ver 1.0 - 19 Dec 2024
 * Jim Fawcett
 */
function align(ida, idp) {
  const posp = document.getElementById(idp);
  const anch = document.getElementById(ida);
  const rect = anch.getBoundingClientRect();
  posp.style.position = 'absolute';
  const leftPosition = rect.left - posp.offsetWidth;
  posp.style.left = leftPosition + window.scrollX + 'px';
  posp.style.top = rect.bottom + window.scrollY + 'px';
  posp.style.right = 'auto';
  posp.style.bottom = 'auto';
  console.log("align pos top & right: " + posp.style.top + ", " + posp.style.left);
}

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
    // blg.classList.toggle('hidden');
    toggleElement('blogs');
    console.log(blg);
  }
}

function hideBlogs() {
  const blg = document.getElementById('blogs');
  if(isDefined(blg)) {
    // blg.classList.add('hidden');
    hideElement('blogs');
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
    align('mblogs', 'blogs');
    // blg.addEventListener('mouseleave', function(event) {
    //   blg.classList.add('hidden')
    // });  
  }
}

function toggleHelp() {
  const hlp = document.getElementById('help');
  if(isDefined(hlp)) {
    // const blg = document.getElementById('blogs');
    hideBlogs();
    hideRes();
    // hlp.classList.toggle('hidden');
    toggleElement('help');
  }
}

function hideHelp() {
  const hlp = document.getElementById('help');
  if(isDefined(hlp)) {
    // hlp.classList.add('hidden');
    hideElement('help');
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
    align('mhelp', 'help');
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
    // res.classList.toggle('hidden');
    toggleElement('res');
  }
}

function hideRes() {
  const res = document.getElementById('res');
  if(isDefined(res)) {
    // res.classList.add('hidden');
    hideElement('res');
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
      <div class='category'>-online execution-</div>\
      <a target='_blank' href='https://godbolt.org'>Compiler Explorer</a>\
      <a target='_blank' href='https://play.rust-lang.org'>Rust Playground</a>\
      <a target='_blank' href='https://dotnetfiddle.net'>dotnet fiddle</a>\
      <a target='_blank' href='https://python-fiddle.com'>Python fiddle</a>\
      <a target='_blank' href='https://runjs.app/play'>runjs</a>\
      <div style='height:0.25rem;'></div>\
      <div class='category'>-Tests-</div>\
      <details style='margin-left:0.5rem;'>\
        <summary>Web Tech</summary>\
        <a target='_self' href='../Tests/GridExplorer/PrototypeExplore.html'>GridExplorer</a>\
        <a target='_self' href='../Tests/FigureSizer/ImageSizer.html'>FigureSizer</a>\
        <a target='_self' href='../Tests/link-navigator/linkNav.html'>linkNav</a>\
        <a target='_self' href='../Tests/PopUpWindow/PopUp.html'>PopUpWindow</a>\
        <a target='_self' href='../Tests/PositionElements/PosElem.html'>PositionElements</a>\
        <a target='_self' href='../Tests/scrollingMenus/ScrollingMenus.html'>ScrollingMenus</a>\
        <a target='_self' href='../Tests/Clickables/Clickables2.html'>Clickables2</a>\
        <a target='_self' href='../Tests/DataMgr/DataMgr.html'>DataManager</a>\
        <div style='height:0.25rem;'></div>\
      </details>\
      <div style='height:0.25rem;'></div>\
      <div class='category'>-presentations-</div>\
      <a target='_blank' href='https://jimfawcett.github.io/ChatGPT.html'>ChatGPT Demo</a>\
      <a target='_blank' href='https://jimfawcett.github.io/personalComputerSecurity.html'>Computer Security</a>\
      <div style='height:0.25rem;'></div>\
      <div class='category'>-neighborhoods-</div>\
      <a target='_blank' href='https://jimfawcett.github.io/'>Old Site</a>\
      <a target='_blank' href='https://ecs.syr.edu/faculty/fawcett'>SU Site</a>\
      <a target='_blank' href='https://github.com/mwcorley79'>MWCorely Site</a>\
      <div style='height:1.0em;'></div>\
    </div>";
    // res.addEventListener('mouseleave', function(event) {
    //   res.classList.add('hidden')
    // });
    align('mres', 'res');
  }
}
