/* Contents unique for each example */
function loadInputs() {
    const htmlInput = document.getElementById('htmlUrl');
    const cssInput  = document.getElementById('cssUrl');
    const jsInput   = document.getElementById('jsUrl');
    const loadBtn   = document.getElementById('loadBtn');

    htmlInput.value = 'FlowModel.html';
    cssInput.value  = 'css/FlowModel.css';
    jsInput.value   = 'none';
}
function loadPanes() {
  const loadBtn = document.getElementById('loadBtn');
  loadBtn.click();
}