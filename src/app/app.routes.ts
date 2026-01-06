import { Routes } from '@angular/router';
import { ProductComponent } from './features/product/product.component';
import { ProductFormComponent } from './features/product-form/product-form.component';

export const routes: Routes = [
    {path:'', component: ProductComponent},
    {path:'form', component: ProductFormComponent},
    {path:'form/:id', component: ProductFormComponent}
];
