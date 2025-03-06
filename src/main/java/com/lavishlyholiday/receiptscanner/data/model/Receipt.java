package com.lavishlyholiday.receiptscanner.data.model;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class Receipt {
    private UUID id;

    private String fileName;
    private String fileType;
    private byte[] fileData;

    private String receiptNumber;
    private BigDecimal receiptTotal;
    private LocalDateTime receiptDate;
    private String receiptDescription;

    private String companyName;
    private String companyAddress;
    private String companyPhone;

    private String taxCategory;
    private String taxSubCategory;

    private String state;
    private String error;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
