// В dev запросы идут на тот же origin (Vite proxy), иначе браузер режет CORS с localhost.
const PROD_API = "http://127.0.0.1:8000";
export const BASE_URL = "http://127.0.0.1:8000";
export const STORAGE_URL = "https://storage.yandexcloud.net/vip-boat-images";