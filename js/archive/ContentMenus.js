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

/*---------------------------------------------------------
  Cookies are used to keep session data for managing
  display of page and section lists
*/
function setCookie(name, value, days) {
  console.info('setcookie: ' + name + '=' + value + ", " + days);
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); // Convert days to milliseconds
    expires = "; expires=" + date.toUTCString();
  }
  // const samesite = "; SameSite=Strict"; Secure;
  const samesite = "; SameSite=Lax";
  document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + samesite + "; path=/";
}
function getCookie(key) {
  let cookieStr = 'getcookie: ' + key + ' = ';
  const cookies = document.cookie.split("; ");
  for (let cookie of cookies) {
    const [trialKey, value] = cookie.split("=");
    if(trialKey === key) {
      console.info(cookieStr + value);      
      return value;
    }
  }
  console.info(cookieStr + 'no value');      
  return null;
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
*/
function showElement(id) {
  console.info('in showElement: id = ' + id);
  showButton(id);
  setCookie(id, 'true', 1);
}
function hideElement(id) {
  console.info('in hideElement: id = ' + id);
  hideButton(id);
  setCookie(id,'false', 1);
}
function toggleElement(id) {
  console.info('in toggleElement: id = ' + id);
  toggleButton(id);
  if (isHidden(id)) {
    setCookie(id, 'false', 1);
  } else {
    setCookie(id, 'true', 1);
  }
}

function toggleTransitionElement(id) {
  console.info('in toggleTransitionElement');
  const element = document.getElementById(id);
  if (element) {
    if (element.classList.contains('hidden')) {
      element.classList.remove('hidden');
      element.classList.add('visible');
    } else {
      element.classList.remove('visible');
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
function setPersistantElements() {
  setElements('sections');
  setElements('pages');
  // setElements('compare');
  setElements('blogs');
  setElements('help');
  setElements('res');
  setElements('lpanel');
  // postMsg('loaded');
  // align('mblogs', 'blogs');
  // align('mhelp', 'help');
  // align('mres', 'res');
}
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
        <td class='center clickable'><a onclick='goNext()'>N</a></td><td>Next</td>\
      </tr>\
      <tr>\
        <td class='center clickable'><a onclick='goPrev()'>P</a></td><td>Prev</td>\
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
        <td class='center clickable'><a onclick='toggleCompare()'>C</a></td><td>Toggle Compare</td>\
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
  buildPages();
}

