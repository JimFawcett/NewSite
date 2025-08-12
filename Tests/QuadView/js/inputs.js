    const htmlInput = document.getElementById('htmlUrl');
    const cssInput  = document.getElementById('cssUrl');
    const jsInput   = document.getElementById('jsUrl');
    const loadBtn   = document.getElementById('loadBtn');

    const frame   = document.getElementById('renderFrame');
    const htmlPre = document.getElementById('htmlCode');
    const cssPre  = document.getElementById('cssCode');
    const jsPre   = document.getElementById('jsCode');

    // Optional: seed defaults for quick testing (same-origin recommended)
    // htmlInput.value = location.origin + '/Test.html';
    // cssInput.value  = location.origin + '/css/Content.css';
    // jsInput.value   = location.origin + '/js/App.js';

    loadBtn.addEventListener('click', async () => {
      const htmlUrl = htmlInput.value.trim();
      const cssUrl  = cssInput.value.trim();
      const jsUrl   = jsInput.value.trim();

      // Rendered HTML (iframe). Use src to preserve relative paths.
      if (htmlUrl) frame.src = htmlUrl;

      // Fetch text for the code panes.
      // Each fetch is isolated so one failure doesn’t block others.
      if (htmlUrl) {
        fetchText(htmlUrl)
          .then(txt => htmlPre.textContent = txt)
          .catch(err => htmlPre.textContent = `⛔ HTML fetch failed: ${err.message}`);
      } else {
        htmlPre.textContent = 'Provide an HTML URL.';
      }

      if (jsUrl) {
        fetchText(jsUrl)
          .then(txt => jsPre.textContent = txt)
          .catch(err => jsPre.textContent = `⛔ JS fetch failed: ${err.message}`);
      } else {
        jsPre.textContent = 'Provide a JavaScript URL.';
      }

      if (cssUrl) {
        fetchText(cssUrl)
          .then(txt => cssPre.textContent = txt)
          .catch(err => cssPre.textContent = `⛔ CSS fetch failed: ${err.message}`);
      } else {
        cssPre.textContent = 'Provide a CSS URL.';
      }
    });

    async function fetchText(url) {
      const res = await fetch(url, { mode: 'cors' }); // same-origin or CORS-enabled
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return res.text();
    }
