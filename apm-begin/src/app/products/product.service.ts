import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject, catchError, combineLatest, filter, map, mergeMap, Observable, of, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { Review } from '../reviews/review';
import { ReviewService } from '../reviews/review.service';
import { HttpErrorService } from '../utilities/http-error.service';
import { Product, Result } from './product';
import { ProductData } from './product-data';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsUrl = 'api/products';
  private reviewService = inject(ReviewService);

  // constructor(private http: HttpClient) {}
  private http = inject(HttpClient); // SINCE ANGULAR 14
  private errorService = inject(HttpErrorService);

  // private productSelectedSubject = new BehaviorSubject<number | undefined>(undefined);
  // readonly productSelected$ = this.productSelectedSubject.asObservable();
  selectedProductId = signal<number | undefined>(undefined);

  private productsResult$ = this.http.get<Product[]>(this.productsUrl) // readonly so no other code will modify it 
    .pipe(
      map(p => ({ data: p } as Result<Product[]>)),
      // tap(() => console.log('In http.get pipeline')),
      tap((p) => console.log(JSON.stringify(p))),
      shareReplay(1), // BEFORE: Processed before caching the data; AFTER: Re-executed for each subscription
      // catchError(err => this.handleError(err))
      catchError(err => of({ data: [], error: this.errorService.formatError(err) } as Result<Product[]>))
    );
  
  // It's a Signal<Product[]>, NOT A WritableSignal<Product[]>, SO IT'S READONLY SIGNAL when we create signal using toSignal() 
  private productsResult = toSignal(this.productsResult$, 
    { initialValue: ({ data: [] } as Result<Product[]>) }); // WITHOUT INITIAL VALUE IT WOULD BE TYPE OF Product[] | undefined
  // toSignal will automatically SUBSCRIBE AND UNSUBSCRIBE!

  products = computed(() => this.productsResult().data);
  productsError = computed(() => this.productsResult().error);

  // ONE OF THE APPROACHES TO CATCH ERROR
  // products = computed(() => {
  //   try {
  //     return toSignal(this.products$, { initialValue: [] as Product[] })(); // BRACKETS AT THE END TO READ THE SIGNAL
  //   } catch (error) {
  //     return [] as Product[];
  //   }
  // });

  // getProducts(): Observable<Product[]> {
  //   return this.http.get<Product[]>(this.productsUrl)
  //     .pipe(
  //       tap(() => console.log('In http.get pipeline')),
  //       catchError(err => this.handleError(err))
  //     );
  // }

  // readonly product$ = this.productSelected$
  // private productResult$ = toObservable(this.selectedProductId)
  //   .pipe(
  //     filter(Boolean), // WOW <3 FILTERS OUT UNDEFINED OR NULL
  //     switchMap(id => {
  //       const productUrl = `${this.productsUrl}/${id}`;
  //       return this.http.get<Product>(productUrl)
  //         .pipe(
  //           // tap(() => console.log('In http.get by id pipeline')),
  //           switchMap(product => this.getProductWithReviews(product)),
  //           // catchError(err => this.handleError(err))
  //           catchError(err => of({ data: undefined, error: this.errorService.formatError(err) } as Result<Product>))
  //         );
  //     }),
  //     map(p => ({ data: p } as Result<Product>))
  //   );


    // BELOW SOLUTION INSTEAD OF COMBINE LATEST
    // Find the product in the existing array of products
    private foundProduct = computed(() => {
      // Dependent signals
      const p = this.products();
      const id = this.selectedProductId();
      if (p && id) {
        return p.find(product => product.id === id);
      }
      return undefined;
    })
  
    // Get the related set of reviews 
    private productResult$ = toObservable(this.foundProduct)
      .pipe(
        filter(Boolean),
        switchMap(product => this.getProductWithReviews(product)),
        map(p => ({ data: p } as Result<Product>)),
        catchError(err => of({
          data: undefined,
          error: this.errorService.formatError(err)
        } as Result<Product>))
      );

  private productResult = toSignal(this.productResult$);
  product = computed(() => this.productResult()?.data); // QUESTION MARKS AS INITIAL VALUE IS UNDEFINED
  productError = computed(() => this.productResult()?.error);
  // readonly product$ = combineLatest([this.productSelected$, this.products$])
  //   .pipe(
  //     map(([selectedProductId, products]) => 
  //       products.find(product => product.id === selectedProductId)
  //     ),
  //     filter(Boolean),
  //     switchMap(product => this.getProductWithReviews(product)),
  //     catchError(err => this.handleError(err))
  //   );

  // getProduct(id: number): Observable<Product> {
  //   const productUrl = `${this.productsUrl}/${id}`;

  //   return this.http.get<Product>(productUrl)
  //     .pipe(
  //       tap(() => console.log('In http.get by id pipeline')),
  //       switchMap(product => this.getProductWithReviews(product)),
  //       catchError(err => this.handleError(err))
  //     );
  // }

  productSelected(selectedProductId: number): void {
    // this.productSelectedSubject.next(selectedProductId);
    this.selectedProductId.set(selectedProductId);
  }

  private getProductWithReviews(product: Product): Observable<Product> {
    if (product.hasReviews) {
      return this.http.get<Review[]>(this.reviewService.getReviewUrl(product.id))
        .pipe(
          map(reviews => ({ ...product, reviews } as Product))
        )
    } else {
      return of(product);
    }
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    const formattedMessage = this.errorService.formatError(err);
    return throwError(() => formattedMessage);
    // throw formattedMessage; // USING JS THROW MESSAGE
  }

}
