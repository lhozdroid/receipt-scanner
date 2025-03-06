package com.lavishlyholiday.invoicescanner.ui.view;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

@Controller
@RequestMapping
public class MainView {
    /**
     * @return
     * @throws Exception
     */
    @GetMapping("")
    public ModelAndView index() throws Exception {
        ModelAndView mv = new ModelAndView("redirect:/app/invoices");
        return mv;
    }
}
