package pw25.mainbackend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import pw25.mainbackend.entities.Order;
import pw25.mainbackend.entities.OrderStatus;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findOrdersByWilaya(String wilaya);
    List<Order> findOrdersByStatus(OrderStatus status);

    void deleteByStatus(OrderStatus status);
}
