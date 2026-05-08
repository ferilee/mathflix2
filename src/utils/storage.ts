export const resolveStorageUrl = (path: string | null | undefined) => {
  if (!path) return "";

  // If it's already a full URL, return it
  if (
    path.startsWith("http") ||
    path.startsWith("https") ||
    path.startsWith("data:")
  ) {
    return path;
  }

  const runtimeConfig = (window as any)?.APP_CONFIG;
  const storageBase =
    runtimeConfig?.STORAGE_URL || import.meta.env.VITE_STORAGE_URL || "";
  const apiBase =
    runtimeConfig?.API_URL ||
    import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD ? "/api" : "http://localhost:3000");

  const encodeStoragePath = (rawPath: string) => {
    const prefix = "/storage/";
    if (!rawPath.startsWith(prefix)) return rawPath;
    const key = rawPath.slice(prefix.length);
    const encodedKey = key
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");
    return `${prefix}${encodedKey}`;
  };

  // If path starts with /storage/, replace it with the storage base
  if (path.startsWith("/storage/")) {
    const safePath = encodeStoragePath(path);
    if (storageBase) {
      return `${storageBase.replace(/\/$/, "")}${safePath}`;
    }
    return `${apiBase.replace(/\/$/, "")}${safePath}`;
  }

  // Fallback for legacy /uploads/
  if (path.startsWith("/uploads/")) {
    return `${apiBase}${path}`;
  }

  return path;
};
