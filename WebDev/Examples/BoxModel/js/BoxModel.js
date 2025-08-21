/* BoxModel.js */
function elem_width(elemid, displayid) {
  const elem = document.getElementById(elemid);
  const display = document.getElementById(displayid);
  if(!elem || !display) return;
  // Prefer inline style if present; otherwise fall back to computed width.
  const wInline = elem.style.width;
  const w = wInline && wInline !== '' ? wInline : getComputedStyle(elem).width;
  display.textContent = w;
}
function load() {
  elem_width('content-demo', 'para');
  elem_width('box-demo', 'div');
  // Padding comes from the box element, not the table cell
  const box = document.getElementById('box-demo');
  const cs = getComputedStyle(box);

  // If padding inline (e.g., style="padding: 15px"),
  // elem.style.padding has it; otherwise use computed styless.
  const padInline = box.style.padding;
  const padText = padInline && padInline !== ''
    ? padInline
    : `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`;
  document.getElementById('padding').textContent = padText;

  // Optional: populate border widths if a cell with id="border" exists
  const borderCell = document.getElementById('border');
  if (borderCell) {
    borderCell.textContent =
      `${cs.borderTopWidth} ${cs.borderRightWidth} ${cs.borderBottomWidth} ${cs.borderLeftWidth}`;
  }
}
