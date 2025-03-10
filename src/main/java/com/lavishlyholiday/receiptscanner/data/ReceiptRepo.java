package com.lavishlyholiday.receiptscanner.data;

import com.lavishlyholiday.receiptscanner.data.model.Receipt;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.namedparam.BeanPropertySqlParameterSource;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
@AllArgsConstructor
@Log4j2
public class ReceiptRepo {
    private final NamedParameterJdbcTemplate template;

    /**
     * @param fileName
     * @return
     * @throws Exception
     */
    public boolean existsByName(String fileName) throws Exception {
        String query = """
                SELECT
                	CASE
                		WHEN COUNT(*) = 0 THEN FALSE
                		ELSE TRUE
                	END
                FROM
                	PUBLIC.RECEIPT
                WHERE
                	FILE_NAME =:fileName
                """;

        SqlParameterSource params = new MapSqlParameterSource() //
                .addValue("fileName", fileName);

        try {
            return template.queryForObject(query, params, Boolean.class);
        } catch (Exception e) {
            LOG.error(e.getMessage(), e);
            throw new Exception("Unable to check if receipt exists.", e);
        }
    }

    /**
     * @return
     * @throws Exception
     */
    public List<Receipt> findAll() throws Exception {
        String query = """
                SELECT
                	ID,
                	FILE_NAME,
                	FILE_TYPE,
                	RECEIPT_NUMBER,
                	RECEIPT_TOTAL,
                	RECEIPT_DATE,
                	RECEIPT_DESCRIPTION,
                	COMPANY_NAME,
                	COMPANY_ADDRESS,
                	COMPANY_PHONE,
                	TAX_CATEGORY,
                	TAX_SUB_CATEGORY,
                	STATE,
                	ERROR,
                	CREATED_AT,
                	UPDATED_AT
                FROM
                	PUBLIC.RECEIPT
                """;

        try {
            return template.query(query, new MapSqlParameterSource(), new BeanPropertyRowMapper<>(Receipt.class));
        } catch (Exception e) {
            LOG.error(e.getMessage(), e);
            throw new Exception("Unable to obtain the receipts.", e);
        }
    }

    /**
     * @param id
     * @return
     * @throws Exception
     */
    public Receipt findFileById(UUID id) throws Exception {
        String query = """
                SELECT
                    FILE_NAME,
                    FILE_TYPE,
                	FILE_DATA
                FROM
                	PUBLIC.RECEIPT
                WHERE
                    ID = :id
                """;

        SqlParameterSource params = new MapSqlParameterSource() //
                .addValue("id", id);

        try {
            return template.query(query, params, new BeanPropertyRowMapper<>(Receipt.class)).stream() //
                    .findFirst() //
                    .orElse(null);
        } catch (Exception e) {
            LOG.error(e.getMessage(), e);
            throw new Exception("Unable to obtain the file.", e);
        }
    }

    /**
     * @param state
     * @return
     * @throws Exception
     */
    public Receipt findOneByStateAndUpdatedBefore(String state, LocalDateTime updatedBefore) throws Exception {
        String query = """
                SELECT
                	ID,
                	FILE_NAME,
                	FILE_TYPE,
                	FILE_DATA,
                	RECEIPT_NUMBER,
                	RECEIPT_TOTAL,
                	RECEIPT_DATE,
                	RECEIPT_DESCRIPTION,
                	COMPANY_NAME,
                	COMPANY_ADDRESS,
                	COMPANY_PHONE,
                	TAX_CATEGORY,
                	TAX_SUB_CATEGORY,
                	STATE,
                	ERROR,
                	CREATED_AT,
                	UPDATED_AT
                FROM
                	PUBLIC.RECEIPT
                WHERE
                	STATE = :state
                    AND UPDATED_AT <= :updatedBefore
                ORDER BY
                    CREATED_AT ASC
                LIMIT
                	1
                """;

        SqlParameterSource params = new MapSqlParameterSource() //
                .addValue("state", state) //
                .addValue("updatedBefore", updatedBefore);

        try {
            return template.query(query, params, new BeanPropertyRowMapper<>(Receipt.class)).stream() //
                    .findFirst() //
                    .orElse(null);
        } catch (Exception e) {
            LOG.error(e.getMessage(), e);
            throw new Exception("Unable to find receipt with state %s.".formatted(state), e);
        }
    }


    /**
     * @param receipt
     * @throws Exception
     */
    @Transactional(rollbackFor = Exception.class)
    public void insert(Receipt receipt) throws Exception {
        String query = """
                INSERT INTO
                	PUBLIC.RECEIPT (
                		ID,
                		FILE_NAME,
                		FILE_TYPE,
                		FILE_DATA,
                		RECEIPT_NUMBER,
                		RECEIPT_TOTAL,
                		RECEIPT_DATE,
                		RECEIPT_DESCRIPTION,
                		COMPANY_NAME,
                		COMPANY_ADDRESS,
                		COMPANY_PHONE,
                		TAX_CATEGORY,
                		TAX_SUB_CATEGORY,
                		STATE,
                		ERROR,
                		CREATED_AT,
                		UPDATED_AT
                	)
                VALUES
                	(
                		:id,
                		:fileName,
                		:fileType,
                		:fileData,
                		:receiptNumber,
                		:receiptTotal,
                		:receiptDate,
                		:receiptDescription,
                		:companyName,
                		:companyAddress,
                		:companyPhone,
                		:taxCategory,
                		:taxSubCategory,
                		:state,
                		:error,
                		:createdAt,
                		:updatedAt
                	)
                """;

        SqlParameterSource params = new BeanPropertySqlParameterSource(receipt);

        try {
            template.update(query, params);
        } catch (Exception e) {
            LOG.error(e.getMessage(), e);
            throw new Exception("Unable to upload receipt.", e);
        }
    }

    /**
     * @param receipt
     * @throws Exception
     */
    @Transactional(rollbackFor = Exception.class)
    public void update(Receipt receipt) throws Exception {
        String query = """
                UPDATE PUBLIC.RECEIPT
                SET
                	FILE_NAME = :fileName,
                	FILE_TYPE = :fileType,
                	FILE_DATA = :fileData,
                	RECEIPT_NUMBER = :receiptNumber,
                	RECEIPT_TOTAL = :receiptTotal,
                	RECEIPT_DATE = :receiptDate,
                	RECEIPT_DESCRIPTION = :receiptDescription,
                	COMPANY_NAME = :companyName,
                	COMPANY_ADDRESS = :companyAddress,
                	COMPANY_PHONE = :companyPhone,
                	TAX_CATEGORY = :taxCategory,
                	TAX_SUB_CATEGORY = :taxSubCategory,
                	STATE = :state,
                	ERROR = :error,
                	CREATED_AT = :createdAt,
                	UPDATED_AT = :updatedAt
                WHERE
                	ID = :id
                """;

        SqlParameterSource params = new BeanPropertySqlParameterSource(receipt);

        try {
            template.update(query, params);
        } catch (Exception e) {
            LOG.error(e.getMessage(), e);
            throw new Exception("Unable to update receipt.", e);
        }
    }
}

