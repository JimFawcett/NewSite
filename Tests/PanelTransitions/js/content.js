/*-----------------------------------------------
  show and hide left panel in container
*/
function toggleLeftPanel() {
  console.warn('in toggleLeftPanel');
  lpanel = document.getElementById('lpanel');

  console.warn('toggling');
  lpanel.classList.toggle('hidden');
}

document.addEventListener("DOMContentLoaded", function () {
  const lpanel = document.getElementById("lpanel");

  lpanel.addEventListener("transitionstart", function (event) {
    if (lpanel.classList.contains('hidden')) {
      lpanel.style.opacity = '0';
    }
    console.warn(`Transition started on property: ${event.propertyName}`);
  });

  lpanel.addEventListener("transitionend", function (event) {
    if (!lpanel.classList.contains('hidden')) {
      lpanel.style.opacity = '1';
    }
    console.warn(`Transition ended on property: ${event.propertyName}`);
  });
});
