package in.resturant.foodiesapi.repository;

import in.resturant.foodiesapi.entity.FoodEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FoodRepository  extends MongoRepository <FoodEntity, String> {
}
