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
