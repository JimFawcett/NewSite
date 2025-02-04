/*---------------------------------------------------------
  Pages embedded in an Explorer's iframe communicate 
  to the Explorer by posting a message with this 
  function.
  - usually used to send back its filename so Explorer
    can put the name in its footer when page loads.
*/
function postMsg(msg) {
  // let ifrm = document.getElementById("pgframe");
  // ifrm.contentWindow.postMessage(msg, '*');
  window.parent.postMessage(msg, '*');
}
/*---------------------------------------------------------
  Message handler
  - Explorers post an event name, e.g., name of button
    action.  
  - Page embedded in iframe receives those messages
    here and generates an approprate action, often
    displaying a menu or form.
*/
window.onmessage = function (e) {
  console.log('in msg loop: msg = ' + e.data);
  const msg = e.data;
  let dst = `${msg.dst}`;
  console.log('msg.dst: ' + dst);
  let key = `${msg.key}`;
  console.log('msg.key: ' + key);
  let value = `${msg.value}`;
  console.log('msg.value: ' + value);
  const elem = document.getElementById(dst);
  switch (key) {
    case 'display':
      console.log('display key');
      if(isDefined(elem)) {
        elem.innerHTML = 
        'dst: &nbsp;&nbsp;' + dst + '<br>key: &nbsp;&nbsp;' + key + '<br>value: ' + value;
      }
      break;
    case 'clear':
      if(isDefined(elem)) {
        elem.innerHTML = 
        'dst: &nbsp;&nbsp;' + dst + '<br>key: &nbsp;&nbsp;' + key + '<br>value: ' + value;
      }
      break;
    default:
      console.log('default');
      if(isDefined(elem)) {
        elem.innerHTML = value;
      }
  }
}
