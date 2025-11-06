/*
 * PagesTest.js - Builds thread page list
 * ver 1.0 - 19 Dec 2024
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>Rust Repo Pages</div>\
    <div class='menuBody'>\
      <a href='RepoRust_RustLogger.html'>Logger</a>\
      <a href='RepoRust_RustTextFinder.html'>Text Finder</a>\
      <a href='RepoRust_RustBlockingQueue.html'>Blocking Queue</a>\
      <a href='RepoRust_RustThreadPool.html'>Thread Pool</a>\
      <a href='RepoRust_RustCmdLine.html'>Cmd Line</a>\
      <a href='RepoRust_RustDisplayLib.html'>Display Lib</a>\
      <a href='RepoRust_RustDirNav.html'>Dir Nav</a>\
      <a href='RepoRust_RustCommPrototype.html'>Comm Prototype</a>\
      <a href='RepoRust_RustCommPrototypeTP.html'>Comm Prototype W/TP</a>\
      <a href='RepoRust_RustStringConv.html'>String Conv</a>\
      <a href='RepoRust_RustBuildOn.html'>BuildOn</a>\
      <a href='RepoRust_RustCommExp.html'>Comm Experiments</a>\
      <a href='RepoRust_RustCommCompare.html'>CommCompare</a>\
      <a href='RepoRust_RustByteRecord.html'>Byte Record</a>\
      <a href='RepoRust_RustBasicDemos.html'>Basic Demos</a>\
      <a href='RepoRust_RustErrorHandling.html'>Error Handling</a>\
      <a href='RepoRust_RustThreading.html'>Rust Threading</a>\
      <a href='RepoRust_RustModels.html'>Rust Models</a>\
      <a href='RepoRust_RustLibraryDemos.html'>Library Demos</a>\
      <a href='RepoRust_RustBiteByByte.html'>Bite by Byte</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
