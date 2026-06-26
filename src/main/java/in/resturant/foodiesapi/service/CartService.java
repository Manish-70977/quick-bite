package in.resturant.foodiesapi.service;

import in.resturant.foodiesapi.io.CartRequest;
import in.resturant.foodiesapi.io.CartResponse;

public interface CartService {

     CartResponse addToCart(CartRequest request);

     CartResponse getCart();

     void clearCart();

     CartResponse removeFromCart(CartRequest cartRequest);
}
