package com.wedding.shop.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "carts")
public class Cart {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Khoa dinh danh chu gio hang, dang "user:<email>" hoac "guest:<X-Guest-Id>".
     * Giu don gian thay vi quan he User bat buoc, de guest khong can dang nhap van mua duoc.
     */
    @Column(nullable = false, unique = true)
    private String ownerKey;

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<CartItem> items = new ArrayList<>();

    public Cart() {}
    public Cart(String ownerKey) { this.ownerKey = ownerKey; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getOwnerKey() { return ownerKey; }
    public void setOwnerKey(String ownerKey) { this.ownerKey = ownerKey; }
    public List<CartItem> getItems() { return items; }
    public void setItems(List<CartItem> items) { this.items = items; }
}
