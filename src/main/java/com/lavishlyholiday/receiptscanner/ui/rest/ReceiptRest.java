package com.lavishlyholiday.receiptscanner.ui.rest;

import com.lavishlyholiday.receiptscanner.service.ReceiptService;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/receipts")
@Log4j2
@AllArgsConstructor
public class ReceiptRest {
    private final ReceiptService receiptService;

    /**
     * @param file
     * @return
     * @throws Exception
     */
    @PostMapping("/upload")
    public ResponseEntity<Boolean> upload(@RequestParam("file") MultipartFile file) throws Exception {
        receiptService.upload(file);
        return ResponseEntity.ok(true);
    }
}
