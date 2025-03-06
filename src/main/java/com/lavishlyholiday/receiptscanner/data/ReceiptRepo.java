package com.lavishlyholiday.receiptscanner.data;

import com.lavishlyholiday.receiptscanner.data.model.Receipt;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.jdbc.core.namedparam.BeanPropertySqlParameterSource;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

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
}
