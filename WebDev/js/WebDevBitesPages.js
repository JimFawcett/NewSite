/*
 * WebDevBitesPages.js - Builds thread page list
 * ver 1.0 - 19 Dec 2024
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>WebDev Bites Pages</div>\
    <div class='menuBody'>\
      <a href='WebDevBites_Survey.html'>Survey</a>\
      <a href='WebDevBites_Html.html'>HTML</a>\
      <a href='WebDevBites_HtmlDom.html'>HTML DOM</a>\
      <a href='WebDevBites_Css.html'>CSS Styles</a>\
      <a href='WebDevBites_JavaScript.html'>JavaScript</a>\
      <a href='WebDevBites_WebComponents.html'>Web Components</a>\
      <a href='WebDevBites_Glossary.html'>Glossary</a>\
      <hr style='margin-top:0.75rem; margin-bottom:0.5rem;'>\
      <a target='_blank' href='../Tests/DropDownList/DropDownList.html'>Drop Down List</a>\
      <a target='_blank' href='../Tests/BookMarks/BookMarks.html'>BookMarks</a>\
      <a target='_blank' href='../Tests/ImageViewerComponent/ImageViewerComponent.html'>Image Viewer</a>\
      <a target='_blank' href='../Tests/TextViewerComponent/TextViewerComponent.html'>Text Viewer</a>\
      <a target='_blank' href='../Tests/link-navigator/LinkNavigator.html'>Link Navigator</a>\
      <a target='_blank' href='../Tests/PassingObjectMsgs/ObjectMessages.html'>Passing Msgs</a>\
      <a target='_blank' href='../Tests/QueryString/QueryString.html'>QueryString</a>\
      <a target='_blank' href='../Tests/SplitterComponent/SplitterComponent.html'>Splitter Component</a>\
      <a target='_blank' href='../Tests/StackedContent/StackedContent.html'>Stacking Content Boxes</a>\
      <a target='_blank' href='../Tests/urlCookie/urlToCookie.html'>Saving urls</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
