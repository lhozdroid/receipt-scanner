import BModal, {MODAL_COLOR, MODAL_SIZE} from "../../bmodal/js/bmodal.js";
import ReceiptApi from "../../api/js/receipt-api.js";
import Util from "../../util/js/util.js";

export default class ReviewReceipt {
    #receipt = null;
    #file = null;
    #modal = null;
    #contents = null;
    #zoom = null;

    /**
     *
     * @param receipt
     */
    constructor(receipt) {
        this.#receipt = receipt;
        const promise = this.#loadFile();
        promise.then(() => this.#initModal());
    }

    /**
     *
     */
    #initModal() {
        this.#initContents();

        this.#modal = new BModal({
            "title": "Review Receipt", //
            "content": this.#contents,
            "size": MODAL_SIZE.xlarge,
            "color": MODAL_COLOR.primary
        });
    }

    /**
     *
     * @returns {string}
     */
    #initContents() {
        // language=HTML
        this.#contents = new DOMParser().parseFromString(`
            <div class="row">
                <div class="col-4">
                    <img class="shadow img-fluid" src="${URL.createObjectURL(this.#file)}">
                </div>
                <div class="col">
                    <div class="row">
                        <div class="col">
                            <strong>${Util.snakeToTitleCase(this.#receipt.state)}</strong>
                        </div>
                        <div class="col text-end">
                            <button class="btn btn-sm btn-success">
                                <span class="fa-classic fa-solid fa-thumbs-up fa-fw"></span>
                                Approve
                            </button>
                            <button class="btn btn-sm btn-warning">
                                <span class="fa-classic fa-solid fa-repeat fa-fw"></span>
                                Repeat Analysis
                            </button>
                            <button class="btn btn-sm btn-danger">
                                <span class="fa-classic fa-solid fa-trash-can fa-fw"></span>
                                Delete
                            </button>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col">
                            <strong>File: </strong> ${this.#receipt.fileName}
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
                                            <button class="btn btn-sm btn-success">
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
        `, "text/html").body.firstChild;
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
        })
    }
}