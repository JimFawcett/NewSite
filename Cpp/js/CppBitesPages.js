/*
 * CppBitesPages.js - Builds thread page list
 * ver 1.1 - 14 May 2026
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>C++ Bites Pages</div>\
    <div class='menuBody'>\
      <a href='CppBites_Intro.html'>Introduction</a>\
      <a href='CppBites_Facts.html'>Facts</a>\
      <a href='CppBites_Tooling.html'>Tooling</a>\
      <a href='CppBites_HelloCpp.html'>Hello</a>\
      <a href='CppBites_DataTypes.html'>Data Types</a>\
      <a href='CppBites_Data.html'>Data</a>\
      <a href='CppBites_Strings.html'>Strings</a>\
      <a href='CppBites_Enums.html'>Enumerations</a>\
      <a href='CppBites_Structs.html'>Structs</a>\
      <a href='CppBites_DataStr.html'>Data Structures</a>\
      <a href='CppBites_Collects.html'>Collections</a>\
      <a href='CppBites_Iter.html'>Iteration</a>\
      <a href='CppBites_Funcs.html'>Functions</a>\
      <a href='CppBites_Macros.html'>Macros</a>\
      <a href='CppBites_Objects.html'>Objects</a>\
      <a href='CppBites_LifeCycle.html'>Life Cycle</a>\
      <a href='CppBites_STR.html'>Special Ops</a>\
      <a href='CppBites_Abstract.html'>Abstract Classes</a>\
      <a href='CppBites_Generics.html'>Generics</a>\
      <a href='CppBites_Traits.html'>Concepts</a>\
      <a href='CppBites_References.html'>References</a>\
      <a href='CppBites_SmartPtrs.html'>Smart Pointers</a>\
      <a href='CppBites_Safety.html'>Safety</a>\
      <a href='CppBites_UDB.html'>Undef Behavior</a>\
      <a href='CppBites_Conversions.html'>Conversions</a>\
      <a href='CppBites_Options.html'>Optional/Variant</a>\
      <a href='CppBites_ErrHnd.html'>Error Handling</a>\
      <a href='CppBites_RegEx.html'>Regular Expr</a>\
      <a href='CppBites_Threads.html'>Threads</a>\
      <a href='CppBites_Synchron.html'>Synchronization</a>\
      <a href='CppBites_Channels.html'>Channels</a>\
      <a href='CppBites_AsyncAwt.html'>Async/Await</a>\
      <a href='CppBites_Idioms.html'>Idioms</a>\
      <a href='CppBites_TipsAndTricks.html'>Tips and Tricks</a>\
      <a href='CppBites_Glossary.html'>Glossary</a>\
      <a href='CppBites_FlashCards.html'>Flash Cards</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
