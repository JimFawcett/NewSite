  
  function createSiteNavMenu(containerId) {
    // 1. Safely encode the current page URL
    const currentSrc = encodeURIComponent(window.location.href);

    // 2. Define each Explorer link target
    const explorers = [
      { label: 'Rust',   url: '../Rust/ExploreRust.html' },
      { label: 'C++',    url: '../Cpp/ExploreCpp.html' },
      { label: 'C#',     url: '../CSharp/ExploreCSharp.html' },
      { label: 'Python', url: '../Python/ExplorePython.html' },
      { label: 'WebDev', url: '../WebDev/ExploreWebDev.html' },
      { label: 'SWDev',  url: '../SWDev/ExploreSWDev.html' },
      { label: 'Basics', url: '../Basics/ExploreBasics.html' },
      { label: 'Code',   url: '../Code/ExploreCode.html' }
    ];

    // 3. Build the comma-separated Explorer links
    const explorerLinks = explorers
      .map(e => `<a target="_parent" href="${e.url}?src=${currentSrc}">${e.label}</a>`)
      .join(', ');

    // 4. Full menu template
    const html = `
      <div style="
        display: flex;
        flex-direction: column;
        border: 2px solid var(--dark);
        background-color: var(--light);
        color: var(--dark);
        padding: 0.25rem 1rem 1rem;
      ">
        <div>Display this page in Explorer for:</div>
        <div class="indent">${explorerLinks}</div>

        <div>For this page:</div>
        <div class="indent">
          <a style="text-decoration:underline;" onclick="postMsg(makeMsg('back', null))">Back</a>,
          <a style="text-decoration:underline;" onclick="postMsg(makeMsg('forward', null))">Forward</a>,
          <a style="text-decoration:underline;" onclick="postMsg(makeMsg('reload', null))">Reload</a>
        </div>

        <div>For this Explorer:</div>
        <div class="indent">
          <a style="text-decoration:underline;" onclick="history.back()">Back</a>, 
          <a style="text-decoration:underline;" onclick="history.forward()">Forward</a>, 
          <a style="text-decoration:underline;" onclick="location.reload()">Reload</a>
        </div>

        <div>For Browser Window:</div>
        <div class="indent">
          <a style="text-decoration:underline;" onclick="postTopMsg(makeMsg('back', null))">Back</a>,
          <a style="text-decoration:underline;" onclick="postTopMsg(makeMsg('forward', null))">Forward</a>,
          <a style="text-decoration:underline;" onclick="postTopMsg(makeMsg('reload', null))">Reload</a>
        </div>
      </div>
    `;

    // 5. Inject into the container
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = html;
    } else {
      console.warn(`createSiteNavMenu: no element found with ID "${containerId}"`);
    }
  }

  // Automatically build on load
