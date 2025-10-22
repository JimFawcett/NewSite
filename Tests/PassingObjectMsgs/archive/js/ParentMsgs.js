function createMessage(dest, key, value) {
  let msg = new Object();
  msg.dst = dest;
  msg.key = key;
  msg.value = value;
  return msg;
}
/*-- Explorer requests change of iframe window location --*/
function postMsg(msg) {
  let ifrm = document.getElementById("pgframe");
  ifrm.contentWindow.postMessage(msg, "*");
}
/*-- iframe responds to Explorer link click --*/
window.onmessage = function (e) {
  switch (e.data.key) {
    case 'display':
      console.log('esc key');
      const dest = document.getElementById('dest');
      if(isDefined(dest)) {
        dest.innerHTML = 
        'dest: ' + dest + '<br>key: ' + key + '<br>value: ' + value;
      }
      break;
    case 'clear':
      /* do nothing */
      break;
    case 'loaded':
      window.parent.postMessage('loaded', '*');
      console.log('Explorer posted message to PageHost');
      break;
    default:
      console.log('filename');
      let fn = document.getElementById('filename');
      fn.innerHTML = e.data + ":"; 
      gFile = e.data;
  }
}
