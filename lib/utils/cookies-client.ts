const TOKEN_NAME = 'token';

export const setCookie = (name: string, value: string, expires?: Date) => {
  document.cookie = `${name}=${value}; path=/; max-age=${
    60 * 60 * 24 * 7
  }; SameSite=Lax${
    process.env.NODE_ENV === 'production' ? '; Secure' : ''
  }`;
};

export const getCookie = (name: string): string | undefined => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift();
  }
};

export const removeCookie = (name: string) => {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
};

// Auth specific methods
export const setAuthToken = (token: string) => {
  setCookie(TOKEN_NAME, token);
  localStorage.setItem(TOKEN_NAME, token);
};

export const getAuthToken = () => {
  return localStorage.getItem(TOKEN_NAME) || getCookie(TOKEN_NAME);
};

export const removeAuthToken = () => {
  removeCookie(TOKEN_NAME);
  localStorage.removeItem(TOKEN_NAME);
};