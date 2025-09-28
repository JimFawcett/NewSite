/*---------------------------------------------------------
 * ContentMessages.js - Scripts for content messaging
 * ver 1.0 - 19 Feb 2025
 * Jim Fawcett
 */

function isDefined(elem) {
  if (typeof elem === 'undefined' || elem === null || elem === undefined) {
    return false;
  }
  return true;
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
/*---------------------------------------------------------
  Post message to Explorer Parent
  - content window posts to parent Explorer
*/
function postParentMsg(msg) {
  window.parent.postMessage(msg, '*');
}
/*---------------------------------------------------------
  Post message to Page Host
*/
function postHostMsg(msg) {
  window.top.postMessage(msg, '*');
}
function copyUrlToClipboard() {
  navigator.clipboard.writeText(window.location.href)
    .then(() => console.log('URL copied to clipboard:', window.location.href))
    .catch(err => console.error('Copy failed:', err));
}
function doUrl() {
  postMsg(makeMsg('url'));
  copyUrlToClipboard();
  alert('url');
}
/*---------------------------------------------------------
  Process messages to content pages (addEventListener version)
----------------------------------------------------------*/

// If some script set window.onmessage earlier, disable it to avoid double-handling:
try { window.onmessage = null; } catch { /* ignore */ }

// OPTIONAL: restrict to trusted origins (leave empty to accept all)
const ALLOWED_ORIGINS = [
  // 'https://your-site.example',
  // 'http://localhost:8000',
];

function contentMessageHandler(event) {
  // Origin check (optional but recommended)
  if (ALLOWED_ORIGINS.length && !ALLOWED_ORIGINS.includes(event.origin)) {
    // console.warn('Blocked message from unexpected origin:', event.origin);
    return;
  }

  const data = event.data;
  if (!data || typeof data !== 'object') return;   // ignore noise
  const { key, value } = data;
  if (!key) return;

  console.log('Message received in iframe:', key, value);

  switch (key) {
    case 'up':
      window.sectionNavigator?.up?.();
      break;

    case 'down':
      window.sectionNavigator?.down?.();
      break;

    case 'next':
      window.pageNavigator?.down?.();
      break;

    case 'prev':
      window.pageNavigator?.up?.();
      break;

    case 'sections': {
      const sections = document.getElementById('sections');
      const pages    = document.getElementById('pages');
      if (!sections || !pages) break;
      if (sections.classList.contains('hidden')) {
        sections.classList.remove('hidden');
        setCookie('sections', true, 10);
        pages.classList.add('hidden');
        setCookie('pages',   false, 10);
      } else {
        sections.classList.add('hidden');
        setCookie('sections', false, 10);
      }
      break;
    }

    case 'pages': {
      const pages    = document.getElementById('pages');
      const sections = document.getElementById('sections');
      if (!pages || !sections) break;
      if (pages.classList.contains('hidden')) {
        pages.classList.remove('hidden');
        setCookie('pages', true, 10);
        sections.classList.add('hidden');
        setCookie('sections', false, 10);
      } else {
        pages.classList.add('hidden');
        setCookie('pages', false, 10);
      }
      break;
    }

    // Content (child) message handler — only the 'clear' case shown
    case 'clear': {
      closeMenus?.();
      hideElement?.('goto');

      // Try a direct self-reload first (same as your menu button)
      // rAF → next tick helps avoid odd states when you just changed the DOM.
      requestAnimationFrame(() => {
        try {
          // If caching ever hides changes, flip to the cache-busting line below.
          location.reload();
          // OR, force a fresh fetch:
          // const u = new URL(location.href);
          // u.searchParams.set('_r', Date.now());
          // location.replace(u.toString());
        } catch (e) {
          // As a fallback, ask the parent to reload this iframe.
          try { window.parent.postMessage({ key: 'reload-iframe' }, '*'); } catch {}
        }
      });
      break;
    }

    // case 'controls':  // handled by Explorer
    //   break;

    case 'about': {
      const abt = document.getElementById('about');
      if (!abt) break;
      abt.classList.toggle('hidden');
      break;
    }

    case 'keys': {
      const kys = document.getElementById('keys');
      if (!kys) break;
      kys.classList.toggle('hidden');
      break;
    }

    case 'url': {
      const url = document.getElementById('url');
      if (!url) break;
      if (url.classList.contains('hidden')) {
        url.classList.remove('hidden');
        url.innerHTML = `<a href="${window.location.href}">${window.location.href}</a>`;
      } else {
        url.classList.add('hidden');
      }
      break;
    }

    case 'goto': {
      const gtm = document.getElementById('goto');
      if (!gtm) break;
      gtm.classList.toggle('hidden');
      break;
    }

    case 'back':
      history.back();
      break;

    case 'forward':
      history.forward();
      break;

    case 'reload':
      alert('reload');
      // Prefer replace() to avoid some odd states; reload() is fine too.
      try { location.reload(); }
      catch { location.replace(location.href); }
      break;

    default:
      console.log('no match for message data');
  }
}

// Attach once (avoid duplicate listeners if script is re-run)
if (!window.__content_msg_handler_attached__) {
  window.addEventListener('message', contentMessageHandler, false);
  window.__content_msg_handler_attached__ = true;
}
