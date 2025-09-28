/*---------------------------------------------------------
 * Content.js - Scripts for content pages
 * ver 1.0 - 06 Jan 2025
 * Jim Fawcett
 */

function isDefined(elem) {
  if (typeof elem === 'undefined' || elem === null || elem === undefined) {
    return false;
  }
  return true;
}

function isHidden(id) {
  const element = document.getElementById(id);
  if(isDefined(element)) {
    return element.classList.contains('hidden');
  }
  return false;
}

/*---------------------------------------------------------
  Post iframe content filename back to parent to be
  included in its footer 
*/
function postFileName() {
  let url = window.location.href;
  // alert(url);
  setCookie('url', url, 10);
  const parseUrl = new URL(url);
  let fn = parseUrl.pathname.split('/').pop();
  window.parent.postMessage(fn, '*');
  postMsg('loaded');
  postHostMsg(makeMsg('url', location.href));
}
function getUrl() {
  let url = getCookie('url');
  if(url === null || url === false) {
    url = "../Site/Explore.html";
  }
  return url;
}
/*---------------------------------------------------------
  temporarily toggle element's hidden state
  - does not toggle persistance cookie 
*/
function toggleButton(id) {
  const btn = document.getElementById(id);
  if(isDefined(btn)) {
    btn.classList.toggle('hidden');
  }
}
/*---------------------------------------------------------
  temporarily set element's hidden state to true
  - does not change persistance cookie 
*/
function hideButton(id) {
  const btn = document.getElementById(id);
  if(isDefined(btn)) {
    btn.classList.add('hidden');
  }
}
/*---------------------------------------------------------
  temporarily set element's hidden state to false
  - does not change persistance cookie 
*/
function showButton(id) {
  const btn = document.getElementById(id);
  if(isDefined(btn)) {
    btn.classList.remove('hidden');
    btn.classList.add("visible");
  }
}
/*---------------------------------------------------------
  set element's hidden state to true
  - also sets its persistance cookie 
*/
function closeMenues() {
  hideElement('about');
  hideElement('keys');
  hideElement('sections');
  hideElement('pages');
  hideElement('compare');
  hideElement('blogs');
  hideElement('help');
  hideElement('res');
  hideElement('goto');
  postMsg('close-goto');
  postMsg('esc');
  postMsg('clear');
}
/*---------------------------------------------------------
  Redirect to Next page in thread
  - based on url of page's next element
*/
function goNext() {
  let nxt = document.getElementById('next');
  if(isDefined(nxt)) {
    nxt.click();
  }
}
function goNextSelf() {
  window.postMessage(makeMsg('next'));
}
/*---------------------------------------------------------
  Redirect to Prev page in thread
  - based on url of page's prev element
*/
function goPrev() {
  let prv = document.getElementById('prev');
  if(isDefined(prv)) {
    prv.click();
  }
}
function goPrevSelf() {
  window.postMessage(makeMsg('prev'));
}
/*---------------------------------------------------------
  Redirect to Home page, e.g., SiteHome.html
  - expects all pages to be in either NewSite dir
    or one of its immediate subdirectories
*/
function goHome() {
  let url = "../Site/Explore.html?src=SiteHome.html";
  if(dirName() === 'NewSite') {
    window.parent.location = url;
  }
  else {
    window.parent.location = url;
  }
}
/*---------------------------------------------------------
  parse the last directory name from current location
  - used to pass filename from iframe content to parent
  - also used to compute target path in goHome()
*/
function dirName() {
  let path = window.location.href;
  // alert(path);
  path = path.replace(/^file:\/\//i, "");
  if (path.split('/').pop().includes('.')) {
    path = path.substring(0, path.lastIndexOf('/'));
  }
  // alert(path);
  return path.split('/').pop();
  // return path;
}

/*---------------------------------------------------------
  Pages embedded in an Explorer's iframe communicate 
  to the Explorer by posting a message with this 
  function.
  - usually used to send back its filename so Explorer
    can put the name in its footer when page loads.
*/
function postMsg(msg) {
  // let ifrm = document.getElementById("pgframe");
  // ifrm.contentWindow.postMessage(msg, '*');
  window.parent.postMessage(msg, '*');
}
function makeMsg(key, value) {
  let msg = new Object();
  msg.key = key;
  msg.value = value;
  return msg;
}
/*---------------------------------------------------------
  Message handler
  - Explorers post an event name, e.g., name of button
    action.  
  - Page embedded in iframe receives those messages
    here and generates an approprate action, often
    displaying a menu or form.

  - NOTE: overridden by handler in contentMessages.js
*/
// window.onmessage = function (e) {
//   console.log('in msg loop: msg = ' + e.data);
//   switch (e.data) {
//     case 'about':
//       toggleButton('about');
//       break;
//     case 'keys':
//       toggleButton('keys');
//       break;
//     case 'next':
//       let nxt = document.getElementById('next');
//       if(isDefined(nxt)) {
//         nxt.click();
//       }
//       break;
//     case 'prev':
//       let prv = document.getElementById('prev');
//       if(isDefined(prv)) {
//         prv.click();
//       }
//       break;
//       case 'compare':
//         hideElement('pages');
//         toggleCompare();
//         break;
//       case 'sections':
//         let pgs = document.getElementById('pages');
//         let scs = document.getElementById('sections');
//         if(isDefined(pgs)) {
//           hideElement('pages');
//         }
//         if(isDefined(scs)) {
//           //toggleButton('sections');
//           toggleElement('sections');
//         }
//         break;
//       case 'pages':
//         let pgs2 = document.getElementById('pages');
//         let scs2 = document.getElementById('sections');
//         if(isDefined(scs2)) {
//           hideElement('sections');
//         }
//         if(isDefined(pgs2)) {
//           toggleElement('pages');
//         }
//         break;
//       case 'clear':
//         clearMenues();
//         break;
//     /* Explorer cases require files in NewSite or an immediate child */
//     case 'Explore':
//       if(dirName() === "NewSite") {
//         window.top.location.href = '../NewSite/Explore.html?src=' + window.location.href;
//       }
//       else {
//         window.top.location.href = '../Explore.html?src=' + window.location.href;
//       }
//       break;
//     case 'ExploreCode':
//       if(dirName() === "NewSite") {
//         window.top.location.href = '../NewSite/ExploreCode.html?src=' + window.location.href;
//       }
//       else {
//         window.top.location.href = '../ExploreCode.html?src=' + window.location.href;
//       }
//       break;
//     case 'ExploreRust':
//       if(dirName() === "NewSite") {
//         window.top.location.href = '../NewSite/Rust/ExploreRust.html?src=' + window.location.href;
//       }
//       else {
//         window.top.location.href = '../Rust/ExploreRust.html?src=' + window.location.href;
//       }
//       break;
//     case 'ExploreCpp':
//       if(dirName() === "NewSite") {
//         window.top.location.href = '../NewSite/Cpp/ExploreCpp.html?src=' + window.location.href;
//       }
//       else {
//         window.top.location.href = '../Cpp/ExploreCpp.html?src=' + window.location.href;
//       }
//       break;
//     case 'ExploreCSharp':
//       if(dirName() === "NewSite") {
//         window.top.location.href = '../NewSite/CSharp/ExploreCSharp.html?src=' + window.location.href;
//       }
//       else {
//         window.top.location.href = '../CSharp/ExploreCSharp.html?src=' + window.location.href;
//       }
//       break;
//     case 'ExplorePython':
//       if(dirName() === "NewSite") {
//         window.top.location.href = '../NewSite/Python/ExplorePython.html?src=' + window.location.href;
//       }
//       else {
//         window.top.location.href = '../Python/ExplorePython.html?src=' + window.location.href;
//       }
//       break;
//     case 'ExploreSWDev':
//       if(dirName() === "NewSite") {
//         window.top.location.href = '../NewSite/SWDev/ExploreSWDev.html?src=' + window.location.href;
//       }
//       else {
//         window.top.location.href = '../SWDev/ExploreSWDev.html?src=' + window.location.href;
//       }
//       break;
//     case 'ExploreWebDev':
//       if(dirName() === "NewSite") {
//         window.top.location.href = '../NewSite/WebDev/ExploreWebDev.html?src=' + window.location.href;
//       }
//       else {
//         window.top.location.href = '../WebDev/ExploreWebDev.html?src=' + window.location.href;
//       }
//       break;
//     case 'ExploreBasics':
//       if(dirName() === "NewSite") {
//         window.top.location.href = '../NewSite/Basics/ExploreBasics.html?src=' + window.location.href;
//       }
//       else {
//         window.top.location.href = '../Basics/ExploreBasics.html?src=' + window.location.href;
//       }
//       break;    
//     case 'goto':
//       alert('GoTo msg');
//       showGoToMenu(); 
//       break; 
//     case 'close-goto':
//       alert('close-goto');
//       hideElement('goto');                                                
//     default:

//   }
// }
function showGoToMenu() {
  // alert('goto');
  let gte = document.getElementById('goto');
  let gtm = document.createElement('div');
  gtm.innerHtml = "style='display:flex; flexwrap:nowrap; position:relative; bottom:1rem; right:2rem;'>\
  + 'GoTo' + '</div>';\
  + 'alert('goto')";
}
/*---------------------------------------------------------
  set background-color for link in list and remove
  for last clicked link
*/
// function setbg(anchor) {
//   const collection = document.getElementsByClassName("clicked");
//   for(let i=0; i<collection.length; i++) {
//     collection[i].style.backgroundColor = 'var(--light)';
//   }
//   anchor.style.backgroundColor = '#ccc';
// }

/*---------------------------------------------------------
  querystring processing passed to Explorers on load
  to specify iframe target
  https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
*/
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

function getParameterByName(name, url = window.location.href) {
  // escape any [ or ] in the name
  name = name.replace(/[[\]]/g, '\\$&');
  // capture everything after `=` up to—but not including—an `&`
  const regex = new RegExp(`[?&]${name}=([^&]*)`);
  const results = regex.exec(url);
  return results
    ? decodeURIComponent(results[1])
    : null;

  // name = name.replace(/[\[\]]/g, '\\$&');
  // var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
  // results = regex.exec(url);
  // if (!results) return null;
  // if (!results[2]) return '';
  // return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
  
/*---------------------------------------------------------
  programmed button click given element id
*/
function clickButton(id) {
  let btn = document.getElementById(id);
  if(isDefined(btn)) {
    btn.click();
  }
}
/*---------------------------------------------------------
  listen for key strokes and respond with programmed
  actions
*/
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
      window.postMessage(makeMsg('next'));
    }
    // if(event.key === 'n' || event.key === 'N') {
    //   clickButton('next');
    // }
    if(event.key === 'p' || event.key === 'P') {
      window.postMessage(makeMsg('prev'));
    }
    // if(event.key === 'p' || event.key === 'P') {
    //   clickButton('prev');
    // }
    if(event.key === 'u' || event.key === 'U') {
      window.sectionNavigator.up();
    }
    if(event.key === 'd' || event.key === 'D') {
      window.sectionNavigator.down();
    }
    if(event.key === 'h' || event.key === 'H') {
      goHome();
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
    // if(event.key === 'c' || event.key === 'C') {
    //   toggleCompare();
    // }
    if(event.key === "Escape") {
      closeMenues();
    }
  });
}
/*---------------------------------------------------------
  close quickStatus element on mouseout etc
*/
function closeQuickStatus() {
  let qstat = document.getElementsByClassName("quickStatus");
  if (qstat) {
    for (item of qstat) {
      let det = item.parentElement;
      det.removeAttribute('open');
    }
  }
}
/*---------------------------------------------------------
  toggle show dropdown, e.g., [ show ... ] shows hidden
  child element.
*/
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

/*---------------------------------------------------------
  GoToMenu.js
  - needed in local js folder for each directory holding
    content, e.g., Tracks, Help, ...
*/  
  function createSiteNavMenu(containerId) {
    // 1. Safely encode the current page URL
    const currentSrc = encodeURIComponent(window.location.href);

    // 2. Define each Explorer link target
    const explorers = [
      { label: 'Rust',   url: '../Rust/ExploreRust.html' },
      { label: 'C++',    url: '../Cpp/ExploreCpp.html' },
      { label: 'C#',     url: '../CSharp/ExploreCSharp.html' },
      { label: 'Python', url: '../Python/ExplorePython.html' },
      { label: 'WebDev', url: '../WebDev/ExploreWebDev.html' },
      { label: 'SWDev',  url: '../SWDev/ExploreSWDev.html' },
      { label: 'Basics', url: '../Basics/ExploreBasics.html' },
      { label: 'Code',   url: '../Code/ExploreCode.html' }
    ];

    // 3. Build the comma-separated Explorer links
    const explorerLinks = explorers
      .map(e => `<a target="_parent" href="${e.url}?src=${currentSrc}">${e.label}</a>`)
      .join(', ');

    // 4. Full menu template
    const html = `
      <div class="darkItem" style="text-align:left; padding-left:1.0rem; cursor:pointer;" onclick="hideElement('goto')">
        Page Actions
      </div>
      <div style="
        display: flex;
        flex-direction: column;
        border: 2px solid var(--dark);
        background-color: var(--light);
        color: var(--dark);
        padding: 0.25rem 1rem 1rem;
      ">
        <div>Display this page in Explorer for:</div>
        <div class="indent">${explorerLinks}</div>

        <div>For this <strong>page:</strong></div>
        <div class="indent">
          <a style="cursor: pointer; text-decoration:underline;" onclick="history.back()">Back</a>,
          <a style="cursor: pointer; text-decoration:underline;" onclick="history.forward()">Forward</a>,
          <a style="cursor: pointer; text-decoration:underline;" onclick="location.reload()">Reload</a>
        </div>

        <div>For this <strong>Explorer:</strong></div>
        <div class="indent">
          <a style="cursor: pointer; text-decoration:underline;" onclick="postParentMsg(makeMsg('back', null))">Back</a>, 
          <a style="cursor: pointer; text-decoration:underline;" onclick="postParentMsg(makeMsg('forward', null">Forward</a>, 
          <a style="cursor: pointer; text-decoration:underline;" onclick="postParentMsg(makeMsg('reload', null))">Reload</a>
        </div>

        <div>For <strong>Page Host:</strong></div>
        <div class="indent">
          <a style="cursor: pointer; text-decoration:underline;" onclick="postHostMsg(makeMsg('back', null))">Back</a>,
          <a style="cursor: pointer; text-decoration:underline;" onclick="postHostMsg(makeMsg('forward', null))">Forward</a>,
          <a style="cursor: pointer; text-decoration:underline;" onclick="postHostMsg(makeMsg('reload', null))">Reload</a>
        </div>
        <div style="height:1.5rem;"></div>
        <button
          class="loadButton"
          style="cursor: pointer; align-self:flex-start; width:fit-content; max-width:10rem; padding:0.25rem 1rem; font-size: 1rem; border:1px solid var(--dark); border-radius:5px"
          onclick="postParentMsg(makeMsg('picklist'))"
        >
          Examples+
        </button>
      </div>
    `;

    // 5. Inject into the container
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = html;
    } else {
      console.warn(`createSiteNavMenu: no element found with ID "${containerId}"`);
    }
    // Close the whole Page Actions container when the pointer leaves it
    container.addEventListener('mouseleave', () => {
      hideElement(containerId);         // your existing helper
      // postMsg('close-goto');         // optional if other frames need to know
    });
  }

  // Automatically build on load
