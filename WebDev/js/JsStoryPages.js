function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>Story Pages</div>\
    <div class='menuBody'>\
      <a href='JSStory_Prologue.html'>Prologue</a>\
      <a href='JSStory_Summary.html'>Chap 1 - JS Summary</a>\
      <a href='JSStory_Engine.html'>Chap 2 - Execution Engine</a>\
      <a href='JSStory_Objects.html'>Chap 3 - Objects &amp; Classes</a>\
      <a href='JSStory_Dom.html'>Chap 4 - DOM &amp; Styles</a>\
      <a href='JSStory_Async.html'>Chap 5 - Async Programming</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
