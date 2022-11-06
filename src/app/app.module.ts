import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { TaggingComponent } from './tagging/tagging.component';
import { SearchingComponent } from './searching/searching.component';
import { TagqueryComponent } from './searching/searchinput/tagquery/tagquery.component';
import { HttpClientModule } from '@angular/common/http';
import { ExclusivetoggleComponent } from './searching/searchinput/exclusivetoggle/exclusivetoggle.component';
import { SearchinputComponent } from './searching/searchinput/searchinput.component';
import { QuestionComponent } from './tagging/question/question.component';
import { FileviewerComponent } from './fileviewer/fileviewer.component';
import { FileSaverModule } from 'ngx-filesaver';
import { AppService } from './app.service';
import { APP_BASE_HREF } from '@angular/common';
import { SettingsComponent } from './settings/settings.component';
import { TagSettingsComponent } from './settings/tag-settings/tag-settings.component';
import { QuestionSettingsComponent } from './settings/question-settings/question-settings.component';

export function initApp(appService: AppService) {
  return () => appService.load();
}

@NgModule({
  declarations: [
    AppComponent,
    ToolbarComponent,
    TaggingComponent,
    SearchingComponent,
    TagqueryComponent,
    ExclusivetoggleComponent,
    SearchinputComponent,
    QuestionComponent,
    FileviewerComponent,
    SettingsComponent,
    TagSettingsComponent,
    QuestionSettingsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDividerModule,
    MatGridListModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSlideToggleModule,
    MatSidenavModule,
    MatTabsModule,
    HttpClientModule,
    FileSaverModule,
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initApp,
      deps: [AppService],
      multi: true
    },
    {
      provide: APP_BASE_HREF,
      useValue: "/" + (window.location.pathname.split("/")[1] || ""),
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
