import { Component, Input } from '@angular/core';
import { Equipment } from '../board-admin/board-admin.component';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../_services/user.service';
import { NotificationService } from '../_services/notification.service';
import { AuthService } from '../_services/auth.service';

@Component({
  selector: 'app-equipment-list',
  templateUrl: './equipment-list.component.html',
  styleUrls: ['./equipment-list.component.scss'],
})
export class EquipmentListComponent {
  @Input() equipmentList: Equipment[] = []; 
  @Input() modelYear?: string = '';
  @Input() contractor?: string = undefined;
  @Input() isManageEquipment?:boolean = false;
  @Input() isContractor?:boolean = false;
  filteredEquipmentList: Equipment[] = []; 
  selectedEquipForEdit?: Equipment;
  originalEquipment?: Equipment;
  showEditForm = false;
  spinnerOn = false;
  subCategories: string[] = []; 
  sizeOptions: string[] = [];
  selectedSubCategories: string[] = []; // list of currently selected sub-categories for filtering
  currentPage = 1; // current page number
  itemsPerPage = 50; // number of items to display per page
  sortOrder: string = 'asc';
  searchText: string = ''; // holds the search text
  filteredSubCategories: string[] = [];
  showDropdown: boolean = false;
  showSizeDropdown: boolean = false;
  selectedSizes: string[] = [];
  isListEmpty: boolean = false;
  message?: string = "";
  selectedCategory: string = ''; // Holds the selected Category
  subCategoriesMap: { [category: string]: string[] } = {}; // Holds mapping of categories to sub-categories
  sizesMap: { [category: string]: string[] } = {}; // Holds mapping of categories to sizes
  selectedSubCategory: string = ''; // Holds the selected Sub-category
  selectedSize: string = ''; // Holds the selected Size
  showAddForm = false;


  constructor(private router: Router, private userService: UserService, private route: ActivatedRoute, private notificationService: NotificationService, private authService: AuthService) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      // Assuming modelYear is passed as a query parameter
      this.modelYear = params['modelYear'];
      this.contractor = params['contractor'];
      this.isManageEquipment = params['isManageEquipment'];
  
      if (this.modelYear) {
        this.loadEquipmentData(this.modelYear);
      } else if(this.contractor) {
        this.loadContractorData(this.contractor);
      }
    });
   
 
  }




  private createSubCategoriesMap(equipmentList: Equipment[]): { [category: string]: string[] } {
    const map: { [category: string]: string[] } = {};

    for (const equipment of equipmentList) {
      // Filter out Caterpillar equipment and categories named "Caterpillar"
      if (equipment.Category && equipment.Sub_Category && 
          (equipment as any).Manufacturer !== 'Caterpillar' && 
          equipment.Category !== 'Caterpillar') {
        if (!map[equipment.Category]) {
          map[equipment.Category] = [];
        }
        if (!map[equipment.Category].includes(equipment.Sub_Category)) {
          map[equipment.Category].push(equipment.Sub_Category);
        }
      }
    }

    // Sort subcategories alphabetically for each category
    for (const category in map) {
      map[category].sort();
    }

    return map;
  }

 
  onSizeChange() {
    // Call the onFilterChange() function to update the filteredEquipmentList
    this.onFilterChange();
  }

  onCategoryChange() {
    // Reset selected sub-category and size
    this.selectedSubCategory = '';
    this.selectedSize = '';
  
    // Update subcategories map based on selected category, excluding Caterpillar
    if (this.selectedCategory) {
      const filteredSubCategories = Array.from(
        new Set(
          this.equipmentList
            .filter((equipment: any) => 
              equipment.Category === this.selectedCategory && 
              equipment.Manufacturer !== 'Caterpillar' &&
              equipment.Category !== 'Caterpillar'
            )
            .map(equipment => equipment.Sub_Category)
        )
      ).sort(); // Sort subcategories alphabetically
      this.subCategoriesMap[this.selectedCategory] = filteredSubCategories;
    }
  
    // Clear sizes map
    this.sizesMap = {};
  
    // Call the onFilterChange() function to update the filteredEquipmentList
    this.onFilterChange();
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
  

  onSubCategoryChange() {
    this.selectedSize = '';
    if (this.selectedSubCategory) {
      const availableSizes = this.equipmentList
      .filter(
        (equipment: any) =>
          equipment.Category === this.selectedCategory &&
          equipment.Sub_Category === this.selectedSubCategory &&
          equipment.Manufacturer !== 'Caterpillar' &&
          equipment.Category !== 'Caterpillar'
      )
      .map(equipment => equipment.Size);
      this.sizesMap[this.selectedSubCategory] = [...new Set(availableSizes)];
    } else {
      this.sizesMap[this.selectedSubCategory] = [];
    }
    this.onFilterChange();
  }
  

  getSubCategoryMapKeys(): string[] {
    // Filter out "Caterpillar" category if it exists
    return Object.keys(this.subCategoriesMap)
      .filter(category => category !== 'Caterpillar')
      .sort();
  }

  

  onEquipmentCardDoubleClick(equipment: Equipment) {
    if (this.isManageEquipment) return; //Added this line to disable double click on equipment card when isManageEquipment is true
    this.router.navigate(['/county-selection'], { state: { equipment } });
  }
  


// onEquipmentCardDoubleClick(equipment: Equipment): void {
//   console.log("Clicked on Equipment:", equipment);  // ✅ Check if function runs

//   this.authService.getUserRole().subscribe(
//     userRole => {
//       console.log("Fetched User Role:", userRole);  // ✅ Verify role is fetched

//       if (userRole === 'admin') {
//         console.log("Navigating to /equipment-details");
//         this.router.navigate(['/equipment-details'], {
//           state: {
//             modelYear: this.modelYear,
//             equipment: equipment,
//             contractor: this.contractor
//           },
//         });
//       } else if (userRole === 'contractor') {
//         console.log("Navigating to /contractor-page");
//         this.router.navigate(['/contractor-page']); 
//       }
//     },
//     error => {
//       console.error('hing user role:', error);
//     }
//   );
// }


  onEditIconClick(event: Event, equipment: Equipment): void {
    event.stopPropagation(); 
    this.selectedEquipForEdit = JSON.parse(JSON.stringify(equipment));
    this.showEditForm = true;
  }

  showAddEquipmentForm() {
    this.selectedEquipForEdit = this.userService.getDefaultEquipment();
    this.showAddForm = true;
    this.showEditForm = true;
  }

  onSaveEquipment(updatedEquipment: any) {
    // Call the UserService to save the updated equipment
    const modelYear = this.contractor && updatedEquipment ? updatedEquipment['Model Year']: this.modelYear;

    if (modelYear || this.contractor) {
      if (!this.showAddForm) {
        this.spinnerOn = true;
        this.message = "Saving equipment...";
        const year = this.isContractor && updatedEquipment ? updatedEquipment['Model Year']: this.modelYear;
        this.userService.editEquipment(updatedEquipment,year, this.contractor).subscribe(
          (response) => {
            console.log('Equipment updated successfully:', response);
            this.notificationService.triggerNotification('Equipment updated successfully', 'success');
  
            // Close the edit form
            this.showEditForm = false;
            // Fetch the updated equipment list
            this.fetchEquipmentList();
          },
          (error) => {
            this.spinnerOn = false;
            this.notificationService.triggerNotification('Error updating equipment', 'error');
            console.error('Error updating equipment:', error);
          }
        );
      } else {
        this.userService.addEquipment(updatedEquipment, modelYear, this.contractor).subscribe(
          (response) => {
            console.log('Equipment added successfully:', response);
            this.notificationService.triggerNotification('Equipment added successfully', 'success');
  
            // Close the edit form
            this.showEditForm = false;
            this.showAddForm = false;
            // Fetch the updated equipment list
            this.fetchEquipmentList();
          },
          (error) => {
            this.spinnerOn = false;
            this.notificationService.triggerNotification('Error adding equipment', 'error');
            console.error('Error adding equipment:', error);
          }
        );
      }

    }
   
  }

  fetchEquipmentList() {
    this.message = "Reloading equipments...";
    if (this.modelYear) {
      this.userService.getModelDataByYear(this.modelYear).subscribe(
        (response) => {
          // Filter out Caterpillar equipment
          this.filteredEquipmentList = response.data.filter((equipment: any) => equipment.Manufacturer !== 'Caterpillar');
          this.spinnerOn = false;
        },
        (error) => {
          this.spinnerOn = false;
          this.notificationService.triggerNotification('Error loading equipment', 'error');
          console.error('Error loading equipment:',error);
        }
      );
    } else if (this.contractor) {
      this.message = "Reloading contractor data...";
      this.userService.getModelDataByContractor(this.contractor).subscribe(
        (response) => {
        this.spinnerOn = false;
        // Filter out Caterpillar equipment
        this.filteredEquipmentList = response.data.filter((equipment: any) => equipment.Manufacturer !== 'Caterpillar');
      },
      (error) => {
        this.spinnerOn = false;
          this.notificationService.triggerNotification('Error loading contractors', 'error');
          console.error('Error loading contractor data:',error);
      }
      );
    }
  }


  loadEquipmentData(modelYear: string) {
    this.spinnerOn = true;
    this.userService.getModelDataByYear(modelYear).subscribe(data => {
      this.spinnerOn = false;
      // Filter out Caterpillar equipment
      this.equipmentList = data.data.filter((equipment: any) => equipment.Manufacturer !== 'Caterpillar');
      this.filteredEquipmentList = this.equipmentList;

      this.subCategories = Array.from(
        new Set(this.equipmentList.map(equipment => equipment.Sub_Category))
      );
    
      // Initialize subCategoriesMap
      this.subCategoriesMap = this.createSubCategoriesMap(this.equipmentList);
    });
  }

  loadContractorData(contractor: string) {
    this.spinnerOn = true;
    this.userService.getModelDataByContractor(contractor).subscribe(data => {
      this.spinnerOn = false;
      // Filter out Caterpillar equipment
      this.equipmentList = data.data.filter((equipment: any) => equipment.Manufacturer !== 'Caterpillar');
      this.filteredEquipmentList = this.equipmentList;

      this.subCategories = Array.from(
        new Set(this.equipmentList.map(equipment => equipment.Sub_Category))
      );
    
      // Initialize subCategoriesMap
      this.subCategoriesMap = this.createSubCategoriesMap(this.equipmentList);
    });
  }
  
  onCancelEdit() {
    this.showEditForm = false;
    this.showAddForm = false;
  }
  

  onCheckboxChange(subCategory: string) {
    const index = this.selectedSubCategories.indexOf(subCategory);

    if (index === -1) {
      // Checkbox is checked, add subcategory to selectedSubCategories
      this.selectedSubCategories.push(subCategory);
    } else {
      // Checkbox is unchecked, remove subcategory from selectedSubCategories
      this.selectedSubCategories.splice(index, 1);
    }

    const filteredBySubCategories = this.equipmentList.filter((equipment) =>
      this.selectedSubCategories.includes(equipment.Sub_Category || '')
    );
    this.sizeOptions = Array.from(
      new Set(filteredBySubCategories.map((e) => e.Size || ''))
    );

    // Call the onFilterChange() function to update the filteredEquipmentList
    this.onFilterChange();
  }

  onSizeCheckboxChange(size: string) {
    const index = this.selectedSizes.indexOf(size);

    if (index === -1) {
      // Checkbox is checked, add size to selectedSizes
      this.selectedSizes.push(size);
    } else {
      // Checkbox is unchecked, remove size from selectedSizes
      this.selectedSizes.splice(index, 1);
    }

    // Call the onFilterChange() function to update the filteredEquipmentList
    this.onFilterChange();
  }

  onSearchChange() {
    // Filter sub-categories based on search text
    this.filteredSubCategories = this.subCategories.filter((subCategory) =>
      subCategory.toLowerCase().includes(this.searchText.toLowerCase())
    );

    // Filter equipment list based on selected sub-categories and exclude Caterpillar
    if (this.selectedSubCategories.length === 0) {
      // No sub-categories selected, display all equipment (excluding Caterpillar)
      this.filteredEquipmentList = this.equipmentList.filter((equipment: any) =>
        equipment.Manufacturer !== 'Caterpillar' &&
        equipment.Sub_Category.toLowerCase().includes(
          this.searchText.toLowerCase()
        )
      );
    } else {
      // Sub-categories selected, display filtered equipment based on sub-categories and search text (excluding Caterpillar)
      this.filteredEquipmentList = this.equipmentList.filter(
        (equipment: any) =>
          equipment.Manufacturer !== 'Caterpillar' &&
          this.selectedSubCategories.includes(equipment.Sub_Category || '') &&
          equipment.Sub_Category.toLowerCase().includes(
            this.searchText.toLowerCase()
          )
      );
    }

    // Reset pagination to first page
    this.currentPage = 1;
  }

  onFilterChange() {
    // Reset pagination to first page
    this.currentPage = 1;
  
    // Create a copy of the equipmentList and filter out Caterpillar
    this.filteredEquipmentList = this.equipmentList.filter(
      (equipment: any) => equipment.Manufacturer !== 'Caterpillar'
    );
  
    // Filter based on selected category
    if (this.selectedCategory) {
      this.filteredEquipmentList = this.filteredEquipmentList.filter(
        equipment => equipment.Category === this.selectedCategory
      );
    }
  
    // Filter based on selected subcategory
    if (this.selectedSubCategory) {
      this.filteredEquipmentList = this.filteredEquipmentList.filter(
        equipment => equipment.Sub_Category === this.selectedSubCategory
      );
    }
  
    // Filter based on selected size
    if (this.selectedSize) {
      this.filteredEquipmentList = this.filteredEquipmentList.filter(
        equipment => equipment.Size === this.selectedSize
      );
    }
  
    // Filter based on search text
    if (this.searchText) {
      this.filteredEquipmentList = this.filteredEquipmentList.filter(
        equipment =>
          equipment.Sub_Category.toLowerCase().includes(this.searchText.toLowerCase())
      );
    }
  
    // Update isListEmpty based on the filtered equipment list
    this.isListEmpty = this.filteredEquipmentList.length === 0;
  }
  
  // public onSortChange(): void {
  //   if (this.sortOrder === 'asc') {
  //     this.filteredEquipmentList.sort((a, b) => {
  //       if (a.Size && b.Size) {
  //         return a.Size.localeCompare(b.Size);
  //       } else {
  //         return 0;
  //       }
  //     });
  //   } else {
  //     this.filteredEquipmentList.sort((a, b) => {
  //       if (a.Size && b.Size) {
  //         return b.Size.localeCompare(a.Size);
  //       } else {
  //         return 0;
  //       }
  //     });
  //   }
  // }

  prevPage() {
    // go to previous page
    this.currentPage--;
  }

  nextPage() {
    // go to next page
    this.currentPage++;
  }

  get totalPages() {
    // calculate total number of pages based on itemsPerPage
    return Math.ceil(this.filteredEquipmentList.length / this.itemsPerPage);
  }
}

