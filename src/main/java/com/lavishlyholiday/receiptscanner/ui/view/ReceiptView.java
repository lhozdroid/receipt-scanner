package com.lavishlyholiday.receiptscanner.ui.view;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

@Controller
@RequestMapping("/app/receipts")
public class ReceiptView {

    /**
     * @return
     * @throws Exception
     */
    @GetMapping
    public ModelAndView index() throws Exception {
        ModelAndView mv = new ModelAndView("receipt/index.html");
        return mv;
    }

    /**
     * @return
     * @throws Exception
     */
    @GetMapping("/upload")
    public ModelAndView upload() throws Exception {
        ModelAndView mv = new ModelAndView("receipt/upload.html");
        return mv;
    }
}
