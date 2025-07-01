export function setCookie(name: string, value: string, days: number) {
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }
  // biome-ignore lint/suspicious/noDocumentCookie: <>
  document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/`;
}

export function getCookie(name: string): string | null {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      const value = c.substring(nameEQ.length, c.length);
      try {
        return decodeURIComponent(value);
      } catch (e) {
        console.error('Error decoding cookie:', e);
        return null;
      }
    }
  }
  return null;
}

export function deleteCookie(name: string) {
  // biome-ignore lint/suspicious/noDocumentCookie: <>
  document.cookie = `${encodeURIComponent(name)}=; Max-Age=-99999999; Path=/`;
}
