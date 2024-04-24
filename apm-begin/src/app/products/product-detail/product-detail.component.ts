import { Component, computed, inject, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';

import { NgIf, NgFor, CurrencyPipe, AsyncPipe } from '@angular/common';
import { Product } from '../product';
import { ProductService } from '../product.service';
import { catchError, EMPTY, Subscription, tap } from 'rxjs';
import { CartService } from 'src/app/cart/cart.service';

@Component({
    selector: 'pm-product-detail',
    templateUrl: './product-detail.component.html',
    standalone: true,
    imports: [AsyncPipe, NgIf, NgFor, CurrencyPipe]
})
export class ProductDetailComponent implements OnChanges, OnDestroy {
  // @Input() productId: number = 0;
  // sub!: Subscription;

  private productService = inject(ProductService);
  private cartService = inject(CartService);

  // Product to display
  // product: Product | null = null;
  // product$ = this.productService.product$
  //   .pipe(
  //     catchError(err => {
  //       this.errorMessage = err;
  //       return EMPTY;
  //     })
  //   );
  product = this.productService.product;
  errorMessage = this.productService.productError;

  // Set the page title
  // pageTitle = this.product ? `Product Detail for: ${this.product.productName}` : 'Product Detail';
  // pageTitle = 'Product Detail';
  pageTitle = computed(() => this.product() ? `Product Detail for: ${this.product()?.productName}` : 'Product Detail'); // COMPILER READS SIGNAL AGAIN HERE: this.product()?.productName, THATS WHY WE NEED '?' DESPITE OF CHECKING IT BEFORE 


  ngOnChanges(changes: SimpleChanges): void { // A hashtable of changes represented by SimpleChange objects
      // const id = changes['productId'].currentValue;
      // if (id) {
      //   this.sub = this.productService.getProduct(id)
      //     .pipe(
      //       tap(() => console.log('In component detail pipeline')),
      //       catchError(err => {
      //         this.errorMessage = err;
      //         return EMPTY;
      //       })
      //     )
      //     .subscribe(product => this.product = product);
      // }
  }

  ngOnDestroy(): void {
      // if(this.sub) { // Because we sub in ngOnChanges so there is possibility that there will be no sub!
      //   this.sub.unsubscribe();
      // }
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product);
  }
}
