/*----------------------------------------------- 
  Show HTML Markup, CSS, and JavaScript
*/
  let muWindow = null;
  let stWindow = null;
  let jsWindow = null;
  let muPopupChecker = null;
  let CsPopupChecker = null;
  let JsPopupChecker = null;

  function showMarkup(id) {
    const demo = document.getElementById(id);
    const rawHTML = demo.innerHTML;

    if (!muWindow || muWindow.closed) {
      muWindow = window.open("", "MarkupPopup", "width=800, height=600, menubar=no, toolbar=no, location=no");
      muWindow.document.write(`
        <pre style="white-space: pre-wrap; overflow: auto; font-family: monospace; font-size: 0.95rem;">
${rawHTML.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}
        </pre>
      `);
      muWindow.document.close();

      // Start checking if the popup is closed
      muPopupChecker = setInterval(() => {
        if (!muWindow || muWindow.closed) {
          clearInterval(muPopupChecker);
          muPopupChecker = null;
          muWindow = null;
          console.log("Popup closed, muWindow set to null");
        }
      }, 500);
    }
    else {
      muWindow.focus();
    }
  }

  async function showCssFile(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error("Failed to load file:", err.message, err);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();

    if (!stWindow || stWindow.closed) {
      stWindow = window.open("", "CssPopup", "width=650, height=600");
      stWindow.document.write(`
        <pre style="white-space: pre-wrap; overflow: auto; font-family: monospace; font-size: 0.95rem;">
${text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}
        </pre>
      `);
      stWindow.document.close();

      // Start checking if the popup is closed
      CsPopupChecker = setInterval(() => {
        if (!stWindow || stWindow.closed) {
          clearInterval(CsPopupChecker);
          CsPopupChecker = null;
          stWindow = null;
          console.log("Popup closed, stWindow set to null");
        }
      }, 500);
    }
    else {
      stWindow.focus();
    }
  } catch (err) {
    console.error("Failed to load CSS:", err);
    alert("Failed to load CSS file.");
  }
}

  async function showJsFile(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error("Failed to load file:", err.message, err);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();

    if (!jsWindow || jsWindow.closed) {
      jsWindow = window.open("", "JsPopup", "width=600, height=700");
      jsWindow.document.write(`
        <pre style="white-space: pre-wrap; overflow: auto; font-family: monospace; font-size: 0.95rem;">
${text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}
        </pre>
      `);
      jsWindow.document.close();

      // Start checking if the popup is closed
      JsPopupChecker = setInterval(() => {
        if (!jsWindow || jsWindow.closed) {
          clearInterval(JsPopupChecker);
          JsPopupChecker = null;
          jsWindow = null;
          console.log("Popup closed, jsWindow set to null");
        }
      }, 500);
    }
    else {
      jsWindow.focus();
    }
  } catch (err) {
    console.error("Failed to load CSS:", err);
    alert("Failed to load CSS file.");
  }
}

