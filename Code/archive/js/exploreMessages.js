function postMsg(msg) {
  let iframe = document.getElementById('pgframe');
  iframe.contentWindow.postMessage(msg, '*');
  console.log('posting msg: ' + msg);
}
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
  // event.data will be "Hello from sender!"
});

function isDefined(elem) {
  if (typeof elem === 'undefined' || elem === null || elem === undefined) {
    return false;
  }
  return true;
}

function clearMenus() {
  let blgs = document.getElementById('blogs');
  if(isDefined(blgs)) {
    blgs.classList.add('hidden');
  }
  let hlp = document.getElementById('help');
  if(isDefined(hlp)) {
    hlp.classList.add('hidden');
  }
  let rcs = document.getElementById('res');
  if(isDefined(rcs)) {
    rcs.classList.add('hidden');
  }
  postMsg(makeMsg('clear', null));
}