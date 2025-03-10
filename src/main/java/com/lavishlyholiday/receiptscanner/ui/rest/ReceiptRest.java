package com.lavishlyholiday.receiptscanner.ui.rest;

import com.lavishlyholiday.receiptscanner.data.model.Receipt;
import com.lavishlyholiday.receiptscanner.service.ReceiptService;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

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
     * @param id
     * @return
     * @throws Exception
     */
    @GetMapping("/{id}/file")
    public ResponseEntity<byte[]> findImageById(@PathVariable("id") UUID id) throws Exception {
        Receipt receipt = receiptService.findFileDataById(id);
        return ResponseEntity.ok() //
                .header(HttpHeaders.CONTENT_TYPE, receipt.getFileType()) //
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + receipt.getFileName() + "\"") //
                .body(receipt.getFileData());
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
