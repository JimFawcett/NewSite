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
  const liframe = document.getElementById('lpgframe');
  if(isDefined(liframe)) {
    liframe.addEventListener('load', () => {
      setTimeout(() => {
        liframe.classList.add('loaded');
      }, 20);
    });
  }
  const riframe = document.getElementById('rpgframe');
  if(isDefined(riframe)) {
    riframe.addEventListener('load', () => {
      setTimeout(() => {
        riframe.classList.add('loaded');
      }, 20);
    });
  }
}

function resetIframeTransition() {
  const liframe = document.getElementById('lpgframe');
  if(isDefined(liframe)) {
    liframe.addEventListener('beforeunload', () => {
      console.log('beforeunload');
      liframe.classList.remove('loaded');
    })
  }
  const riframe = document.getElementById('rpgframe');
  if(isDefined(riframe)) {
    riframe.addEventListener('beforeunload', () => {
      console.log('beforeunload');
      riframe.classList.remove('loaded');
    })
  }
}

function handleIframeTransition() {
  iframeTransition();
  resetIframeTransition();
}

function hideInfoMsgs() {
  // alert('in hideInfoMsgs()');
  let tpi = document.getElementById('top-menu-info');
  if(isDefined(tpi)) {
    tpi.classList.add('hidden');
  }
  let bpi = document.getElementById('bottom-menu-info');
  if(isDefined(bpi)) {
    bpi.classList.add('hidden');
  }
}

// document.addEventListener("DOMContentLoaded", function () {
//   const lpanel = document.getElementById("lpanel");
// });

// function togglePanel() {
//   toggleElement('lpanel');
// }
function togglePanel() {
  const lpanel = document.getElementById("lpanel");
  if (lpanel.classList.contains("visible")) {
    lpanel.classList.remove("visible");
    lpanel.style.opacity = "0";
    lpanel.style.transform = "translateX(-100%)";
    setTimeout(() => {
      lpanel.classList.add("hidden");
      setCookie('lpanel', 'false', 1);
      lpanel.style.display = "none";
    }, 300); // Matches the transition duration
  } else {
    lpanel.style.display = "block";
    setTimeout(() => {
      lpanel.classList.remove("hidden");
      setCookie('lpanel', 'true', 1);
      lpanel.style.opacity = "1";
      lpanel.style.transform = "translateX(0)";
      lpanel.classList.add("visible");
    }, 10); // Small delay to allow transition
  }
}

function togglePanel_paused() {
  const lpanel = document.getElementById("lpanel");
  if (lpanel.classList.contains("visible")) {
    lpanel.classList.remove("visible");
    lpanel.style.opacity = "0";
    lpanel.style.transform = "translateX(-100%)";
    setTimeout(() => {
      lpanel.classList.add("hidden");
      lpanel.style.display = "none";
    }, 300); // Matches the transition duration
  } else {
    lpanel.style.display = "block";
    setTimeout(() => {
      lpanel.classList.remove("hidden");
      lpanel.style.opacity = "1";
      lpanel.style.transform = "translateX(0)";
      lpanel.classList.add("visible");
    }, 10); // Small delay to allow transition
  }
}

// document.addEventListener("DOMContentLoaded", function () {
//   const lpanel = document.getElementById("lpanel");
//   const toggleButton = document.getElementById("toggle-btn");

//   function togglePanel() {
//     if (lpanel.classList.contains("visible")) {
//       lpanel.classList.remove("visible");
//       lpanel.classList.add("hidden");
//       setTimeout(() => {
//         lpanel.style.display = "none";
//       }, 300); // Matches the transition duration
//     } else {
//       lpanel.style.display = "block";
//       setTimeout(() => {
//         lpanel.classList.remove("hidden");
//         lpanel.classList.add("visible");
//       }, 10); // Small delay to allow transition
//     }
//   }

//   toggleButton.addEventListener("click", togglePanel);
// });
// function lpanelTransition() {
//   const lpanel = document.getElementById('lpanel');
//   if(isDefined(lpanel)) {
//     lpanel.addEventListener('DOMContentLOaded', () => {
//       setTimeout(() => {
//         lpanel.classList.add('loaded');
//       }, 20);
//     });
//   }
// }

// function resetLpanelTransition() {
//   const lpanel = document.getElementById('lpanel');
//   if(isDefined(lpanel)) {
//     lpanel.addEventListener('beforeunload', () => {
//       console.log('beforeunload');
//       lpanel.classList.remove('loaded');
//     })
//   }
// }

// function handleLpanelTransition() {
//   lpanelTransition();
//   resetLpanelTransition();
// }

function toggleLeftPanel() {
  toggleTransitionElement('lpanel');
  // toggleElement('lpanel');

  // const leftPanel = document.getElementById('lpanel');
  // if(isDefined(leftPanel)) {
  //   leftPanel.classList.toggle('hidden');
  // }
}

function closeLeftPanel() {
  hideElement('lpanel');
  // const leftPanel = document.getElementById('lpanel');
  // if(isDefined(leftPanel)) {
  //   leftPanel.classList.add('hidden');
  // }
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
  const currentUrl = window.location.href;
  const modifiedUrl = replaceLastSrc(gFile);
  const regex = new RegExp(fromlang, 'g'); // 'g' flag for global replacement
  const updatedUrl = modifiedUrl.replace(regex, tolang);
  // const fileExists = checkUrl(updatedUrl);
  // if(!fileExists) {
  //   return;
  // }
  postMsg('clear');
  postMsg("sections");
  window.location.href = updatedUrl;
  // console.log(`Updated URL: ${updatedUrl}`);
}

function checkUrl(url) {
  const liframe = document.getElementById('lpgframe');
  // const iframe = document.createElement('iframe');
  // iframe.style.display = 'none'; // Hide the iframe

  // Handle successful loading
  liframe.onload = function () {
    alert('frame load succeeded');
    console.log(`File loaded successfully: ${url}`);
    // iframe.style.display = 'block'; // Show iframe after successful load
    return true;
  };

  // Handle loading errors
  liframe.onerror = function () {
    alert('frame load failed');
    console.error(`Failed to load file: ${url}. Reloading fallback: ${fallbackUrl}`);
    return false;
    // iframe.src = fallbackUrl; // Reload the original or fallback file
    // iframe.style.display = 'block'; // Show the iframe with the fallback
  };

  liframe.src = url; // Attempt to load the file
  // document.body.appendChild(iframe); // Add the iframe to the page
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
function makeMsg(key, value) {
  let msg = new Object();
  msg.key = key;
  msg.value = value;
  return msg;
}
function postMsg(msg) {
  let lifrm = document.getElementById("lpgframe");
  lifrm.contentWindow.postMessage(msg, '*');
  let rifrm = document.getElementById("rpgframe");
  rifrm.contentWindow.postMessage(msg, '*');
}
/*-- iframe responds to Explorer link click --*/
window.onmessage = function (e) {
  switch (e.data.key) {
    case 'esc':
      console.log('esc key');
      hideElement('blogs');
      hideElement('help');
      hideElement('res');
      break;
    case 'clear':
      /* do nothing */
      break;
    case 'loaded':
      window.parent.postMessage('loaded', '*');
      console.log('Explorer posted message to PageHost');
      break;
    default:
      console.log('filename');
      let fn = document.getElementById('filename');
      fn.innerHTML = e.data; 
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
  console.log('processQueryString');
  var url = window.location.href;
  var src = getParameterByName("src", url);
  if (isDefined(src)) { 
    /*-- redirect to specified page --*/
    let pf = document.getElementById("lpgframe");
    if (isDefined(src)) {
      console.log('src: ' + src);
      pf.src = src;
      src = null;
    }
  }    
}