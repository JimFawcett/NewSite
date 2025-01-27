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
 
function iframeTransition() {
  const iframe = document.getElementById('pgframe');
  if(isDefined(iframe)) {
    iframe.addEventListener('load', () => {
      setTimeout(() => {
        iframe.classList.add('loaded');
      }, 20);
    });
  }
}

function resetIframeTransition() {
  const iframe = document.getElementById('pgframe');
  if(isDefined(iframe)) {
    iframe.addEventListener('beforeunload', () => {
      alert('beforeunload');
      iframe.classList.remove('loaded');
    })
  }
}

function handleIframeTransition() {
  iframeTransition();
  resetIframeTransition();
}

function toggleLeftPanel() {
  const leftPanel = document.getElementById('lpanel');
  if(isDefined(leftPanel)) {
    leftPanel.classList.toggle('hidden');
  }
}

function closeLeftPanel() {
  const leftPanel = document.getElementById('lpanel');
  if(isDefined(leftPanel)) {
    leftPanel.classList.add('hidden');
  }
}

function replaceLastSrc(filename) {
  const currentUrl = window.location.href;

  // Find the last occurrence of 'src=' followed by any filename
  const regex = /src=[^&?#]+$/;

  // Replace the last match with the new filename
  const updatedUrl = currentUrl.replace(regex, `src=${filename}`);
  return updatedUrl;
}

let gFile;
function compare(fromlang, tolang) {
  postMsg('clear');
  const currentUrl = window.location.href;
  const modifiedUrl = replaceLastSrc(gFile);
  const regex = new RegExp(fromlang, 'g'); // 'g' flag for global replacement
  const updatedUrl = modifiedUrl.replace(regex, tolang);
  postMsg("sections");
  window.location.href = updatedUrl;
  // console.log(`Updated URL: ${updatedUrl}`);
}

function toggleCompare() {
  hideBlogs();
  hideHelp();
  hideRes();
  postMsg("compare");
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

// function toggleBlogs() {
//   postMsg("blogs");
// }

// function toggleHelp() {
//   postMsg("help");
// }

function closeExps() {
  const expls = document.getElementById('explorers');
  if(isDefined(expls)) {
    expls.open = false;
  }
}

function closeTBs() {
  const expls = document.getElementById('toolboxes');
  if(isDefined(expls)) {
    expls.open = false;
  }
}
/*-- Explorer requests change of iframe window location --*/
function postMsg(msg) {
  let ifrm = document.getElementById("pgframe");
  ifrm.contentWindow.postMessage(msg, '*');
}
/*-- iframe responds to Explorer link click --*/
window.onmessage = function (e) {
  switch (e.data) {
    case 'esc':
      console.log('esc key');
      hideElement('blogs');
      hideElement('help');
      hideElement('res');
      break;
    case 'clear':
      /* do nothing */
      break;
    default:
      console.log('filename');
      let fn = document.getElementById('filename');
      fn.innerHTML = e.data + ":"; 
      gFile = e.data;
  }
}

function setbg(anchor) {
  const collection = document.getElementsByClassName("clickable");
  for(let i = 0; i < collection.length; i++) {
    collection[i].style.color = 'var(--unclickclr)';
  }
  anchor.style.color = 'var(--clickclr)';
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
  if (isDefined(src)) { 
    /*-- redirect to specified page --*/
    let pf = document.getElementById("pgframe");
    if (isDefined(src)) {
      pf.src = src;
      src = null;
    }
  }    
}