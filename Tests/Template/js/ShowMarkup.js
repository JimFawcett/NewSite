    function showMarkup(id) {
      const demo = document.getElementById(id);
      const rawHTML = demo.innerHTML;

      const popup = window.open("", "MarkupPopup", "width=600,height=600");
      if (popup) {
        popup.document.write(`
          <pre style="white-space: pre-wrap; overflow: auto; font-family: monospace; font-size: 0.95rem;">
${rawHTML.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}
          </pre>
        `);
        popup.document.close();
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

      const popup = window.open("", "CssPopup", "width=600,height=400");
      if (popup) {
        popup.document.write(`
          <pre style="white-space: pre-wrap; overflow: auto; font-family: monospace; font-size: 0.95rem;">
${cssText.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}
          </pre>
        `);
        popup.document.close();
      }
    } catch (err) {
      console.error("Failed to load CSS:", err);
      alert("Failed to load CSS file.");
    }
  }

