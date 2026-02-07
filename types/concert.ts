export interface BandsintownVenue {
  name: string;
  latitude: string;
  longitude: string;
  city: string;
  region: string;
  country: string;
}

export interface BandsintownOffer {
  type: string;
  url: string;
  status: string;
}

export interface BandsintownEvent {
  id: string;
  artist_id: string;
  url: string;
  datetime: string;
  on_sale_datetime: string | null;
  venue: BandsintownVenue;
  lineup: string[];
  offers: BandsintownOffer[];
  description: string;
}

export interface Concert {
  id: string;
  artistName: string;
  url: string;
  datetime: string;
  venue: {
    name: string;
    city: string;
    region: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  lineup: string[];
  ticketUrl: string | null;
  distance: number; // miles from user
}
