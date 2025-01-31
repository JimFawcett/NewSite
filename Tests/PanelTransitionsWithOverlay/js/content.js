/*-----------------------------------------------
  show and hide left panel in container
*/
let panel = new Object();

panel.isLPanelOpen = true;
panel.rpanel = document.getElementById("rpanel");

panel.toggleLeftPanel = function() {

  if (this.isLPanelOpen) {
    this.rpanel.classList.add("expanded"); // Expand smoothly
    setCookie('rpanel', false, 2);
    console.log("closing panel");
  } else {
    this.rpanel.classList.remove("expanded"); // Shrink smoothly
    setCookie('rpanel', true, 2);
    console.log("opening panel");
  }

  this.isLPanelOpen = !this.isLPanelOpen;
}

panel.closePanel = function closePanel() {
  this.isLPanelOpen = false;
  this.rpanel.classList.add("expanded");
  setCookie('rpanel', false, 2);
  console.log("closing panel");
}

panel.openPanel = function openPanel() {
  this.isLPanelOpen = true;
  this.rpanel.classList.remove("expanded");
  setCookie('rpanel', true, 2);
  console.log("opening panel");
}

panel.setPanel = function setPanel() {
  let state = getCookie('rpanel');
  if(state === null) {
    setCookie('rpanel', false, 2);
    state = "false";
  }
  console.log('in setPanel: cookie value = ' + state);
  if(state === 'true') {
    // closePanel();
  } else {
    this.closePanel();
  }
}
/*---------------------------------------------------------
  Cookies are used to keep session data for managing
  display of page and section lists
*/
function setCookie(name, value, days) {
  console.log('setcookie: ' + name + '=' + value + ", " + days);
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
      console.log(cookieStr + value);      
      return value;
    }
    console.log(cookieStr + 'no value');      
  }
  return null;
}
