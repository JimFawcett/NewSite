/*
 * PagesTest.js - Builds thread page list
 * ver 1.0 - 19 Dec 2024
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>SWDev Bites Pages</div>\
    <div class='menuBody'>\
      <a href='SWDesignBites_Intro.html'>Introduction</a>\
      <a href='SWDesignBites_Structure.html'>Structure</a>\
      <a href='SWDesignBites_StructureBasic.html'>Monolithic</a>\
      <a href='SWDesignBites_StructureFactored.html'>Factored</a>\
      <a href='SWDesignBites_StructureDataFlow.html'>Data Flow</a>\
      <a href='SWDesignBites_StructureTypeErase.html'>Type Erase</a>\
      <a href='SWDesignBites_StructurePlugin.html'>Plugin</a>\
      <a href='SWDevProjects.html'>SW Projects</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
