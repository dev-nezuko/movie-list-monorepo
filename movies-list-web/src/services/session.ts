const TOKEN_KEY = "userToken";
const EMAIL_KEY = "rememberedEmail";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const getRememberedEmail = () => localStorage.getItem(EMAIL_KEY) || "";
export const rememberEmail = (email: string | null) =>
  email ? localStorage.setItem(EMAIL_KEY, email) : localStorage.removeItem(EMAIL_KEY);
