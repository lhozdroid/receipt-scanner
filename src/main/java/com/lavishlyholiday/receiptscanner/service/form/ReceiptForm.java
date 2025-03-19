package com.lavishlyholiday.receiptscanner.service.form;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class ReceiptForm {
    private UUID id;
    private String receiptNumber;
    private BigDecimal receiptTotal;
    private String receiptDescription;
    private String companyName;
    private String companyAddress;
    private String companyPhone;
    private String taxCategory;
    private String taxSubCategory;

    /**
     * @param total
     */
    public void setReceiptTotal(Double total) {
        this.receiptTotal = BigDecimal.valueOf(total);
    }
}
