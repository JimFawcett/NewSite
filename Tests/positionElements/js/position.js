/*-----------------------------------------------
  position.js
*/
function align(ida, idp) {
  const posp = document.getElementById(idp);
  posp.style.position = 'absolute';
  const anch = document.getElementById(ida);
  const arect = anch.getBoundingClientRect();
  const prect = posp.getBoundingClientRect();
  const leftPosition = arect.left - posp.offsetWidth;
  console.log(
    "align parts: leftPosition = " + leftPosition +
    ", anch.style.width = " + arect.width +
    ", window.scrollX = " + window.scrollX
  )
  const acstyle = window.getComputedStyle(anch);
  let awidth = acstyle.width;
  awidth = parseFloat(awidth);
  const pcstyle = window.getComputedStyle(posp);
  let pwidth = pcstyle.width;
  pwidth = parseFloat(pwidth);
  pwidth = prect.width;
  console.log("awidth: " + awidth);
  console.log("pwidth: " + pwidth);
  posp.style.left = arect.left - pwidth + window.scrollX + 'px';
  posp.style.left = leftPosition + window.scrollX + 'px';
  posp.style.top = arect.bottom + window.scrollY + 'px';
  posp.style.right = 'auto';
  posp.style.bottom = 'auto';
  console.log("align pos top & right: " + posp.style.top + ", " + posp.style.left);
}
