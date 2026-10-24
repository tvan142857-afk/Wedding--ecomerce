package com.wedding.shop.payment;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Stripe che do test, KHONG goi API Stripe that o ban nay (chua them stripe-java SDK).
 * - Neu khong co STRIPE_SECRET_KEY: tra TEST_MODE, checkout khong fail.
 * - Neu co key: van tra TEST_MODE (clientSecret gia dang pi_test_...) cho toi khi
 *   tich hop SDK that; khong bao gio log hay commit key.
 */
@Service
public class StripePaymentService implements PaymentService {
    private final String secretKey;

    public StripePaymentService(@Value("${stripe.secret-key:}") String secretKey) {
        this.secretKey = secretKey == null ? "" : secretKey.trim();
    }

    @Override public String providerName() { return "stripe"; }

    @Override
    public PaymentResult charge(PaymentRequest request) {
        if (secretKey.isEmpty()) {
            return new PaymentResult("TEST_MODE", "test_client_secret_no_stripe_key",
                    "Chua cau hinh STRIPE_SECRET_KEY: chay che do test, khong goi API Stripe that.");
        }
        return new PaymentResult("TEST_MODE",
                "pi_test_" + request.orderCode() + "_secret_test",
                "Stripe test mode: key da co nhung ban nay chua goi API Stripe that (can them stripe-java SDK).");
    }
}
