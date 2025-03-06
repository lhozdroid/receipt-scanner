import Util from "../../util/js/util.js";

export default class DatatablesAction {
    #datatable = null;
    #options = {
        "class": "btn btn-sm btn-primary", //
        "icon": "fa-classic fa-solid fa-check fa-fw", //
        "title": "Action", //
        "container": ".row>.col-md-auto", //
        "onClick": (event, instance, datatable) => {
        },
    }

    /**
     *
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
        // language=HTML
        const template = `
            <button type="button" class="${this.#options.class}">
                <span class="${this.#options.icon}"></span>
                ${this.#options.title}
            </button>
        `;

        const button = new DOMParser().parseFromString(template, "text/html").body.firstChild;
        button.addEventListener("click", (e) => this.#options.onClick(e, this, this.#datatable));

        const container = this.#datatable.table().container().querySelector(this.#options.container);
        container.append(button);
    }
}