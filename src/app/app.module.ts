import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { TaggingComponent } from './tagging/tagging.component';
import { SearchingComponent } from './searching/searching.component';
import { TagqueryComponent } from './searching/tagquery/tagquery.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ExclusivetoggleComponent } from './searching/exclusivetoggle/exclusivetoggle.component';

@NgModule({
  declarations: [
    AppComponent,
    ToolbarComponent,
    TaggingComponent,
    SearchingComponent,
    TagqueryComponent,
    ExclusivetoggleComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatSlideToggleModule,
    MatSidenavModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
