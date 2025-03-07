import DatatablesAction from "../../datatables/js/datatables-action.js";
import DatatablesColumnToggle from "../../datatables/js/datatables-column-toggle.js";
import Util from "../../util/js/util.js";
import ReceiptApi from "../../api/js/receipt-api.js";
import BModal from "../../bmodal/js/bmodal.js";

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
            "columns": [ //
                {data: "action"}, //
                {data: "receiptNumber"}, //
                {data: "receiptTotal"}, //
                {data: "receiptDate"}, //
                {data: "receiptDescription"}, //
                {data: "companyName"}, //
                {data: "companyAddress"}, //
                {data: "companyPhone"}, //
                {data: "taxCategory"}, //
                {data: "taxSubCategory"}, //
                {
                    data: "state", //
                    render: (data, type, row) => {
                        return Util.snakeToTitleCase(data);
                    }
                }, //
                {
                    data: "createdAt", //
                    render: (data, type, row) => {
                        return Util.formatLocalDateTime(data);
                    }
                }, //
                {
                    data: "updatedAt", //
                    render: (data, type, row) => {
                        return Util.formatLocalDateTime(data);
                    }
                }, //
                {data: "error"}, //
            ]
        });
    }

    /**
     *
     */
    #initDatatablePlugins() {
        this.#datatablePlugins["columnToggle"] = new DatatablesColumnToggle(this.#datatable, {
            "defaultIgnored": [0], "defaultHidden": [4, 6, 7, 11, 12, 13]

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
                        <th colspan="4">Receipt</th>
                        <th colspan="3">Company</th>
                        <th colspan="2">Tax</th>
                        <th colspan="4">System</th>
                    </tr>
                    <tr>
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
                <tbody></tbody>
            </table>
        `;
        this.#table = this.querySelector("table");
    }

    /**
     *
     */
    #loadReceipts() {
        const promise = ReceiptApi.findAll();
        promise.finally(() => setTimeout(() => this.#loadReceipts(), 5000));
        promise.catch((error) => BModal.danger(error, "Error"));
        promise.then((receipts) => {
            receipts.forEach((receipt) => receipt["action"] = null);
            this.#datatable.clear();
            this.#datatable.rows.add(receipts);
            this.#datatable.draw(false);
        });
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