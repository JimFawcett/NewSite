/*---------------------------------------------------------
 * ContentMsg.js - Scripts for content messaging
 * ver 1.0 - 19 Feb 2025
 * Jim Fawcett
 *
 * --- DEPRICATED! ---
*/

function isDefined(elem) {
  if (typeof elem === 'undefined' || elem === null || elem === undefined) {
    return false;
  }
  return true;
}
/*---------------------------------------------------------
  Post message to Parent
  - content window posts to parent Explorer
*/
function postMsg(msg) {
  window.parent.postMessage(msg, '*');
}
/*---------------------------------------------------------
  Message handler
  - Explorers post an event name, e.g., name of button
    action.  
  - Page embedded in iframe receives those messages
    here and generates an approprate action, often
    displaying a menu or form.
*/
window.onmessage = function (e) {
  console.log('in msg loop: msg = ' + e.data);
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
      case 'compare':
        hideElement('pages');
        toggleCompare();
        break;
      case 'sections':
        let pgs = document.getElementById('pages');
        let scs = document.getElementById('sections');
        if(isDefined(pgs)) {
          hideElement('pages');
        }
        if(isDefined(scs)) {
          //toggleButton('sections');
          toggleElement('sections');
        }
        break;
      case 'pages':
        let pgs2 = document.getElementById('pages');
        let scs2 = document.getElementById('sections');
        if(isDefined(scs2)) {
          hideElement('sections');
        }
        if(isDefined(pgs2)) {
          toggleElement('pages');
        }
        break;
      case 'clear':
        closeMenues();
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
// function postMsg(msg) {
//   let ifrm = document.getElementById("pgframe");
//   ifrm.contentWindow.postMessage(msg, '*');
// }
