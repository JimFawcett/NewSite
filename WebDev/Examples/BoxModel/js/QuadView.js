/* Contents unique for each example */
function loadInputs() {
    const htmlInput = document.getElementById('htmlUrl');
    const cssInput  = document.getElementById('cssUrl');
    const jsInput   = document.getElementById('jsUrl');
    const loadBtn   = document.getElementById('loadBtn');

    htmlInput.value = 'BoxModel.html';
    cssInput.value  = 'css/BoxModel.css';
    jsInput.value   = 'js/BoxModel.js';
}
function loadPanes() {
  const loadBtn = document.getElementById('loadBtn');
  loadBtn.click();
}