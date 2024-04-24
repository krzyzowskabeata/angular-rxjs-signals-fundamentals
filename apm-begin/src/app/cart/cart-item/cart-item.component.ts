import { Component, computed, inject, Input, signal } from '@angular/core';
import { CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CartItem } from '../cart';
import { CartService } from '../cart.service';

@Component({
  selector: 'sw-cart-item',
  standalone: true,
  imports: [CurrencyPipe, FormsModule, NgFor, NgIf],
  templateUrl: './cart-item.component.html'
})
export class CartItemComponent {

  // @Input({ required: true }) cartItem!: CartItem;
  @Input({ required: true }) set cartItem(ci: CartItem) { // USED SETTER WITH INPUT
    this.item.set(ci);
  } 

  private cartService = inject(CartService);

  item = signal<CartItem>(undefined!); // NICE TRICK!!! undefined! but not a best practice

  // Quantity available (hard-coded to 8)
  // Mapped to an array from 1-8
  qtyArr = [...Array(8).keys()].map(x => x + 1);

  // Calculate the extended price
  // exPrice = this.cartItem?.quantity * this.cartItem?.product.price;
  exPrice = computed(() => this.item().quantity * this.item().product.price);

  onQuantitySelected(quantity: number): void {
    this.cartService.updateQuantity(this.item(), Number(quantity)); // Number(quantity) to ensure its a number as template passes quantity as string
  }

  removeFromCart(): void {
    this.cartService.removeFromCart(this.item());
  }
}
