package com.lavishlyholiday.invoicescanner.ui.view;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

@Controller
@RequestMapping("/app/invoices")
public class InvoiceView {

    /**
     * @return
     * @throws Exception
     */
    @GetMapping
    public ModelAndView index() throws Exception {
        ModelAndView mv = new ModelAndView("invoice/index.html");
        return mv;
    }

    /**
     * @return
     * @throws Exception
     */
    @GetMapping("/upload")
    public ModelAndView upload() throws Exception {
        ModelAndView mv = new ModelAndView();
        return mv;
    }
}
