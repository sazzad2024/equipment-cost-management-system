import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Equipment } from '../board-admin/board-admin.component';
import { StorageService } from './storage.service';

const API_URL = 'http://13.220.51.254:8083/api/test/';
//const API_URL = 'http://localhost:8083/api/test/';


@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient, private storageService: StorageService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.storageService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token  // Add the token to the request headers
    });
  }

  getPublicContent(): Observable<any> {
    return this.http.get(API_URL + 'all', { responseType: 'text' });
  }

  getUserBoard(): Observable<any> {
    return this.http.get(API_URL + 'user', { headers: this.getAuthHeaders(), responseType: 'text' });
  }

  getModeratorBoard(): Observable<any> {
    return this.http.get(API_URL + 'mod', { headers: this.getAuthHeaders(), responseType: 'text' });
  }

  getAdminBoard(): Observable<any> {
    return this.http.get(API_URL + 'admin', { headers: this.getAuthHeaders(), responseType: 'text' });
  }

  saveModel(model: any): Observable<any> {
    return this.http.post(API_URL + 'savemodel', model, { headers: this.getAuthHeaders() });
  }

  getSavedModels(): Observable<any> {
    return this.http.get(API_URL + 'savedmodels', { headers: this.getAuthHeaders() });
  }

  getAllModelData(): Observable<any> {
    return this.http.get(API_URL + 'allmodeldata', { headers: this.getAuthHeaders() });
  }

  getAllModelYears(): Observable<any> {
    return this.http.get(API_URL + 'years', { headers: this.getAuthHeaders() });
  }

  getAllContractors(): Observable<any> {
    return this.http.get(API_URL + 'contractors', { headers: this.getAuthHeaders() });
  }

  getModelDataByYear(year: string): Observable<any> {
    return this.http.get(API_URL + `model-data/${year}`, { headers: this.getAuthHeaders() });
  }

  getModelDataByContractor(contractor: string): Observable<any> {
    return this.http.get(API_URL + `contractor-data/${contractor}`, { headers: this.getAuthHeaders() });
  }

  editEquipment(equipment: any, year: string, contractor: string | null = null): Observable<any> {
    const body = {
      equipment,
      year,
      contractor
    };
    return this.http.put(API_URL + 'editEquipment', body, { headers: this.getAuthHeaders() });
  }

  generateNextYearEquipData(priceIncreaseRate: number, updateAllYears: boolean): Observable<any> {
    console.log('Request body for generating 2025 data:', { priceIncreaseRate, updateAllYears });
    return this.http.post(API_URL + 'generate-2025', 
      { priceIncreaseRate, updateAllYears }, 
      { headers: this.getAuthHeaders() }
    );
  }
  

  // generateNextYearEquipData(priceIncreaseRate: number, dataUpdate: boolean): Observable<any> {
  //   return this.http.post(API_URL + 'generate-data', { priceIncreaseRate, dataUpdate }, { headers: this.getAuthHeaders() });
  // }

  
  getFuelCosts(): Observable<any> {
    return this.http.get(API_URL + 'fuelcosts', { headers: this.getAuthHeaders() });
  }

  editFuelCosts(fuelCosts: any): Observable<any> {
    return this.http.put(API_URL + 'editfuelcosts', fuelCosts, { headers: this.getAuthHeaders() });
  }

  getHourlyWage(): Observable<any> {
    return this.http.get(API_URL + 'hrlabourwage', { headers: this.getAuthHeaders() });
  }

  editHourlyWage(labourWage: any): Observable<any> {
    return this.http.put(API_URL + 'edithrlabourwage', labourWage, { headers: this.getAuthHeaders() });
  }

  getCurrentYear(): Observable<any> {
    return this.http.get(API_URL + 'currentyear', { headers: this.getAuthHeaders() });
  }

  getDefaultEquipment() {
    const DEFAULT_EQUIPMENT: Equipment = {
      Category: '',
      Sub_Category: '',
      Size: '',
      "Reimbursable Fuel_type (1 diesel, 2 gas, 3 other)": 0,
      Fuel_unit_price: 0,
      Original_price: 0,
      Sales_Tax: 0,
      Discount: 0,
      Salvage_Value: 0,
      Current_Market_Year_Resale_Value: 0,
      Annual_Overhaul_Labor_Hours: 0,
      Annual_Field_Labor_Hours: 0,
      Cost_of_A_New_Set_of_Tires: 0,
      Tire_Life_Hours: 0,
      Hourly_Lube_Costs: 0,
      Hourly_Wage: 0,
      "Model Year": 0,
      "Adjustment for fuel cost": 1,
      Horse_power: 0,
      Economic_Life_in_months: 0,
      Monthly_use_hours: 0,
      Usage_rate: 0,
      Initial_Freight_cost: 0,
      Annual_Overhead_rate: 0,
      Annual_Overhaul_Parts_cost_rate: 0,
      Annual_Field_Repair_Parts_and_misc_supply_parts_Cost_rate: 0,
      Annual_Ground_Engaging_Component_rate: 0,
      Cost_of_Capital_rate: 0,
      Depreciation_Ownership_cost_Monthly: 0,
      Cost_of_Facilities_Capital_Ownership_cost_Monthly: 0,
      Overhead_Ownership_cost_Monthly: 0,
      Overhaul_Labor_Ownership_cost_Monthly: 0,
      Overhaul_Parts_Ownership_cost_Monthly: 0,
      Total_ownership_cost_hourly: 0,
      Field_Labor_Operating_cost_Hourly: 0,
      Field_Parts_Operating_cost_Hourly: 0,
      Ground_Engaging_Component_Cost_Operating_cost_Hourly: 0,
      Lube_Operating_cost_Hourly: 0,
      Fuel_by_horse_power_Operating_cost_Hourly: 0,
      Tire_Costs_Operating_cost_Hourly: 0,
      Total_operating_cost: 0,
      Total_cost_recovery: 0
    };
    return DEFAULT_EQUIPMENT;
  }

  addEquipment(equipment: any, modelYear: string, contractor: string | null = null): Observable<any> {
    const body = {
      equipment,
      modelYear,
      contractor
    };
    return this.http.post(API_URL + 'addequipment', body, { headers: this.getAuthHeaders() });
  }

  exportData(selections: string[], dataType: string) {
    return this.http.post(API_URL + 'exportdata', { selections, dataType }, { headers: this.getAuthHeaders(), responseType: 'blob' });
  }
}
