const TICKET_FIELDS = new Set([
  'id', 'eventName', 'artistName', 'albumName', 'venue', 'city', 'state',
  'country', 'date', 'time', 'purchaseDate', 'section', 'row', 'seatRange',
  'barcode', 'orderNumber', 'ticketType', 'status', 'perks', 'transferRules',
  'image', 'backgroundColor', 'seatLabel', 'ticketNote', 'latitude',
  'longitude', 'createdAt', 'updatedAt',
]);

module.exports = async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
  const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
  if (!projectId || !apiKey) {
    return response.status(503).json({ error: 'Ticket saving is temporarily unavailable. Please try again.' });
  }
  if (!['GET', 'POST', 'DELETE'].includes(request.method)) {
    response.setHeader('Allow', 'GET, POST, DELETE');
    return response.status(405).json({ error: 'Unsupported ticket request.' });
  }

  const database = `projects/${projectId}/databases/(default)`;
  const base = `https://firestore.googleapis.com/v1/${database}/documents`;
  try {
    if (request.method === 'GET') {
      const tickets = [];
      let pageToken = '';
      do {
        const query = new URLSearchParams({ key: apiKey, pageSize: '1000' });
        if (pageToken) query.set('pageToken', pageToken);
        const upstream = await fetch(`${base}/tickets?${query}`, { signal: AbortSignal.timeout(15000) });
        if (!upstream.ok) return rejectUpstream(response, upstream.status);
        const page = await upstream.json();
        tickets.push(...(page.documents || []).map(document => Object.fromEntries(
          Object.entries(document.fields || {}).map(([key, value]) => [key, fromValue(value)]),
        )));
        pageToken = page.nextPageToken || '';
      } while (pageToken);
      return response.status(200).json(tickets);
    }

    const id = request.query.id;
    if (typeof id !== 'string' || !/^ticket-[^/\x00-\x1f]{1,1000}$/.test(id)) {
      return response.status(400).json({ error: 'The ticket could not be found.' });
    }
    if (request.method === 'DELETE') {
      const upstream = await fetch(`${base}/tickets/${encodeURIComponent(id)}?key=${encodeURIComponent(apiKey)}`, {
        method: 'DELETE', signal: AbortSignal.timeout(15000),
      });
      if (!upstream.ok) return rejectUpstream(response, upstream.status);
      return response.status(200).json({ id });
    }
    const fields = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
    if (!fields || Array.isArray(fields) || typeof fields !== 'object' ||
        !Object.keys(fields).length || Object.keys(fields).some(key => !TICKET_FIELDS.has(key)) ||
        (fields.id !== undefined && fields.id !== id) ||
        Object.values(fields).some(value => value !== null && typeof value !== 'string' &&
          !(typeof value === 'number' && Number.isFinite(value)))) {
      return response.status(400).json({ error: 'Some ticket details are invalid. Please review them and try again.' });
    }
    const upstream = await fetch(`${base}:commit?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      signal: AbortSignal.timeout(15000),
      body: JSON.stringify({ writes: [{
        update: {
          name: `${database}/documents/tickets/${id}`,
          fields: Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, toValue(value)])),
        },
        updateMask: { fieldPaths: Object.keys(fields) },
      }] }),
    });
    if (!upstream.ok) return rejectUpstream(response, upstream.status);
    return response.status(200).json({ id });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return response.status(400).json({ error: 'Some ticket details are invalid. Please review them and try again.' });
    }
    return response.status(503).json({ error: 'The ticket service is temporarily unavailable. Please try again.' });
  }
};

function rejectUpstream(response, status) {
  return response.status(status >= 500 ? 503 : status).json({
    error: status === 429 ? 'The ticket service is busy. Please try again shortly.' :
      'We could not access the ticket database. Please try again.',
  });
}

function toValue(value) {
  if (value === null) return { nullValue: null };
  if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  return { stringValue: value };
}

function fromValue(value) {
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('booleanValue' in value) return value.booleanValue;
  return null;
}
