package com.lavishlyholiday.receiptscanner;


import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenAiConfig {
    @Value("${spring.ai.openai.api-key}")
    private String key;

    @Value("${spring.ai.openai.base-url}")
    private String url;

    /**
     * @return
     */
    @Bean
    @Qualifier("gpt4o")
    public OpenAiChatModel gpt4o() {
        OpenAiApi openAiApi = new OpenAiApi(url, key);
        OpenAiChatOptions options = OpenAiChatOptions.builder().model("gpt-4o").build();
        return OpenAiChatModel.builder() //
                .openAiApi(openAiApi) //
                .defaultOptions(options) //
                .build();
    }
}
