import Util from "../../util/js/util.js";

export default class ReceiptApi {

    /**
     *
     * @param id
     * @returns {Promise<unknown>}
     */
    static approve(id) {
        return new Promise((resolve, reject) => {
            const url = `${Util.getMeta("context")}api/receipts/${id}/approve`;
            fetch(url, {
                method: "POST"
            }).then((response) => {
                if (response.ok) {
                    resolve();
                } else {
                    response.text().then((text) => reject(text));
                }
            });
        });
    }

    /**
     *
     * @param id
     * @returns {Promise<unknown>}
     */
    static deleteById(id) {
        return new Promise((resolve, reject) => {
            const url = `${Util.getMeta("context")}api/receipts/${id}`;
            fetch(url, {
                method: "DELETE"
            }).then((response) => {
                if (response.ok) {
                    resolve();
                } else {
                    response.text().then((text) => reject(text));
                }
            });
        });
    }

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
            });
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
            });
        });
    }

    /**
     *
     * @param id
     * @returns {Promise<unknown>}
     */
    static repeatAnalysis(id) {
        return new Promise((resolve, reject) => {
            const url = `${Util.getMeta("context")}api/receipts/${id}/repeat_analysis`;
            fetch(url, {
                method: "POST"
            }).then((response) => {
                if (response.ok) {
                    resolve();
                } else {
                    response.text().then((text) => reject(text));
                }
            });
        });
    }

    /**
     *
     * @param formData
     * @returns {Promise<unknown>}
     */
    static update(formData) {
        return new Promise((resolve, reject) => {
            const url = `${Util.getMeta("context")}api/receipts`;
            fetch(url, {
                method: "POST", //
                body: formData,
            }).then((response) => {
                if (response.ok) {
                    resolve();
                } else {
                    response.text().then((text) => reject(text));
                }
            });
        });
    }
}