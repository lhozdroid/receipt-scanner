import BModal, {MODAL_COLOR, MODAL_SIZE} from "../../bmodal/js/bmodal.js";
import ReceiptApi from "../../api/js/receipt-api.js";
import TaxCategoryApi from "../../api/js/tax-category-api.js";
import Util from "../../util/js/util.js";
import ImageZoom from "../../image-zoom/js/image-zoom.js";

export default class ReviewReceipt {
    #receipt = null;

    #file = null;
    #taxCategories = null;

    #contents = null;
    #modal = null;

    /**
     *
     * @param receipt
     */
    constructor(receipt) {
        this.#receipt = receipt;

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
    #approveAction() {
    }

    /**
     *
     */
    #deleteAction() {
    }

    /**
     *
     */
    #initEvents() {
        // Obtains the buttons
        const approveButton = this.#contents.querySelector("button[data-action='approve']");
        const repeatButton = this.#contents.querySelector("button[data-action='repeat']");
        const deleteButton = this.#contents.querySelector("button[data-action='delete']");
        const saveButton = this.#contents.querySelector("button[data-action='save']");

        // Sets the events
        approveButton.addEventListener("click", () => this.#approveAction());
        repeatButton.addEventListener("click", () => this.#repeatAction());
        deleteButton.addEventListener("click", () => this.#deleteAction());
        saveButton.addEventListener("click", () => this.#saveAction());
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
                                <button class="btn btn-sm btn-success" data-action="approve">
                                    <span class="fa-classic fa-solid fa-thumbs-up fa-fw"></span>
                                    Approve
                                </button>
                                <button class="btn btn-sm btn-warning" data-action="repeat">
                                    <span class="fa-classic fa-solid fa-repeat fa-fw"></span>
                                    Repeat Analysis
                                </button>
                                <button class="btn btn-sm btn-danger" data-action="delete">
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
                                            <div class="mb-3">
                                                <label class="form-label">Receipt Number</label>
                                                <input class="form-control form-control-sm" name="receiptNumber">
                                            </div>
                                            <div class="mb-3">
                                                <label class="form-label">Receipt Total</label>
                                                <input class="form-control form-control-sm" name="receiptTotal">
                                            </div>
                                            <div class="mb-3">
                                                <label class="form-label">Receipt Description</label>
                                                <input class="form-control form-control-sm" name="receiptDescription">
                                            </div>
                                            <div class="mb-3">
                                                <label class="form-label">Company name</label>
                                                <input class="form-control form-control-sm" name="companyName">
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
                                                <select class="form-select form-select-sm" name="taxCategory"></select>
                                            </div>
                                            <div class="mb-3">
                                                <label class="form-label">Tax Sub-category</label>
                                                <select class="form-select form-select-sm" name="taxSubCategory"></select>
                                            </div>
                                            <div class="text-end">
                                                <button class="btn btn-sm btn-success" data-action="save">
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

    /**
     *
     */
    #repeatAction() {
        const promise = ReceiptApi.repeatAnalysis(this.#receipt.id);
        promise.catch((error) => BModal.danger(error));
        promise.then(() => {
            this.#modal.close();
            BModal.success("Analysis will be repeated. Please wait...");
        });
    }

    /**
     *
     */
    #saveAction() {
    }
}