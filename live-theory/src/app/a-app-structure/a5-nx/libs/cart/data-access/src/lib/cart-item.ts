/** What the cart needs from a product – cart does NOT depend on scope:products. */
export interface CartProduct {
  id: number;
  name: string;
  price: number;
}

export interface CartItem extends CartProduct {
  quantity: number;
}
