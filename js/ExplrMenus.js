/*
 * ExplrMenus.js - Scripts for content pages
 * ver 1.0 - 09 Dec 2024
 * Jim Fawcett
 */

function isDefined(elem) {
  if (typeof elem === 'undefined' || elem === null || elem === undefined) {
    return false;
  }
  return true;
}

function toggleAbout() {
  let abt = document.getElementById('about');
  if(isDefined(abt)) {
    abt.classList.toggle('hidden');
  }
}

function toggleKeys() {
  let keys = document.getElementById('keys');
  if(isDefined(keys)) {
    keys.classList.toggle('hidden');
  }
}

function togglePages() {
  let pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.classList.toggle('hidden');
  }
}

function toggleSections() {
  let scs = document.getElementById('sections');
  if(isDefined(scs)) {
    scs.classList.toggle('hidden');
  }
}

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
        <td class='center clickable'><a onclick='goNext()'>N;</a></td><td>Next</td>\
      </tr>\
      <tr>\
        <td class='center clickable'><a onclick='goPrev()'>P</a></td><td>Prev</td>\
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
    </table>";
  }
}

function buildSections() {
  const scs = document.getElementById('sections');
  if(isDefined(scs)) {
    scs.innerHTML =
    "<div class='darkItem menuHeader' onclick='toggleSections()'>Sections</div>\
    <div class='menuBody'>\
      <a onclick='window.scrollTo(0, 0)'>top</a>\
      <a onclick='window.scrollTo(0, document.body.scrollHeight)'>bottom</a>\
      <div style='height:0.5em;'></div>\
    </div>";
  }
}

// this function is defined in a PagesXX.js file
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
  buildSections();
  buildPages();
}

