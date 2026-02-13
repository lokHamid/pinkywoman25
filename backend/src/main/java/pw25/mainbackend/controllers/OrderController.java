package pw25.mainbackend.controllers;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pw25.mainbackend.dtos.CreateOrderRequest;
import pw25.mainbackend.dtos.UpdateOrderRequest;
import pw25.mainbackend.entities.Order;
import pw25.mainbackend.entities.OrderStatus;
import pw25.mainbackend.exception_handlers.BusinessException;
import pw25.mainbackend.services.OrderService;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor(onConstructor_ =  @Autowired)
public class OrderController {
    private final OrderService orderService;

    // ============ GET ===========
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping()
    public List<Order> findAll() {
        return orderService.findAll();
    }
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<Order> findById(@PathVariable Long id) {
        return orderService.findById(id).map(ResponseEntity::ok).orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping("/status/{status}")
    public List<Order> findByStatus(@PathVariable @NotNull String status) {
        try{
            OrderStatus sts = OrderStatus.fromValue(status);
            return orderService.findOrdersByStatus(sts);
        }catch(IllegalArgumentException e){
            throw new BusinessException("Invalid order status: " + status);
        }
    }
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping("/wilaya/{wilaya}")
    public List<Order> findByWilaya(@PathVariable @NotNull String wilaya) {
        return orderService.findByWilaya(wilaya);
    }

    //============== POST & PUT ===============
    @PostMapping()
    public ResponseEntity<Order> create(@RequestBody @Valid CreateOrderRequest order) {
        Order created = orderService.save(order);
        URI location = URI.create("/api/orders/" + created.getId());
        return ResponseEntity.created(location).body(created);
    }
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Order> update(@PathVariable Long id, @RequestBody @Valid UpdateOrderRequest request) {
        return ResponseEntity.ok(orderService.update(id,request));
    }

    //============== DELETE ===============

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if(!orderService.existsById(id)){
            return ResponseEntity.notFound().build();
        }
        orderService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/status/{status}")
    public ResponseEntity<Void> deleteByStatus(@PathVariable @NotNull String status) {
        try{
            OrderStatus sts = OrderStatus.fromValue(status);
            orderService.deleteByStatus(sts);
            return ResponseEntity.noContent().build();
        }catch(IllegalArgumentException e){
            throw new BusinessException("Invalid order status: " + status);
        }
    }
}
