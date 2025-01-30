/* Parent.js */

function isDefined(elem) {
  if (typeof elem === 'undefined' || elem === null || elem === undefined) {
    return false;
  }
  return true;
}

function load1() {
  console.log("in load1");
  const ifrm = document.getElementById('ifrm');
  if(isDefined(ifrm)) {
    console.log("ifrm: " + ifrm);
    ifrm.src = "Test1.html";
  }
}

function load2() {
  console.log("in load2");
  const ifrm = document.getElementById('ifrm');
  if(isDefined(ifrm)) {
    console.log("ifrm: " + ifrm);
    ifrm.src = "Test2.html";
  }
}
