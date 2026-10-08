export async function readSpotifyError(response: Response): Promise<{
  error: string;
  message: string;
  status: number;
}> {
  const body = (await response.json().catch(() => ({}))) as {
    error?: { status?: number; message?: string; reason?: string };
  };

  const reason = body.error?.reason;
  const message = body.error?.message ?? "Spotify-Anfrage fehlgeschlagen.";

  if (response.status === 401) {
    return { error: "not_connected", message: "Bitte erneut mit Spotify verbinden.", status: 401 };
  }
  if (response.status === 403 || reason === "PREMIUM_REQUIRED") {
    return {
      error: "premium_required",
      message: "Spotify Premium wird für die Fernsteuerung benötigt.",
      status: 403,
    };
  }
  if (response.status === 404 || reason === "NO_ACTIVE_DEVICE") {
    return {
      error: "no_device",
      message: "Kein aktives Spotify-Gerät. Öffne die Spotify-App auf dem Handy.",
      status: 409,
    };
  }

  return { error: reason ?? "spotify_error", message, status: response.status };
}
