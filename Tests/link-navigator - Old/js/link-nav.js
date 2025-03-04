/*  
  link-nav.js
    provides functionality to:
    - collect links in array
    - set and remove highlight from link value
    - step to next or prev link
    - execute link when selected 
*/
/*---------------------------------------------------------
  Cookies are used to keep session data for managing
  display of page and section lists
*/
function setCookie(name, value, days) {
  console.info('setcookie: ' + name + '=' + value + ", " + days);
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); // Convert days to milliseconds
    expires = "; expires=" + date.toUTCString();
  }
  // const samesite = "; SameSite=Strict"; Secure;
  const samesite = "; SameSite=Lax";
  document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + samesite + "; path=/";
}
function getCookie(key) {
  let cookieStr = 'getcookie: ' + key + ' = ';
  const cookies = document.cookie.split("; ");
  for (let cookie of cookies) {
    const [trialKey, value] = cookie.split("=");
    if(trialKey === key) {
      console.info(cookieStr + value);      
      return value;
    }
  }
  console.info(cookieStr + 'no value');      
  return null;
}
// function makeMsgLN(key, value) {
//   let msg = new Object();
//   msg.key = key;
//   msg.value = value;
//   console.info("link-nav makeMsg: " + key + ", " + value);
//   return msg;
// }
// function postMsgLN(msg) {
//   window.parent.postMessage(msg);
//   console.info('posting msg from link-nav');
// }
// window.addEventListener("message", function (event) {
//   // Security check: verify origin if needed
//   // if (event.origin !== "https://your-trusted-domain.com") return;

//   console.info("link-nav Received message:", event.data);
//   // event.data will be "Hello from sender!"
// });    

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
        if(index === "null" || index === "NaN") {
          this.index = 0;
        } else {
          this.index = parseInt(index, 10);
          console.debug("parseInt(index,10): " + this.index);
        }
      }
      setCookie(this.key, this.index, 10);
      // this.index = 0; // Start with no selection
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
    console.debug("index: " + this.index + ", links.length: " + this.links.length);
    if (0 <= this.index && this.index < this.links.length - 1) {
        this.clearHighlight();
        this.index++;
        console.debug("incrementing index, now = " + this.index);
        // setCookie(this.key, this.index, 10);
        this.highlightCurrent();
        this.current();
      }
      else {
        this.index = 0;
        this.highlightCurrent();
        this.current();
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
          console.debug("decrementing index, now = " + this.index);
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
      setCookie(this.key, this.index, 10);
      this.highlightCurrent();
  }

  // Execute the current link by updating iframe src directly
  current() {
    console.info("into link-nav current()");
    if (this.index === -1 && this.links.length > 0) {
        // Start with the first link if no selection
        this.index = 0;
        // setCookie(this.key, this.index, 10);
        this.highlightCurrent();
    } 

    if(this.index === this.links.length) {
      this.index--;
      console.debug("decrementing index, now = " + this.index);
      // setCookie(this.key, this.index, 10);
      this.highlightCurrent();
    }

    if (this.index >= 0 && this.index < this.links.length) {
        const link = this.links[this.index];
        console.log(`Executing: ${link.href}`);
        // postMsgLN(makeMsgLN('page-index', this.index));
        setCookie(this.key, this.index, 10);
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
