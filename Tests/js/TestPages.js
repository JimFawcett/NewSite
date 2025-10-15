/*
 * PagesTest.js - Builds thread page list
 * ver 1.0 - 19 Dec 2024
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>Test Pages</div>\
    <div class='menuBody'>\
      <a href='WebDevBites_Tests.html?src=../Tests/TestIntro.html'>Introduction</a>\
      <a href='WebDevBites_Tests.html?src=../Tests/DropDownList/DropDownList.html'>DropDown List</a>\
      <a href='WebDevBites_Tests.html?src=../Tests/BookMarks/BookMarks.html'>BookMarks</a>\
      <a href='WebDevBites_Tests.html?src=../Tests/link-navigator/LinkNavigator.html'>Link Navigator</a>\
      <a href='WebDevBites_Tests.html?src=../Tests/PassingObjectMsgs/ObjectMessages.html'>Msg Passing</a>\
      <a href='WebDevBites_Tests.html?src=../Tests/QueryString/QueryString.html'>QueryStrings</a>\
      <a href='WebDevBites_Tests.html?src=../Tests/urlCookie/urlToCookie.html'>url to/from cookie</a>\
      <a href='WebDevBites_Tests.html?src=../Tests/StackedContent/StackedContent.html'>Stacked Content</a>\
      <a href='WebDevBites_Tests.html?src=../Tests/ExampleLayout/ExampleLayout.html'>Page Layout</a>\
      <a href='WebDevBites_Tests.html?src=../Tests/TwoPanelComponentWithMarkersAndClick/TwoPanelComponentWithMarkersAndClick.html'>TwoPanel w/ Markers</a>\
      <a href='WebDevBites_Tests.html?src=Components/TwoPanelComponentRefactored/TwoPanelComponentRefactored.html'>TwoPanel Reformated</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
