package com.lavishlyholiday.receiptscanner.service;

import com.lavishlyholiday.receiptscanner.data.ReceiptRepo;
import com.lavishlyholiday.receiptscanner.data.cons.ReceiptState;
import com.lavishlyholiday.receiptscanner.data.model.Receipt;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
@Log4j2
public class ReceiptService {
    private final ReceiptRepo receiptRepo;
    private final OpenAiService openAiService;

    /**
     * @throws Exception
     */
    public void analyzeReceipt() throws Exception {
        // Obtains the receipt
        Receipt receipt = receiptRepo.findOneByStateAndUpdatedBefore(ReceiptState.UPLOAD_COMPLETE.name(), LocalDateTime.now());

        if (receipt != null) {
            LOG.info("%s%s".formatted(StringUtils.rightPad("Analyzing receipt", 40, "."), receipt.getFileName()));

            // Updates the state to active
            receipt.setState(ReceiptState.ANALYSIS_ACTIVE.name());
            receipt.setUpdatedAt(LocalDateTime.now());
            receiptRepo.update(receipt);

            try {
                // Analyses the receipt
                analyzeReceipt(receipt);

                // Updates the state to success
                receipt.setState(ReceiptState.REVISION_PENDING.name());
            } catch (Exception e) {
                LOG.error(e.getLocalizedMessage(), e);

                // Updates the state to failure
                receipt.setState(ReceiptState.ANALYSIS_FAILED.name());
                receipt.setError(e.getMessage());
            }

            // Updates the receipt
            receiptRepo.update(receipt);
        }
    }

    /**
     *
     * @param id
     * @throws Exception
     */
    public void repeatAnalysis(UUID id) throws Exception {
        Receipt receipt = receiptRepo.findById(id);
        if(receipt == null) {
            throw new Exception("Receipt not found.");
        }

        receipt.setState(ReceiptState.UPLOAD_COMPLETE.name());
        receipt.setUpdatedAt(LocalDateTime.now());
        receiptRepo.update(receipt);
    }

    /**
     * @return
     * @throws Exception
     */
    public List<Receipt> findAll() throws Exception {
        return receiptRepo.findAll();
    }

    /**
     * @param id
     * @return
     * @throws Exception
     */
    public Receipt findFileDataById(UUID id) throws Exception {
        Receipt receipt = receiptRepo.findFileById(id);
        if(receipt == null) {
            throw new Exception("File not found.");
        }
        return receipt;
    }

    /**
     * @throws Exception
     */
    public void recoverReceipt() throws Exception {
        // Obtains the receipt
        LocalDateTime recoverTime = LocalDateTime.now().minusMinutes(5);
        Receipt receipt = receiptRepo.findOneByStateAndUpdatedBefore(ReceiptState.ANALYSIS_ACTIVE.name(), recoverTime);

        if (receipt != null) {
            LOG.info("%s%s".formatted(StringUtils.rightPad("Recovering receipt", 40, "."), receipt.getFileName()));

            receipt.setState(ReceiptState.UPLOAD_COMPLETE.name());
            receipt.setUpdatedAt(LocalDateTime.now());
            receiptRepo.update(receipt);
        }
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
        // Uses Open AI to create an analysis of the receipt
        Receipt analysis = openAiService.analyzeReceipt(receipt.getFileType(), receipt.getFileData());

        // Sets the data resulting from the analysis
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
