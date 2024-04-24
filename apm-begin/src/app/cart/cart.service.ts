import { computed, effect, Injectable, signal } from "@angular/core";
import { Product } from "../products/product";
import { CartItem } from "./cart";

@Injectable({
  providedIn: 'root'
})
export class CartService {
  cartItems = signal<CartItem[]>([]);

  cartCount = computed(() => this.cartItems()
    .reduce((accQty, item) => accQty + item.quantity, 0));

  subTotal = computed(() => this.cartItems()
    .reduce((accTotal, item) => accTotal + (item.quantity * item.product.price), 0));

  deliveryFee = computed<number>(() => this.subTotal() < 50 ? 5.99 : 0);

  tax = computed(() => Math.round(this.subTotal() * 10.75) / 100);

  totalPrice = computed(() => this.subTotal() + this.deliveryFee() + this.tax());

  eLength = effect(() => console.log('Cart array length:', this.cartItems().length));

  addToCart(product: Product): void {
    this.cartItems.update(items => [...items, { product, quantity: 1 }]); // COPY OF ARRAY TO CHANGE VALUE (WE NEED TO MAKE COPY)

    // BELOW NOT WORKING?!
    // const newItem = { product, quantity: 1 };
    // if (this.cartItems().length === 0) this.cartItems.update(items => [...items, newItem]);
    // else this.cartItems.update(items => items.map(item => item.product.id === product.id ?
    //   { ...item, quantity: item.quantity + 1 } : newItem));
  }

  removeFromCart(cartItem: CartItem): void {
    this.cartItems.update(items => 
      items.filter(item => item.product.id !== cartItem.product.id));
  }

  updateQuantity(cartItem: CartItem, quantity: number): void {
    this.cartItems.update(items => items.map(item => item.product.id === cartItem.product.id ?
      { ...item, quantity } : item));
  }
}
