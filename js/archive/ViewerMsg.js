/*
 * ViewerMsg.js - messaging javascript
 * ver 1.0 - 09 Dec 2024
 * Jim Fawcett
 */
/*-- Explorer requests change of iframe window location --*/
function postMsg(msg) {
  let lifrm = document.getElementById("left-frame");
  lifrm.contentWindow.postMessage(msg, '*');
  let rifrm = document.getElementById("right-frame");
  rifrm.contentWindow.postMessage(msg, '*');
}
/*-- iframe responds to Explorer link click --*/
window.onmessage = function (e) {
  switch (e.data) {
    case 'esc':
      console.log('esc key');
      hideElement('blogs');
      hideElement('help');
      hideElement('res');
      break;
    case 'clear':
      /* do nothing */
      break;
    case 'loaded':
      window.parent.postMessage('loaded', '*');
      console.log('Explorer posted message to PageHost');
      break;
    default:
      // console.log('filename');
      // let fn = document.getElementById('filename');
      // fn.innerHTML = e.data; 
      // gFile = e.data;
  }
}
