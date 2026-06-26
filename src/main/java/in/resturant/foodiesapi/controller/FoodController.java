package in.resturant.foodiesapi.controller;

import in.resturant.foodiesapi.io.FoodRequest;
import in.resturant.foodiesapi.io.FoodResponse;
import in.resturant.foodiesapi.service.FoodService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import software.amazon.awssdk.thirdparty.jackson.core.JsonProcessingException;
import tools.jackson.databind.ObjectMapper;

import java.util.List;


@RestController
@RequestMapping("/api/foodies")
@AllArgsConstructor
@CrossOrigin("*")
public class FoodController {
    private final FoodService foodService;

    @PostMapping
    public FoodResponse addFood(@RequestPart("food") String foodString,
                                @RequestPart("file")MultipartFile file) {
        ObjectMapper objectMapper = new ObjectMapper();
        FoodRequest request = null;
        request = objectMapper.readValue(foodString, FoodRequest.class);
        FoodResponse response = foodService.addFood(request,file);
        return response;
    }

    @GetMapping
    public List<FoodResponse> readFoods() {
        return foodService.readFoods();
    }
    @GetMapping("/{id}")
    public FoodResponse readFood(@PathVariable String id) {
        return foodService.readFood(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteFood(@PathVariable String id) {
        foodService.deleteFood(id);
    }

}

