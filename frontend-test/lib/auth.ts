import Cookies from "js-cookie";

const TOKEN_KEY = "access_token";

export const setToken = (token: string) => {
  Cookies.set(TOKEN_KEY, token, { expires: 1, sameSite: "Lax" });
};

export const getToken = (): string | undefined => {
  return Cookies.get(TOKEN_KEY);
};

export const clearToken = () => {
  Cookies.remove(TOKEN_KEY);
};

export const isLoggedIn = (): boolean => {
  return !!getToken();
};
