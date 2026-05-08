import axios from "axios";

const runtimeConfig = (window as any).APP_CONFIG;
const baseURL =
  runtimeConfig?.BILLING_API_URL ||
  import.meta.env.VITE_BILLING_API_URL ||
  runtimeConfig?.API_URL ||
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "/api" : "http://localhost:3000");

const billingApi = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default billingApi;
