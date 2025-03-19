package com.lavishlyholiday.receiptscanner.ui.rest;

import com.lavishlyholiday.receiptscanner.data.model.Receipt;
import com.lavishlyholiday.receiptscanner.service.ReceiptService;
import com.lavishlyholiday.receiptscanner.service.form.ReceiptForm;
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
     * @param id
     * @return
     * @throws Exception
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<Boolean> approve(@PathVariable("id") UUID id) throws Exception {
        receiptService.approve(id);
        return ResponseEntity.ok(true);
    }

    /**
     * @param id
     * @return
     * @throws Exception
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Boolean> deleteById(@PathVariable("id") UUID id) throws Exception {
        receiptService.deleteById(id);
        return ResponseEntity.ok(true);
    }

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
     * @param id
     * @return
     * @throws Exception
     */
    @PostMapping("/{id}/repeat_analysis")
    public ResponseEntity<Boolean> repeatAnalysis(@PathVariable("id") UUID id) throws Exception {
        receiptService.repeatAnalysis(id);
        return ResponseEntity.ok(true);
    }

    /**
     * @param form
     * @return
     * @throws Exception
     */
    @PostMapping("")
    public ResponseEntity<Boolean> update(@ModelAttribute ReceiptForm form) throws Exception {
        receiptService.update(form);
        return ResponseEntity.ok(true);
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
