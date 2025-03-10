package com.lavishlyholiday.receiptscanner.service;

import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.concurrent.atomic.AtomicBoolean;

@Service
@AllArgsConstructor
@Log4j2
public class ScheduleService {
    public final AtomicBoolean recoverReceiptFlag = new AtomicBoolean(false);
    private final ReceiptService receiptService;
    private final AtomicBoolean analyzeReceiptFlag = new AtomicBoolean(false);

    /**
     * @throws Exception
     */
    @Scheduled(cron = "*/15 * * * * *")
    public void analyzeReceipt() throws Exception {
        if (!analyzeReceiptFlag.get()) {
            analyzeReceiptFlag.set(true);
            try {
                receiptService.analyzeReceipt();
            } catch (Exception e) {
                LOG.error(e.getMessage(), e);
            } finally {
                analyzeReceiptFlag.set(false);
            }
        }
    }

    /**
     * @throws Exception
     */
    @Scheduled(cron = "0 * * * * *")
    public void recoverReceipt() throws Exception {
        if (!recoverReceiptFlag.get()) {
            recoverReceiptFlag.set(true);
            try {
                receiptService.recoverReceipt();
            } catch (Exception e) {
                LOG.error(e.getMessage(), e);
            } finally {
                recoverReceiptFlag.set(false);
            }
        }
    }
}
