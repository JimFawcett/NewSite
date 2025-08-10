
  let muWindow = null;
  let stWindow = null;

  function showMarkup(id) {
      const demo = document.getElementById(id);
      const rawHTML = demo.innerHTML;

      if (!muWindow || muWindow.closed) {
        muWindow = window.open("", "MarkupPopup", "width=600,height=600");
        muWindow.document.write(`
          <pre style="white-space: pre-wrap; overflow: auto; font-family: monospace; font-size: 0.95rem;">
${rawHTML.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}
          </pre>
        `);
        // popup.document.close();
        muWindow.document.close();
      }
      else {
        muWindow.focus();
      }
    }

    async function showCssFile(cssUrl) {
    try {
      const response = await fetch(cssUrl);
      if (!response.ok) {
        console.error("Failed to load CSS:", err.message, err);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const cssText = await response.text();

      if (!stWindow || stWindow.closed) {
        stWindow = window.open("", "CssPopup", "width=600,height=400");
        stWindow.document.write(`
          <pre style="white-space: pre-wrap; overflow: auto; font-family: monospace; font-size: 0.95rem;">
${cssText.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}
          </pre>
        `);
        stWindow.document.close();
      }
      else {
        stWindow.focus();
      }
    } catch (err) {
      console.error("Failed to load CSS:", err);
      alert("Failed to load CSS file.");
    }
  }

