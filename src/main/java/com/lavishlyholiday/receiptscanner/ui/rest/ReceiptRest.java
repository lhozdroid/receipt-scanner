package com.lavishlyholiday.receiptscanner.ui.rest;

import com.lavishlyholiday.receiptscanner.data.model.Receipt;
import com.lavishlyholiday.receiptscanner.service.ReceiptService;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/receipts")
@Log4j2
@AllArgsConstructor
public class ReceiptRest {
    private final ReceiptService receiptService;

    /**
     * @return
     * @throws Exception
     */
    @GetMapping("")
    public ResponseEntity<List<Receipt>> findAll() throws Exception {
        List<Receipt> receipts = receiptService.findAll();
        return ResponseEntity.ok(receipts);
    }

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
