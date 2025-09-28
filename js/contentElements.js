/*
 * ContentMenus.js - Scripts for content menus
 * ver 1.0 - 06 Jan 2025
 * Jim Fawcett
 */
/*---------------------------------------------------------
  defined in Content.js
*/
// function isDefined(elem) {
//   if (typeof elem === 'undefined' || elem === null || elem === undefined) {
//     return false;
//   }
//   return true;
// }
function closeMenus() {
  let abt = document.getElementById('about');
  if(isDefined(abt)) {
    abt.classList.add('hidden');
  }
  let kys = document.getElementById('keys');
  if(isDefined(kys)) {
    kys.classList.add('hidden');
  }
  let secs = document.getElementById('sections');
  if(isDefined(secs)) {
    // secs.classList.add('hidden');
    hideElement('sections');
  }
  let pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    // pgs.classList.add('hidden');
    hideElement('pages');
  }
}
/*---------------------------------------------------------
  Toggle about popup when using About button on bottom menu
  - not persistent, disappears on refresh
*/
function toggleAbout() {
  let abt = document.getElementById('about');
  if(isDefined(abt)) {
    abt.classList.toggle('hidden');
  }
}
/*---------------------------------------------------------
  Toggle keys popup when using Keys button on bottom menu
  - not persistent, disappears on refresh
*/
function toggleKeys() {
  let keys = document.getElementById('keys');
  if(isDefined(keys)) {
    keys.classList.toggle('hidden');
  }
}
/*---------------------------------------------------------
  Compare functions show/hide code compare menu
  - persistent, does not disappear on refresh
*/
function hideCompare() {
  let cmp = document.getElementById('compare');
  if(isDefined(cmp)) {
    hideElement('compare');
  }
}
function toggleCompare() {
  let cmp = document.getElementById('compare');
  if(isDefined(cmp)) {
    toggleElement('compare');
    let scs = document.getElementById('sections');
    if(isDefined(scs)) {
      showElement('sections');
    }
  }
}
/*---------------------------------------------------------
  Toggle Pages popup when using Page's button on bottom menu
  - persistent, does not disappear on refresh
*/
function togglePages() {
  // console.info('in togglePages()');
  toggleButton('pages');
  if (isHidden('pages')) {
    setCookie('pages', 'false', 1);
  } else {
    setCookie('pages', 'true', 1);
  }
}
/*---------------------------------------------------------
  The Sections functions record hidden state in 
  cookie with 'sections' key
  - actions are persistent, do not revert on refresh
*/
function showSections() {
  showButton('sections');
  setCookie('sections', 'true', 1);
}
function hideSections() {
  hideButton('sections');
  setCookie('sections','false', 1);
}
function toggleSections() {
  // console.info('in toggle sections');
  toggleButton('sections');
  if (isHidden('sections')) {
    setCookie('sections', 'false', 1);
  } else {
    setCookie('sections', 'true', 1);
  }
}
/*---------------------------------------------------------
  The Element functions are the most general, accepting
  an element id for action.
  - persistent, actions do not revert on refresh
  ---------------------------------------------------------
    showElement(id) and hideElement(id) need updates
    in toggleElement(id)
*/
function showElement(id) {
  console.info('in showElement: id = ' + id);
  const elem = document.getElementById(id);
  elem.classList.remove('hidden');
  // elem.classList.add('visible');
  // showButton(id);
  setCookie(id, 'true', 1);
}
function hideElement(id) {
  console.info('in hideElement: id = ' + id);
  const elem = document.getElementById(id);
  // elem.classList.remove('visible');
  elem.classList.add('hidden');
  // hideButton(id);
  setCookie(id,'false', 1);
}
// function toggleElement(id) {
//   console.info('in toggleElement: id = ' + id);
//   toggleButton(id);
//   if (isHidden(id)) {
//     setCookie(id, 'false', 1);
//   } else {
//     setCookie(id, 'true', 1);
//   }
// }
function toggleElement(id) {
  const elem = document.getElementById(id);
  elem.classList.toggle('hidden');
  if(elem.classList.contains('hidden')) {
    // elem.classList.remove('visible');
    setCookie(id, false, 10);
  } else {
    // elem.classList.add('visible');
    setCookie(id, true, 10);
  }
}

function toggleTransitionElement(id) {
  console.info('in toggleTransitionElement');
  const element = document.getElementById(id);
  if (element) {
    if (element.classList.contains('hidden')) {
      element.classList.remove('hidden');
      // element.classList.add('visible');
    } else {
      // element.classList.remove('visible');
      element.classList.add('hidden');
    }
  } else {
    console.warn(`Element with ID ${id} not found.`);
  }
}


/*---------------------------------------------------------
  manage site session variables with cookies
  - used to make compare, pages and sections list state
    persistant across page loading
*/
function setElements(id) {
  console.info('in setElements: id = ' + id);
  let state = getCookie(id);
  console.info('state: ' + state);
  switch(state) {
    case null:
      setCookie(id, 'false', 1);
      hideButton(id);
      // console.info('id: ' + id)
      // console.info('cookie value: ' + getCookie(id));
      break;
    case 'true':
      showButton(id);
      // toggleElement(id); // changed 1/20
      // console.info('cookie value: ' + getCookie(id));
      break;
    case 'false':
      hideButton(id);  //added 1/20
      // console.info('cookie value: ' + getCookie(id));
    default:
  }
}
function align(ida, idp) {
  const posp = document.getElementById(idp);
  posp.style.position = 'absolute';
  const anch = document.getElementById(ida);
  const arect = anch.getBoundingClientRect();
  const prect = posp.getBoundingClientRect();
  const leftPosition = arect.left - posp.offsetWidth;
  console.info(
    "align parts: leftPosition = " + leftPosition +
    ", anch.style.width = " + arect.width +
    ", window.scrollX = " + window.scrollX
  )
  const acstyle = window.getComputedStyle(anch);
  let awidth = acstyle.width;
  awidth = parseFloat(awidth);
  const pcstyle = window.getComputedStyle(posp);
  let pwidth = pcstyle.width;
  pwidth = parseFloat(pwidth);
  pwidth = prect.width;
  console.info("awidth: " + awidth);
  console.info("pwidth: " + pwidth);
  posp.style.left = arect.left - pwidth + window.scrollX + 'px';
  posp.style.left = leftPosition + window.scrollX + 'px';
  posp.style.top = arect.bottom + window.scrollY + 'px';
  posp.style.right = 'auto';
  posp.style.bottom = 'auto';
  console.info("align pos top & right: " + posp.style.top + ", " + posp.style.left);
}
/*---------------------------------------------------------
  loader method collects load actions for all persistent
  elements
*/
// function setPersistantElements() {
//   setElements('sections');
//   setElements('pages');
//   // setElements('compare');
//   setElements('blogs');
//   setElements('help');
//   setElements('res');
//   setElements('lpanel');
//   setElements('controls');
//   // postMsg('loaded');
//   // align('mblogs', 'blogs');
//   // align('mhelp', 'help');
//   // align('mres', 'res');
// }
/*---------------------------------------------------------
  Creates HTML for keys list
*/
function buildKeys() {
  const keys = document.getElementById('keys');
  if(isDefined(keys)) {
    keys.innerHTML = 
    "<table id='keysTable'>\
      <tr onclick='toggleKeys()'>\
        <th>Key</th><th>Action</th>\
      </tr>\
      <tr>\
        <td class='center clickable'><a href='#top'>T</a></td><td>scroll to top</td>\
      </tr>\
      <tr>\
        <td class='center clickable'><a href='#bottom'>E</a></td><td>scroll to end</td>\
      </tr>\
      <tr>\
        <td class='center clickable'><a onclick='goNextSelf()'>N</a></td><td>Next</td>\
      </tr>\
      <tr>\
        <td class='center clickable'><a onclick='goPrevSelf()'>P</a></td><td>Prev</td>\
      </tr>\
      <tr>\
        <td class='center clickable'><a onclick='window.sectionNavigator.down()'>D</a></td><td>Down</td>\
      </tr>\
      <tr>\
        <td class='center clickable'><a onclick='window.sectionNavigator.up()'>U</a></td><td>Up</td>\
      </tr>\
      <tr>\
        <td class='center clickable'><a onclick='goHome()'>H</a></td><td>Home</td>\
      </tr>\
      <tr>\
        <td class='center clickable'><a onclick='window.location.reload()'>R</a></td><td>Reload</td>\
      </tr>\
      <tr>\
        <td class='center clickable'><a onclick='history.go(-1)'>B</a></td><td>Back</td>\
      </tr>\
      <tr>\
        <td class='center clickable'><a onclick='history.go(1)'>F</a></td><td>Forward</td>\
      </tr>\
      <tr>\
        <td class='center clickable'><a onclick='toggleAbout()'>A</a></td><td>Toggle About</td>\
      </tr>\
      <tr>\
        <td class='center clickable'><a onclick='toggleKeys()'>K</a></td><td>Toggle Keys</td>\
      </tr>\
      <tr>\
        <td class='center clickable'><a onclick='toggleSections()'>S</a></td><td>Toggle Sections</td>\
      </tr>\
      <tr>\
        <td class='center clickable'><a onclick='togglePages()'>Q</a></td><td>Toggle Pages</td>\
      </tr>\
      <tr>\
        <td class='center clickable'><a onclick='closeMenues()'>esc</a></td><td>Close Menus</td>\
      </tr>\
    </table>";
  }
}

function buildBottomMenu() {
  buildKeys();
  setKeys();
  // sections menu built in html at content file end
  // buildPages();  needs to be at end of content file
}

