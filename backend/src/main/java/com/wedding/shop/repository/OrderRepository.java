package com.wedding.shop.repository;
import com.wedding.shop.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByBuyerKeyOrderByCreatedAtDesc(String buyerKey);
}
