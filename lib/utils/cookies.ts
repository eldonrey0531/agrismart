'use client';
import * as clientCookies from './cookies-client';

const TOKEN_NAME = 'token';

export const getCookie = (name: string): string | undefined => {
  return clientCookies.getCookie(name);
};

export const setCookie = (name: string, value: string, options?: any) => {
  clientCookies.setCookie(name, value, options);
};

export const deleteCookie = (name: string) => {
  clientCookies.removeCookie(name);
};

export const setAuthToken = (token: string) => {
  clientCookies.setAuthToken(token);
};

export const getAuthToken = () => {
  return clientCookies.getAuthToken();
};

export const removeAuthToken = () => {
  clientCookies.removeAuthToken();
};