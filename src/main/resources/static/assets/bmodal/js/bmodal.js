class Util {
    /**
     *
     * @param base
     * @param extensions
     * @returns {{}|*}
     */
    static deepExtend(base, ...extensions) {
        if (!base) return {};

        for (const obj of extensions) {
            if (!obj) continue;

            for (const [key, value] of Object.entries(obj)) {
                switch (Object.prototype.toString.call(value)) {
                    case "[object Object]":
                        base[key] = base[key] || {};
                        base[key] = Util.deepExtend(base[key], value);
                        break;
                    case "[object Array]":
                        base[key] = Util.deepExtend(new Array(value.length), value);
                        break;
                    default:
                        base[key] = value;
                }
            }
        }

        return base;
    }

    /**
     *
     * @param fn
     */
    static ready(fn) {
        if (document.readyState !== "loading") fn();
        else document.addEventListener("DOMContentLoaded", fn);
    }
}

const MODAL_SIZE = {
    "default": "",
    "small": "modal-sm",
    "large": "modal-lg",
    "xlarge": "modal-xl",
};

const MODAL_COLOR = {
    "primary": "text-bg-primary",
    "secondary": "text-bg-secondary",
    "success": "text-bg-success",
    "info": "text-bg-info",
    "warning": "text-bg-warning",
    "danger": "text-bg-danger",
    "light": "text-bg-light",
    "dark": "text-bg-dark"
};

const MODAL_ACTION_COLOR = {
    "primary": "btn-primary",
    "secondary": "btn-secondary",
    "success": "btn-success",
    "info": "btn-info",
    "warning": "btn-warning",
    "danger": "btn-danger",
    "light": "btn-light",
    "dark": "btn-dark"
};

const MODAL_ACTION = {
    "title": "",
    "color": MODAL_ACTION_COLOR.dark,
    "icon": "",
    "onClick": (modal) => modal.close()
};

/**
 *
 */
class BModal {
    #domParser = new DOMParser();

    #config = {
        /* Definition */
        "size": MODAL_SIZE.default,
        "color": MODAL_COLOR.dark,
        "title": "&nbsp",
        "content": "&nbsp",

        /* Behavior */
        "closeButton": true,
        "closeClick": false,
        "closeEscape": false,

        "displayHeader": true,
        "displayContent": true,
        "displayFooter": true,

        /* Actions */
        "actions": [],

        /* Events */
        "onOpening": (modal) => {
        },
        "onOpened": (modal) => {
        },
        "onClosing": (modal) => {
        },
        "onClosed": (modal) => {
        }
    };

    #element = null;
    #modal = null;

    /**
     * Default constructor
     * @param config
     */
    constructor(config = {}) {
        this.#config = Util.deepExtend(this.#config, config);

        this.#config.onOpening(this);

        const header = this.#renderHeader();
        const content = this.#renderContent();
        const footer = this.#renderFooter();

        this.#element = this.#renderModal(header, content, footer);
        document.body.append(this.#element);
        this.#modal = new bootstrap.Modal(this.#element.querySelector(".modal"), {
            "backdrop": this.#config.closeClick ? true : "static",
            "keyboard": this.#config.closeEscape
        });
        this.#modal.show();

        this.#config.onOpened(this);
    }

    /**
     *
     * @param content
     * @param title
     * @param color
     * @param actions
     * @returns {BModal}
     */
    static confirm(content, title = "Confirm", color = MODAL_COLOR.warning, actions = [
        {
            "title": "No",
            "color": MODAL_ACTION_COLOR.danger,
            "icon": "fa-solid fa-xmark fa-fw",
            "onClick": (modal) => modal.close()
        },
        {
            "title": "Yes",
            "color": MODAL_ACTION_COLOR.success,
            "icon": "fa-solid fa-check fa-fw",
            "onClick": (modal) => modal.close()
        }]) {
        return new BModal({
            "title": title,
            "content": content,
            "color": color,
            "actions": actions
        });
    }

    /**
     *
     * @param content
     * @param title
     * @returns {BModal}
     */
    static danger(content, title = "Important") {
        return new BModal({
            "title": title,
            "content": content,
            "color": MODAL_COLOR.danger,
            "actions": [
                {
                    "title": "Close",
                    "color": MODAL_ACTION_COLOR.danger,
                    "icon": "fa-solid fa-xmark fa-fw",
                    "onClick": (modal) => modal.close()
                }
            ]
        });
    }

    /**
     *
     * @param content
     * @param title
     * @returns {BModal}
     */
    static dark(content, title = "Important") {
        return new BModal({
            "title": title,
            "content": content,
            "color": MODAL_COLOR.dark,
            "actions": [
                {
                    "title": "Close",
                    "color": MODAL_ACTION_COLOR.dark,
                    "icon": "fa-solid fa-xmark fa-fw",
                    "onClick": (modal) => modal.close()
                }
            ]
        });
    }

    /**
     *
     * @param content
     * @param title
     * @returns {BModal}
     */
    static info(content, title = "Important") {
        return new BModal({
            "title": title,
            "content": content,
            "color": MODAL_COLOR.info,
            "actions": [
                {
                    "title": "Close",
                    "color": MODAL_ACTION_COLOR.info,
                    "icon": "fa-solid fa-xmark fa-fw",
                    "onClick": (modal) => modal.close()
                }
            ]
        });
    }

    static light(content, title = "Important") {
        return new BModal({
            "title": title,
            "content": content,
            "color": MODAL_COLOR.light,
            "actions": [
                {
                    "title": "Close",
                    "color": MODAL_ACTION_COLOR.light,
                    "icon": "fa-solid fa-xmark fa-fw",
                    "onClick": (modal) => modal.close()
                }
            ]
        });
    }

    static primary(content, title = "Important") {
        return new BModal({
            "title": title,
            "content": content,
            "color": MODAL_COLOR.primary,
            "actions": [
                {
                    "title": "Close",
                    "color": MODAL_ACTION_COLOR.primary,
                    "icon": "fa-solid fa-xmark fa-fw",
                    "onClick": (modal) => modal.close()
                }
            ]
        });
    }

    static secondary(content, title = "Important") {
        return new BModal({
            "title": title,
            "content": content,
            "color": MODAL_COLOR.secondary,
            "actions": [
                {
                    "title": "Close",
                    "color": MODAL_ACTION_COLOR.secondary,
                    "icon": "fa-solid fa-xmark fa-fw",
                    "onClick": (modal) => modal.close()
                }
            ]
        });
    }

    static success(content, title = "Important") {
        return new BModal({
            "title": title,
            "content": content,
            "color": MODAL_COLOR.success,
            "actions": [
                {
                    "title": "Close",
                    "color": MODAL_ACTION_COLOR.success,
                    "icon": "fa-solid fa-xmark fa-fw",
                    "onClick": (modal) => modal.close()
                }
            ]
        });
    }

    /**
     *
     * @param content
     * @param title
     * @returns {BModal}
     */
    static warning(content, title = "Important") {
        return new BModal({
            "title": title,
            "content": content,
            "color": MODAL_COLOR.warning,
            "actions": [
                {
                    "title": "Close",
                    "color": MODAL_ACTION_COLOR.warning,
                    "icon": "fa-solid fa-xmark fa-fw",
                    "onClick": (modal) => modal.close()
                }
            ]
        });
    }

    /**
     *
     * @returns {null}
     */
    #renderContent() {
        let body = null;
        if (this.#config.displayContent) {
            if (this.#config.content instanceof HTMLElement) {
                // language=HTML
                body = this.#domParser.parseFromString(`
                    <div class="modal-body"></div>
                `, "text/html").body.firstChild;

                body.append(this.#config.content);
            } else {
                // language=HTML
                body = this.#domParser.parseFromString(`
                    <div class="modal-body">
                        ${this.#config.content}
                    </div>
                `, "text/html").body.firstChild;
            }
        }

        return body;
    }

    /**
     *
     * @returns {null}
     */
    #renderFooter() {
        let footer = null;

        if (this.#config.displayFooter) {
            const buttons = [];
            for (let i = 0; i < this.#config.actions.length; i++) {
                const action = Util.deepExtend(MODAL_ACTION, this.#config.actions[i]);

                // language=HTML
                const icon = action.icon != null && action.icon.trim() !== "" ? `
                    <span class="${action.icon}"></span>
                ` : "";

                // language=HTML
                const button = this.#domParser.parseFromString(`
                    <button type="button" class="btn ${action.color}">
                        ${icon}
                        ${action.title}
                    </button>
                `, "text/html").body.firstChild;

                const onClick = action.onClick;
                button.addEventListener("click", () => onClick(this));

                buttons.push(button);
            }

            if (buttons.length > 0) {
                // language=HTML
                footer = this.#domParser.parseFromString(`
                    <div class="modal-footer"></div>
                `, "text/html").body.firstChild;

                for (let i = 0; i < buttons.length; i++) {

                    const button = buttons[i];
                    footer.append(button);
                }
            }
        }

        return footer;
    }

    /**
     *
     * @returns {null}
     */
    #renderHeader() {
        let header = null;

        if (this.#config.displayHeader) {
            // language=HTML
            header = this.#domParser.parseFromString(`
                <div class="modal-header ${this.#config.color}">
                    <h5>${this.#config.title}</h5>
                </div>
            `, "text/html").body.firstChild;

            if (this.#config.closeButton) {
                // language=HTML
                const closeButton = this.#domParser.parseFromString(`
                    <span class="fa-solid fa-xmark fa-fw"></span>
                `, "text/html").body.firstChild;
                closeButton.addEventListener("click", () => this.close());
                header.append(closeButton);
            }
        }

        return header;
    }

    /**
     *
     * @param header
     * @param content
     * @param footer
     * @returns {ChildNode}
     */
    #renderModal(header, content, footer) {
        // language=HTML
        const modal = this.#domParser.parseFromString(`
            <div>
                <style scoped>
                    .modal-header, .modal-footer {
                        padding: 0.5rem 1rem;
                    }

                    .modal-header h5 {
                        padding: 0;
                        margin: 0;
                    }

                    .modal-header span {
                        position: absolute;
                        right: 1rem;
                        font-size: 1.2rem;
                        cursor: pointer;
                    }

                    .modal-footer button {
                        margin: 0 2pt;
                    }
                </style>
                <div class="modal shadow ${this.#config.size}" tabindex="-1">
                    <div class="modal-dialog">
                        <div class="modal-content"></div>
                    </div>
                </div>
            </div>
        `, "text/html").body.firstChild;

        if (header != null) modal.querySelector(".modal-content").append(header);
        if (content != null) modal.querySelector(".modal-content").append(content);
        if (footer != null) modal.querySelector(".modal-content").append(footer);

        return modal;
    }

    /**
     *
     */
    close() {
        this.#config.onClosing(this);

        if (this.#modal != null) {
            this.#modal.hide();
            this.#modal.dispose();
            this.#modal = null;
        }

        if (this.#element != null) {
            this.#element.remove();
            this.#element = null;
        }

        this.#config.onClosed(this);
    }

    /**
     *
     * @returns {null}
     */
    getElement() {
        return this.#element;
    }

    /**
     *
     * @returns {null}
     */
    getModal() {
        return this.#modal;
    }

    /**
     *
     * @returns {null}
     */
    getModal() {
        return this.#modal;
    }
}

export { MODAL_ACTION, MODAL_ACTION_COLOR, MODAL_COLOR, MODAL_SIZE, BModal as default };
