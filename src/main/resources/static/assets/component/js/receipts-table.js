import DatatablesAction from "../../datatables/js/datatables-action.js";
import Util from "../../util/js/util.js";

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
            "order": [[5, "desc"]], "language": {
                "lengthMenu": "_MENU_"
            }
        });
    }

    /**
     *
     */
    #initDatatablePlugins() {
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
            <table class="table table-hover table-striped table-bordered">
                <thead>
                    <tr>
                        <th rowspan="2" data-orderable="false"></th>
                        <th colspan="2">File</th>
                        <th colspan="4">Receipt</th>
                        <th colspan="3">Company</th>
                        <th colspan="2">Tax</th>
                        <th colspan="4">System</th>
                    </tr>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
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
    connectedCallback() {
        this.#initTemplate();
        this.#initDatatable();
        this.#initDatatablePlugins();
    }
}