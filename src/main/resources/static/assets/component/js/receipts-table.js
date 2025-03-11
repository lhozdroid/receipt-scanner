import DatatablesAction from "../../datatables/js/datatables-action.js";
import DatatablesColumnToggle from "../../datatables/js/datatables-column-toggle.js";
import Util from "../../util/js/util.js";
import ReceiptApi from "../../api/js/receipt-api.js";
import BModal from "../../bmodal/js/bmodal.js";
import ReviewReceipt from "./review-receipt.js";

export default class ReceiptsTable extends HTMLElement {
    #table = null;
    #datatable = null;
    #datatablePlugins = {};

    /**
     *
     */
    constructor() {
        super();
    }

    /**
     *
     */
    #initDatatable() {
        this.#datatable = $(this.#table).DataTable({
            "order": [[3, "desc"]], //
            "pageLength": 100, //
            "lengthChange": false, //
            "language": {
                "lengthMenu": "_MENU_"
            }, //
            "typeDetect": false, //
            "columns": [ //
                {
                    "data": "action", //
                    "render": (data, type, row) => this.#renderAction(data, type, row)
                }, //
                {"data": "fileName"}, //
                {"data": "receiptNumber"}, //
                {"data": "receiptTotal"}, //
                {
                    "data": "receiptDate", //
                    "render": (data, type, row) => {
                        return Util.formatLocalDateTime(data);
                    }
                }, //
                {"data": "receiptDescription"}, //
                {"data": "companyName"}, //
                {"data": "companyAddress"}, //
                {"data": "companyPhone"}, //
                {"data": "taxCategory"}, //
                {"data": "taxSubCategory"}, //
                {
                    "data": "state", //
                    "render": (data, type, row) => {
                        return Util.snakeToTitleCase(data);
                    }
                }, //
                {
                    "data": "createdAt", //
                    "render": (data, type, row) => {
                        return Util.formatLocalDateTime(data);
                    }
                }, //
                {
                    "data": "updatedAt", //
                    "render": (data, type, row) => {
                        return Util.formatLocalDateTime(data);
                    }
                }, //
                {"data": "error"}, //
            ]
        });
    }

    /**
     *
     */
    #initDatatablePlugins() {
        this.#datatablePlugins["columnToggle"] = new DatatablesColumnToggle(this.#datatable, {
            "defaultIgnored": [0], //
            "defaultHidden": [2, 4, 5, 7, 8, 12, 13, 14]
        });
        this.#datatablePlugins["uploadAction"] = new DatatablesAction(this.#datatable, {
            "class": "btn btn-sm btn-success", //
            "icon": "fa-classic fa-solid fa-file-arrow-up fa-fw", //
            "title": "Upload Receipts", //
            "onClick": (event, instance, datatable) => {
                window.location.href = `${Util.getMeta("context")}app/receipts/upload`;
            },
        });
    }

    /**
     *
     */
    #initTemplate() {
        // language=HTML
        this.innerHTML = `
            <table class="table table-sm table-hover table-striped table-bordered">
                <thead>
                    <tr>
                        <th rowspan="2" data-orderable="false"></th>
                        <th>File</th>
                        <th colspan="4">Receipt</th>
                        <th colspan="3">Company</th>
                        <th colspan="2">Tax</th>
                        <th colspan="4">System</th>
                    </tr>
                    <tr>
                        <th>Name</th>
                        <th>Number</th>
                        <th>Total</th>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Name</th>
                        <th>Address</th>
                        <th>Phone</th>
                        <th>Category</th>
                        <th>Sub-Category</th>
                        <th>State</th>
                        <th>Create Date</th>
                        <th>Update Date</th>
                        <th>Error</th>
                    </tr>
                </thead>
                <tbody class="align-middle"></tbody>
            </table>
        `;
        this.#table = this.querySelector("table");
    }

    /**
     *
     */
    #loadReceipts() {
        const promise = ReceiptApi.findAll();
        promise.catch((error) => {
            BModal.danger(error, "Error");
            setTimeout(() => this.#loadReceipts(), 10000);
        });
        promise.then((receipts) => {
            receipts.forEach((receipt) => receipt["action"] = null);
            this.#datatable.clear();
            this.#datatable.rows.add(receipts);
            this.#datatable.draw(false);
            setTimeout(() => this.#loadReceipts(), 10000)
        });
    }

    /**
     *
     * @param data
     * @param type
     * @param row
     */
    #renderAction(data, type, row) {
        if (row.state !== "REVISION_PENDING") {
            return "";
        }

        // language=HTML
        const button = new DOMParser().parseFromString(`
            <button type="button" class="btn btn-sm btn-primary">
                <span class="fa-classic fa-solid fa-magnifying-glass fa-fw"></span>
            </button>
        `, "text/html").body.firstChild;

        button.addEventListener("click", () => new ReviewReceipt(row));
        return button;
    }

    /**
     *
     */
    connectedCallback() {
        this.#initTemplate();
        this.#initDatatable();
        this.#initDatatablePlugins();
        this.#loadReceipts();
    }
}