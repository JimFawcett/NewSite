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
  // const samesite = "";
  document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + samesite + "; path=/";
}
function getCookie(key) {
  let cookieStr = 'getcookie: ' + key + ' = ';
  const cookies = document.cookie.split("; ");
  for (let cookie of cookies) {
    // cookie is something like "%23pages=1"
    // Split into [encodedKey, encodedValue]
    const [encodedKey, encodedVal] = cookie.split("=");
    // Decode the key before comparing
    const trialKey = decodeURIComponent(encodedKey);
    if (trialKey === key) {
      console.info(cookieStr + encodedVal);
      // The value itself might still need decodeURIComponent
      // if you want to handle special chars in the value
      return encodedVal;
    }
  }
  console.info(cookieStr + 'no value');
  return null;
}
