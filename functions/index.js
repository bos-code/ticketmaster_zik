const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp();
const ticketmasterApiKey = defineSecret('TICKETMASTER_API_KEY');

exports.ticketmasterLookup = onRequest(
  { cors: true, region: 'us-central1', secrets: [ticketmasterApiKey], timeoutSeconds: 20 },
  async (request, response) => {
    try {
      if (request.method !== 'GET') return response.status(405).json({ error: 'Method not allowed.' });
      const query = String(request.query.q || '').trim().slice(0, 100);
      const mode = request.query.mode === 'venues' ? 'venues' : 'events';
      if (query.length < 2) return response.status(400).json({ error: 'Enter at least two characters.' });
      const token = String(request.headers.authorization || '').replace(/^Bearer\s+/i, '');
      if (!token) return response.status(401).json({ error: 'Admin authentication required.' });
      const decoded = await getAuth().verifyIdToken(token);
      if (!decoded.email_verified) return response.status(403).json({ error: 'Verified admin account required.' });
      const db = getFirestore();
      const [admin, requestDoc] = await Promise.all([db.doc(`admins/${decoded.uid}`).get(), db.doc(`admin_requests/${decoded.uid}`).get()]);
      if (!admin.exists && requestDoc.data()?.status !== 'approved') return response.status(403).json({ error: 'Approved admin access required.' });

      const resource = mode === 'venues' ? 'venues' : 'events';
      const url = new URL(`https://app.ticketmaster.com/discovery/v2/${resource}.json`);
      url.searchParams.set('apikey', ticketmasterApiKey.value());
      url.searchParams.set('keyword', query);
      url.searchParams.set('size', '20');
      if (mode === 'events') url.searchParams.set('sort', 'date,asc');
      const upstream = await fetch(url);
      if (!upstream.ok) throw new Error(`Ticketmaster request failed (${upstream.status}).`);
      const data = await upstream.json();
      const events = (data._embedded?.events || []).map(normalizeEvent);
      const venues = (data._embedded?.venues || []).map(normalizeVenue);
      return response.json({ events, venues });
    } catch (error) {
      console.error('Ticketmaster lookup failed.', error instanceof Error ? error.message : 'Unknown error');
      return response.status(500).json({ error: 'Ticketmaster lookup is temporarily unavailable.' });
    }
  },
);

function normalizeVenue(value) {
  const location = value.location || {};
  return { id: value.id || '', name: value.name || '', address: value.address?.line1 || '', city: value.city?.name || '', state: value.state?.stateCode || value.state?.name || '', country: value.country?.countryCode || value.country?.name || '', postalCode: value.postalCode || '', latitude: finite(location.latitude), longitude: finite(location.longitude) };
}
function normalizeEvent(value) {
  const classification = value.classifications?.[0] || {};
  const venue = value._embedded?.venues?.[0];
  const attraction = value._embedded?.attractions?.[0];
  return { id: value.id || '', name: value.name || '', artistName: attraction?.name || value.name || '', date: value.dates?.start?.localDate || '', time: value.dates?.start?.localTime || '', status: value.dates?.status?.code || '', url: value.url || '', imageUrl: bestImage(value.images || []), description: value.info || value.pleaseNote || '', category: classification.segment?.name || '', genre: classification.genre?.name || '', subgenre: classification.subGenre?.name || '', salesStart: value.sales?.public?.startDateTime || '', salesEnd: value.sales?.public?.endDateTime || '', venue: venue ? normalizeVenue(venue) : null };
}
function bestImage(images) { return [...images].filter((image) => image.url).sort((a, b) => imageScore(b) - imageScore(a))[0]?.url || ''; }
function imageScore(image) { const width = Number(image.width) || 0; const height = Number(image.height) || 1; return width * height - Math.abs(width / height - 16 / 9) * 100000; }
function finite(value) { const number = Number(value); return Number.isFinite(number) ? number : null; }
