function saveUrlToCookie(url, cookieName = "savedUrl", daysToExpire = 7) {
  const encodedUrl = encodeURIComponent(url);

  // Calculate expiration date
  const date = new Date();
  date.setTime(date.getTime() + (daysToExpire * 24 * 60 * 60 * 1000));
  const expires = "expires=" + date.toUTCString();

  // Set cookie
  document.cookie = `${cookieName}=${encodedUrl}; ${expires}; path=/; SameSite=Lax`;
}

// Retrieve URL from cookie
function getUrlFromCookie(cookieName = "savedUrl") {
  const cookies = document.cookie.split("; ");
  const target = cookies.find(row => row.startsWith(`${cookieName}=`));
  return target ? decodeURIComponent(target.split("=")[1]) : null;
}


