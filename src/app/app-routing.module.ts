import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { SearchingComponent } from './searching/searching.component';
import { TaggingComponent } from './tagging/tagging.component';

const routes: Routes = [
  { path: "tag", component: TaggingComponent },
  { path: "search", component: SearchingComponent },
  { path: "", redirectTo: "/search", pathMatch: "full" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
