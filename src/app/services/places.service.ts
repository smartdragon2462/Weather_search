import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class PlacesService {
  constructor(private http: HttpClient) { }

  getPlaces(val) {
    return this.http.get('http://localhost:8080/api/get-city?q=' + val);
  }

  getCurrentLocation() {
      return this.http.get('http://ip-api.com/json');
  }

  getLocationByGeolocation(street, city, state) {
    return this.http.get('http://localhost:8080/api/get-geolocation?street=' + street + '&city=' + city + '&state=' + state);
  }

  getWeatherData(lat, lng) {
      return this.http.get('http://localhost:8080/api/get-weather?lat=' + lat + '&lng=' + lng);
  }

  getCustomSearch(state) {
      return this.http.get('http://localhost:8080/api/custom-search?state=' + state);
  }
}