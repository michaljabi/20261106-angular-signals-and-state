/** What the cart needs from a product – cart does NOT depend on the products feature. */
export interface CartProduct {
  id: number;
  name: string;
  price: number;
}

export interface CartItem extends CartProduct {
  quantity: number;
}
