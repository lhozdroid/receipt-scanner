package com.lavishlyholiday.receiptscanner;


import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.ai.ollama.api.OllamaApi;
import org.springframework.ai.ollama.api.OllamaOptions;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OllamaConfig {
    @Value("${spring.ai.ollama.base-url}")
    private String url;

    /**
     * @return
     */
    @Bean
    @Qualifier("deepseekR1")
    public OllamaChatModel deepseekR1() {
        OllamaApi ollamaApi = new OllamaApi(url);
        OllamaOptions options = OllamaOptions.builder().model("deepseek-r1:14b").build();
        return OllamaChatModel.builder() //
                .ollamaApi(ollamaApi) //
                .defaultOptions(options) //
                .build();
    }

    /**
     * @return
     */
    @Bean
    @Qualifier("llamaVision")
    public OllamaChatModel llamaVision() {
        OllamaApi ollamaApi = new OllamaApi(url);
        OllamaOptions options = OllamaOptions.builder().model("llama3.2-vision:latest").build();
        return OllamaChatModel.builder() //
                .ollamaApi(ollamaApi) //
                .defaultOptions(options) //
                .build();
    }
}
