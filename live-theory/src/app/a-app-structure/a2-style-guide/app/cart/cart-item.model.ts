import { Product } from '../product-catalog/product.model';

export interface CartItem {
  product: Product;
  quantity: number;
}
