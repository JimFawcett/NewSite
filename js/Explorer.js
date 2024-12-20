/*
 * Explorer.js - Scripts for the entire site
 * ver 1.0 - 09 Dec 2024
 * Jim Fawcett
 */

function isDefined(elem) {
  if (typeof elem === 'undefined' || elem === null || elem === undefined) {
    return false;
  }
  return true;
}
 
function toggleLeftPanel() {
  const leftPanel = document.getElementById('lpanel');
  if(isDefined(leftPanel)) {
    leftPanel.classList.toggle('hidden');
  }
}

function toggleAbout() {
  postMsg("about");
}

function toggleKeys() {
  postMsg("keys");
}

function toggleSections() {
  postMsg("sections");
}

function togglePages() {
  postMsg("pages");
}

function goNext() {
  postMsg("next");
}

function goPrev() {
  postMsg("prev");
}

/*-- Explorer requests change of iframe window location --*/
function postMsg(msg) {
  // alert("posting to iframe - " + msg);
  let ifrm = document.getElementById("pgframe");
  ifrm.contentWindow.postMessage(msg, '*');
}
/*-- iframe responds to Explorer link click --*/
window.onmessage = function (e) {
  let fn = document.getElementById('filename');
  fn.innerHTML = e.data + ":"; 
  // alert(fn);
}

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
  const hlp = document.getElementById('help');
  if(isDefined(hlp)) {
    hlp.innerHTML =
    "<div class='darkItem menuHeader' onclick='hideHelp()'>Help</div>\
    <div class='menuBody'>\
      <a target='_blank' href='Help1.html'>Help1</a>\
      <a target='_blank' href='Help1.html'>Help2</a>\
      <div style='height:0.5em;'></div>\
    </div>";
    hlp.addEventListener('mouseleave', function(event) {
      hlp.classList.add('hidden')
    });
  }
}

function setbg(anchor) {
  const collection = document.getElementsByClassName("clicked");
  for(let i=0; i<collection.length; i++) {
    collection[i].style.backgroundColor = 'var(--light)';
  }
  anchor.style.backgroundColor = '#ccc';
}

/*-- querystring processing, see footing for redirect processing -----
  https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
*/
function getParameterByName(name, url = window.location.href) {
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
  results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
  
  /*-- query string redirect processing --*/
  function processQueryString() {
  var url = window.location.href;
  var src = getParameterByName("src", url);
  // alert(src);
  if (isDefined(src)) { 
    /*-- redirect to specified page --*/
    let pf = document.getElementById("pgframe");
    if (isDefined(src)) {
      pf.src = src;
      src = null;
    }
  }    
}