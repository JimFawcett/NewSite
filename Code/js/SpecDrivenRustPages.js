/*
 * SpecDrivenRustPages.js - Builds the Spec-Driven Rust thread page list
 * ver 1.0 - 15 Sep 2026
 * Jim Fawcett
 */

function buildPages() {
  const pgs = document.getElementById('pages');
  if(isDefined(pgs)) {
    pgs.innerHTML =
    "<div class='darkItem listheader' onclick='togglePages()'>Spec-Driven: Rust</div>\
    <div class='menuBody'>\
      <a href='Spec_Driven_Design_Rust_Process.html'>0. Process</a>\
      <a href='Spec_Driven_Design_Rust_Structure.html'>1. Structure</a>\
      <a href='Spec_Driven_Design_Rust_Entry.html'>2. Entry</a>\
      <a href='Spec_Driven_Design_Rust_Cmdline.html'>3. Cmdline</a>\
      <a href='Spec_Driven_Design_Rust_Dirnav.html'>4. Dirnav</a>\
      <a href='Spec_Driven_Design_Rust_Output.html'>5. Output</a>\
      <a href='Spec_Driven_Design_Rust_Testing.html'>6. Testing</a>\
      <a href='Spec_Driven_Design_Rust_Demonstration.html'>7. Demonstration</a>\
      </div>\
    <div style='height:0.5em;'></div>";
  }
}
