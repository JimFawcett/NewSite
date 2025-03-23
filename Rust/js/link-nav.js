/*  
  link-nav.js
    provides functionality to:
    - collect links in array
    - set and remove highlight from link value
    - step to next or prev link
    - execute link when selected 
*/
class LinkNavigator {
  constructor(containerSelector) {
    console.debug("into LinkNav Constructor");
      this.container = document.querySelector(containerSelector);
      this.links = this.container.querySelectorAll("a");
      this.key = containerSelector;
      if(this.key === '#sections') {
        this.index = 0;
      }
      else { 
        let index = getCookie(this.key);
        if(index === null || index === NaN) {
          this.index = 0;
        } else {
          this.index = parseInt(index, 10);
          console.debug("parseInt(index,10): " + this.index);
        }
      }
      setCookie(this.key, this.index, 10);
      this.highlightCurrent();
      this.setupEventListeners();
      console.log('finished construction of LinkNavigator');
  }

  setIndex(index) {
    this.index = index;
  }
  
  // Remove highlighting from all links
  clearHighlight() {
      this.links.forEach(link => link.classList.remove('active'));
  }

  // Highlight the current link
  highlightCurrent() {
      if (this.index >= 0 && this.index < this.links.length) {
          this.links[this.index].classList.add('active');
      }
  }

  // Move to the next link (down)
  down() {
    console.debug("index: " + this.index + ", links.length: " + this.links.length);
    if (0 <= this.index && this.index < this.links.length - 1) {
        this.clearHighlight();
        this.index++;
        console.debug("incrementing index, now = " + this.index);
        this.highlightCurrent();
        this.current();
      }
      else {
        // do nothing
      }
  }

  // Move to the previous link (up)
  up() {
      if (this.index > 0) {
          this.clearHighlight();
          this.index--;
          console.debug("decrementing index, now = " + this.index);
          this.highlightCurrent();
          this.current();
        }
        else {
          // do nothing
        }
  }

  // Select a link when clicked
  selectLink(index) {
      this.clearHighlight();
      this.index = index;
      setCookie(this.key, this.index, 10);
      this.highlightCurrent();
  }

  // Execute the current link by updating iframe src directly
  current() {
    console.info("into link-nav current()");
    if (this.index === -1 && this.links.length > 0) {
        // Start with the first link if no selection
        this.index = 0;
        this.highlightCurrent();
    } 

    if(this.index === this.links.length) {
      this.index--;
      console.debug("decrementing index, now = " + this.index);
      this.highlightCurrent();
    }

    if (this.index >= 0 && this.index < this.links.length) {
        const link = this.links[this.index];
        console.log(`Executing: ${link.href}`);
        let dummy = this.index;
        setCookie(this.key, this.index, 10);
        link.click();
    }
  }

  init() {
    const iframe = document.getElementById('pgframe');
    if (iframe) {
        iframe.src = "test1.html"; // Manually set iframe src
    } else {
        window.open("test1.html", link.target); // Fallback
    }
  }

  // Set up event listeners for navigation and clicking
  setupEventListeners() {
      // Click event for links (no preventDefault)
      this.links.forEach((link, idx) => {
          link.addEventListener('click', () => {
              this.selectLink(idx);
          });
      });
  }
}

// Initialize the navigator after the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const linkcnt = document.getElementById('link-container');
  if(linkcnt) {
    window.linkNavigator = new LinkNavigator('#link-container');
  }
  const sections = document.getElementById('sections');
  if(sections) {
    window.sectionNavigator = new LinkNavigator('#sections');
  }
  const pages = document.getElementById('pages');
  if(pages) {
    window.pageNavigator = new LinkNavigator('#pages');
  }
});
