/*  
  link-nav.js
    provides functionality to:
    - collect links in array
    - set and remove highlight from link value
    - step to next or prev link
    - execute link when selected 
*/
// /*---------------------------------------------------------
//   Cookies are used to keep session data for managing
//   display of page and section lists
// */
// function setCookie(name, value, days) {
//   console.info('setcookie: ' + name + '=' + value + ", " + days);
//   let expires = "";
//   if (days) {
//     const date = new Date();
//     date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); // Convert days to milliseconds
//     expires = "; expires=" + date.toUTCString();
//   }
//   // const samesite = "; SameSite=Strict"; Secure;
//   const samesite = "; SameSite=Lax";
//   document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + samesite + "; path=/";
// }
// function getCookie(key) {
//   let cookieStr = 'getcookie: ' + key + ' = ';
//   const cookies = document.cookie.split("; ");
//   for (let cookie of cookies) {
//     const [trialKey, value] = cookie.split("=");
//     if(trialKey === key) {
//       console.info(cookieStr + value);      
//       return value;
//     }
//   }
//   console.info(cookieStr + 'no value');      
//   return null;
// }
class LinkNavigator {
  constructor(containerSelector) {
      this.container = document.querySelector(containerSelector);
      this.links = this.container.querySelectorAll("a");
      this.key = containerSelector + "LN";
      this.index = 0; // Start with no selection
      // this.index = getCookie(this.key);
      // if(this.index === null || this.index === false) {
      //   this.index = 0;
      //   setCookie(this.key, 0, 10);
      // }
      this.highlightCurrent();
      this.setupEventListeners();
      // this.containerSelector = containerSelector;
      // this.init();
      console.log('finished construction of LinkNavigator');
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
          // setCookie(this.key, this.index, 10);
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
          // setCookie(this.key, this.index, 10);
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
      // setCookie(this.key, this.index, 10);
      this.highlightCurrent();
  }

  // Execute the current link by updating iframe src directly
  current() {
      if (this.index === -1 && this.links.length > 0) {
          // Start with the first link if no selection
          this.index = 0;
          // setCookie(this.key, this.index, 10);
          this.highlightCurrent();
      } 

      if(this.index === this.links.length) {
        this.index--;
        // setCookie(this.key, this.index, 10);
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
