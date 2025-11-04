import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatTabChangeEvent, MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import data from '../../assets/data/wheel_tractors.json';
import { Equipment } from '../board-admin/board-admin.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CalculatorService } from '../calculator.service';
import { UserService } from '../_services/user.service';
import { NotificationService } from '../_services/notification.service';
interface Model {
  id?: string;
  county?: string;
  quarter?: string;
  category: string;
  modelYear: string;
  size: string; 
  subcategory: string;
  fueltype: number;
  equipment: Equipment
}
@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.scss'],
})
export class CalculatorComponent {
  constructor(
    private route: ActivatedRoute,
    private calculatorService: CalculatorService,
    private router: Router,
    private userService: UserService,
    private notificationService: NotificationService
  ) {}
  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const unadjustedRateParam = params.get('unadjustedRate');
      const operCostparam = params.get('operCost');
      const selectItem = params.get('selectedItem');
      const modelYear = params.get('modelYear');
      const selectedCounty = params.get('selectedCounty');
      const selectedQuarter = params.get('selectedQuarter');

      if (
        unadjustedRateParam !== null &&
        operCostparam !== null &&
        selectItem &&
        modelYear
      ) {
        this.modelYear = +modelYear;
        this.selectedItem = JSON.parse(selectItem) as Equipment;
        this.unadjustedRate = +unadjustedRateParam * 176;
        this.operCost = +operCostparam;
        this.unadjustedRate = this.roundTo(this.unadjustedRate, 2);
        this.operCost = this.roundTo(this.operCost, 2);
        this.updateRate();
        this.updateStandByRate();
      } else if (params.get('tab') === 'savedmodels') {
        // Fetch the saved models if the "Saved Models" tab is clicked
        this.fetchSavedModels();
      }

      // Get County and Quarter from route params
      if (selectedCounty) {
        this.modelCounty = selectedCounty;
        console.log('County from params:', this.modelCounty);
      }
      if (selectedQuarter) {
        this.modelQuarter = selectedQuarter;
        console.log('Quarter from params:', this.modelQuarter);
        // Extract year from quarter only if modelYear wasn't already set
        if (!this.modelYear) {
          const yearMatch = selectedQuarter.match(/(\d{4})/);
          if (yearMatch) {
            this.modelYear = +yearMatch[1];
            console.log('Year extracted from quarter:', this.modelYear);
          }
        }
      }
      
      console.log('Final values - County:', this.modelCounty, 'Quarter:', this.modelQuarter, 'Year:', this.modelYear);
    });

    // Also check for state data (from navigation)
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      const state = navigation.extras.state as any;
      if (state.county) {
        this.modelCounty = state.county;
        console.log('County from state:', this.modelCounty);
      }
      if (state.quarter) {
        this.modelQuarter = state.quarter;
        console.log('Quarter from state:', this.modelQuarter);
        // Extract year from quarter only if not already set
        if (!this.modelYear) {
          const yearMatch = state.quarter.match(/(\d{4})/);
          if (yearMatch) {
            this.modelYear = +yearMatch[1];
            console.log('Year extracted from state quarter:', this.modelYear);
          }
        }
      }
    }
  }
  @ViewChild(MatTabGroup) tabGroup!: MatTabGroup;
  modelYear?: number;
  unadjustedRate: number = 0;
  modelRate: number = 100;
  regionalRate: number = 100;
  rateUsed: number = 0;
  disabled = false;
  hours: number = 176;
  operCost: number = 0;
  operCostMultiplier: number = 0.5;
  enteredSearchValue: string = '';
  standByRate: number = 0;
  selectedItem?: Equipment;
  //items:Equipment[] = data;
  price: number = 0;
  salvage: number = 0;
  annualUseHrs: number = 0;
  useFulLife: number = 60;
  intRate: number = 0;
  operFactor: number = 0;
  operTimeFactor: number = 0;
  hp: number = 0;
  oilConsFactor: number = 0;
  maintFactor: number = 0;
  savedModels: Model[] = [];
  dataLoaded = true;
  modelIdInput: string = '';
  modelCounty: string = '';
  modelQuarter: string = '';

  private roundTo = function (num: number, places: number) {
    const factor = 10 ** places;
    return Math.round(num * factor) / factor;
  };

  updateUnadjustedRate(event: any) {
    this.unadjustedRate = parseFloat(event.target.textContent);
    this.updateRate();
    this.updateStandByRate();
  }

  updateModelRate(event: any) {
    this.modelRate = event.target.innerText;
    this.updateRate();
    this.updateStandByRate();
  }

  updateRegionalRate(event: any) {
    this.regionalRate = event.target.innerText;
    this.updateRate();
    this.updateStandByRate();
  }

  updateHours(event: any) {
    this.hours = parseFloat(event.target.textContent);
    this.updateRate();
    this.updateStandByRate();
  }

  updateOpCost(event: any) {
    this.operCost = parseFloat(event.target.textContent);
    this.updateRate();
    this.updateStandByRate();
  }

  updateOperCostMultiplier(event: any) {
    this.operCostMultiplier = event.target.innerText;
    this.updateStandByRate();
  }

  updateRate() {
    this.rateUsed = Number(
      (this.unadjustedRate *
        (this.modelRate / 100) *
        (this.regionalRate / 100)) /
        this.hours +
        Number(this.operCost)
    );
    // Use full precision, no rounding
  }

  updateStandByRate() {
    this.standByRate = Number(
      ((this.unadjustedRate *
        (this.modelRate / 100) *
        (this.regionalRate / 100)) /
        this.hours) *
        Number(this.operCostMultiplier)
    );
    // Use full precision, no rounding
  }

  getFuelType(value: number): string {
    switch (value) {
      case 1:
        return 'diesel';
      case 2:
        return 'gas';
      case 3:
        return 'other';
      default:
        return '';
    }
  }

  generateModelId(): string {
    // Generate ID format: YEAR-CATEGORY_ABBR-SUBCATEGORY_ABBR
    const year = this.modelYear || new Date().getFullYear();
    const categoryAbbr = this.selectedItem?.Category?.substring(0, 3).toUpperCase() || 'EQP';
    const subcategoryAbbr = this.selectedItem?.Sub_Category?.substring(0, 4).toUpperCase() || 'MISC';
    return `${year}-${categoryAbbr}-${subcategoryAbbr}`;
  }

  saveModel(): void {
   this.dataLoaded = false
    // Generate unique ID if not provided
    const generatedId = this.generateModelId();
    
    const model = {
      id: generatedId,
      county: this.modelCounty || undefined,
      quarter: this.modelQuarter || undefined,
      category: this.selectedItem?.Category,
      subcategory: this.selectedItem?.Sub_Category,
      size: this.selectedItem?.Size,
      modelYear: this.modelYear,
      fueltype:
        this.selectedItem?.[
          'Reimbursable Fuel_type (1 diesel, 2 gas, 3 other)'
        ],
      equipment: this.selectedItem,
    };

    console.log('Saving model with data:', model);
    console.log('County:', this.modelCounty, 'Quarter:', this.modelQuarter, 'Year:', this.modelYear);

    this.userService.saveModel(model).subscribe(
      (response) => {
        //console.log(response);
        this.dataLoaded = true;
        this.notificationService.triggerNotification('Model saved successfully!', 'success');
        if (this.tabGroup) {
          this.tabGroup.selectedIndex = 1;
        }
      },
      (error) => {
        console.error(error);
        this.dataLoaded = true;
        this.notificationService.triggerNotification('Failed to save model.', 'error');
      }
    );
  }

  fetchSavedModels() {
    this.userService.getSavedModels().subscribe(
      (response) => {
        console.log(response);
        this.savedModels = response.savedModels.map((modelString: string) =>
          JSON.parse(modelString)
        );
      },
      (error) => {
        console.error(error);
      }
    );
  }

  savedModelClicked(model: any) {
    const { category, modelYear, size, subcategory, fueltype, equipment } = model;
    this.unadjustedRate = this.roundTo(equipment.Total_ownership_cost_hourly * 176, 2);
    this.operCost = this.roundTo(equipment.Total_operating_cost, 2);
    this.updateRate();
    this.updateStandByRate();
    if (this.tabGroup) {
      this.tabGroup.selectedIndex = 0;
    }
  }

  onTabChange(event: MatTabChangeEvent) {
    if (event.index === 1) {
      this.fetchSavedModels();
    }
  }

  printCalculator(): void {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Calculator - ${this.selectedItem?.Category} - ${this.selectedItem?.Sub_Category}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h2 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
              .float-container { display: flex; gap: 20px; margin: 20px 0; }
              .float-child { flex: 1; }
              .blue { background-color: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #dee2e6; }
              .hori-container { display: flex; align-items: center; gap: 10px; margin: 10px 0; }
              .wrapper { display: flex; align-items: center; }
              .symbols { font-weight: bold; margin: 0 5px; }
              .value-display { font-weight: bold; color: #007bff; font-size: 16px; padding: 5px; background-color: #e9ecef; border-radius: 3px; }
              .rate-text { font-weight: bold; font-size: 18px; color: #007bff; }
              .label-text { font-size: 12px; color: #666; margin-bottom: 5px; }
              .text-center { text-align: center; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <h1>Equipment Cost Calculator</h1>
            <p><strong>Equipment:</strong> ${this.selectedItem?.Category} - ${this.selectedItem?.Sub_Category}</p>
            <p><strong>Size:</strong> ${this.selectedItem?.Size}</p>
            <p><strong>Model Year:</strong> ${this.modelYear}</p>
            
            <div class="float-container">
              <div class="float-child">
                <div class="blue">
                  <h2 class="text-center">FHWA Rate</h2>
                  <h6 class="text-center">${this.selectedItem?.Sub_Category}</h6>
                  <h6 class="text-center">Ownership cost (one month)</h6>
                  <div>
                    <div class="hori-container">
                      <div class="wrapper">
                        <div class="symbols">$</div>
                        <div class="value-display">${this.unadjustedRate}</div>
                      </div>
                      <div class="hori-float symbols">x</div>
                      <div class="wrapper">
                        <div class="value-display">${this.modelRate}</div>
                        <div class="symbols">%</div>
                      </div>
                      <div class="hori-float symbols">x</div>
                      <div class="wrapper">
                        <div class="value-display">${this.regionalRate}</div>
                        <div class="symbols">%</div>
                      </div>
                    </div>
                    <br />
                    <div class="text-center">
                      <div class="value-display">${this.hours}</div>
                      <div>+</div>
                    </div>
                    <div class="text-center">
                      <div class="label-text">Operation cost (hourly)</div>
                      <div class="value-display">${this.operCost}</div>
                      <div>=</div>
                    </div>
                    <div class="text-center">
                      <div class="label-text">Rate used for Reimbursement: FHWA (Hourly)</div>
                      <div class="wrapper-cost">
                        <div class="symbols">$</div>
                        <div class="rate-text">${this.rateUsed?.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="float-child">
                <div class="blue">
                  <h2 class="text-center">Standby Rate</h2>
                  <h6 class="text-center">${this.selectedItem?.Sub_Category}</h6>
                  <h6 class="text-center">Ownership cost (one month)</h6>
                  <div>
                    <div class="hori-container">
                      <div class="wrapper">
                        <div class="symbols">$</div>
                        <div class="value-display">${this.unadjustedRate}</div>
                      </div>
                      <div class="hori-float symbols">x</div>
                      <div class="wrapper">
                        <div class="value-display">${this.modelRate}</div>
                        <div class="symbols">%</div>
                      </div>
                      <div class="hori-float symbols">x</div>
                      <div class="wrapper">
                        <div class="value-display">${this.regionalRate}</div>
                        <div class="symbols">%</div>
                      </div>
                    </div>
                    <br />
                    <div class="text-center">
                      <div class="value-display">${this.hours}</div>
                      <div>x</div>
                    </div>
                    <div class="text-center">
                      <div class="value-display">${this.operCostMultiplier}</div>
                      <div>=</div>
                    </div>
                    <div class="text-center">
                      <div class="label-text">Standby rate</div>
                      <div class="wrapper-cost">
                        <div class="symbols">$</div>
                        <div class="rate-text">${this.standByRate?.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div style="margin-top: 30px; text-align: center;">
              <h3>Summary</h3>
              <p><strong>FHWA Rate:</strong> $${this.rateUsed?.toFixed(2)} per hour</p>
              <p><strong>Standby Rate:</strong> $${this.standByRate?.toFixed(2)} per hour</p>
              <p><strong>Unadjusted Monthly Ownership Cost:</strong> $${this.unadjustedRate?.toFixed(2)}</p>
              <p><strong>Model Rate Adjustment:</strong> ${this.modelRate}%</p>
              <p><strong>Regional Rate Adjustment:</strong> ${this.regionalRate}%</p>
              <p><strong>Operation Cost:</strong> $${this.operCost?.toFixed(2)}</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  }
}
