/* 
  DataMgr.js
*/
function togglePanel() {
  const rpanel = document.getElementById('rpanel');
  rpanel.classList.toggle('hidden');
}
function showLoc(target) {
  const loc = window.location.href;
  target.innerHTML = loc;
}
function load() {
  const loc = document.getElementById('showloc');
  showLoc(loc);
}
