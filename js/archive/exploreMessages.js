/*---------------------------------------------------------
 * exploreMessages.js
 * ver 2.0 - 17 July 2025
 * Jim Fawcett
*/
/*---------------------------------------------------------
  Post message to iframe
*/
function postMsg(msg) {
  let iframe = document.getElementById('pgframe');
  iframe.contentWindow.postMessage(msg, '*');
  console.log('posting msg: ' + msg);
  hideInfoMsgs();
}
/*---------------------------------------------------------
  Post message to Page Host
*/
function postHostMsg(msg) {
  window.top.postMessage(msg, '*');
}
/*---------------------------------------------------------
  Build key value message
*/
function makeMsg(key, value) {
  let msg = new Object();
  msg.key = key;
  msg.value = value;
  return msg;
}
window.addEventListener("message", function (event) {
  // Security check: verify origin if needed
  // if (event.origin !== "https://your-trusted-domain.com") return;

  console.info("Controller Received message:", event.data);
  switch(event.data && event.data.key) {
    case 'back':
      history.back();
      break;
    case 'forward':
      history.forward();
      break;
    case 'reload':
      location.reload();
      break;
    case 'picklist':
      showPickList();
      break;
    case 'reload-iframe': {
      window.addEventListener("message", function (event) {
  // Security check: verify origin if needed
  // if (event.origin !== "https://your-trusted-domain.com") return;

  console.info("Controller Received message:", event.data);
  switch(event.data.key) {
    case 'back':
      history.back();
      break;
    case 'forward':
      history.forward();
      break;
    case 'reload':
      location.reload();
      break;
    case 'picklist':
      showPickList();
      break;
    case 'reload-iframe': {
      console.log('in reload-iframe');
      // Find the iframe that sent the message
      const srcWin = event.source;
      const frames = document.querySelectorAll('iframe');

      for (const f of frames) {
        if (f.contentWindow === srcWin) {
          // Try same-origin fast path
          try {
            f.contentWindow.location.reload();
            // If same-origin, this already refreshed; we can return.
            return;
          } catch (_) {
            // Cross-origin or blocked: fall through to reassign src
          }

          // Force a real navigation (works cross-origin)
          try {
            const u = new URL(f.src, window.location.href);
            u.searchParams.set('_r', Date.now());   // cache-buster
            f.src = u.toString();
          } catch {
            // If f.src is empty (e.g., dynamically created about:blank), give it something real
            f.src = f.src || (f.getAttribute('data-src') || f.getAttribute('src')) || window.location.href;
          }
          return;
        }
      }
      console.warn('reload-iframe: could not find sending iframe');
      break;
    }
    default:
      console.log('no case for ' + event.data.key);
  }
  // event.data will be "Hello from sender!"
});

    }

      // const frame = document.getElementById(e.data.id);
      // if (frame) {
      //   frame.src = frame.src;   // force reload
      // }
      break;
    default:
      console.log('no case for ' + event.data.key);
  }
  // event.data will be "Hello from sender!"
});

function isDefined(elem) {
  if (typeof elem === 'undefined' || elem === null || elem === undefined) {
    return false;
  }
  return true;
}

function hideInfoMsgs() {
  // alert('in hideInfoMsgs()');
  let tpi = document.getElementById('top-menu-info');
  if(isDefined(tpi)) {
    tpi.classList.add('hidden');
  }
  let bpi = document.getElementById('bottom-menu-info');
  if(isDefined(bpi)) {
    bpi.classList.add('hidden');
  }
}

function clearMenus() {
  let blgs = document.getElementById('blogs');
  if(isDefined(blgs)) {
    blgs.classList.add('hidden');
    setCookie('blogs', false, 10);
  }
  let hlp = document.getElementById('help');
  if(isDefined(hlp)) {
    hlp.classList.add('hidden');
    setCookie('help', false, 10);
  }
  let rcs = document.getElementById('res');
  if(isDefined(rcs)) {
    rcs.classList.add('hidden');
    setCookie('res', false, 10);
  }
  let pages = document.getElementById('pages');
  if(isDefined(pages)) {
    pages.classList.add('hidden');
    setCookie('pages', false, 10);
  }
  let sections = document.getElementById('sections');
  if(isDefined(sections)) {
    sections.classList.add('hidden');
    setCookie('sections', false, 10);
  }
  let tpi = document.getElementById('top-menu-info');
  if(isDefined(tpi)) {
    tpi.classList.add('hidden');
    setCookie('top-menu-info', false, 10);
  }
  let bpi = document.getElementById('bottom-menu-info');
  if(isDefined(bpi)) {
    bpi.classList.add('hidden');
    setCookie('bottom-menu-info', false, 10);
  }
  let gt = document.getElementById('goto');
  if(isDefined(gt)) {
    gt.classList.add('hidden');
    setCookie('gt', false, 10);
  }
  postMsg(makeMsg('clear', null));
}