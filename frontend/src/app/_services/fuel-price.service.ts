// fuel-price.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FuelPriceService {
  private API_URL = 'http://13.220.51.254:8083/api/';

  constructor(private http: HttpClient) {}
  getFuelPrice(county: string, quarter: string, fuelType: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL}fuel/fuel-price`, {
      params: { county, quarter, fuelType }
    });
  }
  
  
  getFuelMetadata(): Observable<{ counties: string[]; quarters: string[] }> {
    return this.http.get<{ counties: string[]; quarters: string[] }>(`${this.API_URL}fuel/fuel-metadata`);
  }
  
  updateFuelPrices(county: string, quarter: string, prices: { [key: string]: number }) {
    return this.http.post(`${this.API_URL}fuel/update`, { county, quarter, prices });
  }

  bulkUploadFuelPrices(fuelDataArray: any[]): Observable<any> {
    return this.http.post(`${this.API_URL}fuel/bulk-upload`, fuelDataArray);
  }
  
}


