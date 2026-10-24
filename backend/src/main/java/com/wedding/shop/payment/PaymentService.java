package com.wedding.shop.payment;

/** Giao dien thanh toan chung: them cong moi chi can implement interface nay. */
public interface PaymentService {
    /** Ten provider, vi du "cod", "stripe". */
    String providerName();

    PaymentResult charge(PaymentRequest request);

    record PaymentRequest(String orderCode, Long amountVnd, String buyerEmail) {}
    record PaymentResult(String status, String clientSecret, String message) {}
}
