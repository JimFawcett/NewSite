function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>Story Pages</div>\
    <div class='menuBody'>\
      <a href='CSSStory_Prologue.html'>Prologue</a>\
      <a href='CSSStory_Summary.html'>Chap 1 - CSS Summary</a>\
      <a href='CSSStory_Layout.html'>Chap 2 - Layout</a>\
      <a href='CSSStory_Features.html'>Chap 3 - Features</a>\
      <a href='CSSStory_Positioning.html'>Chap 4 - Positioning</a>\
      <a href='CSSStory_StyleManagement.html'>Chap 5 - Style Management</a>\
      <a href='CSSStory_Tut_and_refs.html'>Chap 6 - Tutorials &amp; References</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
