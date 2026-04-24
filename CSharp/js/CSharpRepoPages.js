/*
 * PagesTest.js - Builds thread page list
 * ver 1.0 - 19 Dec 2024
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>Thread Pages</div>\
    <div class='menuBody'>\
      <a href='RepoCSharp_BlockingQueue.html'>Blocking Queue</a>\
      <a href='RepoCSharp_Graph.html'>Directed Graph</a>\
      <a href='RepoCSharp_Parser.html'>C# Parser</a>\
      <a href='RepoCSharp_Navigator.html'>Dir Navigator</a>\
      <a href='RepoCSharp_ConcurrentFileAccess.html'>Concurrent File Access</a>\
      <a href='RepoCSharp_XDocument.html'>XML Document</a>\
      <a href='RepoCSharp_DependencyAnalysis.html'>Dependency Analysis</a>\
      <a href='RepoCSharp_CommPrototype.html'>Comm Prototype</a>\
      <a href='RepoCSharp_RemoteRepo.html'>Remote Pluggable Repo</a>\
      <a href='RepoCSharp_BasicDemos.html'>Basic Demos</a>\
      <a href='RepoCSharp_PubSub.html'>PublisherSubscriber</a>\
      <a href='RepoCSharp_Process.html'>Win Process</a>\
      <a href='RepoCSharp_WPF.html'>Win Pres Foundation</a>\
      <a href='RepoCSharp_WCF'>Win Comm Foundation</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
