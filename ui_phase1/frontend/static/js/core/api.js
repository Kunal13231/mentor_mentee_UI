const TOKEN_KEY = "ms.token";
const ROLE_KEY = "ms.role";

export class ApiError extends Error {
  constructor(message, code, status) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export const session = {
  get token() { return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY); },
  get role() { return localStorage.getItem(ROLE_KEY) || sessionStorage.getItem(ROLE_KEY); },
  save(token, role, remember) {
    const store = remember ? localStorage : sessionStorage;
    store.setItem(TOKEN_KEY, token);
    store.setItem(ROLE_KEY, role);
  },
  clear() {
    [localStorage, sessionStorage].forEach((s) => { s.removeItem(TOKEN_KEY); s.removeItem(ROLE_KEY); });
  },
};

async function request(method, url, { params, body } = {}) {
  const query = params ? "?" + new URLSearchParams(Object.entries(params).filter(([, v]) => v !== "" && v != null)) : "";
  const headers = { Accept: "application/json" };
  if (body) headers["Content-Type"] = "application/json";
  if (session.token) headers.Authorization = `Bearer ${session.token}`;

  let response;
  try {
    response = await fetch(url + query, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new ApiError("Unable to reach the server. Check your connection.", "NETWORK_ERROR", 0);
  }

  const payload = await response.json().catch(() => null);
  if (response.status === 401 && payload?.error_code === "UNAUTHENTICATED") {
    session.clear();
    window.location.assign("/login");
  }
  if (!payload || !payload.success) {
    throw new ApiError(payload?.message || "Something went wrong. Please try again.", payload?.error_code, response.status);
  }
  return payload.data;
}

export const api = {
  get: (url, params) => request("GET", url, { params }),
  post: (url, body) => request("POST", url, { body }),
  patch: (url, body) => request("PATCH", url, { body }),
  del: (url) => request("DELETE", url),
};
