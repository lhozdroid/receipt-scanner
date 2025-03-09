package com.lavishlyholiday.receiptscanner;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ReceiptScannerApplication {
    /**
     * @param args
     */
    public static void main(String[] args) {
        SpringApplication.run(ReceiptScannerApplication.class, args);
    }

}
