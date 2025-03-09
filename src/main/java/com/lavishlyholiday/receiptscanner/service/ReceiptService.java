package com.lavishlyholiday.receiptscanner.service;

import com.lavishlyholiday.receiptscanner.data.ReceiptRepo;
import com.lavishlyholiday.receiptscanner.data.cons.ReceiptState;
import com.lavishlyholiday.receiptscanner.data.model.Receipt;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.lang3.StringUtils;
import org.springframework.core.env.Environment;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
@AllArgsConstructor
@Log4j2
public class ReceiptService {
    private final ReceiptRepo receiptRepo;
    private final OllamaService ollamaService;
    private final Environment environment;

    private final AtomicBoolean running = new AtomicBoolean(false);

    /**
     * @throws Exception
     */
    @Scheduled(cron = "0 * * * * *")
    public void analyzeReceipts() throws Exception {
        if (!running.get()) {
            running.set(true);

            int total = environment.getProperty("receipt.process.limit", Integer.class);
            LOG.info(StringUtils.rightPad("Starting analysis", 40, ".") + total + " total");
            long start = System.currentTimeMillis();

            // Obtains the receipts

            List<Receipt> receipts = receiptRepo.findByStateLimited(ReceiptState.UPLOAD_COMPLETE.name(), total);

            // Updates their state
            receipts.stream().forEach(receipt -> {
                receipt.setState(ReceiptState.ANALYSIS_ACTIVE.name());
                receipt.setUpdatedAt(LocalDateTime.now());
            });
            receiptRepo.update(receipts);

            // Does a check for each receipt
            receipts.stream().parallel().forEach(receipt -> {
                try {
                    LOG.info(StringUtils.rightPad("Processing", 40, ".") + receipt.getFileName());
                    analyzeReceipt(receipt);
                    receipt.setState(ReceiptState.ANALYSIS_COMPLETE.name());
                } catch (Exception e) {
                    LOG.error(e.getMessage(), e);
                    receipt.setState(ReceiptState.ANALYSIS_FAILED.name());
                    receipt.setError(e.getMessage());
                }

                receipt.setUpdatedAt(LocalDateTime.now());
            });

            // Updates the receipts
            receiptRepo.update(receipts);
            LOG.info(StringUtils.rightPad("Receipt analysis concluded", 40, ".") + (System.currentTimeMillis() - start) + "ms");

            running.set(false);
        }
    }

    /**
     * @return
     * @throws Exception
     */
    public List<Receipt> findAll() throws Exception {
        return receiptRepo.findAll();
    }

    /**
     * @param file
     * @throws Exception
     */
    public void upload(MultipartFile file) throws Exception {
        // Checks if the file was already uploaded
        String fileName = file.getOriginalFilename();
        boolean exists = receiptRepo.existsByName(fileName);
        if (exists) {
            throw new Exception("A file with the same name was already uploaded.");
        }

        // Creates the receipt and uploads it
        Receipt receipt = fileToReceipt(file);
        receiptRepo.insert(receipt);
    }

    /**
     * @param receipt
     * @throws Exception
     */
    private void analyzeReceipt(Receipt receipt) throws Exception {
        Receipt analysis = ollamaService.analyzeReceipt(receipt.getFileType(), receipt.getFileData());

        // Sets the data
        receipt.setReceiptNumber(analysis.getReceiptNumber());
        receipt.setReceiptTotal(analysis.getReceiptTotal());
        receipt.setReceiptDate(analysis.getReceiptDate());
        receipt.setReceiptDescription(analysis.getReceiptDescription());

        receipt.setCompanyName(analysis.getCompanyName());
        receipt.setCompanyAddress(analysis.getCompanyAddress());
        receipt.setCompanyPhone(analysis.getCompanyPhone());

        receipt.setTaxCategory(analysis.getTaxCategory());
        receipt.setTaxSubCategory(analysis.getTaxSubCategory());
    }

    /**
     * @param file
     * @return
     * @throws Exception
     */
    private Receipt fileToReceipt(MultipartFile file) throws Exception {
        LocalDateTime now = LocalDateTime.now();

        Receipt receipt = new Receipt();
        receipt.setId(UUID.randomUUID());

        receipt.setFileName(file.getOriginalFilename());
        receipt.setFileType(file.getContentType());
        receipt.setFileData(file.getBytes());

        receipt.setState(ReceiptState.UPLOAD_COMPLETE.name());
        receipt.setCreatedAt(now);
        receipt.setUpdatedAt(now);

        return receipt;
    }
}
