/*
 * Content.js - Scripts for content pages
 * ver 1.0 - 09 Dec 2024
 * Jim Fawcett
 */

function isDefined(elem) {
  if (typeof elem === 'undefined' || elem === null || elem === undefined) {
    return false;
  }
  return true;
}

// let bottomMenu = new object;
// bottomMenu.top = function() {
//   <a href="#top"></a>
// }
 
// bottomMenu.bottom = function() {
//   <a href="#bottom"></a>
// }

function postFileName() {
  // alert('into postFN');
  let url = window.location.href;
  const parseUrl = new URL(url);
  let fn = parseUrl.pathname.split('/').pop();
  // alert(fn);
  window.parent.postMessage(fn, '*');
  // alert('outof postFM');
}

function toggleButton(id) {
  const btn = document.getElementById(id);
  btn.classList.toggle('hidden');
}

function hideButton(id) {
  const btn = document.getElementById(id);
  btn.classList.add('hidden');
}

function goNext() {
  let nxt = document.getElementById('next');
  if(isDefined(nxt)) {
    nxt.click();
  }
}

function goPrev() {
  let prv = document.getElementById('prev');
  if(isDefined(prv)) {
    prv.click();
  }
}

function dirName() {
  let path = window.location.href;
  path = path.replace(/^file:\/\//i, "");
  if (path.split('/').pop().includes('.')) {
    path = path.substring(0, path.lastIndexOf('/'));
  }
  return path.split('/').pop();
}

/*-- Explorer requests javascript execution --*/
function postMsg(msg) {
  /* msg should be 'sections' or 'pages' */
  // let ifrm = document.getElementById("pgframe");
  // ifrm.contentWindow.postMessage(msg, '*');
  window.parent.postMessage(msg, '*');
}

window.onmessage = function (e) {
  switch (e.data) {
    case 'about':
      toggleButton('about');
      break;
    case 'keys':
      toggleButton('keys');
      break;
    case 'next':
      let nxt = document.getElementById('next');
      if(isDefined(nxt)) {
        nxt.click();
      }
      break;
    case 'prev':
      let prv = document.getElementById('prev');
      if(isDefined(prv)) {
        prv.click();
      }
      break;
    case 'sections':
      let pgs = document.getElementById('pages');
      let scs = document.getElementById('sections');
      if(isDefined(pgs)) {
        hideButton('pages');
      }
      if(isDefined(scs)) {
        toggleButton('sections');
      }
      break;
    case 'pages':
      let pgs2 = document.getElementById('pages');
      let scs2 = document.getElementById('sections');
      if(isDefined(scs2)) {
        hideButton('sections');
      }
      if(isDefined(pgs2)) {
        toggleButton('pages');
      }
      break;
    /* Explorer cases require files in NewSite or an immediate child */
    case 'Explore':
      if(dirName() === "NewSite") {
        window.top.location.href = '../NewSite/Explore.html?src=' + window.location.href;
      }
      else {
        window.top.location.href = '../Explore.html?src=' + window.location.href;
      }
      break;
    case 'ExploreCode':
      if(dirName() === "NewSite") {
        window.top.location.href = '../NewSite/ExploreCode.html?src=' + window.location.href;
      }
      else {
        window.top.location.href = '../ExploreCode.html?src=' + window.location.href;
      }
      break;
    case 'ExploreRust':
      if(dirName() === "NewSite") {
        window.top.location.href = '../NewSite/Rust/ExploreRust.html?src=' + window.location.href;
      }
      else {
        window.top.location.href = '../Rust/ExploreRust.html?src=' + window.location.href;
      }
      break;
    case 'ExploreCpp':
      if(dirName() === "NewSite") {
        window.top.location.href = '../NewSite/Cpp/ExploreCpp.html?src=' + window.location.href;
      }
      else {
        window.top.location.href = '../Cpp/ExploreCpp.html?src=' + window.location.href;
      }
      break;
    case 'ExploreCSharp':
      if(dirName() === "NewSite") {
        window.top.location.href = '../NewSite/CSharp/ExploreCSharp.html?src=' + window.location.href;
      }
      else {
        window.top.location.href = '../CSharp/ExploreCSharp.html?src=' + window.location.href;
      }
      break;
    case 'ExplorePython':
      if(dirName() === "NewSite") {
        window.top.location.href = '../NewSite/Python/ExplorePython.html?src=' + window.location.href;
      }
      else {
        window.top.location.href = '../Python/ExplorePython.html?src=' + window.location.href;
      }
      break;
    case 'ExploreSWDev':
      if(dirName() === "NewSite") {
        window.top.location.href = '../NewSite/SWDev/ExploreSWDev.html?src=' + window.location.href;
      }
      else {
        window.top.location.href = '../SWDev/ExploreSWDev.html?src=' + window.location.href;
      }
      break;
    case 'ExploreWebDev':
      if(dirName() === "NewSite") {
        window.top.location.href = '../NewSite/WebDev/ExploreWebDev.html?src=' + window.location.href;
      }
      else {
        window.top.location.href = '../WebDev/ExploreWebDev.html?src=' + window.location.href;
      }
      break;
    case 'ExploreBasics':
      if(dirName() === "NewSite") {
        window.top.location.href = '../NewSite/Basics/ExploreBasics.html?src=' + window.location.href;
      }
      else {
        window.top.location.href = '../Basics/ExploreBasics.html?src=' + window.location.href;
      }
      break;                                                      
    default:

  }
}

// function setbg(anchor) {
//   const collection = document.getElementsByClassName("clicked");
//   for(let i=0; i<collection.length; i++) {
//     collection[i].style.backgroundColor = 'var(--light)';
//   }
//   anchor.style.backgroundColor = '#ccc';
// }

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

function clickButton(id) {
  let btn = document.getElementById(id);
  if(isDefined(btn)) {
    btn.click();
  }
}

function setKeys() {
  document.addEventListener('keydown', function(event) {
    // alert(event.key);
    if(event.key === 't' || event.key === 'T') {
      window.location.href = '#top';
    }
    if(event.key === 'e' || event.key === 'E') {
      window.location.href = '#bottom';
    }
    if(event.key === 'n' || event.key === 'N') {
      clickButton('next');
    }
    if(event.key === 'p' || event.key === 'P') {
      clickButton('prev');
    }
    if(event.key === 'r' || event.key === 'R') {
      window.location.reload();
    }
    if(event.key === 'b' || event.key === 'B') {
      history.go(-1);
    }
    if(event.key === 'f' || event.key === 'F') {
      history.go(1);
    }
    if(event.key === 'a' || event.key === 'A') {
      toggleButton('about');
    }
    if(event.key === 'k' || event.key === 'K') {
      toggleButton('keys');
    }
    if(event.key === 's' || event.key === 'S') {
      toggleButton('sections');
    }
    if(event.key === 'q' || event.key === 'Q') {
      toggleButton('pages');
    }
  });
}

function closeQuickStatus() {
  let qstat = document.getElementsByClassName("quickStatus");
  if (qstat) {
    for (item of qstat) {
      let det = item.parentElement;
      det.removeAttribute('open');
    }
    //let det = qstat[0].parentElement;
    //det.removeAttribute('open');
    let dummy = true;
  }
}

function toggleShow(id, width) {
  let showit = document.getElementById(id);
  if (showit) {
    if (showit.style.display === 'none') {
      showit.style.display = 'block';
      showit.firstElementChild.style.width = width + "px";
    }
    else {
      let d3 = showit.style.width;
      showit.firstElementChild.style.width = width + "px";
      showit.style.display = 'None';
      // location.reload();
    }
  }
  else {
    //alert('showit not defined');
  }
}
function bigger(img) {
  img.style.width = (img.clientWidth * 1.25) + "px";
}
