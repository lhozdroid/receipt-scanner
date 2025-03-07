import Util from "../../util/js/util.js";

export default class DatatablesColumnToggle {
    #datatable = null;
    #options = {
        "class": "btn btn-sm btn-primary dropdown-toggle", //
        "icon": "fa-classic fa-solid fa-columns fa-fw", //
        "title": "Columns", //
        "container": ".row>.col-md-auto", //
        "defaultHidden": [], //
        "defaultIgnored": [], //
        "onToggle": (column, visible) => {
        },
    };

    /**
     * @param datatable
     * @param options
     */
    constructor(datatable, options) {
        this.#datatable = datatable;
        this.#options = Util.extend(this.#options, options);
        this.#initTemplate();
    }

    /**
     *
     */
    #initTemplate() {
        // Obtains the columns
        const columns = this.#datatable.columns().indexes().toArray();

        // Creates the dropdown template
        const template = `
            <div class="dropdown d-inline-block me-1">
                <button type="button" class="${this.#options.class}" data-bs-toggle="dropdown" aria-expanded="false">
                    <span class="${this.#options.icon}"></span>
                    ${this.#options.title}
                </button>
                <ul class="dropdown-menu p-2"></ul>
            </div>
        `;

        // Sets the template
        const dropdown = new DOMParser().parseFromString(template, "text/html").body.firstChild;

        // Obtains the menu container
        const dropdownMenu = dropdown.querySelector(".dropdown-menu");

        // Adds each column
        columns.forEach(index => {
            // Ignores the column if indicated
            if (this.#options.defaultIgnored.includes(index)) {
                return;
            }

            // Obtains the column and title information
            const column = this.#datatable.column(index);
            const title = column.header().textContent.trim() || `Column ${index + 1}`;

            // Checks if the column is visible
            let visible = column.visible();

            // Checks if the column is hidden by default
            if (this.#options.defaultHidden.includes(index)) {
                column.visible(false);
                visible = false;
            }

            // Creates the checkbox for the dropdown menu
            const checked = visible ? "checked" : "";
            const checkboxTemplate = `
                <li>
                    <label class="dropdown-item">
                        <input type="checkbox" class="form-check-input me-2" data-column="${index}" ${checked}>
                        ${title}
                    </label>
                </li>
            `;
            dropdownMenu.insertAdjacentHTML("beforeend", checkboxTemplate);
        });

        // Adds the event listener
        dropdownMenu.addEventListener("change", (event) => {
            // Toggles the column
            if (event.target.matches("input[type='checkbox']")) {
                const columnIndex = event.target.getAttribute("data-column");
                const column = this.#datatable.column(columnIndex);
                const visible = event.target.checked;
                column.visible(visible);
                this.#options.onToggle(column, visible);
            }
        });

        // Inserts the changes into the container
        const container = this.#datatable.table().container().querySelector(this.#options.container);
        container.append(dropdown);
    }
}
