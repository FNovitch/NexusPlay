const localApiUrl = "http://localhost:4000/api/v1";

export const apiBaseUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? localApiUrl : "");

if (!apiBaseUrl) {
  throw new Error("VITE_API_URL precisa ser configurada para o frontend em producao.");
}

export const backendOrigin = import.meta.env.VITE_BACKEND_URL || new URL(apiBaseUrl).origin;
export const demoMode = import.meta.env.VITE_DEMO_MODE === "true";
