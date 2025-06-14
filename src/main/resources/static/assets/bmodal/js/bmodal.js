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

class BModalTracker {
    #modals = [];

    /**
     *
     * @param modal
     */
    trackOpen(modal) {
        this.#modals.push(modal);
        this.#updateZIndexes();
    }

    /**
     *
     * @param modal
     */
    trackClose(modal) {
        this.#modals.splice(this.#modals.indexOf(modal), 1);
        this.#updateZIndexes();
    }

    /**
     *
     */
    #updateZIndexes() {
        let baseZIndex = 2050;

        const backdrops = document.querySelectorAll(".modal-backdrop");

        this.#modals.forEach((modal, index) => {
            const modalZIndex = baseZIndex + index * 20;
            const backdropZIndex = modalZIndex - 1;

            const modalElement = modal.getElement();
            if (modalElement) {
                modalElement.style.zIndex = modalZIndex + "";

                const modalDialog = modalElement.querySelector(".modal");
                if (modalDialog) {
                    modalDialog.style.zIndex = modalZIndex + "";
                }
            }

            if (backdrops[index]) {
                backdrops[index].style.zIndex = backdropZIndex + "";
            }
        });
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
    static #tracker = new BModalTracker();

    #domParser = new DOMParser();

    #config = {
        /* Definition */
        "size": MODAL_SIZE.default, //
        "color": MODAL_COLOR.dark, //
        "title": "&nbsp", //
        "content": "&nbsp", //

        /* Behavior */
        "closeButton": true, //
        "closeClick": false, //
        "closeEscape": false, //

        "displayHeader": true, //
        "displayContent": true, //
        "displayFooter": true, //

        /* Actions */
        "actions": [],

        /* Events */
        "onOpening": (modal) => {
        }, //
        "onOpened": (modal) => {
        }, //
        "onClosing": (modal) => {
        }, //
        "onClosed": (modal) => {
        }, //
        "onShow": (modal) => {
        }, //
        "onHide": (modal) => {
        },
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
            "backdrop": this.#config.closeClick ? true : "static", //
            "keyboard": this.#config.closeEscape
        });
        this.#modal.show();

        this.#config.onOpened(this);
        BModal.#tracker.trackOpen(this);
    }

    /**
     *
     * @param content
     * @param title
     * @param color
     * @param actions
     * @returns {BModal}
     */
    static confirm(content, title = "Confirm", color = MODAL_COLOR.warning, actions = [{
        "title": "No",
        "color": MODAL_ACTION_COLOR.danger,
        "icon": "fa-solid fa-xmark fa-fw",
        "onClick": (modal) => modal.close()
    }, {
        "title": "Yes",
        "color": MODAL_ACTION_COLOR.success,
        "icon": "fa-solid fa-check fa-fw",
        "onClick": (modal) => modal.close()
    }]) {
        return new BModal({
            "title": title, "content": content, "color": color, "actions": actions
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
            "title": title, "content": content, "color": MODAL_COLOR.danger, "actions": [{
                "title": "Close",
                "color": MODAL_ACTION_COLOR.danger,
                "icon": "fa-solid fa-xmark fa-fw",
                "onClick": (modal) => modal.close()
            }]
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
            "title": title, "content": content, "color": MODAL_COLOR.dark, "actions": [{
                "title": "Close",
                "color": MODAL_ACTION_COLOR.dark,
                "icon": "fa-solid fa-xmark fa-fw",
                "onClick": (modal) => modal.close()
            }]
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
            "title": title, //
            "content": content, //
            "color": MODAL_COLOR.info, //
            "actions": [{ //
                "title": "Close", //
                "color": MODAL_ACTION_COLOR.info, //
                "icon": "fa-solid fa-xmark fa-fw", //
                "onClick": (modal) => modal.close()
            }]
        });
    }

    /**
     *
     * @param content
     * @param title
     * @returns {BModal}
     */
    static light(content, title = "Important") {
        return new BModal({
            "title": title,  //
            "content": content,  //
            "color": MODAL_COLOR.light, //
            "actions": [{ //
                "title": "Close", //
                "color": MODAL_ACTION_COLOR.light, //
                "icon": "fa-solid fa-xmark fa-fw", //
                "onClick": (modal) => modal.close()
            }]
        });
    }

    /**
     *
     * @param content
     * @param title
     * @returns {BModal}
     */
    static primary(content, title = "Important") {
        return new BModal({
            "title": title,  //
            "content": content,  //
            "color": MODAL_COLOR.primary,  //
            "actions": [{ //
                "title": "Close", //
                "color": MODAL_ACTION_COLOR.primary, //
                "icon": "fa-solid fa-xmark fa-fw", //
                "onClick": (modal) => modal.close()
            }]
        });
    }

    /**
     *
     * @param content
     * @param title
     * @returns {BModal}
     */
    static secondary(content, title = "Important") {
        return new BModal({
            "title": title,  //
            "content": content,  //
            "color": MODAL_COLOR.secondary,  //
            "actions": [{ //
                "title": "Close", //
                "color": MODAL_ACTION_COLOR.secondary, //
                "icon": "fa-solid fa-xmark fa-fw", //
                "onClick": (modal) => modal.close()
            }]
        });
    }

    /**
     *
     * @param content
     * @param title
     * @returns {BModal}
     */
    static success(content, title = "Important") {
        return new BModal({
            "title": title,  //
            "content": content,  //
            "color": MODAL_COLOR.success,  //
            "actions": [{ //
                "title": "Close", //
                "color": MODAL_ACTION_COLOR.success, //
                "icon": "fa-solid fa-xmark fa-fw", //
                "onClick": (modal) => modal.close()
            }]
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
            "title": title,  //
            "content": content,  //
            "color": MODAL_COLOR.warning,  //
            "actions": [{ //
                "title": "Close", //
                "color": MODAL_ACTION_COLOR.warning, //
                "icon": "fa-solid fa-xmark fa-fw", //
                "onClick": (modal) => modal.close()
            }]
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
                <style>
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
    hide() {
        this.#modal.hide();
        this.#config.onHide(this);
    }

    /**
     *
     */
    show() {
        this.#modal.show();
        this.#config.onShow(this);
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
        BModal.#tracker.trackClose(this);
    }

    /**
     *
     * @returns {null}
     */
    getElement() {
        return this.#element;
    }

    /**
     * //
     * @returns {null}
     */
    getModal() {
        return this.#modal;
    }
}

const LOADING_ICON = {
    loading: "data:image/gif;base64,R0lGODlhPAA8APcAAAUqdf///2hk97ya9GfM0SeizO/x9sDJ3ODl7oGUuQYrdqCuy8/X5RI2fbqZ9BQ3fQkueHGGsTRSj2J5qPv7/UJel2N6qbC91AcseCJDhRw9ggwwejhWkSdHiP39/u3w9mVh9LjC2JGhwvf4+/Hz9+Pn8MHK3TNRjreW9Hxx9iVFh0Nfl2Ff7xA0fI6fwSREhoKVuujs89vh7LCS9czT42pl96SK9Vt0pbSV9GXL0Wd9q1NsoBxRixk2kdbc6Q4vgxY5f6SyzQs8gQotfmqArQkze13F0Bk7gCtKivP1+Ghk9kFNxZuqyAYreGHBy/X2+nSJs4ucv1Jsn36RuG5o90xnndLZ53Zt9jKpzVVZ3xIxhyY9ocTN3xUzi0RgmA4yepKiwx4/g/7+/lxd6DBDr5+H9ZuE9UVPyy5Mi8nR4Qg2fStAqKqO9VdwoxM4fm6EsDdHuHJq96i10Nnf6r3H26660lBW2XmNtbO+1qeM9IWXvDxZlEdjmmdj9qy40RJbmSlnl3yQt5emxqGvy8fP4IiavU6jut7j7R9AhJaD2jaszRdIhiOXxId39ot69hMyfyymzK2Q9F92ps7W5HRuwjxKvmHI0FjC0IF09pB99R04lpaB9evu9CmkzE9pnipBkDVHlyWdyZOA9SQ8iiahy0plnEGQrzFPjebq8T9cllq5xl9htGTJ0Bt8sVO/z1hb5Pj5+x2CtVZbrxRingYweSFZjzxMnD+yzjuvzTRFtFFrnyFChGhnujyFqbOU7lBYqU27zwpAhSKTwn1zyZ6tyj5blW1o6qSL4w5KjJ2H30i4zwtFiYl60UiatRl1rJB/1ktT0hBTkyM8nTV7o5WkxDBOjFSuwBNDg0+9z6+S6xhxqRZooiSaxh+Luw5NjklRzx+GuAQpdZOjw1GovES1zqyP6T+MrRdtpiCOvkJPoCA6mrvF2Rc1gjBznqiO5yZilRw4hk1U1Th/pUpUpUaXsy9wnVezw4R3zSGRwE1Vp0dSoz2Iq0SVsUZRsIh53V6+ySH/C05FVFNDQVBFMi4wAwEAAAAh/ilHSUYgcmVzaXplZCB3aXRoIGh0dHBzOi8vZXpnaWYuY29tL3Jlc2l6ZQAh+QQECgD/ACwAAAAAPAA8AAAI/wADCBxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFixgzatzIsaPHjyBDGhRDiMiRL5LqwBIZEVYCAAC+PIAphRPLh1EA9MjiYIC7fACkrLy58BAALSziDFjqAGgIoguDADgjoAaKpQOOAdABNQCFAwl0JDhAQWAhAFkECCiDFYWCE1ANSIJJt2YAcQDsqKUyY6kvACuIUpACQJq/csnmBYW1DkAutQKomEHBDEAhggbSzBHTsfEWEI2Y/gIQIkkHBdAgC3jFDsCcgYRmArhTduMdtALi9MwKgEgAGhAArPkGDc4GAIMGPjnJhPDTjYRZqGU74G/gAJNO0AXwoA5ngUYTBP/wAUAERyIAXqmtYcMngAkDYaUJMuiAgYIkvuxaBwWAH451AECGEpClsIp/DwVIUxIcPcGBgGOAMEYuAFTD4ENz1HHACB6V8CAATcBUzSFdNZSEH5KcIEkQJJS4kAEIcPKdi0XpQNcKhNCo0CRfADDKL3vAFIRGJdCAQEUk7KLAGZgslcwRAFhxEQUvwXTHUBEFCIcAKWD1zGwXDQIYE54AwMREL6UlQF8DOPBFGBdx8MV9JDywy0S3qScAJrs98IVFYuxyxEoU7PLFjA+JSZVamESilSQXvVSIFTndMRECCrCjpwAsaALAOhdxsgJdHMRAkVQb5HJGJVoAEEFtFiX/EQI1eFw4kRgXyAaTCFjqeBAJhOBxACq+PvTEJAdMYmuxBq2zC11HhIBoQ5xMMgesG+EBgAKAmDJNcHU8BEtOMK0gA0ecfEFLN5AQQIA9D0BAbEM5XSMPIADsYpNGIQBwTgEFWOKuKQCEyxAnAFzjhLv7ILcREwCAAzA57loDgDgFwfKEQQwAII+7BKgCpkZStQJwAcAQYIjDAs2hAwQK8HHAjEYBAvI4lm1kBQCLhHIyJLUAMIlAaQR3DQ8wJScQBaP2Yo8h1wi9kRgRAMBDN4x0g7QOHgTwhJKtXPIulK+Bh8Z2Z3KUhI3bSdJiAGkAAEgByrjbjJmYBZGACAx8TESBCWGNBWtjzhTQiRHvAiAeswPFPbfh5PCDN+MCPXFaK6QU0I0aCpRNOXY9qiGEkJ8TJEMEXyggRY6lF0RBr63HLvvstNdu++0IBQQAIfkEBQIA/wAsCgAJADIALACHBSp1////vJr0aGT3Z8zRJ6LM7/H2z9flgZS5Ql6XwMnc4OXuNFKPoK7LYnmosLzUIkOFM1GOcYaxFDd9UmygCi94Bix3EjZ9JESGQ1+XdGv2kaHCHT6Cwsvea4GuBSp26Ozz+/v9Y3qp8/X41dzomqnH7fD2uZj0doqz3OLsWHCjcoexuMLYgpW6CjF5i3r2sr3VDzN7rLjSS2acDz2BaWX2VFjfxc7fJ0eIhZe8lYH1fXL2VK7AvsjcL0Kt/f3+bGf3hnb1y9PjpLLNtL/WYcLM6+705OjwZcvQWrjGOVeSGjyA4ubvHDeUDy+DLk2LkX71t5bzlqXFeY21p7TPR2Kab4Wwem/2RU/L9fb6+Pn7R5i0Cjl/mIP1QZCvp4z1yNDhqY7nr5H1X3anPlyVXl7rCy5+GDWP0tnnC0SICDZ9D1GSZXuqCCt6ztbkRGCYTqO6/v7+5urxipy/2uDrT1XXWVvmfI+3oa/LaH6sN1WR193qCTN6NXqiIY++r7vTJj2hYMfQIjucXHSlY2DxNEWzqrfQFzl/Wl6xUL7QHYG0ETF+kqLDQU3FIEGEM6nMQ1CgPEq+IpTCq471PVqUI5nGn4f18fP3VsLQFTh+u8XZN63NVW6hu5n0f5K4iJq+KD+OGGylFGGdEVaVT2meZmL1cGn2FzWCloLaSlLQMU+NKkmKYsnRKkCnFTOKbWm9F0iGHFKMoon1EjGHgHP2O4SoCTR6O6/NQLPOf3TKO0ucJUWHdW/D3uPts5T0KWaXYWK2N0e4ElyaLm+dIIu7DkyNGXSrPYeqFWahC0CFgnT2Hoa4jJ2/GnmvFkeFjp/B9vf6sZPtJqDLoInhnq3KJmKVR7jPIluQLabMW3OkhHfNnKvJLUOSIDqIUlmrBCl1NlOQME6MW8XQkH/Wm4X1Xr3JS1WmbYOvJZzINUeYGk+KE0KDMHOfTLvPOYCmT6S7e3LHmYXdinvSWbbFHH2xNnykL3CdS564UKa8LEuKKaTMMnafP42tV7LDJ6LLAAAACP8A/wkcSLCgwAAh3BgaomBEAIMQI0qc+C/Aghn/AAD4h+HGQ4ogQw6UgwEAIG3ygFn4AOajyJcQA6AAEGxAFIHjPuTTArNnQQMfXJUaIGYgon9uCF5iAuKHT4k8/6X450MglIHaABARSCfPB41P/oR4mi0ik3+ABA6QJZDXP03/FFQAgMMbpLnnoorU+y9MPIIhMLSxozaIrAj/FvRy0SbVFwECwlACsOFpqS4FiQQwBOAM4X+EWgFAEcATACwDHkOO5uiDkZcoBgYRYDCEp38fmghqA2CGgRATzAwlBxnyKwAKXnIiOAniDyJKBHIo4XAEgCYDBlzpVFweAENP/5n/ah6mYIAfBoyE+BjC1qmhA6BwF8ALAFyYPgYMpHUUPMUVANSR3QDKTBJFOAAcEV4pZRQi0CUgoQHAIjYMGBoAt8F0VkFPvMTZB4AE44MTvUHokyFlldWTAuBoBEAFzIzQ03kBuPRUCCmAgYaJL0FjCClLKLHBa+EVaQApGdnywT8Q0FGkeTVSFMc5AFxTCRJFHAPAEzI+GYABUjgwpI0FOQmLNNgQoGYf/8Dw5D9azOBiBtBIxMI/xhRQACZq9gMAAm+CAcAURiCAnERuNqPnI4EQMM9oXioAQAn/DGEfmQMldY2eBWDTjhf/4PGmAUt8MMMHE4AA1WTG+KPnMi5U/6CglyRk8I8SbmBK0B5LAODML7FspNmbFf0wwg+6EmSRAwNR0hKxTwVgBB1yOAXtmzVme61PPyiwQgYeaLLejNreaJqLAKzAF0UBXIKHBwiQkOxEAfwBACz4BNLPNQAMMW9Bl2Tg4gcK/BtTBB9IggsB/5RTAQbWsovHn3KAYQsE64JUpzP/6COOQNf8w+NBmAZApRw1xrbhSyHEYIs0/2DzjzhLWKBXAEzAYAgacbgUQA7IBQANJR8YMKOhw/gjUCijfRQAHl9thMLNJFhQwQpK/GmwQQGAkM+9v8ACAARHPBTADQAs4cU9wUrh8w35/GMBAnX6FMARzAqUDRNOO04AAA8MFzFBDHUfFIIcl2wtUQBxyEFtzwMFEEEFrKj5TzX/ELktu2z8rabgE2S8OddoZ+LFFm0rvvlmUf8zheijxyQHC3+QEEfsMEW5bUAAIfkEBQgApQAsCgAJADIAKwCHBSp1vJr0CC13Di98EDR8Fjh+8PL3EzZ9DjJ6Bip43+TuGDp/CSx4CzB51tzp6+719PX5fHH2/Pz9LUyLc2v2KEiI4+fwloH1OFaSrpH1zNPjyNDgboSwqI31xM3eRmKZq7jRMEOuYMHLWHGj+vr8wcrdJJrHX17stJTzusTZprTPbIKuW1znDy+E3eLsipu/t8LYPFmU4ebvHD6CS1PSVVngDUKGGDSPEzKJUVba8vT47vD2QY+vX8fRBjB5CC53Okm7WMLQQEzDe4+3VW6iHj+D2+HreI21G1GLIpXDd272b2j2fpG4vsfbPYaqNqzNSrrPZMrQmoT1qbbQNUa1n67KrrrS2d/qCy1/amX2BSt2h5m9ED6AEFOThHb2FGKeVVqtDD+DDk6PIIu8IY+/c4iyCCx7GDWCnKzJZcvRaYCtEl2ao4r1SJm1Ub7QMKjMh3f2XF+yCDV8b2q+sJLrG3uwK6XMZXyqT6W7QrTOKj+mFkaFOoKnBSx3JmGUTFWnF22mEVeWDEaKF2ihCTuBRZayEzJ/JZ7KYsXNYGK1ooriaGe7DDl+kH/Vc23CeHHGLECqMXWgCTZ+JqHLEDF+IjyKnYffk4HYCDd/SmWbMHOeL3CcHjmHU6u+dm/EOH+lBCt1orDMhHbkL3GeKKLLAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACP8ASwkcSLCgQYEQDipcyJBhpoIbGkqcyLBRIgFaIlLcKBEIwUZaOIpUqAWHwAwDwZTSQFCHQAkjFTYhIdBFKUgNjdwJKdBKzB0xCf4gyKDUCpE0Dz5MymIgHDYDbRqMEZShT4In9BzsUJDnSC8Fj8I0+FBCAYVzqi4cSzChwBsClRi8OvEoQa4USSAwpLZhHIpHaRREMdJtiKCgDOUgqLVv1JFADpd66Fikh8qVJbjQGHQBZsc8r3wGPDqoEYGHSgukLDLIaM4CL6tW7YcgFMxAtWTyqjBpqUmzN17xPBAUqOAiYSNfeHq589lNBIp9nnek3aB0EYGuGjKP4w0IqB9IvF51bGqBiLgMnXtwSynZpXiLHAQc+EH5Bdf3rcDwMpdCC8mG32d3FMTIQb45JtpBP0QxUG3iEVRghAtFxIVASFBo0IAaBhcQACH5BAUCAP8ALAoACQAyACsAhwUqdf///2hk97ya9GfM0SeizO/x9oGUucDJ3M/X5TNRjxQ3fUJel2J5qKCuyxI1fbG81N/k7kNflwYrdwwyegctdyREhhw+goKVu5GhwlJsnyNDhXCGsbeW80ZimRA+gA8vgydHiLqZ9GN6qcLL3S5Ni2tm93lv9vj5+wkse/7+/mhk9oZ39m9o9itKihEzfQsweaGvy7zG2qWL9fb3+palxZ6G9V92pu3w9jFPjZqE9dXc6XZs9htQi2V7qimkzMbO4DuvzV/H0Nrh61lxpNPa52XL0H1y9kxnnCY9oVNsoBg1j6250t7j7TlXkvP1+YJ09paB9fr6/JKjw2mArD1alOfr8gk1fI2ewXKHsYiavZ2syU5U1lTAzx+Ku6KJ9SBBhOHm7+vu9D5Lwa2Q9Ix79a+R9LnD2KmN9Rk8gDZUkHmNtvz8/ZF+9Ulkm8zT487V5OPn8E9pnhU4flZvooqbvsnS4jRFtQ9QkaWzzqq30WHBy3Nq9iOVw1Za4muBrhg1gnyPtxFDhVSuwE6ku0GPrySbx1q4xlx0pS+nzLS/1vHz9wxGigwufkdRzkJNx0W2zhQyiYWXvKi1z5+uypmoxiE6nJupyGRi9CpnmBJdmuXp8SWfylnD0DtLmypAj22Dr2Jg8Ons8xc5f6azziGQwHWKs0lTpRt8saCI4BNhnTyFqRVmoA5MjjOqzLGS7DaszSM8ijJFlgo4fx04ljBDr0BclqKwzDV6oqmO51xd6FNX3CymzH90yrOU9Nje6gk8g1GovDpIuxp3rkKzzneLtFFrn5WC2WtovCFakB6Ft2Zi9hZrpEiZtRdHhS5BrAQpdRh0q027z3JtwVBYqio/pkWVsh2As0+9zxhxqTuDqEq6z4191IR4zhFZly1tnGd9q1eyw5qF3V1gs1pesSVgky5vnU2huQ87fixAqUJPoHpxxzJ3oDZ8o0qdt2FitWVluF6+yV9e7ImavpF/1mJh0jBzn1dcrkCOrV9f7VxfsjR4oWJf63Vs8UGOrgAAAAj/AP8JHEiwIEE4k/6RMMiwocOHBZEQ3ACxokWGFAVye3exo8d/JkQIpPexZMNImP75GnjPYICXAUwKDCBGxqQzomIajNJQBZw6VIpBeKLTo4pJMAZWiMHGoIkZBlEc+AegKoASv4paDBDj35V27vCh+1cpJkVdA8vMUDBTC4Al9XKlegdggyiPmypcKRWEAIF4H/5FYJhPYJZ/Q/5Fysdj4DQAWrRChPAvWwFeRvxa+5ewocQApAA4+iegg8AOL9I0vVjpn7ICBbb5HfQvA0E1A1v/C5ABwC7SbQayfdIx4TDYBSAZcfev60OuogUKiCKiwygKqy0m/mAIuSFn/35V/yzyj1ZK0jzWASgm+bmWf86uebkG/kB7gyqyALDkB1OoMRNQ0MRHUgkEgEDF0HDRIjdUNUFVCwBxH0QB7ECJFlsUoYJHUpxBhRpIVGLFhM/JRBBMAaiQQAx1UAJHdg0FIEURMrxBlIkDidGAVVXdcFeMQ0hAFQBpIECiRYtIAAAt3YjDjToAOGEAQwFYcQEAmVjTTgX/SGhib89gQsYAA4hA11Qu1QEAM8QIFAwAVcDoEQ0UNBKKAGiQOUAHYFSwCH45VGDID0IIVM4/Vsg0BADpCCBAG3oOQBd5BamwAQyc/JNIJ/9k8k8cMv0CQC2OmjAmmfAAkIBLVACgjEAFGP9CQRooyCTGWys42sIMZKoBQKIFBbAqBdGUQh8ApBwJETgAPOKooyeod8OGLkFQAY9ayPlREwsAIIwumOgizAQwiBdjGJQckEEC1OKYwAYOVpXGGxWhiCNBBsSASAkaxCDGvQCXlGIccIShgrIBu2QAFQM1IAbCJ6LQxMMysdFgMtokA4AGUnRUYQkCZdCuR3AAUI4R/xiRCQBeWoRCCev5SgLEJ0IAgDt+/XMOsjQPWMw/RQCQAc0DBSADAKv4RQA+ACiiVYpsvFSQGBXk8BPPJRmwQAXWHNIMDBT8KBAKlZSQxgEUF12JVWpMKTAQFFgFg5EDqVAMAAtcWQVxBKlJAEQNkxhAdLBxVBJIJU1oNaAGi0jh1hmSwXQvipIBwXMAJZeVcEcDImGAFAcAAPnmF6kQOgzdSqAg6RehEEMOYGghOOse2xtwQAAh+QQFCAC6ACwKAAkAMgAqAIcFKnX///9oZPe8mvRnzNEnosy5mPRlYvRrZvb4+fv8/P3t8PXo6/IuQq1dYLMXNI5FT8psZvdJUc9XWeIdPoLM0+OJm77Cy93z9flsgq/j5/AzUY6rt9He4+24l/Tm6vGdrMlxafYILnjx8/dvhbAlPKArpcxgX+2otc+YqMZZw9AyRLJuaPYWNIFMVNR9kLcgQoQZNpASMYeXpsUhOpwnP41WWuGYhNu3lvLg5e42RrYlnsofQIPu8PYsQpFiYPCHmb1jY7dly9EVM4oqQKa0lO8/TMNjytErQKg9S7q6mPQ5SLopPqW5l/JCTcedh99IUs5ATcUMMXpsZ/aSosM0Uo+ukfSjivUtTIsFK3cQM3wPPoF1bPZOaJ04VpFedqa1lfTT2ugRRYYILHoJM3vq7fSojfUqSYrX3erb4esWOX5extBKZZvFzd9YcaMPUJBbc6W4wtgfi7yVpMVFtc5TrcA8TJzI0OE0q81mfKshksE9Sr9QVdgLLn6PoMKuutIFKnYWaKISW5klnMgpo8y7mfRsab2EeM0LO4ApZ5eQf9UkmcbO1uSMncANSowYc6ppgK1HUqNiydCvkesehrhqZfd9c8ldXem9x9scOIWgieFjYfJZW+ZTWN1VbqE/ss4JNX0jXZJNVqhZXbBle6ppf6wmocuercpUbaAkPYooPqIeOJcJOH90bsNtZ/YXbqYbN5R/krhDk7EfWI+ljOVRWKpTWqxdXdRnZdAeVI0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAI/wB1CRxIsKDBgwgTKlzIsKHDhQwEqjr0sGLFJJUsamx4YKPHg2kcMhr45+NCVQIzHoxlMORGMgnHaOQR8eEHgXoM5hgYY+AJIgNDDjlhcuAjgUIOviAosyAEXZXACCyiRU1RhF4E8rh6sGRBSRYlECzURGPILQQHWYS1aSCXVkXlDGRZcUJHI1wFLjXZJu/GDbpm3PTLdSRhkzURujysaxXFgVkRMtiaSNbAO1wPWBFYluGrT4RbCDQzsAgPEQcDAB5EaA3BxBYXazRFMBFjjYu4PhgYQmAhgYMTyr1N3CGgJJcOXEoCiOFOgYaLMtpa/OECXW50oarOXeDz7uBN5jm62txkIrC6bPe1+CLyRq/hi18HbHKBVYd0E9LfiHkgaoTUHdTGDHkt9V18DfWH4ILsMajfVtdxFRAAIfkEBQIA/wAsCgAJADIAKgCHBSp1////aGT3vJr0Z8zRJ6LM7/H2oK7LgZS5z9fl3+TuwMncQl6XsLzUIkOFYnmoEjV99Pb5cYaxUmyfCS547fD2JESGFDd9BSt3M1GOQ1+XgpW6NFKPCjN6kaHC/v7+zNPjY3qpByx4Fjl+qo71KEiI/Pz9L06M3OLsTGedt5b0uZj0RmGZlqXFCi19aoGu6ezzU2ygsZP1G1CLGjyAi5y/dYqzUVbZWXGk1t3porDM+vr8oYj1FzSOcoexNEW0K0qKwcrdN1WRmajHETGGxs7f6+70YcfQiJq9sr3VkqLDX3anydHhHT6CVm+ipYv12d/rpbPOjXz2P1yW9/j7GzeTH0CEDj6CloH1II29W7nH4ubvQLPO0tnnF0iGU63ArrrSNlOQXHSlnKvJJUWHuMPYDi+BrpH1YcHLDDF5DUKGT73QTqO6s5T0gXT2hnf2ZGHz5OjwR1HNqLbQkX71fpG4ManNboSvN63NLm+cDzx/Qk7Hu5n0ztbkq4/pe4+3tZX0JqDLtsHXPFqUSWSbYF/uNVKPu8XaZMrQx8/gbmj31NvoCDV9SLjPnYb1DEaJq7jRinn2dm33TFPTOleTw8zeZ2P2WVvlD1CRIDmZDS97NXujQY+vT2qevsjcP02eP0zCJz2iZXuqSp63PEq+DUuNIzueaH6sLkKt5urxGTaDIpTCcmr2JZ3IGXKqPIWpSJm1MESTeW/2hZe8VVng8fP3WsXRJJnGcWzAXF3pGnmuFGGdH4m6ElqZVcHQCTuCEVWUamX3pozlNkiYK6XMlYHZmoT1RlGim4besZPsHoS3Czl+FmiiLEGqKWaXjp/BX2G0I5C+tL/WWV2wTlaooInhfXH2invSeHDFHH2yOEi6GG6nIlyRfnTKJmCUd4u0KD+OITqJKj+mUlmsHlWNKmiYF2ulZWW4OoKnHH+zhHfPkKDCeY21ame7Uqm9V7PDBCl1MnWfkX/WPoqsQ5OxJF6SeIy1SlSlVrHCOICmj5/BT1e4ZWLYJV+TdWzXAAAACP8A/wkcSLDgwAC1uvSBEcCgw4cQIw6k0iLNQB9GJGrcWNDEnX+M4uXzAsBQRo4oI0r7N+OWLwKINgFA0DClTYIBJgCIVqARAZhe/tW6qTGAUaMDTaRZVqCAHUQ/4/1DYZAdUYEBdkDSQEGDDioNPzRJE6gpHqjO/m25+pDKAwAARmAAICbCvwDsAOhqWoCYOwolTLA1GOAAAHLv/qFxBmBIQxQUKOhqFUiZnn+CCBZyMxDXzQ8lKNziQkBxBxqCAyxIAxfuvxYfCipaMRCCTbtB//kSSE4o1i36NAhh16emPoJYBob5Z5ejCRppWg1EMyLNDpxHIQZzJBB6ygAeADj/kx6oHAAkNTfCGSgJ2z+rKWtpALCMnJ6SBjh+NCWw0D8RFtkUgAEIWEQBAkakh5IIAxVxVQBUwACWgigZMtiFhA24hREfUOjQUUhhGMAiYgw0QXERjciOBqIsENtgqs0FDjVhAPBPGR5itcBcrenz4lWpdCDCJFIIJI8maazlUC3VsXHEO0ElkONGAQwBACj/cCZQNwB4kCMTAKDz0z9sNDZlUW/l8k8wbQiUDAATeBhAEQDM8xMB7nR5pkQ5AeCfANao8M+bLOSYyj9eoEHAEeYtsGeKSAAwiUACSMKDPADUkSN4AHTgTBNwXsdWAv+Eo6ZAufTwDxNTmqADDf8c/1jLo3zqA4AL2uyhjRnn/fjhDjBEEOJgrlpkIwVjCIYhRx9EsMOAlUhTSYLLbgSDPiUAkMYDRfj6HYgpdQGqJpRYABcSyn6XigeneBAHrQLBQAMApDwxwADIAAFAFAJuASpcI6AAbw30CmDvvX6M0EF+KAXgw74wgAHAA7Sa4IAmcAhgzL33tgOAgw3TMEKHAZxgnUYRAFCFAJWuwPE1AIDx3XxbBJAKBYZ4e5eCVFBABMsCRMLHvdgAUMZ3ggDQhA8OxKxgABEUsQC1Ar11A9DWPNEGJQBQldIHkFzwTwc6+BqAEYMA3EVNdJoKtCU/ACCKzkVREYewBQVgKwKGaUbw4ge2avLDHqBUAUAGMFR7kBMA5KcBcwN9AMYIrQFwR+KKY2UrO1b6XVAETAiygJKZY2XEfADQsAi8pd9FBROVGMC6RgEBACH5BAUIAKQALAsACQAxACoAhwUqdbya9AgsdxA0fBY5fgoveBc5fxI1fA0vexU4fg4yet/l7hM2fbeX9AswebSV9MrR4urt9FlypAkzegcud4qbvq2Q9eLn8O3w9fT1+cLL3Ro3k/b3+jVGtamN9aazzq250m+FsNvh7Ih59j1Kv/j5+1da43Fp983U5E9pnik/pYJ09hc0jaCI9YaYvefr8kBclrfC2F11pkRhmCSaxgxFiRZHhUdQzY2ewEdimQo/hKSK9UFNxgstfmmArcTN37rE2Rs3hHtw9iWeypioxlRtoWB3pzWrzWuCrqm30AUqdkxnnN7j7WDH0GPI0Fxd6EtT01NX3ECOriKPvvL0+Nnf6j1alJ6H30GzzkRQoSQ8n1BV2LXA1mXL0QgseyFChCKVwnNtwaSL5BhxqTCozDuwzeXp8Z6tyg4vg1q4xtHY5jVIlyY9jCCMvH+SuJWB9r3H2ztYk1BYrD1LnExVpiNckRE+gSahy1SuwIt70pOA121n92h+q1hdsC9Dkwk3fS9vnfDy9yE6mktmnDR5ogc1fVeywhp4rn90ypupyB85mJeC9VOrvzZ8owk6gTlXkoN3znlwymtovBt7sBQzgFy7yCxtmzmAppiE3JmD9TByng45fZqF9WZ8qlGovSpBj5uF9XOIsmR7qZSB3AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAj/AEkJHEiwIEE1BhMqXMiwYImGECNC5ENqE6lGAzFI3MiQi0AaAzG64UgyohMbSkqqHGiRFJkuDCmSoqKyRJIcFEh94DDwC6khAstIrEKyhChSSjalJMVz4CSCnnIy9LmSIJGBFAoIBGqHlEeFYVTmxFKV1B6CB0ragIgjxyOGiwpmKLtJgUpQA+2WBAp0I0KDkaq2FKixqt6VBUaWTbvyYdOSMstKNqix8OTLEvnAwZzzE0EgDHMuvcx4oJ7DDQ2t/bsy0cAVAxGRvIo5ogZSUmonbDAwx8K1pJzoJthCDynFDLtOZk2QhUSttXsUJTUX8weCBc4M36iBiwbL2xkaewnf8G9pUhWqRuaohMQOgVcEXi9LNGJ6EqQ8EEyAeuN8UkdF9IUXAmUyXH8K0aRQHiXlMBp0EJUAYUGykfQVKVQZ9BhB40VR0AMrJSEQggJZMRBzAj1BUAekrLcRTxsOhMNAo5EXkW8NuaibG7QZNNeF4WGAo43cgSdZQAAh+QQFAgD/ACwLAAkAMQAtAIcFKnX///9oZPe8mvRnzNEnoszv8fbAydzf5e6BlLkjQ4W7mfSgrstCXpfP1+VieagUN30SNn2RocJSbJ+wvNRxhrFke6ozUY40Uo9DX5fo6/OClboLL3kFLHYWOH4IM3qWpcXL0+MRM3y4l/TCy91ziLIILXeHmb1XcKPi5/C3wtft8PbHz+DEzd8po8z09fklRYeNnsBOo7oFK3dLZpyyvtVtZ/dAXJZqgK1+kbgcUYuntM+ruNEiO5wMLn6Km792bPZSV9t8cfZfdqZHY5rr7vQYNY9Etc74+fv29/rW3elgX+4PL4T9/f6vkfRyavZ7j7ZET8maqccaPIE1eqKHePauutIcPoInR4jb4eyzlPQ7WJN5b/ZNVNRhx9AYOoCjivUOT5CTo8NkytH+/v7T2uhhwcttg6+BdPbO1uREYJh5jbUWR4YGMHmVgfWbhfW2lvP7+/1oZPa9x9uEdfajsc3x8/c4VpEJLHsOMnqrj/UQPYANSYw8hqkSXZoKPYOdrMk3VJD6+vwzqswuTIs9WpQup8xac6SojPUOQYUpZ5cUMolqZffe4+2giPVBTp9OaZ4qSYpkYfM8sM0ilMIfQIMdOJUwToxPvM9YWuM+S8ERVpUXa6Qub50YcKhauMYhj79bXOggOol0bsNYwtChr8sgQYQIN35Lus+Zg/UJOoE2Rrbl6fEfiLkknMdTv88nPaIuQq0yRLJhYraNe/VImrVBj69ofqtIU6Q3rc2PftUxRZQjmMU5SZl2i7RUbqG6xNkdg7abht5UrsDZ3+oEKXVcxdB8csiJe9Imn8o5SLs5gaYZNoMad62Sf/WehvUoosxXs8Oqj+iDd82xk+0mYpQbfbLR2OYjXJCiiuIxdqEUYp4beq9KnreVgtosa5odgLSMe/UsQaoYdKsqP6YZTYksS4pqZ79dvclWW65aXrElPYtSWaoeVI5Sqr4/i6wsQpEoP45OV6grQKdPprtAs84VZ6KPffUeP4MiW5BUr8FElbJpZe2JeuQmPpMAAAAI/wD/CRxIsODAAAgDGFzIsKHDgy+slLgFSIPChxgzHtRQCIBHAB7SXNRIkmGTQwCqRfv0rkOlIiVjGlTyr90/UgL7ALAyUmbJAMAAjPuXa8y/aAASXAzwggQPFY16kgwgKA2wNIKWHgDASeCgV/QASFAYgEQlggmSxAzAisjHDCkuFjEBgZJAVzoAsFDIokOHb91slft3pklJJBkAKNr3DUAgtf8ClALw4VunPQBuxfmHhFCHYC4IEDCD7R+JqSwAdCIgkAqAAxeb7IAwMK3Ca/+qFShASvQwAFCkNgxgBUA30f9kANgxMoCda2ksDjztaXfR0QAOCWdYFsAy0QR0Av/bXjDNv2+7C+QyhrQE+YUvzAHoQ6+PSwMZX3hoAyp9smr/qPCTEgp8VMk17xEUQA3/QNAMKK20A8AESKxlgApS1GBAggWRUUoH/wAg0AQw+ZSQTAGksMMJILCwmU8wxiijRkP8xEoajZDBoUYg/sNORk2A0IGIt7ywo0bOZBSACo5JMURSRzYkxUDhFCTGQgE8iUAASFxgAmQw1iiQDSNgFMAEAGxIBg3/2DEjQVUs8A81w0kBQAnX2HkIGW92MRAaiAgEBUMvoOmRAlG9uchPSAAjhRUbvimQD6tEMRVCkgpUSkGAZKokpp7+lAIPMUjhYpSZNgHIkB79MwErqB7/ZEcjdqAaACAAMHGOMLrg4pibP81BWx4qRJlCB8yEUoVAC8wCAAixsmKCBwlM0UEjBr1AjBIlRlacJv8AMRA1HCjAJ0lb7fBPccUOZEACJnz0ALYBSABAEP8IAMZAgfzzQknXADDENbfodZEGgQDAjDqzXAJAHiLZ6ec/NujxzwKVmCBISU0U7NEDG/8TB5qyhDPAAAtM08EVRYTwTw9yCMRIFchkFitVKoihAhIXhQAAzCafPMAoAAAyMgCxLPGPHF340AGCKIIqkMQCACH0ANJMGABHAMxgBBMAdMBTpicAkIkA+go9ggmXRGaHFG3nUQHUmVItwBNOnJz1BAcFQZBEE7FmlMbPcqDNiDN6nAPApqGa9GQskqAtRxT3Nd5QER35IE4sogAAAW6WN2RHDHl41MEtCISO0QuNEINfpgEBACH5BAUIAMIALAwACgAwACwAh////7ya9GfM0bqY9Pz8/SWeySpApz5LwGtl92Rh9Flb5Pj5+yM7nUlS0CJDhZGhwvb3+hs9gkdimeTo8dzi7JqpyG6EsIydv+vu9O3w9RQyiW1m95WkxPf4+3mNtU5pnoaYvfr6/Fdxo9je6hg1kGTL0czT45+I4GNkt0JOxx85mbOU7qyQ6Vx0pbG91Ftc5zJEsVJX20tT0hs3lActeGPJ0DtKvlRY3Q4vghEwhV1d6ThHuSU9iyo/piqlzC1CrR04hy9CrlZa4k1U1aaN5rqY80ROys/X5T9MxA8wg0JNxl1e6XGHsSREhqy50sbO4MLL3gwyehY5f3tw9jhVkbeX9LfB19Tb6BxSi3Bp9itKisrS4go7gjxZk4t69V/H0AYxeqqO9YV29mh+rKKwzKWL9Ymavuns8+fr8hp6r2DBy068zyGQv2Jg8Glk9jV7o1nD0A9KizaszUO1ziSbxyY9omV7qrKT9CijzC5unDuEqDywzhhyqSKVwwotfS9NjF92p1OtwBJem0RQoRA+gFPA0Fq5xgg2fXaKs+Lm7wUqdo6fwR2BtXdwxY191JB+9SNdkjVGtbSV9JemxlVuohFXlTxMnFlxpA1BhYV4z5aC2lBV2CE7iVJZq4WXvC5Dkj5blQ0vfjFPjTKpzF5e6xk7gBo8gEtUpn50ymuCrtrg63BrwEi4zjRHlqSyzT6Jq0yguLiW8WmArUZQy4CTuTF2oCagy2Bf7VtesRc0gVhcr1VZ4F5gujR4olldsTBDrmdj9mJizwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAj/AIUJHEiw4EBEAtEYXMiwoUNhZ7o8nEixoiGBpjJU3NjwijAstjiK3ChnopWRKAVeSNlQAsFEA88IOzSSQMo8DwkJtMlyIU6BtVLC6WnQ1UITMgvyGViCqEA9ToUhFAl1pClhbAaGFHYy5dWNLmZGPelCI0ejUXvCvMAhrdu3cAkqpBC3Ytu4Mip2hYtEmJeNMN8uEVilLsoVD6caXvxwsEBSFNuaJboy1A5hlxkzRKu588i1nisqDC0wycBBTvdOhJlEhxiBRQTetTqyL1zVDlcOLFN3tDBcwv4INDEwr8AwwmKL5GmQJ4y/yTEK2yKMATCCmXqqJm4dusBVOwX+SxIITEaozixiSqQhzLSwsFFX7hLIG3ZDJh7fGs8yML3BDnERJ8x1wiDwXWg8/dIGeUooIsxkjEUkTC7CjEcaQboNFNiFwtAFIVEBAQAh+QQFAgD/ACwMAAoAMAAsAIcFKnX///9oZPe8mvRnzNEnoszv8fbAydyBlLnP1+Xf5O5CXpegrstieahDX5c0Uo9xhrEFK3czUY6DlbtSbJ8HLHe6mfQkRIaRocKwvNQjQ4USNn3+/v5jeqm5w9ju8PZrga61lfTx8/gUN30WM4z09fnCy90JLnj8/P0LM3oLLX5sZvcdPoJGYZmGmL2ukPR4bvZYcaM9WpQQMISpttAPNHs5V5JofqwqSYkGMXq4l/Sli/W9xtv29/pqZfYXOX9gwctLZpzc4eyKm76giPVcdKWxk/RQVdjk6PBTbKBPaZ7p7PMgQYSGd/YbN5SyvtW1wNcvTYxOo7puaPZxavbL0+OLevVhyNBFT8uercrm6vHe4+0moMrO1eRyh7H6+vyVgfVly9EnR4gsS4usudI6Sb0WR4UZO4A1eqJuhLCQffWUpMSqjvXi5u92bPZmYvVUWN95jbZ+kbhJuc98j7eCdPUMMHmls84vp80xT43Hz+AOPYEVNIEOQIQpZpeSosNedqZATMMrQKn4+fvr7vQhkL/W3Ok3VZHY3up2irMRV5YTYZ1aucdle6qWpcV9cfYlPKBImrUdUozJ0eFjYPGvu9M2RrYkm8c7sM5CtM48hakbT4oMRYlza/ZBkK+bqskJOoExRLEhOpxJUtBSv9BziLJVbqFuar4QMX4fh7kZdq0INn5IY5uaqcfEzd/a4OudhvUrapkbeq8vcJ0OTY8gi7wcfrLR2OZUrsAcOIY2rM0qpMx7csiCdsxaXbB0bsJcxdCxk+yNnsAXbqYNSYyZg/VgeKgiW5BfXuxYW+SljOQVOH5hYrVnZrk/iqyahPVbXOirj+kyRZUjlcNGUaI8S5zT2udXwtAOOn4fhLZTrL+QftVTWasbPYGIetAQUZFYtMMnP42WgtoiQ4VBTp8kPIorQZA3fqUZcqkgV4+isMwdgbQEKXUWaaRNVadPV6mTgdhdXekmYZRUscJLnrdMobmeiOCahd0ydqAVZaFlzNJYXMVGlrOVgeJdXegAAAAI/wD/CRxIsOC/ACiQbBkUwKDDhxAjHrTmQKAGDw0latwoMMCWEQDkxbIDgEdGjigdBkAAgB+Bf+Aq5EGRsmbBADYqXCHwUt4/QgQDCBVqs+PQkwcpAGDEM4yZCiIGcuARw04UDB+QbgyAyIsNL9ZOBqAREhyjcwBAZOQgDACAEScASNCiNWIAQyTdVuhyclAjt27nNgygB8AeKf+AoG3AAWWABgA8fDEBgILYL0+8NFJnIGOARABS4XkZRtI/LY67LeMgVEKKLzeHBm0B4NK/OS/P/bPmWGnYVwAc1FV5A0ChgaSO/WvjWM+/Cg7iHhhuMIAHAJts/1MFIEhjxwds/P+TgBElChAAUkjq8/YVdYgBOAxinTLAoFbdBDYQ8r7oVhRLiECUfwRWh8KABdokAgMOLONAKwZIdFSCAmkh3lsAjIfEQwGUkEUDQ9CVIApK+cFFGECgAUALsBmEAmRu4fBBgpP8k04BujQVyz/OGfTKPw0s4QgAlfSnkTr/2FJAAcDwhFgrDvGGwD/X0WCkRFBms6QuO2nzDwYO9ZDHinZUwF+BPPwTy5IF4DGHJlSqtAUF/+BgwpUSiaABAEouuU4F3USoEgclHEjhP5OQtIkfmwBQgR54HnoXnQJREBZHKBRKIQdLvLLEdxq9ksgPbyWCSE0bClRjTR7EdYYN3Tj/WkmBqHHUBQAqjPLCABZsQ+qqHO1zzzbUpMSBUkcIYMQAzIoTHE0b+VPHQMygtAQATgggABvMMksOAMwZheBAgfxDhQUCBWMHR4YAEIq2TXQ7QDMA3HJQGxhQEAQCXYBKEBE2bQGAINoKQES3vgCAiHVxAfbPENAStMIOAjHB0SDd5IBMwWoYEcwyNZRQowpYRBPMNmMAwEAANUIykABN1KQOAKJQUjAlkADQCge0JfuCQNGcccKMpjzE20aDQDZDGViUkQsAMfSAmhP/CADLQKf8Y8Kh//SAQQWAATBECf/8KIhAbuggUC8APGGQHWAVRYgJHpiwxEB3U131IyH8PJP11gT1EDHXxwJwhEACrNDPMnYIyjWHXfxjRyDxIDPK0+pEmqB1KYT95eCPc4hEKw2YMsSloW8lG9cBAQAh+QQFCACmACwMAAsAMAAqAIcFKnVnzNEnoswILXcTNn0UN30MMHkKL3gOMnoWOX4HK3gFLHYMLnpwhrG2lvRuZ/YFKnYQNHyClbtyavaJmr44VpFsgq+yk/SvkvRpgKxcXenb4eyrt9EcPoIJNHseQIO/yNzFzt+bqcgLLn/q7fS7mfRhwstHYpnI0OG5mPRoZPbx8/eFl7wuTItEYJg1e6OmjPUPL4QHMXpPVdc8WZTS2edbc6Rgx9CiifUWM4s7Sb0hj74rSoquutJrZvdMZ5wILndOaJ4pSIkORIYmPowaea8wqM0fiLmtkPSBdPWwkuxTV9xkytFWWuIYNZAyRLEcN5XZ3+oXR4UcOIUSMn8jO54XbKVzbcE2R7c7hKkspsxQa5+8xtpVWq1auMY9sc43rc0PT5Ds7/XN1eSHd/Unocs+W5VeYLMvRJMKP4QUY5+WgtunjedjYPJaxNFgX+4mn8pJZJsoZZdOVqgilMJJUc8qaJglnMiFdvaQf9aotc8JLHxnfasRVZVDtc4kmcYZdKpHmbURPoATMojo6/JCT58ELHcIN35tab4po8wehLZBj6+dh98RWpgNPYFYs8Mra5pevskvb51HUqMmPaEcgLM2U5AwTowTXptIm7VjZLdoZro5SpogOpqiiuI9TJ0aTYlCkrAwc55Cj64zd6EmhLIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAI/wBNCRxIsKDBgwgTKlxoCtIBU1wYSpx4EMglihgTVgCSsaPESAOlLFhBkIuNAxc9mopiqkIGg3oGgjT1sqLKghwL8ilIqKAjgSZuQmS48+ARI0JNJRh4CQHFE6buJCUYZQHGlzuShjAF5ETOjn9MlQFk6ofHClYjXjXIcqrbtxhJwp1LdyHJE0tNya2LkFCFgVb5MpRTEKpghGWQEtzKtmAPt6VuxpwaWSAThhehBhYaEZLHFm5JbjZVavRhg6AIc2V8OqHZ1n2j9JzIcunSthgnq8xJQ+CCx7AH7qmDITjCGaYuCE3isScUgTAIFjJu6gnF1wWXGLSEkVLCtg8lRksX+JUhA4Z7TLERCJpgFYJ4VL5BaNjgATF0dZjSMciUDVPOKTSbAkltthlu1PFkynMJFmQWcgL5IJBT1J1nynz9JcgFhQ0e9B9cAQEAIfkEBQIA/wAsCQAKADMAKwCHBSp1////aGT3vJr0Z8zRJ6LM7/H2wMncoK7LaGT23+Xuz9flgZS5UmygQl6XFDd9sb3UYnmocYaxamX2Y3qpJESGM1GOEzZ9IkOFBit3ZcvRQ1+XBix3t8LXCDN6gpW6kaHCwsvdu5n04ufwNFKPYsnQHD6C+Pn7Fjl+/v7+X8bQboSw8fP4bGf2fI+32+HsDjF6CS54xc7fCy5+ETR9IEGEFDKK9vf6KUiJ/Pz9TWedQY+v5+vy+vr8rZD1t5f0OleSdWz2SmWb9PX5Jj2iL02MM0SyGDWQaX+s1dzpLEuK2d/q7fD1C0CFq7jRd4u0WXGjcGn2CTV9tJXzyNDhvcfbU1jdN0e4usTZRU/LCTB5ManMUGqfVW6hRLXOYMHLzNPjR2Kam6nIT1XYjXz2lKTEED2AI12SCCx7LUGrDy+DmajGeY62X3enHTiVPbHOqbbQH4i5Xname2/2KaTMsZP0QFyWPVqUGG+nFGSfiZq+G1CLloH2GjyB0tnn5enxLabM3uPtztbkVcHQFkeFITqbKGWXkqLDbIKuqY31hnf2GDqAJkaHoYj1RGCYrbrSjp/BXV3qYmDwnazJZ32rZWH0WsPQN1WRSlLRDk2OEFOTC0OHEVeVpbPOGniunq3KTqO6VK7AJJzIGDWDc4iypozlITuILm+dHYO2CTmAHH6yR7jPJZ/KTrzPfpG4h5m9WrjGN63NMU+N6u30orHMrpHrk3/2TlaonojgIpTCF2ukDEiLO4SoFWehHVKMSJq1lqXFNXqiS7rPjJ2/WFvljn3UlYLbiHrQm4T1QEzEg3fOPUycE1+cKmeYNEeWWLXEN1SQRlGiL0STd3DFW3Slpov1X2G0Z2a5fnTJhZe8fXL2GXWsO0m9I5jGmYXcEVqYT6a7K0GQGEqHNn2kMHOfPluVaoCtVFqsc23CXbzIIFmQRpazU7/PKD+OS5+3Djp+BCl1cWzAgnT2NlOQtcDWPIapU62/H4y8bmq+Uam9RJSxM3ehM3egZczSbGneAAAACP8A/wkcSLBgwQAIAxhcyLChQ4MB/IAYdiDHw4sYGQaA8A+AR1cWM4rEOEtLDSpJugCgonCkS4ZUAExCCAbAmpYvcw708+9JigCPAMDBGSDFEixUhuDMGeAPlRFL//XYAAAJgxgP/gwMMARRRwAYwEQVGaDTwJkEm+oQyEjs1icA1OkbxyHrWIyB/imZZOHfkoM5Ai05sVTrnhIC9dm8e/EAACf/6AHowNigoH+8CBD4BwvAk8oO/wo5oPJyRgX/zmjQ7A4ACNANU7zyCMBFCpEp5AA4BU7fA7+wY4N5BCZkxgCzqHrkQC+4w4QvA5w4sMYJVJ3YDyLMabTTsElUemT/h5hxCFzaAISgHi9dEBYwN0CfgALgCDZvxW4BYKQVe4AFSnylhFsMdQIAEZXUMcCC+FTl3xIw7KYPPxzEsMRdOSiRQSQCJLLgACLMA8AIOgWACACeeCFQaxHcNQsAhQgggC0fDhAPACHo1IMW7/wDCGIaEPLPDQvxcKCME/jw4TQAHKDTCRyYIVAsKvzjyz8sLHQCDDNUImMU1Syo319MCQHAPQIVkAsHQNy2EAMAcCOjjEEoAwA0xrkUgGPvqHKPKmZMxhgPGABgBDGVRJJMDACAkV0KCHwFwD9ruMnQCxZ4xCgAMDjJ3hJrMLDGhRcN4UQEFnCxxh/bsZeQcwQZ/0XLMAj4YWlGPSRxABVMwGrQDS5I+g8pQxznxx0DxbCGeC7lcOIR03hzjIiU5NmQH4yqswMvPTJw60UByPCPG5LYItAUy/xzAGw93AGAKgWs9sUe/zhKFpxj/CPPQLgAQApsSfyjTgEFWKJZPgAw4GsA9EnyjwA+nAvABrDliAfBb2j2BQBQLIwEAMQIFEQd/9QCgBwKddCQo6cQXIAXJXSGyMIGXjFQC2Q0OJO9Bk3yjwEwSJGLy3Sc8g9kIxnASJyV/FNJMgCYwERBERPUq89moNLNPYbcWexIEfUBABpHzAAACoK05IZDOQwjLDTr6cnDMCb80wcDrA6UhsgFcTD0TwoLDEMJKRB8XWIKN/xU0NoC7dtQq+NFLrlDpiUTyT+YCETL5Jx3ntEa/0DReUAAIfkEBQgAwAAsCQALADMAKgCH////aGT3Z8zRJ6LM/Pz9ZWL1ZWLzSFHPJZ/K7fD28PL3M1GPHj+DpbPOM0WzIUKERlDLspP0EDCEupj0GzeTSlLRc2v2cYaxbGb28/X5N1SRDC5/laTEj5/By9Pj5+vyr5L0uJf0rJD1LqfM3+TunKvJlYH2GDWRYmDwjnz2Nka3ITqb4+fwb2j2U1fcUViqK6XMUmyfo4r1d3DFHTiWOUi6t5b0PEucV1rj9fb6HzqILUGrX17sJz6jKKPMs5TvdWz2t5bxY2DycGn2d231Kz+nmYP1P0vCcmr28fP3CjN7Ci95VluuEzGIVFnfIEGEETZ9aWe7sZPsZGS3YV/uJTygPEq+PUrAJqDLEjKHHTiPuZfyBy13sb3VETN8t8LY9/j73OHsXsbQHD2CBSt3TGedLUyL1dvo4ubvFjl/ipu+ZsvRd4y0DjyAYcLMVsHQSWSbb4WwEVaVCCx6RWGZWnKkZXyqPbHNTbvPRrbOfHD2NKvNC0GGHFGLKWaXH4i6rbnSMUWVqI31u8XahXjPE2CcF0iGGG6mDk2PDEeKDjB8vsfbbIKvVG2hO4WpI5jFi3r1zdXktZX0FTOLSZu2UFXYf3TKL0OuGTuAT2meaYCsKkCPXF3pLm6cTVTUr7vToIj1s5T0IpPBp43mjXzUkoDXVm+iXb3Jl4PcGXOqrZDqkn/2Jj2hooriQk3GgXT2H1ePFzSNnYffnIX1TFWnW1znFESDJDyKa4GuRVGhmYXdR1KjZGHzJqHLQU6fR1GiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACP8AgQkcSLBgwTPA1BhcyLChw4WfHkqcSBHYA2BnYlTcyLGjx4cI2QiMyHDRR4MsgKFpqAkYl4cXT07UyFDkwJcpZT4kEYZhH51Agx4UuIhmxZXA1ghVKLOT0Kcvn8pEKrWqVatJFlK96vCEJa4bqxgw2PJkT2BOXWLkuEXgVo5l83RcZbXXQKXAcjSsYhUMF1sFf2Y1CAbYhrEFf0n1ofZhDbAbY9YqwAPYHMgNzxY0iXnhYGBGO0tEKJA0R9MybYqWqOUj6qpBPuL9+bFSQVkUXwOlIhCEwNgd78hsWaugqo1pq2Jg6KqhEoIwBAL6eGUsYofHCwJ+RPBzxTOYgCkjam2QRse3G9VcDJ9zdUXzAl+Fcr/QE32Hc5pTsX+/v3+BAQEAIfkEBQIA/wAsCQALADMAKgCHBSp1////aGT3vJr0Z8zRJ6LM7/H2Ql6XgZS5z9flwMncoK7L3+TuYnmocYaxEjV9uZj0u5n0sLzUNFKPJESGamX3Lk2MIkOFUmyfM1GOQ1+XByx4BSt2FDd9CS54CjN69PX5lqXFwcrdPluV/v7+DDF5kaHCS2acTmiegpW6Di+CWHCjcWn2prPOKEiItZXz5+vyY3qporDMzNPjrbnSHFGL7fD2U2ygt8HXFjl+1t3pNlSROliTa4GuiZq+8fP3fpG42+Hs/Pz9GTuA9vf6IEGEnKvJFjOMRE/KkqLD4ubv5OjwFkeFdWz2vcfbR2KZbmf2HD6CaGT2ED2AztbkjJ2/X3amjp/BdYmze4+2K0qKVcHQCi19NHqiaYCsJZ7JXHSlxM3e+Pn7TlTWO0q9usTZZGHzNn2kEluZm4T1EjGHmajGZXuqydHhYsjQoYj1p43mhJa8L0Ku6+70q4/1SbnPEFKSWrjG3uPt0tnn2d/qj37VJJnGSFHPloH1IZLB+fr8QrTOsJL0Hj+DJz2isr3VYcHLDUGFqbbQTqO6WVvmL6jNYF/ukH31O7DOeIy1GjaSM0Wzg3X2m6nIaH6rGz2Bx8/g1NvoQEzEeW/2GXasCjh/HoO2PIaqfnL2bYSvSVOlhpi9VVng6ezzUlfcHjiXXV3pZcvRLm+dU63AEjJ/FWehT73PII29HH2xDk6PCTyCQI2uRGCYOkqaIjucNqzNFWKdCTV9H4m6EVaVh3f2QE6eYMTOJkaHdG7CDS97KqTM5enxpYv0MU+Ninr1loLahHjOGDWCgXT2YmO2MESUnIffDEaKSp63Q5KwGnmvF2ymKmiYBCl1+vr8rpHqOEe5bGi9Xb3ITVaoHzqISJm1GG+oI1yRSJq1DUmMKWaXJDyLv8jcKj+mW3Oknq3KKT+OV1yv4OXuH1aOJWCUK0GQVrHCUai9aoCtU1msNUeXOoOnWLTDXV+yKGSWfnTJWl6xaWT2eHHGRU+8bmftGUyJXmC0TqK6M57DcmvfAAAACP8A/wkcSLBgwQA/5gQIYLChw4cQC06rItCKAYYRMz4kYUDJHBIHEQGYgAHAJ4waUw60VBIAgCdhQAoMYAUADCE8OBBRyXONyx3udrg0ITMAFgA48uSoJOTgwoU8CSoAcIyUoAEDlvUCUGamjhIuAdBA+S8ADAQ8rCggm1LICA6iBFzFuozDsGkz9VRBELPgHBdhxbLNuAQALQEChGHFCgoAnoFP2QbwuUaMnkoddvLUAUAOYkmLByQDQCVjAC8ARi3M8k9J1HMACCEW4GexOwB6TFcBUCiAgWEefkSd5mKDotm66MD5VUSM6XMdAGjIAWDN4IyFAEAyNdsUJACIUgb/0IGBwwUZTaP+E4IAwAZx+MT9AoAlvcaFYoRcb0tjUNhKLeCl3oBl+abEKETo0YYOmhGoXgB4UDIQTPtFFVmFM1HxAQDgYMMDAP+0gOF9bTigwSeWYPjDBRwg0YhAywzxTx4OlkXDPwBw4JKIDgUgAQDV/KPLQHsAkMWIEAXjQQ7suJHKFP+c02N7ovxTwQsCQcAckj3iAIAzBBDwjzOCNRRAFgAo8o8AukDwTwQdfMClmdl1EyYBzYB3XQALAICEQAJ4IswyAFgxZ0M6/FODIQTwwg1p+53DgQpVCsRIKf+UcahBJKCZwzdTmCSTmS3880skSOCjhkn2DRiAGGt0//BPCSYQgSEJheSAo0BVOFfjTEQgyCVCluCgAAyb/hqRDA5eWCNrzVKRxRNWIGJrjfcQJOF9zAb2xEVRhdHQLv84YVppHWjDyzWo0JcstP9I8iCanABzyj9uMPHPKA5W8NA0bSywRhk/YBTAEwB88U8dAp0xY1TbFkTNP+MItMQTBF0wA0MBNADAHwI5ssU3/zzGU6kE+UuQARkAwE037MDDQQmJBkCDywr/wwkAGQjIEwUGcVCJQmv8Y0sBdYSZJwYgEVHSFPOgA4AHGw9YyUBcEERCBhzwUYAjd6Kzb1k/IMCBQDxQkWxBV1+9hEBCeDBFAXRvEWYX/+RWoAF6KDqhn7Kccu11AcCwckoNYwN+X9FH012AKwBgsHaNP7TMjSuc2DJzooqrtAQGBPVSdecqASzDGgqAoHhAACH5BAUCAJUALAoACwAyACoAhwUqdbya9GfM0SeizAgtdwkveA4yegYsdxI2fRg6f7iX9Pf4+4OVuwwweYmbvnBp9uLn8Nbc6Y2ewOrt9B0+gjV6oqe0z4J19puqyFhxo0ZimZWlxQ4vg6u40bSV9G6EsE9pnoh49Wtm9ggye8vT43Rr9ik+pWVi9LnD2BBTk0mbtbvF2nhu9mFg7wstflpb5iafyiVFhzdJmBJalxA0fHaKswUqdqGvyzNFsl5e6wk0e21n9iM7njtYk1bB0BVmoH1x9kpUpSSbx0BMwxhupyCOvrXA1h45l0xT1Jinxh9AhL7H22DFzi1CkTyFqS5CrQo4fgxHizywza660qOxzWFitVldsEhRzpSA9UO1zhg2g4589QcreVC90A5Nj1VuoSFChDlXkot80wtBhihll1BV2Q8zejhHuHdwxbeW8YJ2zCKTwmR7qlBYql29yQYueFNX3COYxXOIspB/1RRfm5+I4LGT7T+LrFeywgo8gpiC9UGPrws6gGtovC5unQ4vfD1alGZ8qq2Q6lCmvMLL3Th/pXJswRNBgkSTsWbL0QoteoWXvJmF3hlNiZ6G9ZeD25F+9YCTuZOB2C9wnLuZ8wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAj/ACsJHEiwoMGDCBMqXMiwocOHYR5KVEgoIaCJGCu16XGwBkEKGRtqgTOwToxKKAZGIDgFIceQgGwI9FCSQMhKLW8WDKJz4kocB/v01KlnaCWbGV8YNABm4kWjN1dWAnNDpyKBTwR6hPpwSlOBCbhGFUu2LEEzAjeabQhG5sBHUHM2bHmm4JxKW28iZTKRZqU0TMUiwonQo1KClCqhvdlShcOqBIFUqjNUqkC+C20ertTiCMq1Cq+aRbt4oRHQGU+jnlgV8mqHeV8vDPTQtdklD6Eg4jsJb8YyHScmEtgIdVXcBoUQLCT7q0DaA6X4uFnXp0C5PZ0LHGIDZMMFA8kIJkQa8g9CAsqlKET69CbIsAQLEJxeqYJshV2G39/f0zL//wodx1VAACH5BAUGABYALAsADQAxACcAhLya9BM2fQgzexY4fraW9KqO9RE0fHdu9rOU9IZ39nxx9iI7iVG+0Eq6zylAj0W2z66R9EGzzg88fxE+gAk6gThWkQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVLoCWOZElWZqqubOu+cCzPtIjWJILvfO//wKBwSCwaj8ikcslsCicwglOVGA2mJAWWCd16v+CweExmQsq7SPlGbLC66KEkzI7b77EQACH5BAUCAP8ALAoACQAyACwAhwUqdf///2hk97ya9GfM0SeizO/x9sDJ3ODl7s/X5UJel4GUuRQ3faCuy2J5qDRSjxM2fQcseFJsoGN6qTNRjnGGsQkueJGhwiJDhQsyeujr8iREhrC81MHK3QUrdoKVuiVFh5Kiw/Hz92XL0RA0fB4/g7WV9MjQ4aWL9cXN335y9vz8/Wd9q3Bp9/7+/hw+gl52pszT42tm9g4/g/T1+WLI0O3w9dvh7Pj5+3KHsg8vg13F0Nbd6ShIiVpypKqO9ExnnRY5fyulzLK91eLn8LfC1yBBhLCS9URgmI+fwSQ8nxo8gDlXkjZGtvr6/LmY9Pb3+r3H2ytKimqBrXRr9lZvohtQi6GvywwweX6RuFlb5WHBywstfi5Mi6y50tnf6kBclgg1fU6juidHiD1alRw3lFO/z5uqyLnD2NLZ53WKs6GJ9Yucv5WlxSCNvYp69mNg8kFNxUeYtIiavYd39hMxiClmlwo7gUKQryKUwqa0z3yQt0xT0zSrzd7j7eXp8S1Bq2hk9jV7o6660ljC0FRY3p+H9UhjmoWXvCWeyRExfnmNtam20K2Q9DCozV9e7DdUkE27z6SyzZaB9TBOjCk+pW2Dr4999TpKmw1MjhdJh5yF9T+yzlhcsE9pnhg1kEplnI2ewDFDsCSZxRYzjEZQzKOK41q5xhZrpBhxqRNcmRBTk4N19lBW2ClAj0i4z5J/9pinxn1zyRl1rBZGhTlIuxt7sDyFqTxZk7uZ9GJjtk9XqXRuw7S/1p6typaC2hY0gTitzUS1zhFZlwtEiAs4fh+HuByAs5mE9QQpdVFrn1SuwB6Etmdj9u7w9hk7gCA5mmxpvUlTpj1LvgxHixRhnVGovHdt9juvzbOU7npv9q6R6uvu9KmO6Il60bvF2SM8ijJGlSmjzB9Xjx1Si0JPoJuF3mVi9ZB/1i9wnSJckD+MrTBznhw4hpWA9StpmD6KrCZhlFezw4R3zR1UjTqCpxVkn1/AyhVmoW5p5G1n70uft4h53RZnokuetwAAAAj/AP8JHEiwoEAXKaYsweJjEA6DECNKnPjPyQIAAEgwwKiMG8WPIAmGAvCp0JNc3XYBUPYwpMuIfgDUeURlgM1cKou8DBmgZ8+BkgDEESDgic0BpgCw2PnRyYEFLBYccBLg3xwAhYgaOvrEAwWmE234+IcRwL+OAS4AaEW0xRGb2QAgARvRSRUASvJ1MycNgCcc3wCIIiqgxaYn3gDMGRjAxokvLpgGCKzkHB2BOAEUoTHGAx/CArQAA/BFYIATDASqcbIzgBqs/6jkEph0SoAYFgAAKsWnCRYAVwZCWRjrbpGqLgPcffRPgCGBcZFUTQCpLAAGgyIL9PNvwT8eAJIg/+dpCYAWgTLW/OsGwAFyHCckXTlgoKAILEbQvB40HmSAQboFIpAAKnQCACP9SfQfWSvRwBQNuAj2yDmPiAIAJSIk98UgB+CQoH8IVAdABBhR4seHFP1EVwA0MAIDBT5IIgKKdL3kgk801qjjjkyBswuPBQWAQAwI5FiQCgKZswSQFpH1zyItSdTEP9oAydgVcp1xCACxGDngEQS9oGMAkGBhQAAiMGCEkef9w4qV/7iAwRJUrYABFtp9pEIjpvAYwEVzpDHSIjl68E+bcDYWIUaQaJCjJAOVAuc/LBYRSy8zTtqaii9poClYAUCRwAEx0ODlp5R+Y8RASxSRp3/cJP/wxQqnGhRAL/9YYAcegmDxD38h4RDKQArcUCtB3GSQgRtCEECAPAxY4OlHAYxESz3vAICBRy/phEoBBdTgLB6/guQRLVsQ8M8twB0rUCz/MAOuMM4u888FjAWAAxSc/pPAP/U4+88pAKjh7j+Q2gJuAZEQIMY/wVH6BQtYeHDIAXly946zBFij2MFp/KNJIgsLoc4/MVAaw2+0kIPRFcitsGU98oghZgIHu2DJP+QYM4ob9CgVGQ0YeHAMIf/Is+QXVQXgRxdl/XPGwQLRsFTUMGR4GgDv/POKQPsAMLVpBjCywAU407VCClBJxRqlaAAwyz/i7JA0AAv0h+OOPhEytLUdAwkjh9hU6whFZ7YIZEwxHpSGakS3/VbMHRhJUjjfN1RQsTIpXO5nAE546LlBAQEAIfkEBQgAyQAsCgAJADIALACH////aGT3vJr0Z8zRJ6LMuZj0ZWLz/Pz98PL35Ojxjp/BGz2C7vD28fP3I0OFcGn1hpm9NFKPY3qp3+TugpW6tJX09PX5GTuA+/v9GjeTfpG4aGT2FTOAlaXF+vr86ezz0tnnIEGEJDyf9/j7ME6MMEOvCy95UGufQU3GmKfGTFPTDi+DYV/vZcvRXl7r4ubvHTiW7O/1+Pn7invTq4/puJf0W1zoEzGIKaTMOkm8Di9/amX3Ulbb2N7qo7HMPkvAITqb6u30Jp7KRlDMETCFVlnhRE/Ksb3VSVHPJz6i6+70WFvjupjzuZfyUFbYSFLOUVXZBy13Bit3EDR7PlqVOFaRy9LiHT6DrbnSq4/0Fjh+TWidp4z0o4n1YMHLHFGLtsLXa4Gu3OLsKWWXY8jQlYH1x8/gm4T1ucPZSmWbxM3fWcPQCjqAMqnNt5b0LabM2uDrIIy8IpPBXcbQbmf2qLXQdImyElqYh3j2pbPOjHv2iZu+eo62DkuMGXSrUFiqQbTOO7DOI5fEkX72cmr2BSp2NqzNQZCvT7zPjJ2/X3amIFmPsJPsNnujJJzIXXWlK0CpY2Hya2b3Wl2xG3yxSbjPmIPbZWS4VW+iFTOLCy1/d4u0EFKSSFKlVa/Bb4WwET6BdWz2Cj2DhJa8WHGjL3GeoInhFGCdC0GGF22mGDSPcGu/dW/EP4usNkiYCSx7JqHLkYDWpozlR5m1f5K4IjuJTlXXfnTJKUCOYsTNRZWyHDiFJj2LH0CDgJO5PUycLEKRenHIQE6fO0ubMXSfSJq1MkWVHDiHKaLKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACP8AkwkcSLCgwWSPDipcyJAhLYFTtDScSFFhomSqkjVJJquix48sCDL5SFKhj2RGku2oMdBUSYoYLCpsIuVlw4QLodjcScNSp2RpFrpRaGXnwZEFkRBcYtDMFIF2XkZlaCVKMkhPBL5KdtJoQVLJQnp9KPAiyU/JmCaT1IWjwaJdD/ZKNtXrwEl2bZawkcyF1xE2X+QdjBBhXMKIEyvOW2vxi6ITHRS0tJjs4oZxgzo8uHEuYs+XF0oeONpjFoE485qdqDb0xJNbUxJJ9imm69u4c+v2WNrmh2RwbNu0mqzRy9XJxLx8GueNTeTJen9MRbjV7ol1dSs3CP2lc4KQK4IzPpvsi8A4BqXvVjTQzMBKDS3blV8Qx5rr4A3qwl8QVjL0wPE3ECgCHbabGGgJaJBwgwUEACH5BAUCAP8ALAoACQAyACwAhwUqdf///7ya9Ghk92fM0SeizO/x9s/X5YGUuUJel8DJ3ODl7jRSj6Cuy2J5qLC81CJDhTNRjnGGsRQ3fVJsoAoveAYsdxI2fSREhkNfl3Rr9pGhwh0+gsLL3muBrgUqdujs8/v7/WN6qfP1+NXc6Jqpx+3w9rmY9HaKs9zi7Fhwo3KHsbjC2IKVugoxeYt69rK91Q8ze6y40ktmnA89gWpl91RY38XO3ydHiIWXvJWB9X1y9lSuwL7I3C9Crf39/mxn94Z29cvT46SyzbS/1mHCzOvu9OTo8GXL0Fq4xjlXkho8gOLm7xw3lA8vgy5Ni5F+9beW85alxXmNtae0z0dimm+FsHpv9kVPy/X2+vj5+0eYtAo5f5iD9UGQr6eM9cjQ4amO56+R9V92pz5clV5e6wsufhg1j9LZ5wtEiAg2fQ9RkmV7qggres7W5ERgmE6juv7+/ubq8Yqcv9rg609V11lb5nyPt6Gvy2h+rDdVkdfd6gkzejV6oiGPvq+70yY9oWDH0CI7nFx0pWNg8TRFs6q30Bc5f1pesVC+0B2BtBExfpKiw0FNxSBBhDOpzENQoDxKviKUwquO9T1alCOZxp+H9fHz91bC0BU4frvF2TetzVVuobuZ9H+SuIiavig/jhhspRRhnRFWlU9pnmVi9XBp9hc1gpaC2kpS0DFPjSpJimLJ0SpApxUzim1pvRdIhhxSjKKJ9RIxh4Bz9juEqAk0ejuvzUCzzn90yjtLnCVFh3Vvw97j7bOU9Clml2FitjdHuBJcmi5vnSCLuw5MjRl0qz2HqhVmoQtAhYJ09h6GuIydvxp5rxZHhY6fwfb3+rGT7Sagy6CJ4Z6tyiZilUe4zyJbkC2mzFtzpIR3zZyryS1DkiA6iFJZqwQpdTZTkDBOjFvF0JB/1puF9V69yUtVpm2DryWcyDVHmBpPihNCgzBzn0y7zzmApk+ku3tyx5mF3Yp70lm2xRx9sTZ8pC9wnUueuFCmvCxLiimkzDJ2nz+NrVeywyeiywAAAAj/AP8JHEiwoMAAIdwYGqJgRACDECNKnPgvwIIZ/wAA+IfhxkOKIEMOlIMBACBt8oBZ+ADmo8iXEAOgABBsQBSB4z7k0wKzZ0EDH1yVGiBmIKJ/bgheYgLih0+QKf75EAhloDYARATSyfNB45M/IZ5mi8jkHyCBA2QJ5PVP0z8FFQDg8AYp7jmeMDkJlBfmn7mBITC0sYM2iKwI/xb0ctEm1RcBAsJQArDh6b8uBgMYAnCG8D9CrQCgCOAJAJYBjyFHc/TByEsU/2z8CyLAYAhP/z40EdQGwAwDISaYGUoOMuRXABS81DtwEsEMAn8QUSKQQwmHIwA0GTDgSifj8gAY/3p5jqAp530JBvhhwEiIjyFsnRo6AMp3AbwAuIXpY4DB8RStAEAd3A2gzCRRhAPAEZYJVMhLaACwiA0FggYAbg0K9MRLm30ASDA+OOHbJT6NAOBYPSkAjkYAVMDMCD2tF4BLT4WQAhhokAgTNIaQsoQSG7iW4VMGkJKRLR/8AwEdQw40I40QxXEOANdUgkQRxwDwBIwZBmCAFA4ECSVBTMIiDTYEpNnHPzAMqcUMLGYAjUQs/GNMAQVgkmY/ACAwJBgATGEEAslJ1GYzeD4SCAHziNalAgCU8M8Q+o0pUFLX4FkANu148Q8eQxqwxAczfDABCBJpMZkx/uC5jAsVMP/YJQnQKeGGpQPtsQQAzvwSy0ZE4ArTeiP8IOxBCzgwECUtNflUAEbQIYdTzg755IzV+vSDAitk4IEm78X4pGW3sajRCniFFMAleHiAAAnHRhTAHwDAgk8g/VwDwBDxDnRJBix+oEC/BQUQwQeS4ELAP+VUgAG1FAWAR59ygGELBOmKNKcz/+gjjkDX/KOjk2MGMKUcM8JWFkwhxGCLNP9g8484S1iQbgBMwGAIGnG4FEAOyQUADSUfGBAjocP4I1Aoon0kcVcboXAzCRZUsIISfRKsHgj51PsLLABAcMRDAdwAwBJe3POrFD7fkM8/FiAwp08BHKGsQNkw4bQDAPBLsHARE8Qw90EhyHGJ1jHFIYe0PTsZQQWspPlPNf8ImW3EbPSdJuATZHy5vGZn4sUWayNerWZQ/zOF559LFIAcLPxBQhytD2s6SAEBACH5BAUIAKUALAoACQAyACsAhwUqdbya9Agtdw4vfBA0fBY4fvDy9xM2fQ4yegYqeN/k7hg6fwkseAswedbc6evu9fT1+Xxx9vz8/S1Mi3Nr9ihIiOPn8JaB9ThWkq6R9czT48jQ4G6EsKiN9cTN3kZimau40TBDrmDBy1hxo/r6/MHK3SSax19e7LSU87rE2aa0z2yCrltc593i7A8vhIqbv7fC2DxZlOHm7xw+gktT0lVZ4A1Chhg0jxMyiVFW2vL0+O7w9kGPr1/H0QYweQgudzpJu1jC0EBMw3uPt1Vuoh4/g9vh63iNtRtRiyKVw3du9m9o9n6RuL7H2z2GqjaszUq6z2TK0JqE9am20DVGtZ+uyq660tnf6mpl9wstfwUrdoeZvRA+gBBTk4R29hRinlVarQw/gw5OjyCLvCGPv3OIsggsexg1gpysyWXL0WmArRJdmqOK9UiZtVG+0DCozId39lxfsgg1fG9qvrCS6xt7sCulzGV8qk+lu0K0zio/phZGhQUsdzqCpyZhlExVpxdtphFXlgxGihdooQk7gUWWshMyfyWeymLFzWBitaKK4mhnuww5fpB/1XNtwnhxxixAqjF1oAk2fiahyxAxfiI8ip2H35OB2Ag3f0plmzBzni9wnB45h1OrvnZvxDh/pQQrdaKwzIR25C9xniiiywAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAj/AEsJHEiwoEGBEA4qXMiQYaaCGxpKnMiwUSIBWiJS3CgRCMFGWjiKVKgFh8AMA8GU0kBQh0AJIxU2GdiiFKSGRu6EFGglpk+CPwgyKLXi50ESAlkMhMOG5sEYRhX2JHhCz8EOBXdyrFHKS8GiMA0+lFBA4ZyoB8MSTCjwhkAlBqdOLOqTBAJDaBfGoViURkEUP0P4BGUoB0GrRocKrCkSiOBSD/Ny9CAZrYQWGn0uqBx15xXOc0HHNCLwkGjIMYNwziyQ8mnQfghCkbyjlJZMWhUiFTjpNcUrmweCAuWbI+viCkkjXw56JtFSapkz3M2Rrk+5iNDmFhkyD9oNCKQbRLT+M6xpgYi4BI17cEsp17Z/Durd++D2guujVmBImUuhha7dV9kdBTFyVGWfHfRDFAPFJt5ABD6oUERcCISEhFlhKF1AACH5BAUCAP8ALAoACQAyACsAhwUqdf///2hk97ya9GfM0SeizO/x9oGUucDJ3M/X5TNRjxQ3fUJel2J5qKCuyxI1fbG81N/k7kNflwYrdwwyegctdyREhhw+goKVu5GhwlJsnyNDhXCGsbeW80ZimRA+gA8vgydHiLqZ9GN6qcLL3S5Ni2tm93lv9vj5+wkse/7+/mhk9oZ39m9o9itKihEzfQsweaGvy7zG2qWL9fb3+palxZ6G9V92pu3w9jFPjZqE9dXc6XZs9htQi2V7qimkzMbO4DuvzV/H0Nrh61lxpNPa52XL0H1y9kxnnCY9oVNsoBg1j6250t7j7TlXkvP1+YJ09paB9fr6/JKjw2mArD1alOfr8gk1fI2ewXKHsYiavZ2syU5U1lTAzx+Ku6KJ9SBBhOHm7+vu9D5Lwa2Q9Ix79a+R9LnD2KmN9Rk8gDZUkHmNtvz8/ZF+9Ulkm8zT487V5OPn8E9pnhU4flZvooqbvsnS4jRFtQ9QkaWzzqq30WHBy3Nq9iOVw1Za4muBrhg1gnyPtxFDhVSuwE6ku0GPrySbx1q4xlx0pS+nzLS/1vHz9wxGigwufkdRzkJNx0W2zhQyiYWXvKi1z5+uypmoxiE6nJupyGRi9CpnmBJdmuXp8SWfylnD0DtLmypAj22Dr2Jg8Ons8xc5f6azziGQwHWKs0lTpRt8saCI4BNhnTyFqRVmoA5MjjOqzLGS7DaszSM8ijJFlgo4fx04ljBDr0BclqKwzDV6oqmO51xd6FNX3CymzH90yrOU9Nje6gk8g1GovDpIuxp3rkKzzneLtFFrn5WC2WtovCFakB6Ft2Zi9hZrpEiZtRdHhS5BrAQpdRh0q027z3JtwVBYqio/pkWVsh2As0+9zxhxqTuDqEq6z4191IR4zhFZly1tnGd9q1eyw5qF3V1gs1pesSVgky5vnU2huQ87fixAqUJPoHpxxzJ3oDZ8o0qdt2FitWVluF6+yV9e7ImavpF/1mJh0jBzn1dcrkCOrV9f7VxfsjR4oWJf63Vs8UGOrgAAAAj/AP8JHEiwIEE4k/6RMMiwocOHBZEQ3ACxokWGFAVye3exo8d/JkQIpPexZMNImP75GnjPYICXAUwKDCBGxqQzomIajNJQBZw6VIpBeKLTo4pJMAZWiMHGoIkZBlEc+AegKoASv4paDBDj35V27vCh+1cpJkVdA8vMUDBTC4Al9XKlegdggyiPmypcKRWEAIF4H/5FYJhPYJZ/Q/5Fysdj4DQAWrRChPAvWwFeRvxa+5ewocQApAA4+iegg8AOL9I0vVjpn7ICBbb5HfQvA0E1A1v/C5ABwC7SbQayfdIx4TDYBSAZcfev60OuogUKiCKiwygKqy0m/mAIuSFn/35V/yzyj1ZK0jzWASgm+bmWf86uebkG/kB7gyqyALDkB1OoMRNQ0MRHUgkEgEDF0HDRIjdUNUFVCwBxH0QB7ECJFlsUoYJHUpxBhRpIVGLFhM/JRBBMAaiQQAx1UAJHdg0FIEURMrxBlIkDidGAVVXdcFeMQ0hAFQBpIECiRYtIAAAt3YjDjToAOGEAQwFYcQEAmVjTTgX/SGhib89gQsYAA4hA11Qu1QEAM8QIFAwAVcDoEQ0UNBKKAGiQOUAHYFSwCH45VGDID0IIVM4/Vsg0BADpCCBAG3oOQBd5BamwAQyc/JNIJ/9k8k8cMv0CQC2OmjAmmfAAkIBLVACgjEAFGP9CQRooyCTGWys42sIMZKoBQKIFBbAqBdGUQh8ApBwJETgAPOKooyeod8OGLkFQAY9ayPlREwsAIIwumOgizAQwiBdjGJQckEEC1OKYwAYOVpXGGxWhiCNBBsSASAkaxCDGvQCXlGIccIShgrIBu2QAFQM1IAbCJ6LQxMMysdFgMtokA4AGUnRUYQkCZdCuR3AAUI4R/xiRCQBeWoRCCev5SgLEJ0IAgDt+/XMOsjQPWMw/RQCQAc0DBSADAKv4RQA+ACiiVYpsvFSQGBXk8BPPJRmwQAXWHNIMDBT8KBAKlZSQxgEUF12JVWpMKTAQFFgFg5EDqVAMAAtcWQVxBKlJAEQNkxhAdLBxVBJIJU1oNaAGi0jh1hmSwXQvipIBwXMAJZeVcEcDImGAFAcAAPnmF6kQOgzdSqAg6RehEEMOYGghOOse2xtwQAAh+QQFCAC6ACwKAAkAMgAqAIcFKnX///9oZPe8mvRnzNEnosy5mPRlYvRrZvb4+fv8/P3t8PXo6/IuQq1dYLMXNI5FT8psZvdJUc9XWeIdPoLM0+OJm77Cy93z9flsgq/j5/AzUY6rt9He4+24l/Tm6vGdrMlxafYILnjx8/dvhbAlPKArpcxgX+2otc+YqMZZw9AyRLJuaPYWNIFMVNR9kLcgQoQZNpASMYeXpsUhOpwnP41WWuGYhNu3lvLg5e42RrYlnsofQIPu8PYsQpFiYPCHmb1jY7dly9EVM4oqQKa0lO8/TMNjytErQKg9S7q6mPQ5SLopPqW5l/JCTcedh99IUs5ATcUMMXpsZ/aSosM0Uo+ukfSjivUtTIsFK3cQM3wPPoF1bPZOaJ04VpFedqa1lfTT2ugRRYYILHoJM3vq7fSojfUqSYrX3erb4esWOX5extBKZZvFzd9YcaMPUJBbc6W4wtgfi7yVpMVFtc5TrcA8TJzI0OE0q81mfKshksE9Sr9QVdgLLn6PoMKuutIFKnYWaKISW5klnMgpo8y7mfRsab2EeM0LO4ApZ5eQf9UkmcbO1uSMncANSowYc6ppgK1HUqNiydCvkesehrhqZfd9c8ldXem9x9scOIWgieFjYfJZW+ZTWN1VbqE/ss4JNX0jXZJNVqhZXbBle6ppf6wmocuercpUbaAkPYooPqIeOJcJOH90bsNtZ/YXbqYbN5R/krhDk7EfWI+ljOVRWKpTWqxdXdRnZdAeVI0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAI/wB1CRxIsKDBgwgTKlzIsKHDhQwEqjr0sGLFJJUsamx4YKPHg2kcMhr45+NCVQIzHoxlMORGMgnHaOQR8eEHgXoM5hgYY+AJIgNDDjlhcuAjgUIOviAosyAEXZXACCyiRU1RhF4E8rh6sGRBSRYlECzURGPILQQHWYS1aSCXVkXlDGRZcUJHI1wFLjXZJu/GDbpm3PTLdSRhkzURujysaxXFgVkRMtiaSNbAO1wPWBFYluGrT4RbCDQzsAgPEQcDAB5EaA3BxBYXazRFMBFjjYu4PhgYQmAhgYMTyr1N3CGgJJcOXEoCiOFOgYaLMtpa/OECXW50oarOXeDz7uBN5jm62txkIrC6bPe1+CLyRq/hi18HbHKBVYd0E9LfiHkgaoTUHdTGDHkt9V18DfWH4ILsMajfVtdxFRAAIfkEBQIA/wAsCgAJADIAKgCHBSp1////aGT3vJr0Z8zRJ6LM7/H2oK7LgZS5z9fl3+TuwMncQl6XsLzUIkOFYnmoEjV99Pb5cYaxUmyfCS547fD2JESGFDd9BSt3M1GOQ1+XgpW6NFKPCjN6kaHC/v7+zNPjY3qpByx4Fjl+qo71KEiI/Pz9L06M3OLsTGedt5b0uZj0RmGZlqXFCi19aoGu6ezzU2ygsZP1G1CLGjyAi5y/dYqzUVbZWXGk1t3porDM+vr8oYj1FzSOcoexNEW0K0qKwcrdN1WRmajHETGGxs7f6+70YcfQiJq9sr3VkqLDX3anydHhHT6CVm+ipYv12d/rpbPOjXz2P1yW9/j7GzeTH0CEDj6CloH1II29W7nH4ubvQLPO0tnnF0iGU63ArrrSNlOQXHSlnKvJJUWHuMPYDi+BrpH1YcHLDDF5DUKGT73QTqO6s5T0gXT2hnf2ZGHz5OjwR1HNqLbQkX71fpG4ManNboSvN63NLm+cDzx/Qk7Hu5n0ztbkq4/pe4+3tZX0JqDLtsHXPFqUSWSbYF/uNVKPu8XaZMrQx8/gbmj31NvoCDV9SLjPnYb1DEaJq7jRinn2dm33TFPTOleTw8zeZ2P2WVvlD1CRIDmZDS97NXujQY+vT2qevsjcP02eP0zCJz2iZXuqSp63PEq+DUuNIzueaH6sLkKt5urxGTaDIpTCcmr2JZ3IGXKqPIWpSJm1MESTeW/2hZe8VVng8fP3WsXRJJnGcWzAXF3pGnmuFGGdH4m6ElqZVcHQCTuCEVWUamX3pozlNkiYK6XMlYHZmoT1RlGim4besZPsHoS3Czl+FmiiLEGqKWaXjp/BX2G0I5C+tL/WWV2wTlaooInhfXH2invSeHDFHH2yOEi6GG6nIlyRfnTKJmCUd4u0KD+OITqJKj+mUlmsHlWNKmiYF2ulZWW4OoKnHH+zhHfPkKDCeY21ame7Uqm9V7PDBCl1MnWfkX/WPoqsQ5OxJF6SeIy1SlSlVrHCOICmj5/BT1e4ZWLYJV+TdWzXAAAACP8A/wkcSLDgwAC1uvSBEcCgw4cQIw6k0iLNQB9GJGrcWNDEnX+M4uXzAsBQRo4oI0r7N+OWLwKINgFA0DClTYIBJgCIVqARAZhe/tW6qTGAUaMDTaRZVqCAHUQ/4/1DYZAdUYEBdkDSQEGDDioNPzRJE6gpHqjO/m25+pDKAwAARmAAICbCvwDsAOhqWoCYOwolTLA1GOAAAHLv/qFxBmBIQxQUKOhqFUiZnn+CCBZyMxDXzQ8lKNziQkBxBxqCAyxIAxfuvxYfCipaMRCCTbtB//kSSE4o1i36NAhh16emPoJYBob5Z5ejCRppWg1EMyLNDpxHIQZzJBB6ygAeADj/kx6oHAAkNTfCGSgJ2z+rKWtpALCMnJ6SBjh+NCWw0D8RFtkUgAEIWEQBAkakh5IIAxVxVQBUwACWgigZMtiFhA24hREfUOjQUUhhGMAiYgw0QXERjciOBqIsENtgqs0FDjVhAPBPGR5itcBcrenz4lWpdCDCJFIIJI8maazlUC3VsXHEO0ElkONGAQwBACj/cCZQNwB4kCMTAKDz0z9sNDZlUW/l8k8wbQiUDAATeBhAEQDM8xMB7nR5pkQ5AeCfANao8M+bLOSYyj9eoEHAEeYtsGeKSAAwiUACSMKDPADUkSN4AHTgTBNwXsdWAv+Eo6ZAufTwDxNTmqADDf8c/1jLo3zqA4AL2uyhjRnn/fjhDjBEEOJgrlpkIwVjCIYhRx9EsMOAlUhTSYLLbgSDPiUAkMYDRfj6HYgpdQGqJpRYABcSyn6XigeneBAHrQLBQAMApDwxwADIAAFAFAJuASpcI6AAbw30CmDvvX6M0EF+KAXgw74wgAHAA7Sa4IAmcAhgzL33tgOAgw3TMEKHAZxgnUYRAFCFAJWuwPE1AIDx3XxbBJAKBYZ4e5eCVFBABMsCRMLHvdgAUMZ3ggDQhA8OxKxgABEUsQC1Ar11A9DWPNEGJQBQldIHkFzwTwc6+BqAEYMA3EVNdJoKtCU/ACCKzkVREYewBQVgKwKGaUbw4ge2avLDHqBUAUAGMFR7kBMA5KcBcwN9AMYIrQFwR+KKY2UrO1b6XVAETAiygJKZY2XEfADQsAi8pd9FBROVGMC6RgEBACH5BAUIAKQALAsACQAxACoAhwUqdbya9AgsdxA0fBY5fgoveBc5fxI1fA0vexU4fg4yet/l7hM2fbeX9AswebSV9MrR4urt9FlypAkzegcud4qbvq2Q9eLn8O3w9fT1+cLL3Ro3k/b3+jVGtamN9aazzq250m+FsNvh7Ih59j1Kv/j5+1da43Fp983U5E9pnik/pYJ09hc0jaCI9YaYvefr8kBclrfC2F11pkRhmCSaxgxFiRZHhUdQzY2ewEdimQo/hKSK9UFNxgstfmmArcTN37rE2Rs3hHtw9iWeypioxlRtoWB3pzWrzWuCrqm30AUqdkxnnN7j7WDH0GPI0Fxd6EtT01NX3ECOriKPvvL0+Nnf6j1alJ6H30GzzkRQoSQ8n1BV2LXA1mXL0QgseyFChCKVwnNtwaSL5BhxqTCozDuwzeXp8Z6tyg4vg1q4xtHY5jVIlyY9jCCMvH+SuJWB9r3H2ztYk1BYrD1LnExVpiNckRE+gSahy1SuwIt70pOA121n92h+q1hdsC9Dkwk3fS9vnfDy9yE6mktmnDR5ogc1fVeywhp4rn90ypupyB85mJeC9VOrvzZ8owk6gTlXkoN3znlwymtovBt7sBQzgFy7yCxtmzmAppiE3JmD9TByng45fZqF9WZ8qlGovSpBj5uF9XOIsmR7qZSB3AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAj/AEkJHEiwIEE1BhMqXMiwYImGECNC5ENqE6lGAzFI3MiQi0AaAzG64UgyohMbSkqqHGiRFJkuDCmSoqKyRJIcFEh94DDwC6khAstIrEKyhChSSjalJMVz4CSCnnIy9LmSIJGBFAoIBGqHlEeFYVTmxFKV1B6CB0ragIgjxyOGiwpmKLtJgUpQA+2WBAp0I0KDkaq2FKixqt6VBUaWTbvyYdOSMstKNqix8OTLEvnAwZzzE0EgDHMuvcx4oJ7DDQ2t/bsy0cAVAxGRvIo5ogZSUmonbDAwx8K1pJzoJthCDynFDLtOZk2QhUSttXsUJTUX8weCBc4M36iBiwbL2xkaewnf8G9pUhWqRuaohMQOgVcEXi9LNGJ6EqQ8EEyAeuN8UkdF9IUXAmUyXH8K0aRQHiXlMBp0EJUAYUGykfQVKVQZ9BhB40VR0AMrJSEQggJZMRBzAj1BUAekrLcRTxsOhMNAo5EXkW8NuaibG7QZNNeF4WGAo43cgSdZQAAh+QQFAgD/ACwLAAkAMQAtAIcFKnX///9oZPe8mvRnzNEnoszv8fbAydzf5e6BlLkjQ4W7mfSgrstCXpfP1+VieagUN30SNn2RocJSbJ+wvNRxhrFke6ozUY40Uo9DX5fo6/OClboLL3kFLHYWOH4IM3qWpcXL0+MRM3y4l/TCy91ziLIILXeHmb1XcKPi5/C3wtft8PbHz+DEzd8po8z09fklRYeNnsBOo7oFK3dLZpyyvtVtZ/dAXJZqgK1+kbgcUYuntM+ruNEiO5wMLn6Km792bPZSV9t8cfZfdqZHY5rr7vQYNY9Etc74+fv29/rW3elgX+4PL4T9/f6vkfRyavZ7j7ZET8maqccaPIE1eqKHePauutIcPoInR4jb4eyzlPQ7WJN5b/ZNVNRhx9AYOoCjivUOT5CTo8NkytH+/v7T2uhhwcttg6+BdPbO1uREYJh5jbUWR4YGMHmVgfWbhfW2lvP7+/1oZPa9x9uEdfajsc3x8/c4VpEJLHsOMnqrj/UQPYANSYw8hqkSXZoKPYOdrMk3VJD6+vwzqswuTIs9WpQup8xac6SojPUOQYUpZ5cUMolqZffe4+2giPVBTp9OaZ4qSYpkYfM8sM0ilMIfQIMdOJUwToxPvM9YWuM+S8ERVpUXa6Qub50YcKhauMYhj79bXOggOol0bsNYwtChr8sgQYQIN35Lus+Zg/UJOoE2Rrbl6fEfiLkknMdTv88nPaIuQq0yRLJhYraNe/VImrVBj69ofqtIU6Q3rc2PftUxRZQjmMU5SZl2i7RUbqG6xNkdg7abht5UrsDZ3+oEKXVcxdB8csiJe9Imn8o5SLs5gaYZNoMad62Sf/WehvUoosxXs8Oqj+iDd82xk+0mYpQbfbLR2OYjXJCiiuIxdqEUYp4beq9KnreVgtosa5odgLSMe/UsQaoYdKsqP6YZTYksS4pqZ79dvclWW65aXrElPYtSWaoeVI5Sqr4/i6wsQpEoP45OV6grQKdPprtAs84VZ6KPffUeP4MiW5BUr8FElbJpZe2JeuQmPpMAAAAI/wD/CRxIsODAAAgDGFzIsKHDgy+slLgFSIPChxgzHtRQCIBHAB7SXNRIkmGTQwCqRfv0rkOlIiVjGlTyr90/UgL7ALAyUmbJAMAAjPuXa8y/aAASXAzwggQPFY16kgwgKA2wNIKWHgDASeCgV/QASFAYgEQlggmSxAzAisjHDCkuFjEBgZJAVzoAsFDIokOHb91slft3pklJJBkAKNr3DUAgtf8ClALw4VunPQBuxfmHhFCHYC4IEDCD7R+JqSwAdCIgkAqAAxeb7IAwMK3Ca/+qFShASvQwAFCkNgxgBUA30f9kANgxMoCda2ksDjztaXfR0QAOCWdYFsAy0QR0Av/bXjDNv2+7C+QyhrQE+YUvzAHoQ6+PSwMZX3hoAyp9smr/qPCTEgp8VMk17xEUQA3/QNAMKK20A8AESKxlgApS1GBAggWRUUoH/wAg0AQw+ZSQTAGksMMJILCwmU8wxiijRkP8xEoajZDBoUYg/sNORk2A0IGIt7ywo0bOZBSACo5JMURSRzYkxUDhFCTGQgE8iUAASFxgAmQw1iiQDSNgFMAEAGxIBg3/2DEjQVUs8A81w0kBQAnX2HkIGW92MRAaiAgEBUMvoOmRAlG9uchPSAAjhRUbvimQD6tEMRVCkgpUSkGAZKokpp7+lAIPMUjhYpSZNgHIkB79MwErqB7/ZEcjdqAaACAAMHGOMLrg4pibP81BWx4qRJlCB8yEUoVAC8wCAAixsmKCBwlM0UEjBr1AjBIlRlacJv8AMRA1HCjAJ0lb7fBPccUOZEACJnz0ALYBSABAEP8IAMZAgfzzQknXADDENbfodZEGgQDAjDqzXAJAHiLZ6ec/NujxzwKVmCBISU0U7NEDG/8TB5qyhDPAAAtM08EVRYTwTw9yCMRIFchkFitVKoihAhIXhQAAzCafPMAoAAAyMgCxLPGPHF340AGCKIIqkMQCACH0ANJMGABHAMxgBBMAdMBTpicAkIkA+go9ggmXRGaHFG3nUQHUmVItwBNOnJz1BAcFQZBEE7FmlMbPcqDNiDN6nAPApqGa9GQskqAtRxT3Nd5QER35IE4sogAAAW6WN2RHDHl41MEtCISO0QuNEINfpgEBACH5BAUIAMIALAwACgAwACwAh////7ya9GfM0bqY9Pz8/SWeySpApz5LwGtl92Rh9Flb5Pj5+yM7nUlS0CJDhZGhwvb3+hs9gkdimeTo8dzi7JqpyG6EsIydv+vu9O3w9RQyiW1m95WkxPf4+3mNtU5pnoaYvfr6/Fdxo9je6hg1kGTL0czT45+I4GNkt0JOxx85mbOU7qyQ6Vx0pbG91Ftc5zJEsVJX20tT0hs3lActeGPJ0DtKvlRY3Q4vghEwhV1d6ThHuSU9iyo/piqlzC1CrR04hy9CrlZa4k1U1aaN5rqY80ROys/X5T9MxA8wg0JNxl1e6XGHsSREhqy50sbO4MLL3gwyehY5f3tw9jhVkbeX9LfB19Tb6BxSi3Bp9itKisrS4go7gjxZk4t69V/H0AYxeqqO9YV29mh+rKKwzKWL9Ymavuns8+fr8hp6r2DBy068zyGQv2Jg8Glk9jV7o1nD0A9KizaszUO1ziSbxyY9omV7qrKT9CijzC5unDuEqDywzhhyqSKVwwotfS9NjF92p1OtwBJem0RQoRA+gFPA0Fq5xgg2fXaKs+Lm7wUqdo6fwR2BtXdwxY191JB+9SNdkjVGtbSV9JemxlVuohFXlTxMnFlxpA1BhYV4z5aC2lBV2CE7iVJZq4WXvC5Dkj5blQ0vfjFPjTKpzF5e6xk7gBo8gEtUpn50ymuCrtrg63BrwEi4zjRHlqSyzT6Jq0yguLiW8WmArUZQy4CTuTF2oCagy2Bf7VtesRc0gVhcr1VZ4F5gujR4olldsTBDrmdj9mJizwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAj/AIUJHEiw4EBEAtEYXMiwoUNhZ7o8nEixoiGBpjJU3NjwijAstjiK3ChnopWRKAVeSNlQAsFEA88IOzSSQMo8DwkJtMlyIU6BtVLC6WnQ1UITMgvyGViCqEA9ToUhFAl1pClhbAaGFHYy5dWNLmZGPelCI0ejUXvCvMAhrdu3cAkqpBC3Ytu4Mip2hYtEmJeNMN8uEVilLsoVD6caXvxwsEBSFNuaJboy1A5hlxkzRKu588i1nisqDC0wycBBTvdOhJlEhxiBRQTetTqyL1zVDlcOLFN3tDBcwv4INDEwr8AwwmKL5GmQJ4y/yTEK2yKMATCCmXqqJm4dusBVOwX+SxIITEaozixiSqQhzLSwsFFX7hLIG3ZDJh7fGs8yML3BDnERJ8x1wiDwXWg8/dIGeUooIsxkjEUkTC7CjEcaQboNFNiFwtAFIVEBAQAh+QQFAgD/ACwMAAoAMAAsAIcFKnX///9oZPe8mvRnzNEnoszv8fbAydyBlLnP1+Xf5O5CXpegrstieahDX5c0Uo9xhrEFK3czUY6DlbtSbJ8HLHe6mfQkRIaRocKwvNQjQ4USNn3+/v5jeqm5w9ju8PZrga61lfTx8/gUN30WM4z09fnCy90JLnj8/P0LM3oLLX5sZvcdPoJGYZmGmL2ukPR4bvZYcaM9WpQQMISpttAPNHs5V5JofqwqSYkGMXq4l/Sli/W9xtv29/pqZfYXOX9gwctLZpzc4eyKm76giPVcdKWxk/RQVdjk6PBTbKBPaZ7p7PMgQYSGd/YbN5SyvtW1wNcvTYxOo7puaPZxavbL0+OLevVhyNBFT8uercrm6vHe4+0moMrO1eRyh7H6+vyVgfVly9EnR4gsS4usudI6Sb0WR4UZO4A1eqJuhLCQffWUpMSqjvXi5u92bPZmYvVUWN95jbZ+kbhJuc98j7eCdPUMMHmls84vp80xT43Hz+AOPYEVNIEOQIQpZpeSosNedqZATMMrQKn4+fvr7vQhkL/W3Ok3VZHY3up2irMRV5YTYZ1aucdle6qWpcV9cfYlPKBImrUdUozJ0eFjYPGvu9M2RrYkm8c7sM5CtM48hakbT4oMRYlza/ZBkK+bqskJOoExRLEhOpxJUtBSv9BziLJVbqFuar4QMX4fh7kZdq0INn5IY5uaqcfEzd/a4OudhvUrapkbeq8vcJ0OTY8gi7wcfrLR2OZUrsAcOIY2rM0qpMx7csiCdsxaXbB0bsJcxdCxk+yNnsAXbqYNSYyZg/VgeKgiW5BfXuxYW+SljOQVOH5hYrVnZrk/iqyahPVbXOirj+kyRZUjlcNGUaI8S5zT2udXwtAOOn4fhLZTrL+QftVTWasbPYGIetAQUZFYtMMnP42WgtoiQ4VBTp8kPIorQZA3fqUZcqkgV4+isMwdgbQEKXUWaaRNVadPV6mTgdhdXekmYZRUscJLnrdMobmeiOCahd0ydqAVZaFlzNJYXMVGlrOVgeJdXegAAAAI/wD/CRxIsOC/ACiQbBkUwKDDhxAjHrTmQKAGDw0latwoMMCWEQDkxbIDgEdGjigdBkAAgB+Bf+Aq5EGRsmbBADYqXCHwUt4/QgQDCBVqs+PQkwcpAGDEM4yZCiIGcuARw04UDB+QbgyAyIsNL9ZOBqAREhyjcwBAZOQgDACAEScASNCiNWIAQyTdVuhyclAjt27nNgygB8AeKf+AoG3AAWWABgA8fDEBgILYL0+8NFJnIGOARABS4XkZRtI/LY67LeMgVEKKLzeHBm0B4NK/OS/P/bPmWGnYVwAc1FV5A0ChgaSO/WvjWM+/Cg7iHhhuMIAHAJts/1MFIEhjxwds/P+TgBElChAAUkjq8/YVdYgBOAxinTLAoFbdBDYQ8r7oVhRLiECUfwRWh8KABdokAgMOLONAKwZIdFSCAmkh3lsAjIfEQwGUkEUDQ9CVIApK+cFFGECgAUALsBmEAmRu4fBBgpP8k04BujQVyz/OGfTKPw0s4QgAlfSnkTr/2FJAAcDwhFgrDvGGwD/X0WCkRFBms6QuO2nzDwYO9ZDHinZUwF+BPPwTy5IF4DGHJlSqtAUF/+BgwpUSiaABAEouuU4F3USoEgclHEjhP5OQtIkfmwBQgR54HnoXnQJREBZHKBRKIQdLvLLEdxq9ksgPbyWCSE0bClRjTR7EdYYN3Tj/WkmBqHHUBQAqjPLCABZsQ+qqHO1zzzbUpMSBUkcIYMQAzIoTHE0b+VPHQMygtAQATgggABvMMksOAMwZheBAgfxDhQUCBWMHR4YAEIq2TXQ7QDMA3HJQGxhQEAQCXYBKEBE2bQGAINoKQES3vgCAiHVxAfbPENAStMIOAjHB0SDd5IBMwWoYEcwyNZRQowpYRBPMNmMAwEAANUIykABN1KQOAKJQUjAlkADQCge0JfuCQNGcccKMpjzE20aDQDZDGViUkQsAMfSAmhP/CADLQKf8Y8Kh//SAQQWAATBECf/8KIhAbuggUC8APGGQHWAVRYgJHpiwxEB3U131IyH8PJP11gT1EDHXxwJwhEACrNDPMnYIyjWHXfxjRyDxIDPK0+pEmqB1KYT95eCPc4hEKw2YMsSloW8lG9cBAQAh+QQFCACmACwMAAsAMAAqAIcFKnVnzNEnoswILXcTNn0UN30MMHkKL3gOMnoWOX4HK3gFLHYMLnpwhrG2lvRuZ/YFKnYQNHyClbtyavaJmr44VpFsgq+yk/SvkvRpgKxcXenb4eyrt9EcPoIJNHseQIO/yNzFzt+bqcgLLn/q7fS7mfRhwstHYpnI0OG5mPRoZPbx8/eFl7wuTItEYJg1e6OmjPUPL4QHMXpPVdc8WZTS2edbc6Rgx9CiifUWM4s7Sb0hj74rSoquutJrZvdMZ5wILndOaJ4pSIkORIYmPowaea8wqM0fiLmtkPSBdPWwkuxTV9xkytFWWuIYNZAyRLEcN5XZ3+oXR4UcOIUSMn8jO54XbKVzbcE2R7c7hKkspsxQa5+8xtpVWq1auMY9sc43rc0PT5Ds7/XN1eSHd/Unocs+W5VeYLMvRJMKP4QUY5+WgtunjedjYPJaxNFgX+4mn8pJZJsoZZdOVqgilMJJUc8qaJglnMiFdvaQf9aotc8JLHxnfasRVZVDtc4kmcYZdKpHmbURPoATMojo6/JCT58ELHcIN35tab4po8wehLZBj6+dh98RWpgNPYFYs8Mra5pevskvb51HUqMmPaEcgLM2U5AwTowTXptIm7VjZLdoZro5SpogOpqiiuI9TJ0aTYlCkrAwc55Cj64zd6EmhLIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAI/wBNCRxIsKDBgwgTKlxoCtIBU1wYSpx4EMglihgTVgCSsaPESAOlLFhBkIuNAxc9mopiqkIGg3oGgjT1sqLKghwL8ilIqKAjgSZuQmS48+ARI0JNJRh4CQHFE6buJCUYZQHGlzuShjAF5ETOjn9MlQFk6ofHClYjXjXIcqrbtxhJwp1LdyHJE0tNya2LkFCFgVb5MpRTEKpghGWQEtzKtmAPt6VuxpwaWSAThhehBhYaEZLHFm5JbjZVavRhg6AIc2V8OqHZ1n2j9JzIcunSthgnq8xJQ+CCx7AH7qmDITjCGaYuCE3isScUgTAIFjJu6gnF1wWXGLSEkVLCtg8lRksX+JUhA4Z7TLERCJpgFYJ4VL5BaNjgATF0dZjSMciUDVPOKTSbAkltthlu1PFkynMJFmQWcgL5IJBT1J1nynz9JcgFhQ0e9B9cAQEAIfkEBQIA/wAsCQAKADMAKwCHBSp1////aGT3vJr0Z8zRJ6LM7/H2wMncoK7LaGT23+Xuz9flgZS5UmygQl6XFDd9sb3UYnmocYaxamX2Y3qpJESGM1GOEzZ9IkOFBit3ZcvRQ1+XBix3t8LXCDN6gpW6kaHCwsvdu5n04ufwNFKPYsnQHD6C+Pn7Fjl+/v7+X8bQboSw8fP4bGf2fI+32+HsDjF6CS54xc7fCy5+ETR9IEGEFDKK9vf6KUiJ/Pz9TWedQY+v5+vy+vr8rZD1t5f0OleSdWz2SmWb9PX5Jj2iL02MM0SyGDWQaX+s1dzpLEuK2d/q7fD1C0CFq7jRd4u0WXGjcGn2CTV9tJXzyNDhvcfbU1jdN0e4usTZRU/LCTB5ManMUGqfVW6hRLXOYMHLzNPjR2Kam6nIT1XYjXz2lKTEED2AI12SCCx7LUGrDy+DmajGeY62X3enHTiVPbHOqbbQH4i5Xname2/2KaTMsZP0QFyWPVqUGG+nFGSfiZq+G1CLloH2GjyB0tnn5enxLabM3uPtztbkVcHQFkeFITqbKGWXkqLDbIKuqY31hnf2GDqAJkaHoYj1RGCYrbrSjp/BXV3qYmDwnazJZ32rZWH0WsPQN1WRSlLRDk2OEFOTC0OHEVeVpbPOGniunq3KTqO6VK7AJJzIGDWDc4iypozlITuILm+dHYO2CTmAHH6yR7jPJZ/KTrzPfpG4h5m9WrjGN63NMU+N6u30orHMrpHrk3/2TlaonojgIpTCF2ukDEiLO4SoFWehHVKMSJq1lqXFNXqiS7rPjJ2/WFvljn3UlYLbiHrQm4T1QEzEg3fOPUycE1+cKmeYNEeWWLXEN1SQRlGiL0STd3DFW3Slpov1X2G0Z2a5fnTJhZe8fXL2GXWsO0m9I5jGmYXcEVqYT6a7K0GQGEqHNn2kMHOfPluVaoCtVFqsc23CXbzIIFmQRpazU7/PKD+OS5+3Djp+BCl1cWzAgnT2NlOQtcDWPIapU62/H4y8bmq+Uam9RJSxM3ehM3egZczSbGneAAAACP8A/wkcSLBgwQAIAxhcyLChQ4MB/IAYdiDHw4sYGQaA8A+AR1cWM4rEOEtLDSpJugCgonCkS4ZUAExCCAbAmpYvcw708+9JigCPAMDBGSDFEixUhuDMGeAPlRFL//XYAAAJgxgP/gwMMARRRwAYwEQVGaDTwJkEm+oQyEjs1icA1OkbxyHrWIyB/imZZOHfkoM5Ai05sVTrnhIC9dm8e/EAACf/6AHowNigoH+8CBD4BwvAk8oO/wo5oPJyRgX/zmjQ7A4ACNANU7zyCMBFCpEp5AA4BU7fA7+wY4N5BCZkxgCzqHrkQC+4w4QvA5w4sMYJVJ3YDyLMabTTsElUemT/h5hxCFzaAISgHi9dEBYwN0CfgALgCDZvxW4BYKQVe4AFSnylhFsMdQIAEZXUMcCC+FTl3xIw7KYPPxzEsMRdOSiRQSQCJLLgACLMA8AIOgWACACeeCFQaxHcNQsAhQgggC0fDhAPACHo1IMW7/wDCGIaEPLPDQvxcKCME/jw4TQAHKDTCRyYIVAsKvzjyz8sLHQCDDNUImMU1Syo319MCQHAPQIVkAsHQNy2EAMAcCOjjEEoAwA0xrkUgGPvqHKPKmZMxhgPGABgBDGVRJJMDACAkV0KCHwFwD9ruMnQCxZ4xCgAMDjJ3hJrMLDGhRcN4UQEFnCxxh/bsZeQcwQZ/0XLMAj4YWlGPSRxABVMwGrQDS5I+g8pQxznxx0DxbCGeC7lcOIR03hzjIiU5NmQH4yqswMvPTJw60UByPCPG5LYItAUy/xzAGw93AGAKgWs9sUe/zhKFpxj/CPPQLgAQApsSfyjTgEFWKJZPgAw4GsA9EnyjwA+nAvABrDliAfBb2j2BQBQLIwEAMQIFEQd/9QCgBwKddCQo6cQXIAXJXSGyMIGXjFQC2Q0OJO9Bk3yjwEwSJGLy3Sc8g9kIxnASJyV/FNJMgCYwERBERPUq89moNLNPYbcWexIEfUBABpHzAAACoK05IZDOQwjLDTr6cnDMCb80wcDrA6UhsgFcTD0TwoLDEMJKRB8XWIKN/xU0NoC7dtQq+NFLrlDpiUTyT+YCETL5Jx3ntEa/0DReUAAIfkEBQgAwAAsCQALADMAKgCH////aGT3Z8zRJ6LM/Pz9ZWL1ZWLzSFHPJZ/K7fD28PL3M1GPHj+DpbPOM0WzIUKERlDLspP0EDCEupj0GzeTSlLRc2v2cYaxbGb28/X5N1SRDC5/laTEj5/By9Pj5+vyr5L0uJf0rJD1LqfM3+TunKvJlYH2GDWRYmDwjnz2Nka3ITqb4+fwb2j2U1fcUViqK6XMUmyfo4r1d3DFHTiWOUi6t5b0PEucV1rj9fb6HzqILUGrX17sJz6jKKPMs5TvdWz2t5bxY2DycGn2d231Kz+nmYP1P0vCcmr28fP3CjN7Ci95VluuEzGIVFnfIEGEETZ9aWe7sZPsZGS3YV/uJTygPEq+PUrAJqDLEjKHHTiPuZfyBy13sb3VETN8t8LY9/j73OHsXsbQHD2CBSt3TGedLUyL1dvo4ubvFjl/ipu+ZsvRd4y0DjyAYcLMVsHQSWSbb4WwEVaVCCx6RWGZWnKkZXyqPbHNTbvPRrbOfHD2NKvNC0GGHFGLKWaXH4i6rbnSMUWVqI31u8XahXjPE2CcF0iGGG6mDk2PDEeKDjB8vsfbbIKvVG2hO4WpI5jFi3r1zdXktZX0FTOLSZu2UFXYf3TKL0OuGTuAT2meaYCsKkCPXF3pLm6cTVTUr7vToIj1s5T0IpPBp43mjXzUkoDXVm+iXb3Jl4PcGXOqrZDqkn/2Jj2hooriQk3GgXT2H1ePFzSNnYffnIX1TFWnW1znFESDJDyKa4GuRVGhmYXdR1KjZGHzJqHLQU6fR1GiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACP8AgQkcSLBgwTPA1BhcyLChw4WfHkqcSBHYA2BnYlTcyLGjx4cI2QiMyHDRR4MsgKFpqAkYl4cXT07UyFDkwJcpZT4kEYZhH51Agx4UuIhmxZXA1ghVKLOT0Kcvn8pEKrWqVatJFlK96vCEJa4bqxgw2PJkT2BOXWLkuEXgVo5l83RcZbXXQKXAcjSsYhUMF1sFf2Y1CAbYhrEFf0n1ofZhDbAbY9YqwAPYHMgNzxY0iXnhYGBGO0tEKJA0R9MybYqWqOUj6qpBPuL9+bFSQVkUXwOlIhCEwNgd78hsWaugqo1pq2Jg6KqhEoIwBAL6eGUsYofHCwJ+RPBzxTOYgCkjam2QRse3G9VcDJ9zdUXzAl+Fcr/QE32Hc5pTsX+/v3+BAQEAIfkEBQIA/wAsCQALADMAKgCHBSp1////aGT3vJr0Z8zRJ6LM7/H2Ql6XgZS5z9flwMncoK7L3+TuYnmocYaxEjV9uZj0u5n0sLzUNFKPJESGamX3Lk2MIkOFUmyfM1GOQ1+XByx4BSt2FDd9CS54CjN69PX5lqXFwcrdPluV/v7+DDF5kaHCS2acTmiegpW6Di+CWHCjcWn2prPOKEiItZXz5+vyY3qporDMzNPjrbnSHFGL7fD2U2ygt8HXFjl+1t3pNlSROliTa4GuiZq+8fP3fpG42+Hs/Pz9GTuA9vf6IEGEnKvJFjOMRE/KkqLD4ubv5OjwFkeFdWz2vcfbR2KZbmf2HD6CaGT2ED2AztbkjJ2/X3amjp/BdYmze4+2K0qKVcHQCi19NHqiaYCsJZ7JXHSlxM3e+Pn7TlTWO0q9usTZZGHzNn2kEluZm4T1EjGHmajGZXuqydHhYsjQoYj1p43mhJa8L0Ku6+70q4/1SbnPEFKSWrjG3uPt0tnn2d/qj37VJJnGSFHPloH1IZLB+fr8QrTOsJL0Hj+DJz2isr3VYcHLDUGFqbbQTqO6WVvmL6jNYF/ukH31O7DOeIy1GjaSM0Wzg3X2m6nIaH6rGz2Bx8/g1NvoQEzEeW/2GXasCjh/HoO2PIaqfnL2bYSvSVOlhpi9VVng6ezzUlfcHjiXXV3pZcvRLm+dU63AEjJ/FWehT73PII29HH2xDk6PCTyCQI2uRGCYOkqaIjucNqzNFWKdCTV9H4m6EVaVh3f2QE6eYMTOJkaHdG7CDS97KqTM5enxpYv0MU+Ninr1loLahHjOGDWCgXT2YmO2MESUnIffDEaKSp63Q5KwGnmvF2ymKmiYBCl1+vr8rpHqOEe5bGi9Xb3ITVaoHzqISJm1GG+oI1yRSJq1DUmMKWaXJDyLv8jcKj+mW3Oknq3KKT+OV1yv4OXuH1aOJWCUK0GQVrHCUai9aoCtU1msNUeXOoOnWLTDXV+yKGSWfnTJWl6xaWT2eHHGRU+8bmftGUyJXmC0TqK6M57DcmvfAAAACP8A/wkcSLBgwQA/5gQIYLChw4cQC06rItCKAYYRMz4kYUDJHBIHEQGYgAHAJ4waUw60VBIAgCdhQAoMYAUADCE8OBBRyXONyx3udrg0ITMAFgA48uSoJOTgwoU8CSoAcIyUoAEDlvUCUGamjhIuAdBA+S8ADAQ8rCggm1LICA6iBFzFuozDsGkz9VRBELPgHBdhxbLNuAQALQEChGHFCgoAnoFP2QbwuUaMnkoddvLUAUAOYkmLByQDQCVjAC8ARi3M8k9J1HMACCEW4GexOwB6TFcBUCiAgWEefkSd5mKDotm66MD5VUSM6XMdAGjIAWDN4IyFAEAyNdsUJACIUgb/0IGBwwUZTaP+E4IAwAZx+MT9AoAlvcaFYoRcb0tjUNhKLeCl3oBl+abEKETo0YYOmhGoXgB4UDIQTPtFFVmFM1HxAQDgYMMDAP+0gOF9bTigwSeWYPjDBRwg0YhAywzxTx4OlkXDPwBw4JKIDgUgAQDV/KPLQHsAkMWIEAXjQQ7suJHKFP+c02N7ovxTwQsCQcAckj3iAIAzBBDwjzOCNRRAFgAo8o8AukDwTwQdfMClmdl1EyYBzYB3XQALAICEQAJ4IswyAFgxZ0M6/FODIQTwwg1p+53DgQpVCsRIKf+UcahBJKCZwzdTmCSTmS3880skSOCjhkn2DRiAGGt0//BPCSYQgSEJheSAo0BVOFfjTEQgyCVCluCgAAyb/hqRDA5eWCNrzVKRxRNWIGJrjfcQJOF9zAb2xEVRhdHQLv84YVppHWjDyzWo0JcstP9I8iCanABzyj9uMPHPKA5W8NA0bSywRhk/YBTAEwB88U8dAp0xY1TbFkTNP+MItMQTBF0wA0MBNADAHwI5ssU3/zzGU6kE+UuQARkAwE037MDDQQmJBkCDywr/wwkAGQjIEwUGcVCJQmv8Y0sBdYSZJwYgEVHSFPOgA4AHGw9YyUBcEERCBhzwUYAjd6Kzb1k/IMCBQDxQkWxBV1+9hEBCeDBFAXRvEWYX/+RWoAF6KDqhn7Kccu11AcCwckoNYwN+X9FH012AKwBgsHaNP7TMjSuc2DJzooqrtAQGBPVSdecqASzDGgqAoHhAACH5BAUCAJUALAoACwAyACoAhwUqdbya9GfM0SeizAgtdwkveA4yegYsdxI2fRg6f7iX9Pf4+4OVuwwweYmbvnBp9uLn8Nbc6Y2ewOrt9B0+gjV6oqe0z4J19puqyFhxo0ZimZWlxQ4vg6u40bSV9G6EsE9pnoh49Wtm9ggye8vT43Rr9ik+pWVi9LnD2BBTk0mbtbvF2nhu9mFg7wstflpb5iafyiVFhzdJmBJalxA0fHaKswUqdqGvyzNFsl5e6wk0e21n9iM7njtYk1bB0BVmoH1x9kpUpSSbx0BMwxhupyCOvrXA1h45l0xT1Jinxh9AhL7H22DFzi1CkTyFqS5CrQo4fgxHizywza660qOxzWFitVldsEhRzpSA9UO1zhg2g4589QcreVC90A5Nj1VuoSFChDlXkot80wtBhihll1BV2Q8zejhHuHdwxbeW8YJ2zCKTwmR7qlBYql29yQYueFNX3COYxXOIspB/1RRfm5+I4LGT7T+LrFeywgo8gpiC9UGPrws6gGtovC5unQ4vfD1alGZ8qq2Q6lCmvMLL3Th/pXJswRNBgkSTsWbL0QoteoWXvJmF3hlNiZ6G9ZeD25F+9YCTuZOB2C9wnLuZ8wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAj/ACsJHEiwoMGDCBMqXMiwocOHYR5KVEgoIaCJGCu16XGwBkEKGRtqgTOwToxKKAZGIDgFIceQgGwI9FCSQMhKLW8WDKJz4kocB/v01KlnaCWbGV8YNABm4kWjN1dWAnNDpyKBTwR6hPpwSlOBCbhGFUu2LEEzAjeabQhG5sBHUHM2bHmm4JxKW28iZTKRZqU0TMUiwonQo1KClCqhvdlShcOqBIFUqjNUqkC+C20ertTiCMq1Cq+aRbt4oRHQGU+jnlgV8mqHeV8vDPTQtdklD6Eg4jsJb8YyHScmEtgIdVXcBoUQLCT7q0DaA6X4uFnXp0C5PZ0LHGIDZMMFA8kIJkQa8g9CAsqlKET69CbIsAQLEJxeqYJshV2G39/f0zL//wodx1VAACH5BAUGABYALAsADQAxACcAhLya9BM2fQgzexY4fraW9KqO9RE0fHdu9rOU9IZ39nxx9iI7iVG+0Eq6zylAj0W2z66R9EGzzg88fxE+gAk6gThWkQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVLoCWOZElWZqqubOu+cCzPtIjWJILvfO//wKBwSCwaj8ikcslsCicwglOVGA2mJAWWCd16v+CweExmQsq7SPlGbLC66KEkzI7b77EQACH5BAUCAP8ALAoACQAyACwAhwUqdf///2hk97ya9GfM0SeizO/x9sDJ3ODl7s/X5UJel4GUuRQ3faCuy2J5qDRSjxM2fQcseFJsoGN6qTNRjnGGsQkueJGhwiJDhQsyeujr8iREhrC81MHK3QUrdoKVuiVFh5Kiw/Hz92XL0RA0fB4/g7WV9MjQ4aWL9cXN335y9vz8/Wd9q3Bp9/7+/hw+gl52pszT42tm9g4/g/T1+WLI0O3w9dvh7Pj5+3KHsg8vg13F0Nbd6ShIiVpypKqO9ExnnRY5fyulzLK91eLn8LfC1yBBhLCS9URgmI+fwSQ8nxo8gDlXkjZGtvr6/LmY9Pb3+r3H2ytKimqBrXRr9lZvohtQi6GvywwweX6RuFlb5WHBywstfi5Mi6y50tnf6kBclgg1fU6juidHiD1alRw3lFO/z5uqyLnD2NLZ53WKs6GJ9Yucv5WlxSCNvYp69mNg8kFNxUeYtIiavYd39hMxiClmlwo7gUKQryKUwqa0z3yQt0xT0zSrzd7j7eXp8S1Bq2hk9jV7o6660ljC0FRY3p+H9UhjmoWXvCWeyRExfnmNtam20K2Q9DCozV9e7DdUkE27z6SyzZaB9TBOjCk+pW2Dr4999TpKmw1MjhdJh5yF9T+yzlhcsE9pnhg1kEplnI2ewDFDsCSZxRYzjEZQzKOK41q5xhZrpBhxqRNcmRBTk4N19lBW2ClAj0i4z5J/9pinxn1zyRl1rBZGhTlIuxt7sDyFqTxZk7uZ9GJjtk9XqXRuw7S/1p6typaC2hY0gTitzUS1zhFZlwtEiAs4fh+HuByAs5mE9QQpdVFrn1SuwB6Etmdj9u7w9hk7gCA5mmxpvUlTpj1LvgxHixRhnVGovHdt9juvzbOU7npv9q6R6uvu9KmO6Il60bvF2SM8ijJGlSmjzB9Xjx1Si0JPoJuF3mVi9ZB/1i9wnSJckD+MrTBznhw4hpWA9StpmD6KrCZhlFezw4R3zR1UjTqCpxVkn1/AyhVmoW5p5G1n70uft4h53RZnokuetwAAAAj/AP8JHEiwoEAXKaYsweJjEA6DECNKnPjPyQIAAEgwwKiMG8WPIAmGAvCp0JNc3XYBUPYwpMuIfgDUeURlgM1cKou8DBmgZ8+BkgDEESDgic0BpgCw2PnRyYEFLBYccBLg3xwAhYgaOvrEAwWmE234+IcRwL+OAS4AaEW0xRGb2QAgARvRSRUASvJ1MycNgCcc3wCIIiqgxaYn3gDMGRjAxokvLpgGCKzkHB2BOAEUoTHGAx/CArQAA/BFYIATDASqcbIzgBqs/6jkEph0SoAYFgAAKsWnCRYAVwZCWRjrbpGqLgPcffRPgCGBcZFUTQCpLAAGgyIL9PNvwT8eAJIg/+dpCYAWgTLW/OsGwAFyHCckXTlgoKAILEbQvB40HmSAQboFIpAAKnQCACP9SfQfWSvRwBQNuAj2yDmPiAIAJSIk98UgB+CQoH8IVAdABBhR4seHFP1EVwA0MAIDBT5IIgKKdL3kgk801qjjjkyBswuPBQWAQAwI5FiQCgKZswSQFpH1zyItSdTEP9oAydgVcp1xCACxGDngEQS9oGMAkGBhQAAiMGCEkef9w4qV/7iAwRJUrYABFtp9pEIjpvAYwEVzpDHSIjl68E+bcDYWIUaQaJCjJAOVAuc/LBYRSy8zTtqaii9poClYAUCRwAEx0ODlp5R+Y8RASxSRp3/cJP/wxQqnGhRAL/9YYAcegmDxD38h4RDKQArcUCtB3GSQgRtCEECAPAxY4OlHAYxESz3vAICBRy/phEoBBdTgLB6/guQRLVsQ8M8twB0rUCz/MAOuMM4u888FjAWAAxSc/pPAP/U4+88pAKjh7j+Q2gJuAZEQIMY/wVH6BQtYeHDIAXly946zBFij2MFp/KNJIgsLoc4/MVAaw2+0kIPRFcitsGU98oghZgIHu2DJP+QYM4ob9CgVGQ0YeHAMIf/Is+QXVQXgRxdl/XPGwQLRsFTUMGR4GgDv/POKQPsAMLVpBjCywAU407VCClBJxRqlaAAwyz/i7JA0AAv0h+OOPhEytLUdAwkjh9hU6whFZ7YIZEwxHpSGakS3/VbMHRhJUjjfN1RQsTIpXO5nAE546LlBAQEAIfkEBQgAyQAsCgAJADIALACH////aGT3vJr0Z8zRJ6LMuZj0ZWLz/Pz98PL35Ojxjp/BGz2C7vD28fP3I0OFcGn1hpm9NFKPY3qp3+TugpW6tJX09PX5GTuA+/v9GjeTfpG4aGT2FTOAlaXF+vr86ezz0tnnIEGEJDyf9/j7ME6MMEOvCy95UGufQU3GmKfGTFPTDi+DYV/vZcvRXl7r4ubvHTiW7O/1+Pn7invTq4/puJf0W1zoEzGIKaTMOkm8Di9/amX3Ulbb2N7qo7HMPkvAITqb6u30Jp7KRlDMETCFVlnhRE/Ksb3VSVHPJz6i6+70WFvjupjzuZfyUFbYSFLOUVXZBy13Bit3EDR7PlqVOFaRy9LiHT6DrbnSq4/0Fjh+TWidp4z0o4n1YMHLHFGLtsLXa4Gu3OLsKWWXY8jQlYH1x8/gm4T1ucPZSmWbxM3fWcPQCjqAMqnNt5b0LabM2uDrIIy8IpPBXcbQbmf2qLXQdImyElqYh3j2pbPOjHv2iZu+eo62DkuMGXSrUFiqQbTOO7DOI5fEkX72cmr2BSp2NqzNQZCvT7zPjJ2/X3amIFmPsJPsNnujJJzIXXWlK0CpY2Hya2b3Wl2xG3yxSbjPmIPbZWS4VW+iFTOLCy1/d4u0EFKSSFKlVa/Bb4WwET6BdWz2Cj2DhJa8WHGjL3GeoInhFGCdC0GGF22mGDSPcGu/dW/EP4usNkiYCSx7JqHLkYDWpozlR5m1f5K4IjuJTlXXfnTJKUCOYsTNRZWyHDiFJj2LH0CDgJO5PUycLEKRenHIQE6fO0ubMXSfSJq1MkWVHDiHKaLKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACP8AkwkcSLCgwWSPDipcyJAhLYFTtDScSFFhomSqkjVJJquix48sCDL5SFKhj2RGku2oMdBUSYoYLCpsIuVlw4QLodjcScNSp2RpFrpRaGXnwZEFkRBcYtDMFIF2XkZlaCVKMkhPBL5KdtJoQVLJQnp9KPAiyU/JmCaT1IWjwaJdD/ZKNtXrwEl2bZawkcyF1xE2X+QdjBBhXMKIEyvOW2vxi6ITHRS0tJjs4oZxgzo8uHEuYs+XF0oeONpjFoE485qdqDb0xJNbUxJJ9imm69u4c+v2WNrmh2RwbNu0mqzRy9XJxLx8GueNTeTJen9MRbjV7ol1dSs3CP2lc4KQK4IzPpvsi8A4BqXvVjTQzMBKDS3blV8Qx5rr4A3qwl8QVjL0wPE3ECgCHbabGGgJaJBwgwUEACH5BAUCAP8ALAoACQAyACwAhwUqdf///7ya9Ghk92fM0SeizO/x9s/X5YGUuUJel8DJ3ODl7jRSj6Cuy2J5qLC81CJDhTNRjnGGsRQ3fVJsoAoveAYsdxI2fSREhkNfl3Rr9pGhwh0+gsLL3muBrgUqdujs8/v7/WN6qfP1+NXc6Jqpx+3w9rmY9HaKs9zi7Fhwo3KHsbjC2IKVugoxeYt69rK91Q8ze6y40ktmnA89gWpl91RY38XO3ydHiIWXvJWB9X1y9lSuwL7I3C9Crf39/mxn94Z29cvT46SyzbS/1mHCzOvu9OTo8GXL0Fq4xjlXkho8gOLm7xw3lA8vgy5Ni5F+9beW85alxXmNtae0z0dimm+FsHpv9kVPy/X2+vj5+0eYtAo5f5iD9UGQr6eM9cjQ4amO56+R9V92pz5clV5e6wsufhg1j9LZ5wtEiAg2fQ9RkmV7qggres7W5ERgmE6juv7+/ubq8Yqcv9rg609V11lb5nyPt6Gvy2h+rDdVkdfd6gkzejV6oiGPvq+70yY9oWDH0CI7nFx0pWNg8TRFs6q30Bc5f1pesVC+0B2BtBExfpKiw0FNxSBBhDOpzENQoDxKviKUwquO9T1alCOZxp+H9fHz91bC0BU4frvF2TetzVVuobuZ9H+SuIiavig/jhhspRRhnRFWlU9pnmVi9XBp9hc1gpaC2kpS0DFPjSpJimLJ0SpApxUzim1pvRdIhhxSjKKJ9RIxh4Bz9juEqAk0ejuvzUCzzn90yjtLnCVFh3Vvw97j7bOU9Clml2FitjdHuBJcmi5vnSCLuw5MjRl0qz2HqhVmoQtAhYJ09h6GuIydvxp5rxZHhY6fwfb3+rGT7Sagy6CJ4Z6tyiZilUe4zyJbkC2mzFtzpIR3zZyryS1DkiA6iFJZqwQpdTZTkDBOjFvF0JB/1puF9V69yUtVpm2DryWcyDVHmBpPihNCgzBzn0y7zzmApk+ku3tyx5mF3Yp70lm2xRx9sTZ8pC9wnUueuFCmvCxLiimkzDJ2nz+NrVeywyeiywAAAAj/AP8JHEiwoMAAIdwYGqJgRACDECNKnPgvwIIZ/wAA+IfhxkOKIEMOlIMBACBt8oBZ+ADmo8iXEAOgABBsQBSB4z7k0wKzZ0EDH1yVGiBmIKJ/bgheYgLih0+QKf75EAhloDYARATSyfNB45M/IZ5mi8jkHyCBA2QJ5PVP0z8FFQDg8AYp7jmeMDkJlBfmn7mBITC0sYM2iKwI/xb0ctEm1RcBAsJQArDh6b8uBgMYAnCG8D9CrQCgCOAJAJYBjyFHc/TByEsU/2z8CyLAYAhP/z40EdQGwAwDISaYGUoOMuRXABS81DtwEsEMAn8QUSKQQwmHIwA0GTDgSifj8gAY/3p5jqAp530JBvhhwEiIjyFsnRo6AMp3AbwAuIXpY4DB8RStAEAd3A2gzCRRhAPAEZYJVMhLaACwiA0FggYAbg0K9MRLm30ASDA+OOHbJT6NAOBYPSkAjkYAVMDMCD2tF4BLT4WQAhhokAgTNIaQsoQSG7iW4VMGkJKRLR/8AwEdQw40I40QxXEOANdUgkQRxwDwBIwZBmCAFA4ECSVBTMIiDTYEpNnHPzAMqcUMLGYAjUQs/GNMAQVgkmY/ACAwJBgATGEEAslJ1GYzeD4SCAHziNalAgCU8M8Q+o0pUFLX4FkANu148Q8eQxqwxAczfDABCBJpMZkx/uC5jAsVMP/YJQnQKeGGpQPtsQQAzvwSy0ZE4ArTeiP8IOxBCzgwECUtNflUAEbQIYdTzg755IzV+vSDAitk4IEm78X4pGW3sajRCniFFMAleHiAAAnHRhTAHwDAgk8g/VwDwBDxDnRJBix+oEC/BQUQwQeS4ELAP+VUgAG1FAWAR59ygGELBOmKNKcz/+gjjkDX/KOjk2MGMKUcM8JWFkwhxGCLNP9g8484S1iQbgBMwGAIGnG4FEAOyQUADSUfGBAjocP4I1Aoon0kcVcboXAzCRZUsIISfRKsHgj51PsLLABAcMRDAdwAwBJe3POrFD7fkM8/FiAwp08BHKGsQNkw4bQDAPBLsHARE8Qw90EhyHGJ1jHFIYe0PTsZQQWspPlPNf8ImW3EbPSdJuATZHy5vGZn4sUWayNerWZQ/zOF559LFIAcLPxBQhytD2s6SAEBACH5BAUIAKUALAoACQAyACsAhwUqdbya9Agtdw4vfBA0fBY4fvDy9xM2fQ4yegYqeN/k7hg6fwkseAswedbc6evu9fT1+Xxx9vz8/S1Mi3Nr9ihIiOPn8JaB9ThWkq6R9czT48jQ4G6EsKiN9cTN3kZimau40TBDrmDBy1hxo/r6/MHK3SSax19e7LSU87rE2aa0z2yCrltc593i7A8vhIqbv7fC2DxZlOHm7xw+gktT0lVZ4A1Chhg0jxMyiVFW2vL0+O7w9kGPr1/H0QYweQgudzpJu1jC0EBMw3uPt1Vuoh4/g9vh63iNtRtRiyKVw3du9m9o9n6RuL7H2z2GqjaszUq6z2TK0JqE9am20DVGtZ+uyq660tnf6mpl9wstfwUrdoeZvRA+gBBTk4R29hRinlVarQw/gw5OjyCLvCGPv3OIsggsexg1gpysyWXL0WmArRJdmqOK9UiZtVG+0DCozId39lxfsgg1fG9qvrCS6xt7sCulzGV8qk+lu0K0zio/phZGhQUsdzqCpyZhlExVpxdtphFXlgxGihdooQk7gUWWshMyfyWeymLFzWBitaKK4mhnuww5fpB/1XNtwnhxxixAqjF1oAk2fiahyxAxfiI8ip2H35OB2Ag3f0plmzBzni9wnB45h1OrvnZvxDh/pQQrdaKwzIR25C9xniiiywAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAj/AEsJHEiwoEGBEA4qXMiQYaaCGxpKnMiwUSIBWiJS3CgRCMFGWjiKVKgFh8AMA8GU0kBQh0AJIxU2GdiiFKSGRu6EFGglpk+CPwgyKLXi50ESAlkMhMOG5sEYRhX2JHhCz8EOBXdyrFHKS8GiMA0+lFBA4ZyoB8MSTCjwhkAlBqdOLOqTBAJDaBfGoViURkEUP0P4BGUoB0GrRocKrCkSiOBSD/Ny9CAZrYQWGn0uqBx15xXOc0HHNCLwkGjIMYNwziyQ8mnQfghCkbyjlJZMWhUiFTjpNcUrmweCAuWbI+viCkkjXw56JtFSapkz3M2Rrk+5iNDmFhkyD9oNCKQbRLT+M6xpgYi4BI17cEsp17Z/Durd++D2guujVmBImUuhha7dV9kdBTFyVGWfHfRDFAPFJt5ABD6oUERcCISEhFlhKF1AACH5BAUCAP8ALAoACQAyACsAhwUqdf///2hk97ya9GfM0SeizO/x9oGUucDJ3M/X5TNRjxQ3fUJel2J5qKCuyxI1fbG81N/k7kNflwYrdwwyegctdyREhhw+goKVu5GhwlJsnyNDhXCGsbeW80ZimRA+gA8vgydHiLqZ9GN6qcLL3S5Ni2tm93lv9vj5+wkse/7+/mhk9oZ39m9o9itKihEzfQsweaGvy7zG2qWL9fb3+palxZ6G9V92pu3w9jFPjZqE9dXc6XZs9htQi2V7qimkzMbO4DuvzV/H0Nrh61lxpNPa52XL0H1y9kxnnCY9oVNsoBg1j6250t7j7TlXkvP1+YJ09paB9fr6/JKjw2mArD1alOfr8gk1fI2ewXKHsYiavZ2syU5U1lTAzx+Ku6KJ9SBBhOHm7+vu9D5Lwa2Q9Ix79a+R9LnD2KmN9Rk8gDZUkHmNtvz8/ZF+9Ulkm8zT487V5OPn8E9pnhU4flZvooqbvsnS4jRFtQ9QkaWzzqq30WHBy3Nq9iOVw1Za4muBrhg1gnyPtxFDhVSuwE6ku0GPrySbx1q4xlx0pS+nzLS/1vHz9wxGigwufkdRzkJNx0W2zhQyiYWXvKi1z5+uypmoxiE6nJupyGRi9CpnmBJdmuXp8SWfylnD0DtLmypAj22Dr2Jg8Ons8xc5f6azziGQwHWKs0lTpRt8saCI4BNhnTyFqRVmoA5MjjOqzLGS7DaszSM8ijJFlgo4fx04ljBDr0BclqKwzDV6oqmO51xd6FNX3CymzH90yrOU9Nje6gk8g1GovDpIuxp3rkKzzneLtFFrn5WC2WtovCFakB6Ft2Zi9hZrpEiZtRdHhS5BrAQpdRh0q027z3JtwVBYqio/pkWVsh2As0+9zxhxqTuDqEq6z4191IR4zhFZly1tnGd9q1eyw5qF3V1gs1pesSVgky5vnU2huQ87fixAqUJPoHpxxzJ3oDZ8o0qdt2FitWVluF6+yV9e7ImavpF/1mJh0jBzn1dcrkCOrV9f7VxfsjR4oWJf63Vs8UGOrgAAAAj/AP8JHEiwIEE4k/6RMMiwocOHBZEQ3ACxokWGFAVye3exo8d/JkQIpPexZMNImP75GnjPYICXAUwKDCBGxqQzomIajNJQBZw6VIpBeKLTo4pJMAZWiMHGoIkZBlEc+AegKoASv4paDBDj35V27vCh+1cpJkVdA8vMUDBTC4Al9XKlegdggyiPmypcKRWEAIF4H/5FYJhPYJZ/Q/5Fysdj4DQAWrRChPAvWwFeRvxa+5ewocQApAA4+iegg8AOL9I0vVjpn7ICBbb5HfQvA0E1A1v/C5ABwC7SbQayfdIx4TDYBSAZcfev60OuogUKiCKiwygKqy0m/mAIuSFn/35V/yzyj1ZK0jzWASgm+bmWf86uebkG/kB7gyqyALDkB1OoMRNQ0MRHUgkEgEDF0HDRIjdUNUFVCwBxH0QB7ECJFlsUoYJHUpxBhRpIVGLFhM/JRBBMAaiQQAx1UAJHdg0FIEURMrxBlIkDidGAVVXdcFeMQ0hAFQBpIECiRYtIAAAt3YjDjToAOGEAQwFYcQEAmVjTTgX/SGhib89gQsYAA4hA11Qu1QEAM8QIFAwAVcDoEQ0UNBKKAGiQOUAHYFSwCH45VGDID0IIVM4/Vsg0BADpCCBAG3oOQBd5BamwAQyc/JNIJ/9k8k8cMv0CQC2OmjAmmfAAkIBLVACgjEAFGP9CQRooyCTGWys42sIMZKoBQKIFBbAqBdGUQh8ApBwJETgAPOKooyeod8OGLkFQAY9ayPlREwsAIIwumOgizAQwiBdjGJQckEEC1OKYwAYOVpXGGxWhiCNBBsSASAkaxCDGvQCXlGIccIShgrIBu2QAFQM1IAbCJ6LQxMMysdFgMtokA4AGUnRUYQkCZdCuR3AAUI4R/xiRCQBeWoRCCev5SgLEJ0IAgDt+/XMOsjQPWMw/RQCQAc0DBSADAKv4RQA+ACiiVYpsvFSQGBXk8BPPJRmwQAXWHNIMDBT8KBAKlZSQxgEUF12JVWpMKTAQFFgFg5EDqVAMAAtcWQVxBKlJAEQNkxhAdLBxVBJIJU1oNaAGi0jh1hmSwXQvipIBwXMAJZeVcEcDImGAFAcAAPnmF6kQOgzdSqAg6RehEEMOYGghOOse2xtwQAAh+QQFCAC6ACwKAAkAMgAqAIcFKnX///9oZPe8mvRnzNEnosy5mPRlYvRrZvb4+fv8/P3t8PXo6/IuQq1dYLMXNI5FT8psZvdJUc9XWeIdPoLM0+OJm77Cy93z9flsgq/j5/AzUY6rt9He4+24l/Tm6vGdrMlxafYILnjx8/dvhbAlPKArpcxgX+2otc+YqMZZw9AyRLJuaPYWNIFMVNR9kLcgQoQZNpASMYeXpsUhOpwnP41WWuGYhNu3lvLg5e42RrYlnsofQIPu8PYsQpFiYPCHmb1jY7dly9EVM4oqQKa0lO8/TMNjytErQKg9S7q6mPQ5SLopPqW5l/JCTcedh99IUs5ATcUMMXpsZ/aSosM0Uo+ukfSjivUtTIsFK3cQM3wPPoF1bPZOaJ04VpFedqa1lfTT2ugRRYYILHoJM3vq7fSojfUqSYrX3erb4esWOX5extBKZZvFzd9YcaMPUJBbc6W4wtgfi7yVpMVFtc5TrcA8TJzI0OE0q81mfKshksE9Sr9QVdgLLn6PoMKuutIFKnYWaKISW5klnMgpo8y7mfRsab2EeM0LO4ApZ5eQf9UkmcbO1uSMncANSowYc6ppgK1HUqNiydCvkesehrhqZfd9c8ldXem9x9scOIWgieFjYfJZW+ZTWN1VbqE/ss4JNX0jXZJNVqhZXbBle6ppf6wmocuercpUbaAkPYooPqIeOJcJOH90bsNtZ/YXbqYbN5R/krhDk7EfWI+ljOVRWKpTWqxdXdRnZdAeVI0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAI/wB1CRxIsKDBgwgTKlzIsKHDhQwEqjr0sGLFJJUsamx4YKPHg2kcMhr45+NCVQIzHoxlMORGMgnHaOQR8eEHgXoM5hgYY+AJIgNDDjlhcuAjgUIOviAosyAEXZXACCyiRU1RhF4E8rh6sGRBSRYlECzURGPILQQHWYS1aSCXVkXlDGRZcUJHI1wFLjXZJu/GDbpm3PTLdSRhkzURujysaxXFgVkRMtiaSNbAO1wPWBFYluGrT4RbCDQzsAgPEQcDAB5EaA3BxBYXazRFMBFjjYu4PhgYQmAhgYMTyr1N3CGgJJcOXEoCiOFOgYaLMtpa/OECXW50oarOXeDz7uBN5jm62txkIrC6bPe1+CLyRq/hi18HbHKBVYd0E9LfiHkgaoTUHdTGDHkt9V18DfWH4ILsMajfVtdxFRAAIfkEBQIA/wAsCgAJADIAKgCHBSp1////aGT3vJr0Z8zRJ6LM7/H2oK7LgZS5z9fl3+TuwMncQl6XsLzUIkOFYnmoEjV99Pb5cYaxUmyfCS547fD2JESGFDd9BSt3M1GOQ1+XgpW6NFKPCjN6kaHC/v7+zNPjY3qpByx4Fjl+qo71KEiI/Pz9L06M3OLsTGedt5b0uZj0RmGZlqXFCi19aoGu6ezzU2ygsZP1G1CLGjyAi5y/dYqzUVbZWXGk1t3porDM+vr8oYj1FzSOcoexNEW0K0qKwcrdN1WRmajHETGGxs7f6+70YcfQiJq9sr3VkqLDX3anydHhHT6CVm+ipYv12d/rpbPOjXz2P1yW9/j7GzeTH0CEDj6CloH1II29W7nH4ubvQLPO0tnnF0iGU63ArrrSNlOQXHSlnKvJJUWHuMPYDi+BrpH1YcHLDDF5DUKGT73QTqO6s5T0gXT2hnf2ZGHz5OjwR1HNqLbQkX71fpG4ManNboSvN63NLm+cDzx/Qk7Hu5n0ztbkq4/pe4+3tZX0JqDLtsHXPFqUSWSbYF/uNVKPu8XaZMrQx8/gbmj31NvoCDV9SLjPnYb1DEaJq7jRinn2dm33TFPTOleTw8zeZ2P2WVvlD1CRIDmZDS97NXujQY+vT2qevsjcP02eP0zCJz2iZXuqSp63PEq+DUuNIzueaH6sLkKt5urxGTaDIpTCcmr2JZ3IGXKqPIWpSJm1MESTeW/2hZe8VVng8fP3WsXRJJnGcWzAXF3pGnmuFGGdH4m6ElqZVcHQCTuCEVWUamX3pozlNkiYK6XMlYHZmoT1RlGim4besZPsHoS3Czl+FmiiLEGqKWaXjp/BX2G0I5C+tL/WWV2wTlaooInhfXH2invSeHDFHH2yOEi6GG6nIlyRfnTKJmCUd4u0KD+OITqJKj+mUlmsHlWNKmiYF2ulZWW4OoKnHH+zhHfPkKDCeY21ame7Uqm9V7PDBCl1MnWfkX/WPoqsQ5OxJF6SeIy1SlSlVrHCOICmj5/BT1e4ZWLYJV+TdWzXAAAACP8A/wkcSLDgwAC1uvSBEcCgw4cQIw6k0iLNQB9GJGrcWNDEnX+M4uXzAsBQRo4oI0r7N+OWLwKINgFA0DClTYIBJgCIVqARAZhe/tW6qTGAUaMDTaRZVqCAHUQ/4/1DYZAdUYEBdkDSQEGDDioNPzRJE6gpHqjO/m25+pDKAwAARmAAICbCvwDsAOhqWoCYOwolTLA1GOAAAHLv/qFxBmBIQxQUKOhqFUiZnn+CCBZyMxDXzQ8lKNziQkBxBxqCAyxIAxfuvxYfCipaMRCCTbtB//kSSE4o1i36NAhh16emPoJYBob5Z5ejCRppWg1EMyLNDpxHIQZzJBB6ygAeADj/kx6oHAAkNTfCGSgJ2z+rKWtpALCMnJ6SBjh+NCWw0D8RFtkUgAEIWEQBAkakh5IIAxVxVQBUwACWgigZMtiFhA24hREfUOjQUUhhGMAiYgw0QXERjciOBqIsENtgqs0FDjVhAPBPGR5itcBcrenz4lWpdCDCJFIIJI8maazlUC3VsXHEO0ElkONGAQwBACj/cCZQNwB4kCMTAKDz0z9sNDZlUW/l8k8wbQiUDAATeBhAEQDM8xMB7nR5pkQ5AeCfANao8M+bLOSYyj9eoEHAEeYtsGeKSAAwiUACSMKDPADUkSN4AHTgTBNwXsdWAv+Eo6ZAufTwDxNTmqADDf8c/1jLo3zqA4AL2uyhjRnn/fjhDjBEEOJgrlpkIwVjCIYhRx9EsMOAlUhTSYLLbgSDPiUAkMYDRfj6HYgpdQGqJpRYABcSyn6XigeneBAHrQLBQAMApDwxwADIAAFAFAJuASpcI6AAbw30CmDvvX6M0EF+KAXgw74wgAHAA7Sa4IAmcAhgzL33tgOAgw3TMEKHAZxgnUYRAFCFAJWuwPE1AIDx3XxbBJAKBYZ4e5eCVFBABMsCRMLHvdgAUMZ3ggDQhA8OxKxgABEUsQC1Ar11A9DWPNEGJQBQldIHkFzwTwc6+BqAEYMA3EVNdJoKtCU/ACCKzkVREYewBQVgKwKGaUbw4ge2avLDHqBUAUAGMFR7kBMA5KcBcwN9AMYIrQFwR+KKY2UrO1b6XVAETAiygJKZY2XEfADQsAi8pd9FBROVGMC6RgEBACH5BAUIAKQALAsACQAxACoAhwUqdbya9AgsdxA0fBY5fgoveBc5fxI1fA0vexU4fg4yet/l7hM2fbeX9AswebSV9MrR4urt9FlypAkzegcud4qbvq2Q9eLn8O3w9fT1+cLL3Ro3k/b3+jVGtamN9aazzq250m+FsNvh7Ih59j1Kv/j5+1da43Fp983U5E9pnik/pYJ09hc0jaCI9YaYvefr8kBclrfC2F11pkRhmCSaxgxFiRZHhUdQzY2ewEdimQo/hKSK9UFNxgstfmmArcTN37rE2Rs3hHtw9iWeypioxlRtoWB3pzWrzWuCrqm30AUqdkxnnN7j7WDH0GPI0Fxd6EtT01NX3ECOriKPvvL0+Nnf6j1alJ6H30GzzkRQoSQ8n1BV2LXA1mXL0QgseyFChCKVwnNtwaSL5BhxqTCozDuwzeXp8Z6tyg4vg1q4xtHY5jVIlyY9jCCMvH+SuJWB9r3H2ztYk1BYrD1LnExVpiNckRE+gSahy1SuwIt70pOA121n92h+q1hdsC9Dkwk3fS9vnfDy9yE6mktmnDR5ogc1fVeywhp4rn90ypupyB85mJeC9VOrvzZ8owk6gTlXkoN3znlwymtovBt7sBQzgFy7yCxtmzmAppiE3JmD9TByng45fZqF9WZ8qlGovSpBj5uF9XOIsmR7qZSB3AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAj/AEkJHEiwIEE1BhMqXMiwYImGECNC5ENqE6lGAzFI3MiQi0AaAzG64UgyohMbSkqqHGiRFJkuDCmSoqKyRJIcFEh94DDwC6khAstIrEKyhChSSjalJMVz4CSCnnIy9LmSIJGBFAoIBGqHlEeFYVTmxFKV1B6CB0ragIgjxyOGiwpmKLtJgUpQA+2WBAp0I0KDkaq2FKixqt6VBUaWTbvyYdOSMstKNqix8OTLEvnAwZzzE0EgDHMuvcx4oJ7DDQ2t/bsy0cAVAxGRvIo5ogZSUmonbDAwx8K1pJzoJthCDynFDLtOZk2QhUSttXsUJTUX8weCBc4M36iBiwbL2xkaewnf8G9pUhWqRuaohMQOgVcEXi9LNGJ6EqQ8EEyAeuN8UkdF9IUXAmUyXH8K0aRQHiXlMBp0EJUAYUGykfQVKVQZ9BhB40VR0AMrJSEQggJZMRBzAj1BUAekrLcRTxsOhMNAo5EXkW8NuaibG7QZNNeF4WGAo43cgSdZQAAh+QQFAgD/ACwLAAkAMQAtAIcFKnX///9oZPe8mvRnzNEnoszv8fbAydzf5e6BlLkjQ4W7mfSgrstCXpfP1+VieagUN30SNn2RocJSbJ+wvNRxhrFke6ozUY40Uo9DX5fo6/OClboLL3kFLHYWOH4IM3qWpcXL0+MRM3y4l/TCy91ziLIILXeHmb1XcKPi5/C3wtft8PbHz+DEzd8po8z09fklRYeNnsBOo7oFK3dLZpyyvtVtZ/dAXJZqgK1+kbgcUYuntM+ruNEiO5wMLn6Km792bPZSV9t8cfZfdqZHY5rr7vQYNY9Etc74+fv29/rW3elgX+4PL4T9/f6vkfRyavZ7j7ZET8maqccaPIE1eqKHePauutIcPoInR4jb4eyzlPQ7WJN5b/ZNVNRhx9AYOoCjivUOT5CTo8NkytH+/v7T2uhhwcttg6+BdPbO1uREYJh5jbUWR4YGMHmVgfWbhfW2lvP7+/1oZPa9x9uEdfajsc3x8/c4VpEJLHsOMnqrj/UQPYANSYw8hqkSXZoKPYOdrMk3VJD6+vwzqswuTIs9WpQup8xac6SojPUOQYUpZ5cUMolqZffe4+2giPVBTp9OaZ4qSYpkYfM8sM0ilMIfQIMdOJUwToxPvM9YWuM+S8ERVpUXa6Qub50YcKhauMYhj79bXOggOol0bsNYwtChr8sgQYQIN35Lus+Zg/UJOoE2Rrbl6fEfiLkknMdTv88nPaIuQq0yRLJhYraNe/VImrVBj69ofqtIU6Q3rc2PftUxRZQjmMU5SZl2i7RUbqG6xNkdg7abht5UrsDZ3+oEKXVcxdB8csiJe9Imn8o5SLs5gaYZNoMad62Sf/WehvUoosxXs8Oqj+iDd82xk+0mYpQbfbLR2OYjXJCiiuIxdqEUYp4beq9KnreVgtosa5odgLSMe/UsQaoYdKsqP6YZTYksS4pqZ79dvclWW65aXrElPYtSWaoeVI5Sqr4/i6wsQpEoP45OV6grQKdPprtAs84VZ6KPffUeP4MiW5BUr8FElbJpZe2JeuQmPpMAAAAI/wD/CRxIsODAAAgDGFzIsKHDgy+slLgFSIPChxgzHtRQCIBHAB7SXNRIkmGTQwCqRfv0rkOlIiVjGlTyr90/UgL7ALAyUmbJAMAAjPuXa8y/aAASXAzwggQPFY16kgwgKA2wNIKWHgDASeCgV/QASFAYgEQlggmSxAzAisjHDCkuFjEBgZJAVzoAsFDIokOHb91slft3pklJJBkAKNr3DUAgtf8ClALw4VunPQBuxfmHhFCHYC4IEDCD7R+JqSwAdCIgkAqAAxeb7IAwMK3Ca/+qFShASvQwAFCkNgxgBUA30f9kANgxMoCda2ksDjztaXfR0QAOCWdYFsAy0QR0Av/bXjDNv2+7C+QyhrQE+YUvzAHoQ6+PSwMZX3hoAyp9smr/qPCTEgp8VMk17xEUQA3/QNAMKK20A8AESKxlgApS1GBAggWRUUoH/wAg0AQw+ZSQTAGksMMJILCwmU8wxiijRkP8xEoajZDBoUYg/sNORk2A0IGIt7ywo0bOZBSACo5JMURSRzYkxUDhFCTGQgE8iUAASFxgAmQw1iiQDSNgFMAEAGxIBg3/2DEjQVUs8A81w0kBQAnX2HkIGW92MRAaiAgEBUMvoOmRAlG9uchPSAAjhRUbvimQD6tEMRVCkgpUSkGAZKokpp7+lAIPMUjhYpSZNgHIkB79MwErqB7/ZEcjdqAaACAAMHGOMLrg4pibP81BWx4qRJlCB8yEUoVAC8wCAAixsmKCBwlM0UEjBr1AjBIlRlacJv8AMRA1HCjAJ0lb7fBPccUOZEACJnz0ALYBSABAEP8IAMZAgfzzQknXADDENbfodZEGgQDAjDqzXAJAHiLZ6ec/NujxzwKVmCBISU0U7NEDG/8TB5qyhDPAAAtM08EVRYTwTw9yCMRIFchkFitVKoihAhIXhQAAzCafPMAoAAAyMgCxLPGPHF340AGCKIIqkMQCACH0ANJMGABHAMxgBBMAdMBTpicAkIkA+go9ggmXRGaHFG3nUQHUmVItwBNOnJz1BAcFQZBEE7FmlMbPcqDNiDN6nAPApqGa9GQskqAtRxT3Nd5QER35IE4sogAAAW6WN2RHDHl41MEtCISO0QuNEINfpgEBACH5BAUIAMIALAwACgAwACwAh////7ya9GfM0bqY9Pz8/SWeySpApz5LwGtl92Rh9Flb5Pj5+yM7nUlS0CJDhZGhwvb3+hs9gkdimeTo8dzi7JqpyG6EsIydv+vu9O3w9RQyiW1m95WkxPf4+3mNtU5pnoaYvfr6/Fdxo9je6hg1kGTL0czT45+I4GNkt0JOxx85mbOU7qyQ6Vx0pbG91Ftc5zJEsVJX20tT0hs3lActeGPJ0DtKvlRY3Q4vghEwhV1d6ThHuSU9iyo/piqlzC1CrR04hy9CrlZa4k1U1aaN5rqY80ROys/X5T9MxA8wg0JNxl1e6XGHsSREhqy50sbO4MLL3gwyehY5f3tw9jhVkbeX9LfB19Tb6BxSi3Bp9itKisrS4go7gjxZk4t69V/H0AYxeqqO9YV29mh+rKKwzKWL9Ymavuns8+fr8hp6r2DBy068zyGQv2Jg8Glk9jV7o1nD0A9KizaszUO1ziSbxyY9omV7qrKT9CijzC5unDuEqDywzhhyqSKVwwotfS9NjF92p1OtwBJem0RQoRA+gFPA0Fq5xgg2fXaKs+Lm7wUqdo6fwR2BtXdwxY191JB+9SNdkjVGtbSV9JemxlVuohFXlTxMnFlxpA1BhYV4z5aC2lBV2CE7iVJZq4WXvC5Dkj5blQ0vfjFPjTKpzF5e6xk7gBo8gEtUpn50ymuCrtrg63BrwEi4zjRHlqSyzT6Jq0yguLiW8WmArUZQy4CTuTF2oCagy2Bf7VtesRc0gVhcr1VZ4F5gujR4olldsTBDrmdj9mJizwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAj/AIUJHEiw4EBEAtEYXMiwoUNhZ7o8nEixoiGBpjJU3NjwijAstjiK3ChnopWRKAVeSNlQAsFEA88IOzSSQMo8DwkJtMlyIU6BtVLC6WnQ1UITMgvyGViCqEA9ToUhFAl1pClhbAaGFHYy5dWNLmZGPelCI0ejUXvCvMAhrdu3cAkqpBC3Ytu4Mip2hYtEmJeNMN8uEVilLsoVD6caXvxwsEBSFNuaJboy1A5hlxkzRKu588i1nisqDC0wycBBTvdOhJlEhxiBRQTetTqyL1zVDlcOLFN3tDBcwv4INDEwr8AwwmKL5GmQJ4y/yTEK2yKMATCCmXqqJm4dusBVOwX+SxIITEaozixiSqQhzLSwsFFX7hLIG3ZDJh7fGs8yML3BDnERJ8x1wiDwXWg8/dIGeUooIsxkjEUkTC7CjEcaQboNFNiFwtAFIVEBAQAh+QQFAgD/ACwMAAoAMAAsAIcFKnX///9oZPe8mvRnzNEnoszv8fbAydyBlLnP1+Xf5O5CXpegrstieahDX5c0Uo9xhrEFK3czUY6DlbtSbJ8HLHe6mfQkRIaRocKwvNQjQ4USNn3+/v5jeqm5w9ju8PZrga61lfTx8/gUN30WM4z09fnCy90JLnj8/P0LM3oLLX5sZvcdPoJGYZmGmL2ukPR4bvZYcaM9WpQQMISpttAPNHs5V5JofqwqSYkGMXq4l/Sli/W9xtv29/pqZfYXOX9gwctLZpzc4eyKm76giPVcdKWxk/RQVdjk6PBTbKBPaZ7p7PMgQYSGd/YbN5SyvtW1wNcvTYxOo7puaPZxavbL0+OLevVhyNBFT8uercrm6vHe4+0moMrO1eRyh7H6+vyVgfVly9EnR4gsS4usudI6Sb0WR4UZO4A1eqJuhLCQffWUpMSqjvXi5u92bPZmYvVUWN95jbZ+kbhJuc98j7eCdPUMMHmls84vp80xT43Hz+AOPYEVNIEOQIQpZpeSosNedqZATMMrQKn4+fvr7vQhkL/W3Ok3VZHY3up2irMRV5YTYZ1aucdle6qWpcV9cfYlPKBImrUdUozJ0eFjYPGvu9M2RrYkm8c7sM5CtM48hakbT4oMRYlza/ZBkK+bqskJOoExRLEhOpxJUtBSv9BziLJVbqFuar4QMX4fh7kZdq0INn5IY5uaqcfEzd/a4OudhvUrapkbeq8vcJ0OTY8gi7wcfrLR2OZUrsAcOIY2rM0qpMx7csiCdsxaXbB0bsJcxdCxk+yNnsAXbqYNSYyZg/VgeKgiW5BfXuxYW+SljOQVOH5hYrVnZrk/iqyahPVbXOirj+kyRZUjlcNGUaI8S5zT2udXwtAOOn4fhLZTrL+QftVTWasbPYGIetAQUZFYtMMnP42WgtoiQ4VBTp8kPIorQZA3fqUZcqkgV4+isMwdgbQEKXUWaaRNVadPV6mTgdhdXekmYZRUscJLnrdMobmeiOCahd0ydqAVZaFlzNJYXMVGlrOVgeJdXegAAAAI/wD/CRxIsOC/ACiQbBkUwKDDhxAjHrTmQKAGDw0latwoMMCWEQDkxbIDgEdGjigdBkAAgB+Bf+Aq5EGRsmbBADYqXCHwUt4/QgQDCBVqs+PQkwcpAGDEM4yZCiIGcuARw04UDB+QbgyAyIsNL9ZOBqAREhyjcwBAZOQgDACAEScASNCiNWIAQyTdVuhyclAjt27nNgygB8AeKf+AoG3AAWWABgA8fDEBgILYL0+8NFJnIGOARABS4XkZRtI/LY67LeMgVEKKLzeHBm0B4NK/OS/P/bPmWGnYVwAc1FV5A0ChgaSO/WvjWM+/Cg7iHhhuMIAHAJts/1MFIEhjxwds/P+TgBElChAAUkjq8/YVdYgBOAxinTLAoFbdBDYQ8r7oVhRLiECUfwRWh8KABdokAgMOLONAKwZIdFSCAmkh3lsAjIfEQwGUkEUDQ9CVIApK+cFFGECgAUALsBmEAmRu4fBBgpP8k04BujQVyz/OGfTKPw0s4QgAlfSnkTr/2FJAAcDwhFgrDvGGwD/X0WCkRFBms6QuO2nzDwYO9ZDHinZUwF+BPPwTy5IF4DGHJlSqtAUF/+BgwpUSiaABAEouuU4F3USoEgclHEjhP5OQtIkfmwBQgR54HnoXnQJREBZHKBRKIQdLvLLEdxq9ksgPbyWCSE0bClRjTR7EdYYN3Tj/WkmBqHHUBQAqjPLCABZsQ+qqHO1zzzbUpMSBUkcIYMQAzIoTHE0b+VPHQMygtAQATgggABvMMksOAMwZheBAgfxDhQUCBWMHR4YAEIq2TXQ7QDMA3HJQGxhQEAQCXYBKEBE2bQGAINoKQES3vgCAiHVxAfbPENAStMIOAjHB0SDd5IBMwWoYEcwyNZRQowpYRBPMNmMAwEAANUIykABN1KQOAKJQUjAlkADQCge0JfuCQNGcccKMpjzE20aDQDZDGViUkQsAMfSAmhP/CADLQKf8Y8Kh//SAQQWAATBECf/8KIhAbuggUC8APGGQHWAVRYgJHpiwxEB3U131IyH8PJP11gT1EDHXxwJwhEACrNDPMnYIyjWHXfxjRyDxIDPK0+pEmqB1KYT95eCPc4hEKw2YMsSloW8lG9cBAQAh+QQFCACmACwMAAsAMAAqAIcFKnVnzNEnoswILXcTNn0UN30MMHkKL3gOMnoWOX4HK3gFLHYMLnpwhrG2lvRuZ/YFKnYQNHyClbtyavaJmr44VpFsgq+yk/SvkvRpgKxcXenb4eyrt9EcPoIJNHseQIO/yNzFzt+bqcgLLn/q7fS7mfRhwstHYpnI0OG5mPRoZPbx8/eFl7wuTItEYJg1e6OmjPUPL4QHMXpPVdc8WZTS2edbc6Rgx9CiifUWM4s7Sb0hj74rSoquutJrZvdMZ5wILndOaJ4pSIkORIYmPowaea8wqM0fiLmtkPSBdPWwkuxTV9xkytFWWuIYNZAyRLEcN5XZ3+oXR4UcOIUSMn8jO54XbKVzbcE2R7c7hKkspsxQa5+8xtpVWq1auMY9sc43rc0PT5Ds7/XN1eSHd/Unocs+W5VeYLMvRJMKP4QUY5+WgtunjedjYPJaxNFgX+4mn8pJZJsoZZdOVqgilMJJUc8qaJglnMiFdvaQf9aotc8JLHxnfasRVZVDtc4kmcYZdKpHmbURPoATMojo6/JCT58ELHcIN35tab4po8wehLZBj6+dh98RWpgNPYFYs8Mra5pevskvb51HUqMmPaEcgLM2U5AwTowTXptIm7VjZLdoZro5SpogOpqiiuI9TJ0aTYlCkrAwc55Cj64zd6EmhLIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAI/wBNCRxIsKDBgwgTKlxoCtIBU1wYSpx4EMglihgTVgCSsaPESAOlLFhBkIuNAxc9mopiqkIGg3oGgjT1sqLKghwL8ilIqKAjgSZuQmS48+ARI0JNJRh4CQHFE6buJCUYZQHGlzuShjAF5ETOjn9MlQFk6ofHClYjXjXIcqrbtxhJwp1LdyHJE0tNya2LkFCFgVb5MpRTEKpghGWQEtzKtmAPt6VuxpwaWSAThhehBhYaEZLHFm5JbjZVavRhg6AIc2V8OqHZ1n2j9JzIcunSthgnq8xJQ+CCx7AH7qmDITjCGaYuCE3isScUgTAIFjJu6gnF1wWXGLSEkVLCtg8lRksX+JUhA4Z7TLERCJpgFYJ4VL5BaNjgATF0dZjSMciUDVPOKTSbAkltthlu1PFkynMJFmQWcgL5IJBT1J1nynz9JcgFhQ0e9B9cAQEAIfkEBQIA/wAsCQAKADMAKwCHBSp1////aGT3vJr0Z8zRJ6LM7/H2wMncoK7LaGT23+Xuz9flgZS5UmygQl6XFDd9sb3UYnmocYaxamX2Y3qpJESGM1GOEzZ9IkOFBit3ZcvRQ1+XBix3t8LXCDN6gpW6kaHCwsvdu5n04ufwNFKPYsnQHD6C+Pn7Fjl+/v7+X8bQboSw8fP4bGf2fI+32+HsDjF6CS54xc7fCy5+ETR9IEGEFDKK9vf6KUiJ/Pz9TWedQY+v5+vy+vr8rZD1t5f0OleSdWz2SmWb9PX5Jj2iL02MM0SyGDWQaX+s1dzpLEuK2d/q7fD1C0CFq7jRd4u0WXGjcGn2CTV9tJXzyNDhvcfbU1jdN0e4usTZRU/LCTB5ManMUGqfVW6hRLXOYMHLzNPjR2Kam6nIT1XYjXz2lKTEED2AI12SCCx7LUGrDy+DmajGeY62X3enHTiVPbHOqbbQH4i5Xname2/2KaTMsZP0QFyWPVqUGG+nFGSfiZq+G1CLloH2GjyB0tnn5enxLabM3uPtztbkVcHQFkeFITqbKGWXkqLDbIKuqY31hnf2GDqAJkaHoYj1RGCYrbrSjp/BXV3qYmDwnazJZ32rZWH0WsPQN1WRSlLRDk2OEFOTC0OHEVeVpbPOGniunq3KTqO6VK7AJJzIGDWDc4iypozlITuILm+dHYO2CTmAHH6yR7jPJZ/KTrzPfpG4h5m9WrjGN63NMU+N6u30orHMrpHrk3/2TlaonojgIpTCF2ukDEiLO4SoFWehHVKMSJq1lqXFNXqiS7rPjJ2/WFvljn3UlYLbiHrQm4T1QEzEg3fOPUycE1+cKmeYNEeWWLXEN1SQRlGiL0STd3DFW3Slpov1X2G0Z2a5fnTJhZe8fXL2GXWsO0m9I5jGmYXcEVqYT6a7K0GQGEqHNn2kMHOfPluVaoCtVFqsc23CXbzIIFmQRpazU7/PKD+OS5+3Djp+BCl1cWzAgnT2NlOQtcDWPIapU62/H4y8bmq+Uam9RJSxM3ehM3egZczSbGneAAAACP8A/wkcSLBgwQAIAxhcyLChQ4MB/IAYdiDHw4sYGQaA8A+AR1cWM4rEOEtLDSpJugCgonCkS4ZUAExCCAbAmpYvcw708+9JigCPAMDBGSDFEixUhuDMGeAPlRFL//XYAAAJgxgP/gwMMARRRwAYwEQVGaDTwJkEm+oQyEjs1icA1OkbxyHrWIyB/imZZOHfkoM5Ai05sVTrnhIC9dm8e/EAACf/6AHowNigoH+8CBD4BwvAk8oO/wo5oPJyRgX/zmjQ7A4ACNANU7zyCMBFCpEp5AA4BU7fA7+wY4N5BCZkxgCzqHrkQC+4w4QvA5w4sMYJVJ3YDyLMabTTsElUemT/h5hxCFzaAISgHi9dEBYwN0CfgALgCDZvxW4BYKQVe4AFSnylhFsMdQIAEZXUMcCC+FTl3xIw7KYPPxzEsMRdOSiRQSQCJLLgACLMA8AIOgWACACeeCFQaxHcNQsAhQgggC0fDhAPACHo1IMW7/wDCGIaEPLPDQvxcKCME/jw4TQAHKDTCRyYIVAsKvzjyz8sLHQCDDNUImMU1Syo319MCQHAPQIVkAsHQNy2EAMAcCOjjEEoAwA0xrkUgGPvqHKPKmZMxhgPGABgBDGVRJJMDACAkV0KCHwFwD9ruMnQCxZ4xCgAMDjJ3hJrMLDGhRcN4UQEFnCxxh/bsZeQcwQZ/0XLMAj4YWlGPSRxABVMwGrQDS5I+g8pQxznxx0DxbCGeC7lcOIR03hzjIiU5NmQH4yqswMvPTJw60UByPCPG5LYItAUy/xzAGw93AGAKgWs9sUe/zhKFpxj/CPPQLgAQApsSfyjTgEFWKJZPgAw4GsA9EnyjwA+nAvABrDliAfBb2j2BQBQLIwEAMQIFEQd/9QCgBwKddCQo6cQXIAXJXSGyMIGXjFQC2Q0OJO9Bk3yjwEwSJGLy3Sc8g9kIxnASJyV/FNJMgCYwERBERPUq89moNLNPYbcWexIEfUBABpHzAAACoK05IZDOQwjLDTr6cnDMCb80wcDrA6UhsgFcTD0TwoLDEMJKRB8XWIKN/xU0NoC7dtQq+NFLrlDpiUTyT+YCETL5Jx3ntEa/0DReUAAIfkEBQgAwAAsCQALADMAKgCH////aGT3Z8zRJ6LM/Pz9ZWL1ZWLzSFHPJZ/K7fD28PL3M1GPHj+DpbPOM0WzIUKERlDLspP0EDCEupj0GzeTSlLRc2v2cYaxbGb28/X5N1SRDC5/laTEj5/By9Pj5+vyr5L0uJf0rJD1LqfM3+TunKvJlYH2GDWRYmDwjnz2Nka3ITqb4+fwb2j2U1fcUViqK6XMUmyfo4r1d3DFHTiWOUi6t5b0PEucV1rj9fb6HzqILUGrX17sJz6jKKPMs5TvdWz2t5bxY2DycGn2d231Kz+nmYP1P0vCcmr28fP3CjN7Ci95VluuEzGIVFnfIEGEETZ9aWe7sZPsZGS3YV/uJTygPEq+PUrAJqDLEjKHHTiPuZfyBy13sb3VETN8t8LY9/j73OHsXsbQHD2CBSt3TGedLUyL1dvo4ubvFjl/ipu+ZsvRd4y0DjyAYcLMVsHQSWSbb4WwEVaVCCx6RWGZWnKkZXyqPbHNTbvPRrbOfHD2NKvNC0GGHFGLKWaXH4i6rbnSMUWVqI31u8XahXjPE2CcF0iGGG6mDk2PDEeKDjB8vsfbbIKvVG2hO4WpI5jFi3r1zdXktZX0FTOLSZu2UFXYf3TKL0OuGTuAT2meaYCsKkCPXF3pLm6cTVTUr7vToIj1s5T0IpPBp43mjXzUkoDXVm+iXb3Jl4PcGXOqrZDqkn/2Jj2hooriQk3GgXT2H1ePFzSNnYffnIX1TFWnW1znFESDJDyKa4GuRVGhmYXdR1KjZGHzJqHLQU6fR1GiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACP8AgQkcSLBgwTPA1BhcyLChw4WfHkqcSBHYA2BnYlTcyLGjx4cI2QiMyHDRR4MsgKFpqAkYl4cXT07UyFDkwJcpZT4kEYZhH51Agx4UuIhmxZXA1ghVKLOT0Kcvn8pEKrWqVatJFlK96vCEJa4bqxgw2PJkT2BOXWLkuEXgVo5l83RcZbXXQKXAcjSsYhUMF1sFf2Y1CAbYhrEFf0n1ofZhDbAbY9YqwAPYHMgNzxY0iXnhYGBGO0tEKJA0R9MybYqWqOUj6qpBPuL9+bFSQVkUXwOlIhCEwNgd78hsWaugqo1pq2Jg6KqhEoIwBAL6eGUsYofHCwJ+RPBzxTOYgCkjam2QRse3G9VcDJ9zdUXzAl+Fcr/QE32Hc5pTsX+/v3+BAQEAIfkEBQIA/wAsCQALADMAKgCHBSp1////aGT3vJr0Z8zRJ6LM7/H2Ql6XgZS5z9flwMncoK7L3+TuYnmocYaxEjV9uZj0u5n0sLzUNFKPJESGamX3Lk2MIkOFUmyfM1GOQ1+XByx4BSt2FDd9CS54CjN69PX5lqXFwcrdPluV/v7+DDF5kaHCS2acTmiegpW6Di+CWHCjcWn2prPOKEiItZXz5+vyY3qporDMzNPjrbnSHFGL7fD2U2ygt8HXFjl+1t3pNlSROliTa4GuiZq+8fP3fpG42+Hs/Pz9GTuA9vf6IEGEnKvJFjOMRE/KkqLD4ubv5OjwFkeFdWz2vcfbR2KZbmf2HD6CaGT2ED2AztbkjJ2/X3amjp/BdYmze4+2K0qKVcHQCi19NHqiaYCsJZ7JXHSlxM3e+Pn7TlTWO0q9usTZZGHzNn2kEluZm4T1EjGHmajGZXuqydHhYsjQoYj1p43mhJa8L0Ku6+70q4/1SbnPEFKSWrjG3uPt0tnn2d/qj37VJJnGSFHPloH1IZLB+fr8QrTOsJL0Hj+DJz2isr3VYcHLDUGFqbbQTqO6WVvmL6jNYF/ukH31O7DOeIy1GjaSM0Wzg3X2m6nIaH6rGz2Bx8/g1NvoQEzEeW/2GXasCjh/HoO2PIaqfnL2bYSvSVOlhpi9VVng6ezzUlfcHjiXXV3pZcvRLm+dU63AEjJ/FWehT73PII29HH2xDk6PCTyCQI2uRGCYOkqaIjucNqzNFWKdCTV9H4m6EVaVh3f2QE6eYMTOJkaHdG7CDS97KqTM5enxpYv0MU+Ninr1loLahHjOGDWCgXT2YmO2MESUnIffDEaKSp63Q5KwGnmvF2ymKmiYBCl1+vr8rpHqOEe5bGi9Xb3ITVaoHzqISJm1GG+oI1yRSJq1DUmMKWaXJDyLv8jcKj+mW3Oknq3KKT+OV1yv4OXuH1aOJWCUK0GQVrHCUai9aoCtU1msNUeXOoOnWLTDXV+yKGSWfnTJWl6xaWT2eHHGRU+8bmftGUyJXmC0TqK6M57DcmvfAAAACP8A/wkcSLBgwQA/5gQIYLChw4cQC06rItCKAYYRMz4kYUDJHBIHEQGYgAHAJ4waUw60VBIAgCdhQAoMYAUADCE8OBBRyXONyx3udrg0ITMAFgA48uSoJOTgwoU8CSoAcIyUoAEDlvUCUGamjhIuAdBA+S8ADAQ8rCggm1LICA6iBFzFuozDsGkz9VRBELPgHBdhxbLNuAQALQEChGHFCgoAnoFP2QbwuUaMnkoddvLUAUAOYkmLByQDQCVjAC8ARi3M8k9J1HMACCEW4GexOwB6TFcBUCiAgWEefkSd5mKDotm66MD5VUSM6XMdAGjIAWDN4IyFAEAyNdsUJACIUgb/0IGBwwUZTaP+E4IAwAZx+MT9AoAlvcaFYoRcb0tjUNhKLeCl3oBl+abEKETo0YYOmhGoXgB4UDIQTPtFFVmFM1HxAQDgYMMDAP+0gOF9bTigwSeWYPjDBRwg0YhAywzxTx4OlkXDPwBw4JKIDgUgAQDV/KPLQHsAkMWIEAXjQQ7suJHKFP+c02N7ovxTwQsCQcAckj3iAIAzBBDwjzOCNRRAFgAo8o8AukDwTwQdfMClmdl1EyYBzYB3XQALAICEQAJ4IswyAFgxZ0M6/FODIQTwwg1p+53DgQpVCsRIKf+UcahBJKCZwzdTmCSTmS3880skSOCjhkn2DRiAGGt0//BPCSYQgSEJheSAo0BVOFfjTEQgyCVCluCgAAyb/hqRDA5eWCNrzVKRxRNWIGJrjfcQJOF9zAb2xEVRhdHQLv84YVppHWjDyzWo0JcstP9I8iCanABzyj9uMPHPKA5W8NA0bSywRhk/YBTAEwB88U8dAp0xY1TbFkTNP+MItMQTBF0wA0MBNADAHwI5ssU3/zzGU6kE+UuQARkAwE037MDDQQmJBkCDywr/wwkAGQjIEwUGcVCJQmv8Y0sBdYSZJwYgEVHSFPOgA4AHGw9YyUBcEERCBhzwUYAjd6Kzb1k/IMCBQDxQkWxBV1+9hEBCeDBFAXRvEWYX/+RWoAF6KDqhn7Kccu11AcCwckoNYwN+X9FH012AKwBgsHaNP7TMjSuc2DJzooqrtAQGBPVSdecqASzDGgqAoHhAACH5BAUEAJUALAoACwAyACoAhwUqdbya9GfM0SeizAgtdwkveA4yegYsdxI2fRg6f7iX9Pf4+4OVuwwweYmbvnBp9uLn8Nbc6Y2ewOrt9B0+gjV6oqe0z4J19puqyFhxo0ZimZWlxQ4vg6u40bSV9G6EsE9pnoh49Wtm9ggye8vT43Rr9ik+pWVi9LnD2BBTk0mbtbvF2nhu9mFg7wstflpb5iafyiVFhzdJmBJalxA0fHaKswUqdqGvyzNFsl5e6wk0e21n9iM7njtYk1bB0BVmoH1x9kpUpSSbx0BMwxhupyCOvrXA1h45l0xT1Jinxh9AhL7H22DFzi1CkTyFqS5CrQo4fgxHizywza660qOxzWFitVldsEhRzpSA9UO1zhg2g4589QcreVC90A5Nj1VuoSFChDlXkot80wtBhihll1BV2Q8zejhHuHdwxbeW8YJ2zCKTwmR7qlBYql29yQYueFNX3COYxXOIspB/1RRfm5+I4LGT7T+LrFeywgo8gpiC9UGPrws6gGtovC5unQ4vfD1alGZ8qq2Q6lCmvMLL3Th/pXJswRNBgkSTsWbL0QoteoWXvJmF3hlNiZ6G9ZeD25F+9YCTuZOB2C9wnLuZ8wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAj/ACsJHEiwoMGDCBMqXMiwocOHYR5KVEgoIaCJGCu16XGwBkEKGRtqgTOwToxKKAZGIDgFIceQgGwI9FCSQMhKLW8WDKJz4kocB/v01KlnaCWbGV8YNABm4kWjN1dWAnNDpyKBTwR6hPpwSlOBCbhGFUu2LEEzAjeabQhG5sBHUHM2bHmm4JxKW28iZTKRZqU0TMUiwonQo1KClCqhvdlShcOqBIFUqjNUqkC+C20ertTiCMq1Cq+aRbt4oRHQGU+jnlgV8mqHeV8vDPTQtdklD6Eg4jsJb8YyHScmEtgIdVXcBoUQLCT7q0DaA6X4uFnXp0C5PZ0LHGIDZMMFA8kIJkQa8g9CAsqlKET69CbIsAQLEJxeqYJshV2G39/f0zL//wodx1VAACH5BAUEABYALAsADQAxACcAhLya9BM2fQgzexY4fraW9KqO9RE0fHdu9rOU9IZ39nxx9iI7iVG+0Eq6zylAj0W2z66R9EGzzg88fxE+gAk6gThWkQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVLoCWOZElWZqqubOu+cCzPtIjWJILvfO//wKBwSCwaj8ikcslsCicwglOVGA2mJAWWCd16v+CweExmQsq7SPlGbLC66KEkzI7b77EQACH5BAUCAP8ALAAAAAA8ADwAhwUqdf///2hk97ya9GfM0SeizO/x9sDJ3N/k7s/X5YGUuaCuyxM2fWJ5qDRSj0JelwcseAkveHGGsVJsoChHiJGhwiJDhQsyerC81DNRjmN6qSREhkNflzhWkcHK3YKVuvT2+RAwhAUrdrmY9CVFh0VhmJKiw7fC2B4/g2XL0aqO9I6fwbWV9OPn8F3F0Bw+gn5y9hA0e3Nr9qu40fL0+MzT43KHsvv7/ff4+5uE9Yucv2LI0LCS9W9o9v39/hY4fu7w9ho8gGDBy6aM9FBqn5WB9cTN3yulzOzv9ZF+9rK91RUziyBBhKOK9Xhu9trg65+H9UVPyqe0zzWrzdzi7DFPjQotfg0+ghZHhWpl9z9blZyqyVpb5ufr8mh+q/n6/L3H2ytKimqBrTxZlOHm7ylnl06juqGvy36RuBo2ki9Dry5MiytAqFO/z2Ng8od39gg1fbrE2UtmnJWlxVVZ34t69uns83WKs9bc6a660hlyqgo7gSY9ooJ09mV7qnyQt8nR4VjC0K2Q9F92psfP4Ghk9jqvzTVGtXmNtWZi9V11pR2CtRxRi/7+/jCozaSyzSpAj22DryOXxA5LjRFZmBdrpE27zwxGij+yzkGPr1Zvoklkm9je6k1U1VFW2vDy901nnVpypBk6gEi4z4aZvThHuVhcsB04ll9e7K2R6iKTwk9XqUpS0T1MnZinxjVHlyE7iUiatRt9soiavmJjtrS/1tPa51RtoRY0gTxKvpaC2qKK4g9ChUS1zgs4fhBTkx+LuzyFqSahyx+GuAQpdVSuwISWvIl60RRhnVGovBNdmqeN5iM8nT+MrSCOvhp4rlq4xrOU7iSbxyWeyndwxQ4wfBMyf0aXs2povCZilTBznh5VjX1zyRVloDV7o9HY5h1Si0FNxZuF3nJswSE6m+Xp8ZB/1s3V5EpUp1u6xzV6oj2IqimjzCJckFlxo0ZRoi9wnQ9QkIN3zTh/pRpPileywh9XjyGQwBlNiUKRrymiykSVsVm1xIh53T5MuAAAAAj/AP8JHEiwoMGDCBMqXMiwocOHECNKnEixosWLGDNq3Mixo8ePIEMabERITJAL7vLgEBnxiwIAAGL8gAkKCcuHOgCkoTNiwLJVAEB9ucmQCgBYqGQMWDoCaC2iAwNIlTrwEYAoArL0XLoLgBeo/24cUOBFwYEvAf7lpCNAAJSlA0aIyADVgLt/MAH8I2InQAUAntr24LE0GoASRL+4A8Cs3zJx74J+iQPgUFsBPXKMOAZAR1QkgDg14hiAMrNEbwQ2BVALBAURrC4L4IILwBOBAQjFEHhnqMYAdwDQ+SdjYFcxAWpEAMCGFSt/FwCcGQjipKvFcdJmDLAY1T+3Ag2X/0ibIENeAD/yjBZI5Z+Cf7YAVNCOMYAYAFwEZmnyb5lX7TgAIsUZBxhQ0CcXMBFHcHnQd1EAeQCgRiECCQCDKQDM4GBCEOIFwAQgcARCBxKikggqhwBQBQ0PBfBEHgfgsOGDLZAIAAQwrUHFjAtR5VEAIEihSAbuPEIDj2Ad1MhUSCbp5EWwrNJRAC3UQEaTDkXRh0DiiALfRS7h9Q8iK1Hkzz9OkHbGYWfIAYArWDIkAA8EBWFRAB1cYEAANPzARJwMbalRIxYEgdYNFkSwnkRRDASDILv8o8idL33wTU6IAHqQCB8FgIQWeXXQ10SPDNToQDc8CEItrtRy5JMNTf8F66xAJnBADSBoClZpFgwURC2LxmpHAk/coKtDATwlQhn5qBPBPw069IVnAnGw40ZIxHABMEcQQAA/DETQRaw5YTFPGQBYYJNGT1VSQAE7eJsPtA3Z8Q8WQhDwzzrSHbuQK/8M824v3hbzTwVRBfCFjA5+88883v4DDQB3+KtQqc+8W4AlBJjxz3T/BMCJFxGIUMIBi7ZXhrcEJNOZxQnZ8g8+02h8RDv/1BAyIMthAQ5MZ2h3QwkABMOPGVj8cw7MCDUSyT+MACMJMNt45cM/IFgggiyB/MOPnU+kFQACa+T1zxZMJ0TDV2YP8snOAJTxzygCxfKmdgEYIIUCFXxXk7ZCN3hAllmphkzZM/+w44LXACjgIJMhyRoVIHEP1Ms+d89akGsiPCPMP8D4IsJtmhOUXHS+XAHTI3//SEUkF4gwASGtdxrADQyXrvvuvPfu++/A9x4QADs="
};

const LOADING_SUBTITLE = [
    "Loading, please wait.",
    "Fetching data, hold on.",
    "Processing your request.",
    "Hang tight, loading now.",
    "Almost done, one moment.",
    "Thank you for waiting.",
    "Preparing your content.",
    "Just a moment, loading.",
    "Loading, we’re on it.",
    "Fetching content for you.",
    "Please wait a moment.",
    "Loading, nearly there.",
    "Thanks for your patience.",
    "Hold on, working on it.",
    "Getting things ready.",
    "Loading your data now.",
    "Processing, hang tight.",
    "Content loading shortly.",
    "Please hold on a sec.",
    "We’re working on it.",
    "Loading, almost there.",
    "Just a moment please.",
    "Preparing things now.",
    "We’re on it, hold on.",
    "Content on the way.",
    "Your data is loading.",
    "Loading, stay tuned.",
    "Almost ready, hold on.",
    "Fetching info for you.",
    "Hang tight, processing.",
    "Loading up, please wait.",
    "Getting your data now.",
    "One sec, almost done.",
    "Hold tight, we’re close.",
    "Preparing things for you.",
    "We’re loading, thanks.",
    "Fetching now, hold on.",
    "One moment, loading.",
    "Processing info, hang tight.",
    "Your content is on its way.",
    "Just a sec, loading.",
    "Please stand by.",
    "Hang on, preparing now.",
    "Content loading, thank you.",
    "Retrieving data, hold on.",
    "Loading now, one moment.",
    "We’re setting things up.",
    "Preparing to display content.",
    "Processing quickly, hold on.",
    "Getting everything ready.",
    "Finalizing things, one moment.",
    "We’re almost ready.",
    "Thanks for bearing with us.",
    "Loading your request now.",
    "Please wait while we load.",
    "Hang tight, preparing now.",
    "Working on your request.",
    "Getting things done for you.",
    "Almost finished loading.",
    "Just a bit more, loading.",
    "Setting things up for you.",
    "Hold tight, finishing up.",
    "Loading, thanks for waiting.",
    "One moment, getting ready.",
    "We’re nearly finished.",
    "Please wait, almost there.",
    "Your data is coming soon.",
    "Just a few seconds more.",
    "Preparing everything now.",
    "Content is almost ready.",
    "Final touches, hold on."
];

/**
 *
 */
class BLoading extends BModal {
    #interval = null;
    #backdrop = null;
    #observer = null;
    #bound = null;

    /**
     *
     * @param content
     */
    constructor(content = "") {
        super({
            "content": content, //
            "closeButton": false, //
            "displayHeader": false, //
            "displayFooter": false
        });

        const element = this.getElement();
        const subtitle = element.querySelector(".loading-content span");
        if (subtitle.innerHTML.trim() === "") {
            subtitle.innerHTML = LOADING_SUBTITLE[Math.floor(Math.random() * LOADING_SUBTITLE.length)];

            this.#interval = setInterval(() => {
                subtitle.innerHTML = LOADING_SUBTITLE[Math.floor(Math.random() * LOADING_SUBTITLE.length)];
            }, 5000);
        }
    }

    /**
     *
     * @param title
     * @param icon
     * @param subtitle
     * @returns {string}
     */
    static #getHTML(title, icon, subtitle) {
        // language=HTML
        return `
            <div>
                <style>
                    .loading-content {
                        min-width: 500px;
                    }
                    .img-loading {
                        width: 60px;
                        height: 60px;
                    }
                </style>
                <div class="loading-content">
                    <div class="row">
                        <div class="col-sm-2">
                            <img class="img-loading" src="${icon}">
                        </div>
                        <div class="col-sm">
                            <div class="row">
                                <div class="col-sm">
                                    <h3 class="m-0">${title}</h3>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-sm">
                                    <span class="fw-light">${subtitle}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     *
     * @param target
     * @param title
     * @param icon
     * @param subtitle
     * @returns {BLoading}
     */
    static element(target, title = "Loading...", icon = LOADING_ICON.loading, subtitle = "") {
        const instance = BLoading.screen(title, icon, subtitle);
        instance.#restrict(target);
        return instance;
    }

    /**
     *
     * @param title
     * @param icon
     * @param subtitle
     * @returns {BLoading}
     */
    static screen(title = "Loading...", icon = LOADING_ICON.loading, subtitle = "") {
        // language=HTML
        const template = this.#getHTML(title, icon, subtitle);
        return new BLoading(template);
    }

    /**
     *
     * @param target
     */
    #restrict(target) {
        // Fixes the window overflow
        document.body.style.overflow = "visible";

        // Obtains element modal and dialog
        const element = this.getElement();
        const modal = element.querySelector(".modal");
        const dialog = modal.querySelector(".modal-dialog");

        // Replaces the backdrop
        // language=HTML
        this.#backdrop = new DOMParser().parseFromString(`
            <div class="modal-backdrop show"></div>
        `, "text/html").body.firstChild;

        // Checks if the element can be replaced
        const bootstrapModal = this.getModal();
        if (bootstrapModal._backdrop && bootstrapModal._backdrop._element) {
            bootstrapModal._backdrop._element.remove();
            bootstrapModal._backdrop._element = this.#backdrop;
            document.body.append(this.#backdrop);
        }

        // Ensures proper positioning
        this.#backdrop.style.position = "absolute";

        modal.style.position = "absolute";

        // Sets the initial position
        this.#updatePosition(target, modal, dialog);

        // Observes size changes
        this.#observer = new ResizeObserver(() => this.#updatePosition(target, modal, dialog));
        this.#observer.observe(target);

        // Handles window resize and scroll
        this.#bound = () => this.#updatePosition(target, modal, dialog);
        window.addEventListener("scroll", this.#bound);
        window.addEventListener("resize", this.#bound);
    }

    /**
     *
     * @param target
     * @param modal
     * @param dialog
     */
    #updatePosition(target, modal, dialog) {
        // Obtains the position of the target
        const rect = target.getBoundingClientRect();

        // Obtains the scrolling position
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

        // Calculate offsets to center the dialog within the target
        const dialogWidth = dialog.offsetWidth;
        const dialogHeight = dialog.offsetHeight;

        const offsetX = (rect.width - dialogWidth) / 2;
        const offsetY = (rect.height - dialogHeight) / 2;

        // Updates modal position and size
        modal.style.top = `${rect.top + scrollTop}px`;
        modal.style.left = `${rect.left + scrollLeft}px`;
        modal.style.width = `${rect.width}px`;
        modal.style.height = `${rect.height}px`;

        // Center the dialog within the modal
        dialog.style.position = "absolute";
        dialog.style.top = `${offsetY}px`;
        dialog.style.left = `${offsetX}px`;

        // Updates backdrop position and size
        this.#backdrop.style.top = `${rect.top + scrollTop}px`;
        this.#backdrop.style.left = `${rect.left + scrollLeft}px`;
        this.#backdrop.style.width = `${rect.width}px`;
        this.#backdrop.style.height = `${rect.height}px`;

        // Removes default Bootstrap modal centering
        dialog.style.margin = "0";
    };

    /**
     *
     */
    close() {
        if (this.#interval !== null) clearInterval(this.#interval);
        if (this.#observer) this.#observer.disconnect();
        if (this.#backdrop) this.#backdrop.remove();
        if (this.#bound) {
            window.removeEventListener("scroll", this.#bound);
            window.removeEventListener("resize", this.#bound);
        }

        super.close();
    }
}

export { BLoading, LOADING_ICON, LOADING_SUBTITLE, MODAL_ACTION, MODAL_ACTION_COLOR, MODAL_COLOR, MODAL_SIZE, BModal as default };
