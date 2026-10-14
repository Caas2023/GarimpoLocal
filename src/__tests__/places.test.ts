import { searchPlaces } from '../lib/places-api';

describe('searchPlaces', () => {
  const originalEnv = process.env.GOOGLE_MAPS_API_KEY;

  afterEach(() => {
    process.env.GOOGLE_MAPS_API_KEY = originalEnv;
  });

  it('retorna mock data quando GOOGLE_MAPS_API_KEY não está definida', async () => {
    delete process.env.GOOGLE_MAPS_API_KEY;
    const results = await searchPlaces('Restaurante', 'Guarulhos', 'SP');
    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].place_id).toBe('mock_id_123');
  });

  it('faz requisição correta para Places API quando GOOGLE_MAPS_API_KEY está definida', async () => {
    process.env.GOOGLE_MAPS_API_KEY = 'fake_test_api_key';

    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ places: [{ id: 'place_1', displayName: { text: 'Empresa Teste' } }] })
    });
    global.fetch = mockFetch as unknown as typeof fetch;

    const results = await searchPlaces('Padaria', 'Guarulhos', 'SP');
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('places.googleapis.com');
    expect(options.headers['X-Goog-Api-Key']).toBe('fake_test_api_key');
    expect(results.places).toBeDefined();
  });
});
