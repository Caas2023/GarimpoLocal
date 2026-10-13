
export async function searchPlaces(query: string, city: string, state: string) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.warn("GOOGLE_MAPS_API_KEY not set. Returning mock data for demonstration.");
    return [{
      name: "Exemplo de Empresa (Mock)",
      address: `Logradouro Exemplo, ${city}, ${state}`,
      place_id: "mock_id_123"
    }];
  }

  // NOTE: Implement Places API field mask here in production.
  // Must respect Google's Terms: attribution and field restrictions.
  const response = await fetch(
    `https://places.googleapis.com/v1/places:searchText`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.id"
      },
      body: JSON.stringify({
        textQuery: `${query} in ${city}, ${state}`
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Places API error: ${response.statusText}`);
  }

  return response.json();
}
