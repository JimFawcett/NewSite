/*
 * Site.js - Scripts for the entire site
 * ver 1.0 - 09 Dec 2024
 * Jim Fawcett
 */
 
function toggleLeftPanel() {
  const leftPanel = document.getElementById('lpanel');
  leftPanel.classList.toggle('hidden');
}

/*-- Explorer requests change of iframe window location --*/
function postMsg(msg) {
  /* msg should be 'sections' or 'exit' */
  let ifrm = document.getElementById("pgframe");
  ifrm.contentWindow.postMessage(msg, '*');
}
/*-- iframe responds to Explorer link click --*/
window.onmessage = function (e) {
  // alert('into TOC msg handler');
  // alert(e.data);
  window.location.href = e.data;
}

function setbg(anchor) {
  const collection = document.getElementsByClassName("clicked");
  for(let i=0; i<collection.length; i++) {
    collection[i].style.backgroundColor = 'var(--light)';
  }
  anchor.style.backgroundColor = '#ccc';
}
