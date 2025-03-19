import Util from "../../util/js/util.js";
import ReceiptApi from "../../api/js/receipt-api.js";
import BValidate from "../../bvalidate/js/bvalidate.js";
import ImageZoom from "../../image-zoom/js/image-zoom.js";
import TaxCategoryApi from "../../api/js/tax-category-api.js";
import BModal, {BLoading, MODAL_ACTION_COLOR, MODAL_COLOR, MODAL_SIZE} from "../../bmodal/js/bmodal.js";

export default class ReviewReceipt {
    #config = {
        "actions": {
            "approve": true, //
            "repeat": true, //
            "delete": true, //
            "save": true //
        }
    }

    #receipt = null;

    #file = null;
    #taxCategories = null;

    #contents = null;
    #modal = null;
    #validate = null;

    /**
     *
     * @param receipt
     * @param config
     */
    constructor(receipt, config = {}) {
        this.#receipt = receipt;
        this.#config = Util.extend(this.#config, config);

        const loadFile = this.#loadFile();
        const loadTaxCategories = this.#loadTaxCategories();

        Promise.all([loadFile, loadTaxCategories]).then(() => {
            this.#initModalContents();
            this.#initModal();
            this.#initTaxCategories();
            this.#initForm();
            this.#initZoom();
            this.#initEvents();
        });
    }

    /**
     *
     */
    #actionApprove() {
        BModal.confirm("Do you really want to approve this receipt?", "Approve Receipt", MODAL_COLOR.success, //
            [ //
                {
                    "title": "No", //
                    "color": MODAL_ACTION_COLOR.dark, //
                    "icon": "fa-solid fa-xmark fa-fw", //
                    "onClick": (modal) => modal.close() //
                }, //
                {
                    "title": "Yes", //
                    "color": MODAL_ACTION_COLOR.success, //
                    "icon": "fa-solid fa-check fa-fw", //
                    "onClick": (modal) => {
                        modal.close();

                        const savePromise = this.#actionSave();
                        savePromise.then(() => {
                            const loading = BLoading.screen("Approving...");

                            const promiseApprove = ReceiptApi.approve(this.#receipt.id);
                            promiseApprove.then(() => this.#modal.close());
                            promiseApprove.catch((error) => BModal.danger(error));
                            promiseApprove.finally(() => loading.close());
                        });
                    }
                } //
            ]);
    }

    /**
     *
     */
    #actionDelete() {
        BModal.confirm("Do you really want to delete this receipt?", "Delete Receipt", MODAL_COLOR.danger, //
            [ //
                {
                    "title": "No", //
                    "color": MODAL_ACTION_COLOR.dark, //
                    "icon": "fa-solid fa-xmark fa-fw", //
                    "onClick": (modal) => modal.close() //
                }, //
                {
                    "title": "Yes", //
                    "color": MODAL_ACTION_COLOR.danger, //
                    "icon": "fa-solid fa-check fa-fw", //
                    "onClick": (modal) => {
                        modal.close();
                        const loading = BLoading.screen("Deleting...");

                        const promise = ReceiptApi.deleteById(this.#receipt.id);
                        promise.then(() => this.#modal.close());
                        promise.catch((error) => BModal.danger(error));
                        promise.finally(() => loading.close());
                    }
                } //
            ]);
    }

    /**
     *
     */
    #actionRepeat() {
        BModal.confirm("Do you really want to repeat the analysis?", "Repeat Analysis", MODAL_COLOR.warning, //
            [ //
                {
                    "title": "No", //
                    "color": MODAL_ACTION_COLOR.dark, //
                    "icon": "fa-solid fa-xmark fa-fw", //
                    "onClick": (modal) => modal.close() //
                }, //
                {
                    "title": "Yes", //
                    "color": MODAL_ACTION_COLOR.warning, //
                    "icon": "fa-solid fa-check fa-fw", //
                    "onClick": (modal) => {
                        modal.close();
                        const loading = BLoading.screen("Repeating...");

                        const promise = ReceiptApi.repeatAnalysis(this.#receipt.id);
                        promise.catch((error) => BModal.danger(error));
                        promise.then(() => this.#modal.close());
                        promise.finally(() => loading.close());
                    }
                } //
            ]);
    }

    /**
     *
     */
    #actionSave() {
        return new Promise((resolve, reject) => {
            if (this.#validate.isValid()) {
                const loading = BLoading.screen("Saving...");

                const form = this.#contents.querySelector("form");
                const formData = new FormData(form);

                const promise = ReceiptApi.update(formData);
                promise.then(() => resolve());
                promise.catch((error) => {
                    BModal.danger(error);
                    reject();
                });
                promise.finally(() => loading.close());
            }
        });
    }

    /**
     *
     */
    #initEvents() {
        // Obtains the buttons
        const approveButton = this.#contents.querySelector("button[data-action='approve']");
        const repeatButton = this.#contents.querySelector("button[data-action='repeat']");
        const deleteButton = this.#contents.querySelector("button[data-action='delete']");

        // Sets the events
        approveButton.addEventListener("click", () => this.#actionApprove());
        repeatButton.addEventListener("click", () => this.#actionRepeat());
        deleteButton.addEventListener("click", () => this.#actionDelete());
    }

    /**
     *
     */
    #initForm() {
        const form = this.#contents.querySelector("form");
        Object.keys(this.#receipt).forEach((attribute) => {
            const value = this.#receipt[attribute];
            const input = form.querySelector(`[name='${attribute}']`);
            if (input) {
                input.value = value;
                if (attribute === "taxCategory") input.dispatchEvent(new Event("change"));
            }
        });

        this.#validate = new BValidate(form, {
            "onSubmit": (e) => {
                e.preventDefault();
                this.#actionSave();
            }
        });
    }

    /**
     *
     */
    #initModal() {
        this.#modal = new BModal({
            "title": "Review Receipt", //
            "content": this.#contents, //
            "size": MODAL_SIZE.xlarge, //
            "color": MODAL_COLOR.primary //
        });
    }

    /**
     *
     * @returns {string}
     */
    #initModalContents() {
        // language=HTML
        this.#contents = new DOMParser().parseFromString(`
            <div>
                <style>
                    img.img-fluid {
                        cursor: zoom-in;
                    }
                </style>
                <div class="row">
                    <div class="col-4">
                        <div class="card shadow">
                            <div class="card-body">
                                <img class="img-fluid" src="${URL.createObjectURL(this.#file)}">
                            </div>
                        </div>
                    </div>
                    <div class="col">
                        <div class="row">
                            <div class="col">
                                <strong>${Util.snakeToTitleCase(this.#receipt.state)}</strong>
                            </div>
                            <div class="col text-end">
                                <button class="btn btn-sm btn-success ${this.#config.actions.approve ? "" : "d-none"}" data-action="approve">
                                    <span class="fa-classic fa-solid fa-thumbs-up fa-fw"></span>
                                    Approve
                                </button>
                                <button class="btn btn-sm btn-warning ${this.#config.actions.repeat ? "" : "d-none"}" data-action="repeat">
                                    <span class="fa-classic fa-solid fa-repeat fa-fw"></span>
                                    Repeat Analysis
                                </button>
                                <button class="btn btn-sm btn-danger ${this.#config.actions.delete ? "" : "d-none"}" data-action="delete">
                                    <span class="fa-classic fa-solid fa-trash-can fa-fw"></span>
                                    Delete
                                </button>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col">
                                <strong>File:</strong>
                                ${this.#receipt.fileName}
                            </div>
                        </div>
                        <div class="row">
                            <div class="col">
                                <div class="card shadow">
                                    <div class="card-body">
                                        <form>
                                            <input name="id" type="hidden">
                                            <div class="mb-3">
                                                <label class="form-label">Receipt Number</label>
                                                <input class="form-control form-control-sm" name="receiptNumber">
                                            </div>
                                            <div class="mb-3">
                                                <label class="form-label">Receipt Total</label>
                                                <input class="form-control form-control-sm" name="receiptTotal" data-required="true">
                                            </div>
                                            <div class="mb-3">
                                                <label class="form-label">Receipt Description</label>
                                                <input class="form-control form-control-sm" name="receiptDescription" data-required="true">
                                            </div>
                                            <div class="mb-3">
                                                <label class="form-label">Company name</label>
                                                <input class="form-control form-control-sm" name="companyName" data-required="true">
                                            </div>
                                            <div class="mb-3">
                                                <label class="form-label">Company Address</label>
                                                <input class="form-control form-control-sm" name="companyAddress">
                                            </div>
                                            <div class="mb-3">
                                                <label class="form-label">Company Phone</label>
                                                <input class="form-control form-control-sm" name="companyPhone">
                                            </div>
                                            <div class="mb-3">
                                                <label class="form-label">Tax Category</label>
                                                <select class="form-select form-select-sm" name="taxCategory" data-required="true"></select>
                                            </div>
                                            <div class="mb-3">
                                                <label class="form-label">Tax Sub-category</label>
                                                <select class="form-select form-select-sm" name="taxSubCategory" data-required="true"></select>
                                            </div>
                                            <div class="text-end">
                                                <button type="submit" class="btn btn-sm btn-success ${this.#config.actions.save ? "" : "d-none"}" data-action="save">
                                                    <span class="fa-classic fa-solid fa-check fa-fw"></span>
                                                    Save
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `, "text/html").body.firstChild;
    }

    /**
     *
     */
    #initTaxCategories() {
        // Obtains the selects
        const taxCategorySelect = this.#contents.querySelector("select[name='taxCategory']");
        const taxSubCategorySelect = this.#contents.querySelector("select[name='taxSubCategory']");

        // Sets the categories
        let categories = "";
        Object.keys(this.#taxCategories).forEach((taxCategory) => {
            // language=HTML
            categories += `
                <option value="${taxCategory}">${taxCategory}</option>
            `;
        });
        taxCategorySelect.innerHTML = categories;

        // Sets the sub category selector
        taxCategorySelect.addEventListener("change", () => {
            const value = taxCategorySelect.value;
            let subCategories = "";
            this.#taxCategories[value].forEach((subCategory) => {
                // language=HTML
                subCategories += `
                    <option value="${subCategory}">${subCategory}</option>
                `;
            });
            taxSubCategorySelect.innerHTML = subCategories;
        });

        // Dispatches the event
        taxCategorySelect.dispatchEvent(new Event("change"));
    }

    /**
     *
     */
    #initZoom() {
        const image = this.#contents.querySelector("img");
        image.addEventListener("load", () => new ImageZoom(image))
    }

    /**
     *
     * @returns {Promise<unknown>}
     */
    #loadFile() {
        return new Promise((resolve, reject) => {
            const promise = ReceiptApi.findFileById(this.#receipt.id);
            promise.catch((error) => BModal.danger(error));
            promise.then((file) => {
                this.#file = file;
                resolve();
            });
        });
    }

    /**
     *
     * @returns {Promise<unknown>}
     */
    #loadTaxCategories() {
        return new Promise((resolve, reject) => {
            const promise = TaxCategoryApi.findAll();
            promise.catch((error) => BModal.danger(error));
            promise.then((taxCategories) => {
                this.#taxCategories = taxCategories;
                resolve();
            });
        });
    }
}