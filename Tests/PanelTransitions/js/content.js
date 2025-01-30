/*-----------------------------------------------
  show and hide left panel in container
*/
function toggleLeftPanel() {
  console.log('in toggleLeftPanel');
  lpanel = document.getElementById('lpanel');
  console.log('toggling');
  lpanel.classList.toggle('hidden');
}