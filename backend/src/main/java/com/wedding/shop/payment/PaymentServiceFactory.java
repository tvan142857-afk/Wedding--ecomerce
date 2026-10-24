package com.wedding.shop.payment;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class PaymentServiceFactory {
    private final List<PaymentService> services;
    private final String defaultProvider;

    public PaymentServiceFactory(List<PaymentService> services,
                                 @Value("${payment.provider:cod}") String defaultProvider) {
        this.services = services;
        this.defaultProvider = defaultProvider;
    }

    public PaymentService resolve(String requested) {
        String name = (requested == null || requested.isBlank()) ? defaultProvider : requested.trim().toLowerCase();
        return services.stream()
                .filter(s -> s.providerName().equals(name))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Payment provider khong ho tro: " + name));
    }

    public String defaultProvider() { return defaultProvider; }
}
