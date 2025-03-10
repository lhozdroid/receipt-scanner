import Util from "../../util/js/util.js";

export default class ReceiptApi {
    /**
     *
     * @returns {Promise<unknown>}
     */
    static findAll() {
        return new Promise((resolve, reject) => {
            const url = `${Util.getMeta("context")}api/receipts`;
            fetch(url, {
                method: "GET"
            }).then((response) => {
                if (response.ok) {
                    response.json().then((json) => resolve(json));
                } else {
                    response.text().then((text) => reject(text));
                }
            })
        });
    }

    /**
     *
     * @param id
     * @returns {Promise<unknown>}
     */
    static findFileById(id) {
        return new Promise((resolve, reject) => {
            const url = `${Util.getMeta("context")}api/receipts/${id}/file`;
            fetch(url, {
                method: "GET"
            }).then((response) => {
                if (response.ok) {
                    response.blob().then((blob) => resolve(blob));
                } else {
                    response.text().then((text) => reject(text));
                }
            })
        })
    }
}