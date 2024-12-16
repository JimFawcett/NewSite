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
 
function toggleSections() {
  const secs = document.getElementById('sections');
  secs.classList.toggle('hidden');
}

function togglePages() {
  // alert('in togglePages');
  const pgs = document.getElementById('pages');
  // alert(pgs);
  pgs.classList.toggle('hidden');
  // pgs.style.display = 'block';
}

/*-- Explorer requests change of iframe window location --*/
function postMsg(msg) {
  /* msg should be 'sections' or 'exit' */
  let ifrm = document.getElementById("pgframe");
  ifrm.contentWindow.postMessage(msg, '*');
}
/*-- iframe responds to Explorer link click --*/
window.onmessage = function (e) {
  if(e.data === 'sections') {
    toggleSections();
  }
  else if(e.data === 'pages') {
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