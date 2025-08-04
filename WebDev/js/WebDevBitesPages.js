/*
 * PagesTest.js - Builds thread page list
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
      <a href='WebDevBites_HtmlDOM.html'>HTML DOM</a>\
      <a href='WebDevBites_Css.html'>CSS Styles</a>\
      <a href='WebDevBites_JavaScript.html'>JavaScript</a>\
      <a href='WebDevBites_WebComponents.html'>Web Components</a>\
      <hr style='margin-top:0.75rem; margin-bottom:0.5rem;'>\
      <a href='WebDevBites_Clickables.html'>Clickables</a>\
      <a href='WebDevBites_CodeViewer.html'>CodeViewer</a>\
      <a href='WebDevBites_FigureSizer.html'>FigureSizer</a>\
      <a href='WebDevBites_ImageViewerComponent.html'>ImageViewer</a>\
      <a href='WebDevBites_FlexExplorer.html'>FileExplorer</a>\
      <a href='WebDevBites_GridExplorerComponent.html'>GridExplorer</a>\
      <a href='WebDevBites_LinkNavigator.html'>LinkNavigator</a>\
      <a href='WebDevBites_PanelTransitionsWithOverlay.html'>PanelTransitions</a>\
      <a href='WebDevBites_PassingObjectMsgs.html'>PassMsgs</a>\
      <a href='WebDevBites_PopUpWindow.html'>PopUpWindow</a>\
      <a href='WebDevBites_PositionElements.html'>Position Elements</a>\
      <a href='WebDevBites_QueryString.html'>QueryString</a>\
      <a href='WebDevBites_ScrollingMenus.html'>Scrolling Menus</a>\
      <a href='WebDevBites_SplitterComponent.html'>Splitter Component</a>\
      <a href='WebDevBites_UrlCookie.html'>Url Cookie</a>\
      <a class='undef' href='javascript:;'>more</a>\
      <a href='WebDevBites_Glossary.html'>Glossary</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
