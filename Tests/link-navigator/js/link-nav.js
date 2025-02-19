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
      this.container = document.querySelector(containerSelector);
      this.links = this.container.querySelectorAll("a");
      this.index = 0; // Start with no selection
      this.highlightCurrent();
      this.setupEventListeners();
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
      if (this.index < this.links.length - 1) {
          this.clearHighlight();
          this.index++;
          this.highlightCurrent();
          this.current();
        }
        else {
          // this.init();
          // this.clearHighlight();
          // this.index = this.links.length;
        }
  }

  // Move to the previous link (up)
  up() {
      if (this.index > 0) {
          this.clearHighlight();
          this.index--;
          this.highlightCurrent();
          this.current();
        }
        else {
          // this.init();
          // this.clearHighlight();
          // this.index = -1;
        }
  }

  // Select a link when clicked
  selectLink(index) {
      this.clearHighlight();
      this.index = index;
      this.highlightCurrent();
  }

  // Execute the current link by updating iframe src directly
  current() {
      if (this.index === -1 && this.links.length > 0) {
          // Start with the first link if no selection
          this.index = 0;
          this.highlightCurrent();
      } 

      if(this.index === this.links.length) {
        this.index--;
        this.highlightCurrent();
      }

      if (this.index >= 0 && this.index < this.links.length) {
          const link = this.links[this.index];
          console.log(`Executing: ${link.href}`);
          link.click();
          // const iframe = document.getElementById('ifrm');
          // if (iframe) {
          //     iframe.src = link.href; // Manually set iframe src
          // } else {
          //     window.open(link.href, link.target); // Fallback
          // }
      }
  }

  init() {
    const iframe = document.getElementById('ifrm');
    if (iframe) {
        iframe.src = "test_init.html"; // Manually set iframe src
    } else {
        window.open("test_init.html", link.target); // Fallback
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

      // Keyboard event for up/down navigation and Enter to activate
      document.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowDown') {
              this.down();
          } else if (e.key === 'ArrowUp') {
              this.up();
          } else if (e.key === 'Enter') {
              this.current();
          }
      });
  }
}

// Initialize the navigator after the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.linkNavigator = new LinkNavigator('#link-container');
  window.sectionNavigator = new LinkNavigator('#sections');
});
