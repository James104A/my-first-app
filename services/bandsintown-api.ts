import { BandsintownEvent, Concert } from '@/types/concert';

const BANDSINTOWN_API_URL = 'https://rest.bandsintown.com';
const APP_ID = 'my_first_app';

// Billboard Hot 100 artists (January 2026)
const BILLBOARD_ARTISTS = [
  'Taylor Swift',
  'Alex Warren',
  'Olivia Dean',
  'Ella Langley',
  'Kehlani',
  'sombr',
  'Leon Thomas',
  'Justin Bieber',
  'Morgan Wallen',
  'Pooh Shiesty',
  'RAYE',
  'Djo',
  'Chris Brown',
  'Bryson Tiller',
  'Sabrina Carpenter',
  'Tate McRae',
  'Lil Uzi Vert',
  'KATSEYE',
  'Riley Green',
  'Ravyn Lenae',
  'Gunna',
  'Burna Boy',
  'Myles Smith',
  'Mariah The Scientist',
  'Kali Uchis',
  'BigXthaPlug',
  'Russell Dickerson',
  'Megan Moroney',
  'Cody Johnson',
  'Shaboozey',
  'Jelly Roll',
  'Tinashe',
  'HARDY',
  'Luke Combs',
  'Gavin Adcock',
  'YoungBoy Never Broke Again',
  'Jason Aldean',
  'Parmalee',
  'Metro Boomin',
  'Quavo',
  'Peso Pluma',
  'Tyla',
  'Cardi B',
  'David Guetta',
  'Teddy Swims',
  'Tones And I',
  'Ed Sheeran',
  '21 Savage',
  'Drake',
  'Tame Impala',
  'Blake Shelton',
  'Chase Matthew',
  'Tyler, The Creator',
  'Don Toliver',
  'Shakira',
  'George Birge',
  'Tucker Wetmore',
  '$uicideboy$',
  'The Marias',
  'Daniel Caesar',
  'NF',
  'Phil Wickham',
  'Madison Beer',
  'Bad Bunny',
  'Post Malone',
  'Audrey Nuna',
];

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  // Haversine formula to calculate distance in miles
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function fetchArtistEvents(artistName: string): Promise<BandsintownEvent[]> {
  const encodedName = encodeURIComponent(artistName);
  const url = `${BANDSINTOWN_API_URL}/artists/${encodedName}/events?app_id=${APP_ID}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    // API returns empty array or error object if no events
    if (!Array.isArray(data)) {
      return [];
    }
    return data;
  } catch {
    return [];
  }
}

export async function fetchUpcomingConcerts(
  userLat: number,
  userLon: number
): Promise<Concert[]> {
  const maxDistance = 50; // miles

  // Fetch events for all artists in parallel
  const eventPromises = BILLBOARD_ARTISTS.map(artist => fetchArtistEvents(artist));
  const allArtistEvents = await Promise.all(eventPromises);

  // Flatten and process events
  const nearbyConcerts: Concert[] = [];

  allArtistEvents.forEach((events, index) => {
    const artistName = BILLBOARD_ARTISTS[index];

    events.forEach(event => {
      const venueLat = parseFloat(event.venue.latitude);
      const venueLon = parseFloat(event.venue.longitude);

      // Skip if venue coordinates are invalid
      if (isNaN(venueLat) || isNaN(venueLon)) {
        return;
      }

      const distance = calculateDistance(userLat, userLon, venueLat, venueLon);

      // Only include events within 50 miles
      if (distance <= maxDistance) {
        const ticketOffer = event.offers.find(o => o.type === 'Tickets' && o.status === 'available');

        nearbyConcerts.push({
          id: event.id,
          artistName,
          url: event.url,
          datetime: event.datetime,
          venue: {
            name: event.venue.name,
            city: event.venue.city,
            region: event.venue.region,
            country: event.venue.country,
            latitude: venueLat,
            longitude: venueLon,
          },
          lineup: event.lineup,
          ticketUrl: ticketOffer?.url || event.url,
          distance,
        });
      }
    });
  });

  // Sort by date and return top 5
  nearbyConcerts.sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());

  return nearbyConcerts.slice(0, 5);
}
