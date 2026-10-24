package com.wedding.shop.payment;

import org.springframework.stereotype.Service;

@Service
public class CodPaymentService implements PaymentService {
    @Override public String providerName() { return "cod"; }

    @Override
    public PaymentResult charge(PaymentRequest request) {
        // COD: khong thu tien truoc, don luon duoc coi la thanh toan hop le khi tao.
        return new PaymentResult("SUCCESS", null, "Thanh toan khi nhan hang (COD)");
    }
}
