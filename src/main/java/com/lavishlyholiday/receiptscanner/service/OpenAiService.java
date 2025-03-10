package com.lavishlyholiday.receiptscanner.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lavishlyholiday.receiptscanner.data.model.Receipt;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.model.Media;
import org.springframework.ai.openai.OpenAiChatModel;
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
@Log4j2
public class OpenAiService {
    private final OpenAiChatModel gpt4o;
    private final ObjectMapper objectMapper;

    /**
     * @param fileType
     * @param fileData
     * @return
     * @throws Exception
     */
    public Receipt analyzeReceipt(String fileType, byte[] fileData) throws Exception {
        // Makes analysis of the data
        String jsonData = analyze(fileType, fileData);

        // Transforms the data
        Receipt receipt = objectMapper.readValue(jsonData, Receipt.class);
        return receipt;
    }

    /**
     * @param fileType
     * @param fileData
     * @return
     * @throws Exception
     */
    private String analyze(String fileType, byte[] fileData) throws Exception {
        // Obtains the instructions
        String instructions = readPrompt("analysis");

        // Creates the media object
        Resource resource = new ByteArrayResource(fileData);
        Media media = new Media(MimeType.valueOf(fileType), resource);

        // Creates the messages
        Message userMessage = new UserMessage(instructions, List.of(media));

        // Creates the prompt
        Prompt prompt = new Prompt(userMessage);

        // Calls the LLM
        ChatResponse response = gpt4o.call(prompt);

        // Extracts the message
        String content = response.getResult().getOutput().getText();

        // Extracts the JSON
        String json = extractJson(content);
        return json;
    }

    /**
     * @param content
     * @return
     * @throws Exception
     */
    private String extractJson(String content) throws Exception {
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
}
