import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { BoardAdminComponent } from './board-admin/board-admin.component';
import { BoardModeratorComponent } from './board-moderator/board-moderator.component';
import { BoardUserComponent } from './board-user/board-user.component';
import { ReactiveFormsModule } from '@angular/forms';
import { httpInterceptorProviders } from './_helpers/http.interceptor';
import { CalculatorComponent } from './calculator/calculator.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { EquipmentListComponent } from './equipment-list/equipment-list.component';
import { PaginationComponent } from './pagination/pagination.component';
import { EquipmentDetailsComponent } from './equipment-details/equipment-details.component';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { EquipmentManagerComponent } from './equipment-manager/equipment-manager.component';
import { EditFormComponent } from './edit-form/edit-form.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { NotificationComponent } from './notification/notification.component';
import { FuelQuarterSelectionComponent } from './fuel-quarter-selection/fuel-quarter-selection.component';
import { CountySelectionComponent } from './county-selection/county-selection.component';
import { SavedModelsComponent } from './saved-models/saved-models.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    ProfileComponent,
    BoardAdminComponent,
    BoardModeratorComponent,
    BoardUserComponent,
    CalculatorComponent,
    SidenavComponent,
    EquipmentListComponent,
    PaginationComponent,
    EquipmentDetailsComponent,
    LoadingSpinnerComponent,
    EquipmentManagerComponent,
    EditFormComponent,
    ConfirmationDialogComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    NotificationComponent,
    FuelQuarterSelectionComponent,
    CountySelectionComponent
    ,SavedModelsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
     // * MATERIAL IMPORTS
     MatSidenavModule,
     MatToolbarModule,
     MatMenuModule,
     MatIconModule,
     MatDividerModule,
     MatListModule,
     MatTabsModule,
     FormsModule,
     ReactiveFormsModule,
     MatDialogModule
  ],
  providers: [httpInterceptorProviders],
  bootstrap: [AppComponent]
})
export class AppModule { }
