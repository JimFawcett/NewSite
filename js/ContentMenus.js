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
  console.log('setcookie: ' + name + '=' + value);
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); // Convert days to milliseconds
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/";
}
function getCookie(key) {
  console.log('getcookie: ' + key);
  const cookies = document.cookie.split("; ");
  for (let cookie of cookies) {
    const [trialKey, value] = cookie.split("=");
    if(trialKey === key) return value;
  }
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
  // console.log('in togglePages()');
  toggleButton('pages');
  if (isHidden('pages')) {
    setCookie('pages', 'false');
  } else {
    setCookie('pages', 'true');
  }
}
/*---------------------------------------------------------
  The Sections functions record hidden state in 
  cookie with 'sections' key
  - actions are persistent, do not revert on refresh
*/
function showSections() {
  showButton('sections');
  setCookie('sections', 'true');
}
function hideSections() {
  hideButton('sections');
  setCookie('sections','false');
}
function toggleSections() {
  // console.log('in toggle sections');
  toggleButton('sections');
  if (isHidden('sections')) {
    setCookie('sections', 'false');
  } else {
    setCookie('sections', 'true');
  }
}
/*---------------------------------------------------------
  The Element functions are the most general, accepting
  an element id for action.
  - persistent, actions do not revert on refresh
*/
function showElement(id) {
  console.log('in showElement: id = ' + id);
  showButton(id);
  setCookie(id, 'true');
}
function hideElement(id) {
  console.log('in hideElement: id = ' + id);
  hideButton(id);
  setCookie(id,'false');
}
function toggleElement(id) {
  console.log('in toggleElement: id = ' + id);
  toggleButton(id);
  if (isHidden(id)) {
    setCookie(id, 'false');
  } else {
    setCookie(id, 'true');
  }
}
/*---------------------------------------------------------
  manage site session variables with cookies
  - used to make compare, pages and sections list state
    persistant across page loading
*/
function setElements(id) {
  console.log('in setElements: id = ' + id);
  let state = getCookie(id);
  console.log('state: ' + state);
  switch(state) {
    case null:
      setCookie(id, 'false');
      // console.log('id: ' + id)
      // console.log('cookie value: ' + getCookie(id));
      break;
    case 'true':
      toggleElement(id);
      // console.log('cookie value: ' + getCookie(id));
      break;
    case 'false':
      // console.log('cookie value: ' + getCookie(id));
    default:
  }
}
/*---------------------------------------------------------
  loader method collects load actions for all persistent
  elements
*/
function setPersistantElements() {
  setElements('sections');
  setElements('pages');
  setElements('compare');
  setElements('blogs');
  setElements('help');
  setElements('res');
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
        <td class='center clickable'><a onclick='location.reload()'>R</a></td><td>Reload</td>\
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

/*---------------------------------------------------------
  sections menu built with html at end of each content page 
*/
// function buildSections() {
//   const scs = document.getElementById('sections');
//   if(isDefined(scs)) {
//     scs.innerHTML =
//     "<div class='darkItem menuHeader' onclick='toggleSections()'>Sections</div>\
//     <div class='menuBody'>\
//       <a href='#top'>top</a>\
//       <a href='#bottom'>bottom</a>\
//       <div style='height:0.5em;'></div>\
//     </div>";
//   }
// }

/*---------------------------------------------------------
  pages menu is built with javascript in XXPages.js file 
  which defines buildPages() function.
*/
// this function is defined in a XXPages.js file
// function buildPages() {
//   const pgs = document.getElementById('pages');
//   if(isDefined(pgs)) {
//     pgs.innerHTML =
//     "<div class='darkItem menuHeader' onclick='togglePages()'>Pages</div>\
//     <div class='menuBody'>\
//       <a href='SiteHome.html'>Site Home</a>\
//       </div>\
//     <div style='height:0.5em;'></div>";
//   }
// }

function buildBottomMenu() {
  buildKeys();
  setKeys();
  // sections menu built in html at content file end
  buildPages();
}

