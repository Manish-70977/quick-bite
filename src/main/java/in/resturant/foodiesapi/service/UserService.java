package in.resturant.foodiesapi.service;

import in.resturant.foodiesapi.io.UserRequest;
import in.resturant.foodiesapi.io.UserResponse;

public interface UserService {

    UserResponse registerUser(UserRequest request);

    String findByUserId();
}
