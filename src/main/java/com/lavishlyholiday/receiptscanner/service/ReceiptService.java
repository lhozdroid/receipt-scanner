package com.lavishlyholiday.receiptscanner.service;

import com.lavishlyholiday.receiptscanner.data.ReceiptRepo;
import com.lavishlyholiday.receiptscanner.data.cons.ReceiptState;
import com.lavishlyholiday.receiptscanner.data.model.Receipt;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
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
