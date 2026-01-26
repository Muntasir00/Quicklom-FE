import { API_BASE_URL } from "@config/apiConfig";

export async function fetchGeoapifySuggestions(query) {
  if (!query) return [];

  const params = new URLSearchParams({
    query: query
  });

  const url = `${API_BASE_URL}/api/v.1/user/geocode/autocomplete?${params.toString()}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status && data.data) {
      return data.data;
    }
    return [];
  } catch (error) {
    console.error("Geocode API error:", error);
    return [];
  }
}