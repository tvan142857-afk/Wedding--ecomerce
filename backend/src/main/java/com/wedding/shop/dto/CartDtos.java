package com.wedding.shop.dto;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
public class CartDtos {
    public record AddItemRequest(@NotNull Long productId, @Min(1) int quantity) {}
    public record OrderRequest(String fullName, String phone, String address, String note,
                               String paymentProvider) {}
}
