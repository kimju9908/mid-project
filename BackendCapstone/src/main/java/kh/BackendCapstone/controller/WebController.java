package kh.BackendCapstone.controller;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

@Controller
public class WebController implements ErrorController {
	private static final String PATH = "/error";
	
	@RequestMapping(value = PATH)
	public ModelAndView saveLeadQuery() {
		return new ModelAndView("forward:/");
	}
}