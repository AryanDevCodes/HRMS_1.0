package com.workzen;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class WorkZenHrmsApplication {

	public static void main(String[] args) {
		SpringApplication.run(WorkZenHrmsApplication.class, args);
	}

}
