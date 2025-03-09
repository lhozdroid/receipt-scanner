package com.lavishlyholiday.receiptscanner.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lavishlyholiday.receiptscanner.data.model.Receipt;
import lombok.AllArgsConstructor;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.model.Media;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.MimeType;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@AllArgsConstructor
public class OllamaService {
    private final OllamaChatModel llamaVision;
    private final OllamaChatModel deepseekR1;
    private final ObjectMapper objectMapper;

    /**
     * @param fileType
     * @param fileData
     * @return
     * @throws Exception
     */
    public Receipt analyzeReceipt(String fileType, byte[] fileData) throws Exception {
        // Makes analysis of the data
        String plainTextData = recognize(fileType, fileData);
        String jsonData = analyze(plainTextData);

        // Transforms the data
        Receipt receipt = objectMapper.readValue(jsonData, Receipt.class);
        return receipt;
    }

    /**
     * @param receiptTextData
     * @return
     * @throws Exception
     */
    private String analyze(String receiptTextData) throws Exception {
        // Obtains the system prompt
        String systemPrompt = readPrompt("analysis");

        // Creates the messages
        Message systemMessage = new SystemMessage(systemPrompt);
        Message userMessage = new UserMessage(receiptTextData);

        // Creates the prompt
        Prompt prompt = new Prompt(List.of(systemMessage, userMessage));

        // Calls the LLM
        ChatResponse response = deepseekR1.call(prompt);

        // Extracts the message
        String content = response.getResult().getOutput().getText();

        // Extracts the json
        String json = extractJson(content);
        return json;
    }

    /**
     * @param content
     * @return
     * @throws Exception
     */
    private String extractJson(String content) throws Exception {
        // Regex pattern to extract JSON content
        Pattern pattern = Pattern.compile("```json\\n(.*?)\\n```", Pattern.DOTALL);
        Matcher matcher = pattern.matcher(content);

        if (!matcher.find()) {
            throw new Exception("Unable to extract receipt information.");
        }

        String json = matcher.group(1).trim();
        return json;
    }

    /**
     * @param name
     * @return
     * @throws Exception
     */
    private String readPrompt(String name) throws Exception {
        ClassPathResource resource = new ClassPathResource("prompts/%s.prompt".formatted(name));
        return Files.readString(Path.of(resource.getURI()), StandardCharsets.UTF_8);
    }

    /**
     * @param fileType
     * @param fileData
     * @return
     * @throws Exception
     */
    private String recognize(String fileType, byte[] fileData) throws Exception {
        // Obtains the system prompt
        String systemPrompt = readPrompt("vision");

        // Creates the media object
        Resource resource = new ByteArrayResource(fileData);
        Media media = new Media(MimeType.valueOf(fileType), resource);

        // Creates the messages
        Message systemMessage = new SystemMessage(systemPrompt);
        Message userMessage = new UserMessage("Proceed", List.of(media));

        // Creates the prompt
        Prompt prompt = new Prompt(List.of(systemMessage, userMessage));

        // Calls the LLM
        ChatResponse response = llamaVision.call(prompt);

        // Extracts the message
        String content = response.getResult().getOutput().getText();
        return content;
    }
}
