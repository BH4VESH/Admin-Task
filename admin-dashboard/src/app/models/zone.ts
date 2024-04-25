export interface Zone {
    _id?: string;
    country_id: string;
    name: string;
    coordinates: google.maps.LatLng[];
  }