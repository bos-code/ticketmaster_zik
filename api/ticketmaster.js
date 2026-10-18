module.exports = async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  const apiKey = process.env.TICKETMASTER_API_KEY;
  if (!apiKey) return response.status(503).json({ error: 'Ticketmaster lookup is not configured.' });
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: 'Unsupported request.' });
  }
  const keyword = String(request.query.q || '').trim().slice(0, 100);
  if (keyword.length < 2) return response.status(200).json({ events: [] });

  const url = new URL('https://app.ticketmaster.com/discovery/v2/events.json');
  url.searchParams.set('apikey', apiKey);
  url.searchParams.set('keyword', keyword);
  url.searchParams.set('size', '20');
  url.searchParams.set('sort', 'date,asc');
  try {
    const upstream = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!upstream.ok) return response.status(502).json({ error: `Ticketmaster request failed (${upstream.status}).` });
    const data = await upstream.json();
    return response.status(200).json({ events: (data._embedded?.events ?? []).map(normalizeEvent) });
  } catch {
    return response.status(502).json({ error: 'Ticketmaster lookup is temporarily unavailable.' });
  }
};

function normalizeEvent(value) {
  const venue = value._embedded?.venues?.[0];
  const attraction = value._embedded?.attractions?.[0];
  return {
    id: value.id ?? '',
    name: value.name ?? '',
    artistName: attraction?.name ?? value.name ?? '',
    date: value.dates?.start?.localDate ?? '',
    time: value.dates?.start?.localTime ?? '',
    status: value.dates?.status?.code ?? '',
    imageUrl: bestImage(value.images ?? []),
    category: value.classifications?.[0]?.segment?.name ?? '',
    venue: venue ? {
      id: venue.id ?? '', name: venue.name ?? '', address: venue.address?.line1 ?? '',
      city: venue.city?.name ?? '', state: venue.state?.stateCode ?? venue.state?.name ?? '',
      country: venue.country?.countryCode ?? venue.country?.name ?? '',
    } : null,
  };
}

function bestImage(images) {
  const score = (image) => {
    const width = Number(image.width) || 0;
    const height = Number(image.height) || 1;
    return width * height - Math.abs(width / height - 16 / 9) * 100000;
  };
  return [...images].filter((image) => image.url).sort((a, b) => score(b) - score(a))[0]?.url ?? '';
}
