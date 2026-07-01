const BASE_URL = "https://task-management-system-7gxl.onrender.com/api/v1";

export async function apiRequest(
  endpoint,
  method = "GET",
  body = null,
  auth = false
) {
  const headers = {
    "Content-Type": "application/json",
  };

  // Add JWT token if authentication is required
  if (auth) {
    const token = localStorage.getItem("token");

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  const data = await response.json();

  // If request failed, throw an error
  if (!response.ok) {
    const error = new Error(data.error || "Something went wrong");
    error.status = response.status;
    throw error;
  }

  // Save the HTTP status in the returned data
  data.status = response.status;

  return data;
}