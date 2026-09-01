/**
 * Safe API Client Utility for MahaExam Platform
 * Handles network calls safely, preventing "Unexpected end of JSON input" errors.
 */

export async function fetchJson(url, options = {}) {
  try {
    const res = await fetch(url, options);

    // Handle 204 No Content or empty responses
    if (res.status === 204) {
      return { ok: res.ok, status: res.status, data: { success: true } };
    }

    const contentType = res.headers.get("content-type") || "";
    let data = null;

    if (contentType.includes("application/json")) {
      try {
        data = await res.json();
      } catch (jsonError) {
        console.warn(`[fetchJson] Failed to parse JSON response from ${url}:`, jsonError.message);
        data = { error: "Invalid JSON response received from server." };
      }
    } else {
      const text = await res.text();
      data = {
        error: text || `Server returned status ${res.status}`,
        isNonJson: true,
      };
    }

    return {
      ok: res.ok,
      status: res.status,
      data: data || {},
    };
  } catch (netError) {
    console.error(`[fetchJson] Network or connection error fetching ${url}:`, netError.message);
    return {
      ok: false,
      status: 0,
      data: { error: netError.message || "Network request failed. Please check your connection." },
    };
  }
}
