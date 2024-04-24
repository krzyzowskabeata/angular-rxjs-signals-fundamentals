import { Review } from "../reviews/review";

/* Defines the product entity */
export interface Product {
  id: number;
  productName: string;
  productCode: string;
  description: string;
  price: number;
  quantityInStock?: number;
  hasReviews?: boolean;
  reviews?: Review[];
}

// SHOULD BE REMOVED TO UTILITIES FOLDER
// GENERIC
export interface Result<T> { // T represents ANY type
  data: T | undefined;
  error?: string;
}
