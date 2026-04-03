/**
 * Standardized API response helpers.
 * All non-webhook API routes should use these instead of raw Response.json()
 * or NextResponse.json() to ensure a consistent response shape.
 *
 * Success shape:  { success: true,  data: T }
 * Error shape:    { success: false, error: string }
 */

export function apiOk<T>(data: T, status = 200): Response {
  return Response.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 400): Response {
  return Response.json({ success: false, error: message }, { status });
}
