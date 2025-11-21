/*
 * PagesTest.js - Builds thread page list
 * ver 1.0 - 19 Dec 2024
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>Cpp Repo Pages</div>\
    <div class='menuBody'>\
      <a href='RepoCpp_CppUtils.html'>CppUtils</a>\
      <a href='RepoCpp_FileUtils.html'>FileUtils</a>\
      <a href='RepoCpp_Testing.html'>Testing</a>\
      <a href='RepoCpp_Logger.html'>Logger</a>\
      <a href='RepoCpp_TextFinder.html'>TextFinder</a>\
      <a href='RepoCpp_Duplicates.html'>Duplicates</a>\
      <a href='RepoCpp_FileDates.html'>FileDates</a>\
      <a href='RepoCpp_FileSizes.html'>FileSizes</a>\
      <a href='RepoCpp_FindFiles.html'>FindFiles</a>\
      <a href='RepoCpp_CodeWebifier.html'>CodeWebifier</a>\
      <a href='RepoCpp_PrettyPrint.html'>PrettyPrint</a>\
      <a href='RepoCpp_BlockingQueue.html'>BlockingQueue</a>\
      <a href='RepoCpp_FileMgr.html'>FileMgr</a>\
      <a href='RepoCpp_CppProperties.html'>Cpp Properties</a>\
      <a href='RepoCpp_ThreadPool.html'>ThreadPool</a>\
      <a href='RepoCpp_NoSqlDb.html'>NoSqlDb</a>\
      <a href='RepoCpp_Process.html'>Process</a>\
      <a href='RepoCpp_ConcurrentFileAccess.html'>ConcurrentFileAccess</a>\
      <a href='RepoCpp_LexicalScanner.html'>LexicalScanner</a>\
      <a href='RepoCpp_RetryWrapper.html'>RetryWrapper</a>\
      <a href='RepoCpp_WinFileSystem.html'>WinFileSystem</a>\
      <a href='RepoCpp_WinSockets.html'>WinSockets</a>\
      <a href='RepoCpp_XmlDocument.html'>XmlDocument</a>\
      <a href='RepoCpp_DirGraph.html'>DirGraph</a>\
      <a href='RepoCpp_CppParser.html'>Cpp Parser</a>\
      <a href='RepoCpp_CodeAnalyzer.html'>Cpp CodeAnalyzer</a>\
      <a href='RepoCpp_CommWithFileXfer.html'>CommWithFileXfer</a>\
      <a href='RepoCpp_HttpClientServer.html'>HttpClientServer</a>\
      <a href='RepoCpp_CMakeDemo.html'>CMakeDemo</a>\
      <a href='RepoCpp_BasicDemos.html'>BasicDemos</a>\
      <a href='RepoCpp_STRValueType.html'>STRValueType</a>\
      <a href='RepoCpp_CompoundObjects.html'>CompoundObjects</a>\
      <a href='RepoCpp_ObjectFactories.html'>Object Factories</a>\
      <a href='RepoCpp_TemplateTechniques.html'>TemplateTechniques</a>\
      <a href='RepoCpp_STL-Containers.html'>STL-Containers</a>\
      <a href='RepoCpp_IOStreams.html'>IOStreams</a>\
      <a href='RepoCpp_Threads.html'>Threads</a>\
      <a href='RepoCpp_ProcsAndThreads.html'>Procs and Threads</a>\
      <a href='RepoCpp_Interop.html'>Interop</a>\
      <a href='RepoCpp_CppModels.html'>CppModels</a>\
      <a href='RepoCpp_CppModelsVideos.html'>CppModelsVideos</a>\
      <a href='RepoCpp_CppStory.html'>CppStory</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
