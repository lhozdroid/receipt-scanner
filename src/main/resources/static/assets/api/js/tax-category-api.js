import Util from "../../util/js/util.js";

export default class TaxCategoryApi {
    /**
     *
     * @returns {Promise<unknown>}
     */
    static findAll() {
        return new Promise((resolve, reject) => {
            const url = `${Util.getMeta("context")}data/tax-categories.json`;
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
}