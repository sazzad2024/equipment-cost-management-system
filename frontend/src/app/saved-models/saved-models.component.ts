import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../_services/user.service';

interface SavedModelRow {
  id?: string;
  category: string;
  subcategory: string;
  size: string;
  modelYear: number | string;
  fueltype: number;
  county?: string;
  quarter?: string;
  equipment: any;
}

@Component({
  selector: 'app-saved-models',
  templateUrl: './saved-models.component.html',
  styleUrls: ['./saved-models.component.scss']
})
export class SavedModelsComponent implements OnInit {
  rows: SavedModelRow[] = [];
  filtered: SavedModelRow[] = [];

  // filters
  searchText: string = '';
  filterId: string = '';
  filterCategory: string = '';
  filterSubcategory: string = '';
  filterSize: string = '';
  filterCounty: string = '';
  filterQuarter: string = '';

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.userService.getSavedModels().subscribe(resp => {
      const list = (resp?.savedModels || []) as string[];
      this.rows = list.map(s => {
        try { return JSON.parse(s); } catch { return null; }
      }).filter(Boolean);
      this.applyFilters();
    });
  }

  applyFilters(): void {
    const q = this.searchText.trim().toLowerCase();
    this.filtered = this.rows.filter(r => {
      const inQuick = !q || JSON.stringify(r).toLowerCase().includes(q);
      if (!inQuick) return false;
      if (this.filterId && String(r.id||'').toLowerCase().indexOf(this.filterId.toLowerCase()) === -1) return false;
      if (this.filterCategory && (r.category||'').toLowerCase().indexOf(this.filterCategory.toLowerCase()) === -1) return false;
      if (this.filterSubcategory && (r.subcategory||'').toLowerCase().indexOf(this.filterSubcategory.toLowerCase()) === -1) return false;
      if (this.filterSize && (r.size||'').toLowerCase().indexOf(this.filterSize.toLowerCase()) === -1) return false;
      if (this.filterCounty && (r.county||'').toLowerCase().indexOf(this.filterCounty.toLowerCase()) === -1) return false;
      if (this.filterQuarter && (r.quarter||'').toLowerCase().indexOf(this.filterQuarter.toLowerCase()) === -1) return false;
      return true;
    });
  }

  clearFilters(): void {
    this.searchText = '';
    this.filterId = '';
    this.filterCategory = '';
    this.filterSubcategory = '';
    this.filterSize = '';
    this.filterCounty = '';
    this.filterQuarter = '';
    this.applyFilters();
  }

  print(): void {
    const html = this.filtered.map(r => `
      <tr>
        <td>${r.id||''}</td>
        <td>${r.category||''}</td>
        <td>${r.subcategory||''}</td>
        <td>${r.size||''}</td>
        <td>${r.modelYear||''}</td>
        <td>${this.getFuelType(r.fueltype)}</td>
        <td>${r.county||''}</td>
        <td>${r.quarter||''}</td>
      </tr>
    `).join('');
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>Saved Models</title>
      <style>table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:6px;text-align:left}</style>
      </head><body>
      <h2>Saved Models</h2>
      <table>
        <thead>
          <tr><th>ID</th><th>Category</th><th>Subcategory</th><th>Size</th><th>Model Year</th><th>Fuel Type</th><th>County</th><th>Quarter</th></tr>
        </thead>
        <tbody>${html}</tbody>
      </table>
      </body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
  }

  getFuelType(value: number): string {
    switch (value) {
      case 1: return 'diesel';
      case 2: return 'gas';
      case 3: return 'other';
      default: return '';
    }
  }

  navigateToEquipment(model: SavedModelRow): void {
    // Navigate to equipment details with the saved equipment data
    this.router.navigate(['/equipment-details'], {
      state: {
        equipment: model.equipment,
        county: model.county,
        quarter: model.quarter
      }
    });
  }
}



