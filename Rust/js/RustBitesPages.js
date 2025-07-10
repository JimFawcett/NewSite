/*
 * PagesTest.js - Builds thread page list
 * ver 1.0 - 19 Dec 2024
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>Rust Bites Pages</div>\
    <div class='menuBody'>\
      <a href='RustBites_Intro.html'>Introduction</a>\
      <a href='RustBites_HelloRust.html'>Hello World</a>\
      <a href='RustBites_Starting.html'>Rust Features</a>\
      <a href='RustBites_Tooling.html'>Tooling</a>\
      <a href='RustBites_Data.html'>Data Operations</a>\
      <a href='RustBites_DataTypes.html'>Data Types</a>\
      <a href='RustBites_Objects.html'>Objects</a>\
      <a href='RustBites_Generics.html'>Generics</a>\
      <a href='RustBites_Iter.html'>Iteration</a>\
      <a href='RustBites_Safety.html'>Rust Safety</a>\
      <a href='RustBites_UDB.html'>Undefined Behavior</a>\
      <a href='RustBites_FlashCards.html'>Flash Cards</a>\
      <a href='RustBites_Facts.html'>Facts</a>\
      <a href='RustBites_Strings.html'>Strings</a>\
      <a href='RustBites_DataStr.html'>Data Structures</a>\
      <a href='RustBites_SmartPtrs.html'>Smart Pointers</a>\
      <a href='RustBites_LifeCycle.html'>Life Cycle</a>\
      <a href='RustBites_Ownrs.html'>Ownership</a>\
      <a href='RustBites_Traits.html'>Traits</a>\
      <a href='RustBites_Funcs.html'>Functions</a>\
      <a href='RustBites_Structs.html'>Structs</a>\
      <a href='RustBites_LifeTime.html'>LifeTime Annot.</a>\
      <a href='RustBites_Abstract.html'>Abstractions</a>\
      <a href='RustBites_Enums.html'>Enums</a>\
      <a href='RustBites_ErrHnd.html'>Error Handling</a>\
      <a href='RustBites_Options.html'>Options</a>\
      <a href='RustBites_Conversions.html'>Conversions</a>\
      <a class='undef' href='RustBites_Collections.html'>Collections</a>\
      <a class='undef' href='RustBites_Iterators.html'>Iterators</a>\
      <a class='undef' href='RustBites_Idiomatic.html'>Idiomatic Rust</a>\
      <a class='undef' href='RustBites_Macros.html'>Macros</a>\
      <a class='undef' href='RustBites_Threads.html'>Threads</a>\
      <a class='undef' href='RustBites_Synch.html'>Synchronization</a>\
      <a class='undef' href='RustBites_RegExp.html'>Reg Expressions</a>\
      <a class='undef' href='RustBites_HacksHelps.html'>Helpers</a>\
      <a class='undef' href='RustBites_CodeExper.html'>Code Experim</a>\
      <a href='RustBites_References.html'>References</a>\
      <a href='RustBites_Glossary.html'>Glossary</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
