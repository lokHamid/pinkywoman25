package pw25.mainbackend.services;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import pw25.mainbackend.dtos.CreateOrderRequest;
import pw25.mainbackend.dtos.UpdateOrderRequest;
import pw25.mainbackend.entities.Order;
import pw25.mainbackend.entities.OrderStatus;
import pw25.mainbackend.entities.ProductVariant;
import pw25.mainbackend.exception_handlers.BusinessException;
import pw25.mainbackend.exception_handlers.ResourceNotFoundException;
import pw25.mainbackend.repositories.OrderRepository;
import pw25.mainbackend.repositories.ProductVariantRepository;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor(onConstructor_ =  @Autowired)
public class OrderService {
    private final OrderRepository orderRepository;
    private final ProductVariantRepository productVariantRepository;

    public Optional<Order> findById(Long id) {
        return orderRepository.findById(id);
    }
    public boolean existsById(Long id) {
        return orderRepository.existsById(id);
    }
    public List<Order> findAll() {
        return orderRepository.findAll();
    }
    public List<Order> findByWilaya(String wilaya) {
        return orderRepository.findOrdersByWilaya(wilaya);
    }
    public List<Order> findOrdersByStatus(OrderStatus status) {
        return orderRepository.findOrdersByStatus(status);
    }
    public Order save(CreateOrderRequest request) {

        // 1. Find the ProductVariant (throws exception if not found)
        ProductVariant variant = productVariantRepository
                .findById(request.variantId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "ProductVariant",
                        "id",
                        request.variantId().toString()
                ));

        // 2. Build the Order entity using Lombok builder
        Order order = Order.builder()
                .customerName(request.customer_name())
                .wilaya(request.wilaya())
                .phone(request.phone_number())
                .address(request.address())
                .notes(request.notes())
                .status(OrderStatus.fromValue(request.status()))   // assuming you have this static method
                .product(variant)                                  // ← important: link the variant
                .quantity(request.quantity())
                .unit_price(request.unit_price())
                // created_at & updated_at are managed by JPA (@CreationTimestamp / @UpdateTimestamp)
                // total is calculated by DB trigger / formula → not set here
                .build();

        // 3. Save and return
        return orderRepository.save(order);
    }
    public Order update(Long id, UpdateOrderRequest request) {
        Order toUpdate = findById(id).orElseThrow(() -> new ResourceNotFoundException("Order","id",id.toString()));

        if(request.customer_name() != null){
            toUpdate.setCustomerName(request.customer_name());
        }
        if(request.wilaya() != null){
            toUpdate.setWilaya(request.wilaya());
        }
        if(request.address() != null){
            toUpdate.setAddress(request.address());
        }
        if(request.notes() != null){
            toUpdate.setNotes(request.notes());
        }
        if(request.phone_number() != null){
            toUpdate.setPhone(request.phone_number());
        }
        if (request.status() != null) {
            try{
                toUpdate.setStatus(OrderStatus.fromValue(request.status()));
            }catch(IllegalArgumentException e){
                throw new BusinessException("Invalid Order Status");
            }
        }
        if(request.variantId() != null){
            if(!productVariantRepository.existsById(request.variantId())){
                throw new ResourceNotFoundException("Variant","id",request.variantId().toString());
            }
            toUpdate.setProduct(productVariantRepository.findById(request.variantId()).orElseThrow(() -> new ResourceNotFoundException("Product","id",request.variantId().toString())));
        }
        if(request.created_at() != null){
            toUpdate.setCreated_at(request.created_at());
        }
        if(request.updated_at() != null){
            toUpdate.setUpdated_at(request.updated_at());
        }
        if(request.quantity() != null){
            toUpdate.setQuantity(request.quantity());
        }
        if(request.unit_price() != null){
            toUpdate.setUnit_price(request.unit_price());
        }
        return orderRepository.save(toUpdate);
    }
    public void deleteById(Long id) {
        orderRepository.deleteById(id);
    }
    public void deleteByStatus(OrderStatus status) {
        orderRepository.deleteByStatus(status);
    }
}
