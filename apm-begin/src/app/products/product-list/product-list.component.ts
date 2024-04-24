import { Component, inject, OnDestroy, OnInit } from '@angular/core';

import { NgIf, NgFor, NgClass, AsyncPipe } from '@angular/common';
import { Product } from '../product';
import { ProductDetailComponent } from '../product-detail/product-detail.component';
import { ProductService } from '../product.service';
import { catchError, EMPTY, of, Subscription, tap } from 'rxjs';

@Component({
    selector: 'pm-product-list',
    templateUrl: './product-list.component.html',
    standalone: true, // WHEN USING STANDALONE COMPONENTS WE NEED TO IMPORT EVERYTHING WHAT TEMPLATE NEEDS (like below)
    imports: [AsyncPipe, NgIf, NgFor, NgClass, ProductDetailComponent]
})
export class ProductListComponent implements OnInit, OnDestroy {
  pageTitle = 'Products';
  // sub!: Subscription;
  
  private productService = inject(ProductService);

  // Products
  // readonly products$ = this.productService.products$ // READONLY to ensure it's newer modified
  // .pipe(
  //   // tap(() => console.log('In component pipeline')),
  //   catchError(err => {
  //     this.errorMessage = err;
  //     return EMPTY;
  //   })
  // );

  products = this.productService.products;
  errorMessage = this.productService.productsError;

  // products: Product[] = [];

  // Selected product id to highlight the entry
  // selectedProductId: number = 0;
  // readonly selectedProductId$ = this.productService.productSelected$; // readonly as we don't want to overwrite this variable
  selectedProductId = this.productService.selectedProductId; // readonly as we don't want to overwrite this variable

  ngOnInit(): void {
    // this.sub = this.productService.products$
    //   .pipe(
    //     tap(() => console.log('In component pipeline')),
    //     catchError(err => {
    //       this.errorMessage = err;
    //       return EMPTY;
    //     })
    //   )
    //   .subscribe(products => {
    //     this.products = products;
    //     console.log(this.products);
    //   }); // This is next callback function (observer)

      // SETTING errorMessage IN OBSERVER
      // .subscribe({
      //   next: products => {
      //     this.products = products;
      //     console.log(this.products);
      //   },
      //   error: err => this.errorMessage = err
      // });
  }

  onSelected(productId: number): void {
    // this.selectedProductId = productId;
    this.productService.productSelected(productId);
  }

  ngOnDestroy(): void {
      // this.sub.unsubscribe();
  }
}
