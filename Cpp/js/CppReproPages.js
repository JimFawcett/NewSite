/*
 * PagesTest.js - Builds thread page list
 * ver 1.0 - 19 Dec 2024
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>Cpp Story Pages</div>\
    <div class='menuBody'>\
      <a href='ReproCpp_CppUtils.html'>Cpp Utils</a>\
      <a href='ReproCpp_FileUtils.html'>File Utils</a>\
      <a href='ReproCpp_CppTesting.html'>Cpp Testing</a>\
      <a href='ReproCpp_CppLogger.html'>Cpp Logger</a>\
      <a href='ReproCpp_CppTextFinder.html'>Cpp TextFinder</a>\
      <a href='ReproCpp_CppDuplicates.html'>Cpp Duplicates</a>\
      <a href='ReproCpp_CppFileDates.html'>Cpp FileDates</a>\
      <a href='ReproCpp_CppFileSizes.html'>Cpp FileSizes</a>\
      <a href='ReproCpp_CppFindFiles.html'>Cpp FindFiles</a>\
      <a href='ReproCpp_CppCodeWebifier.html'>Cpp CodeWebifier</a>\
      <a href='ReproCpp_CppPrettyPrint.html'>Cpp PrettyPrint</a>\
      <a href='ReproCpp_CppBlockingQueue.html'>Cpp BlockingQueue</a>\
      <a href='ReproCpp_CppFileMgr.html'>Cpp FileMgr</a>\
      <a href='ReproCpp_CppProperties.html'>Cpp Properties</a>\
      <a href='ReproCpp_CppThreadPool.html'>Cpp ThreadPool</a>\
      <a href='ReproCpp_CppNoSqlDb.html'>Cpp No Sql Db</a>\
      <a href='ReproCpp_CppProcess.html'>Cpp Process</a>\
      <a href='ReproCpp_CppConcurrentFileAcess.html'>Cpp Concurrent File Acess</a>\
      <a href='ReproCpp_CppLexicalScanner.html'>Cpp Lexical Scanner</a>\
      <a href='ReproCpp_CppRetryWrapper.html'>Cpp RetryWrapper</a>\
      <a href='ReproCpp_CppWinFileSystem.html'>Cpp WinFileSystem</a>\
      <a href='ReproCpp_CppWinSockets.html'>Cpp WinSockets</a>\
      <a href='ReproCpp_CppXmlDocument.html'>Cpp XmlDocument</a>\
      <a href='ReproCpp_CppDirGraph.html'>Cpp DirGraph</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
