import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { BoardUserComponent } from './board-user/board-user.component';
import { BoardModeratorComponent } from './board-moderator/board-moderator.component';
import { BoardAdminComponent } from './board-admin/board-admin.component';
import { EquipmentDetailsComponent } from './equipment-details/equipment-details.component';
import { CalculatorComponent } from './calculator/calculator.component';
import { EquipmentManagerComponent } from './equipment-manager/equipment-manager.component';
import { EquipmentListComponent } from './equipment-list/equipment-list.component';
import { SavedModelsComponent } from './saved-models/saved-models.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { FuelQuarterSelectionComponent } from './fuel-quarter-selection/fuel-quarter-selection.component';
import { CountySelectionComponent } from './county-selection/county-selection.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: 'fuel-quarter-selection',
    component: FuelQuarterSelectionComponent,
  },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent },
  // { path: 'user', component: BoardUserComponent },
  // { path: 'mod', component: BoardModeratorComponent },
  { path: 'equipments', component: BoardAdminComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'equipment-details', component: EquipmentDetailsComponent},
  { path: 'county-selection', component: CountySelectionComponent },
  { path: 'calculator', component: CalculatorComponent },
  { path: 'manage-equipment-data', component: EquipmentManagerComponent},
  { path: 'equipment-list', component: EquipmentListComponent},
  { path: 'saved-models', component: SavedModelsComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password/:token', component: ResetPasswordComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes,{useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
