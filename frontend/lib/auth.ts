export function getToken(): string | null {
  return localStorage.getItem("jwt");
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export function logout() {
  localStorage.removeItem("jwt");
  window.location.href = "/login";
}
