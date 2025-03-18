/*---------------------------------------------------------
  FigureSizer.js
  - scripts for making resize-able figures
*/

/*-----------------------------------------------------
  Make element bigger
  - used in figure-sizer child content with 
    onclick="bigger(figure-sizer-Id)"
*/
function bigger(id) {
  const fig = document.getElementById(id);
  const figWidth = parseFloat(window.getComputedStyle(fig).width);
  fig.style.width = `${figWidth * 1.25}px`;
}
/*-----------------------------------------------------
  Make element smaller
  - used in figure-sizer child caption with 
    onclick="bigger(figure-sizer-Id)"
*/
function smaller(id) {
  const fig = document.getElementById(id);
  const figWidth = parseFloat(window.getComputedStyle(fig).width);
  fig.style.width = `${figWidth / 1.25}px`;
}
    