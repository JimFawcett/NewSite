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

function blockParentScroll() {
  let secs = document.getElementById('sections');
  secs.addEventListener('mouseenter', () => {
    document.body.style.overflow = 'hidden';  
  });
  secs.addEventListener('mouseleave', () => {
    document.body.style.overflow = 'auto';  
  });
  let pgs = document.getElementById('pages');
  pgs.addEventListener('mouseenter', () => {
    document.body.style.overflow = 'hidden';  
  });
  pgs.addEventListener('mouseleave', () => {
    document.body.style.overflow = 'auto';  
  });
}

// let bottomMenu = new object;
// bottomMenu.top = function() {
//   <a href="#top"></a>
// }
 
// bottomMenu.bottom = function() {
//   <a href="#bottom"></a>
// }

function toggleSections() {
  const secs = document.getElementById('sections');
  secs.classList.toggle('hidden');
}

function hideSections() {
  const secs = document.getElementById('sections');
  secs.classList.add('hidden');
}

function togglePages() {
  const pgs = document.getElementById('pages');
  pgs.classList.toggle('hidden');
}

function hidePages() {
  const pgs = document.getElementById('pages');
  pgs.classList.add('hidden');
}

/*-- Explorer requests javascript execution --*/
function postMsg(msg) {
  /* msg should be 'sections' or 'pages' */
  let ifrm = document.getElementById("pgframe");
  ifrm.contentWindow.postMessage(msg, '*');
}

window.onmessage = function (e) {
  let nxt = document.getElementById('next');
  let prv = document.getElementById('prev');
  if(e.data === 'next') {
    nxt.click();
    return;
  }
  else if (e.data === 'prev') {
    prv.click();
    return;
  }
  let pgs = document.getElementById('pages');
  let scs = document.getElementById('sections');
  if(e.data === 'sections') {
    pgs.classList.add('hidden');
    toggleSections();
  }
  else if(e.data === 'pages') {
    scs.classList.add('hidden');
    togglePages();
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