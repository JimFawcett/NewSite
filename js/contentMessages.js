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
/*---------------------------------------------------------
  Process messages to content pages
*/
window.onmessage = function (event) {
  console.log("Message received in iframe:" + event.data.key + ", " + event.data.value);
  switch(event.data.key) {
    case 'up':
      window.sectionNavigator.up();
      break;
    case 'down':
      window.sectionNavigator.down();
      break;
    case 'next':
      window.pageNavigator.down();
      break;
    case 'prev':
      window.pageNavigator.up();
      break;
    case 'sections':
      let sections = document.getElementById('sections');
      if(sections.classList.contains('hidden')) {
        sections.classList.remove('hidden');
        setCookie('sections', true, 10);
        let pages = document.getElementById('pages');
        pages.classList.add('hidden');
        setCookie('pages', false, 10);
      } else {
        sections.classList.add('hidden');
        setCookie('sections', false, 10);
      }
      break;
    case 'pages':
      let pages = document.getElementById('pages');
      if(pages.classList.contains('hidden')) {
        pages.classList.remove('hidden');
        setCookie('pages', true, 10);
        let sections = document.getElementById('sections');
        sections.classList.add('hidden');
        setCookie('sections', false, 10);
      } else {
        pages.classList.add('hidden');
        setCookie('pages', false, 10);
      }
      break;

    case 'clear':
      closeMenus();
      break;

    // case 'controls':
    // - handled by Explorer

    case 'about':
      let abt = document.getElementById('about');
      if(abt.classList.contains('hidden')) {
        abt.classList.remove('hidden');
      } else {
        abt.classList.add('hidden');
      }
      break;

    case 'keys':
      let kys = document.getElementById('keys');
      if(kys.classList.contains('hidden')) {
        kys.classList.remove('hidden');
      } else {
        kys.classList.add('hidden');
      }
      break;

    case 'url':
      // alert('url');
      let url = document.getElementById('url');
      if(url.classList.contains('hidden')) {
        url.classList.remove('hidden');
        url.innerHTML='<a href=' + window.location.href + '>' + window.location.href + '</a>';
      } else {
        url.classList.add('hidden');
      }
      // alert('done');
      break;

    case 'goto':
      // alert('url');
      let gtm = document.getElementById('goto');
      if(gtm.classList.contains('hidden')) {
        gtm.classList.remove('hidden');
        // gtm.innerHTML='<a href=' + window.location.href + '>' + window.location.href + '</a>';
        // gtm.innerHTML=
        //   "<div style='display:flex; flex-direction:column; flexwrap:nowrap;'>"
        //    + "<div>This Page:</div>"
        //    + "<div>foobar</div><br>" 
        //    + "</div>";
      } else {
        gtm.classList.add('hidden');
      }
      // alert('done');
      break;

    case 'back':
      history.back();
      break;
        
    case 'forward':
      history.forward();
      break;
        
    case 'reload':
      alert('reload');
      location.reload();
      break;
        
    default:
      console.log('no match for message data');
  }
};
