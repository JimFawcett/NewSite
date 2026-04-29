/*
 * SWDevBitesPages.js - Builds SWDev bites page list
 * ver 1.1 - 29 Apr 2026
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>SWDev Bites Pages</div>\
    <div class='menuBody'>\
      <div class='darkItem' style='padding-left:0.5rem; font-size:0.9rem'>Design</div>\
      <a href='SWDesignBites_Intro.html'>Intro</a>\
      <a href='SWDesignBites_Structure.html'>Structure</a>\
      <a href='SWDesignBites_StructureBasic.html'>Monolithic</a>\
      <a href='SWDesignBites_StructureFactored.html'>Factored</a>\
      <a href='SWDesignBites_StructureDataFlow.html'>Data Flow</a>\
      <a href='SWDesignBites_StructureTypeErase.html'>Type Erase</a>\
      <a href='SWDesignBites_StructurePlugin.html'>Plugin</a>\
      <div class='darkItem' style='padding-left:0.5rem; font-size:0.9rem'>Deploy</div>\
      <a href='SWDeployBites_Intro.html'>Intro</a>\
      <a href='SWDeployBites_Process.html'>Process</a>\
      <a href='SWDeployBites_Git.html'>Config Mgmt</a>\
      <a class='undef' href='javascript:;'>Scripting</a>\
      <a class='undef' href='javascript:;'>Containers</a>\
      <a class='undef' href='javascript:;'>Platforms</a>\
      <a class='undef' href='javascript:;'>Publication</a>\
      <a class='undef' href='javascript:;'>Use Cases</a>\
      <div class='darkItem' style='padding-left:0.5rem; font-size:0.9rem'>General</div>\
      <a href='SWDevBites_Glossary.html'>Glossary</a>\
      <a href='SWDevReferences.html'>References</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
