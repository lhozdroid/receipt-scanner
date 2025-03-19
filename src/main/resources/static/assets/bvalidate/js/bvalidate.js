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

/**
 * Validation of forms for bootstrap
 */
class BValidate {
    /** The form */
    #form = null;

    /** Configuration */
    #config = {
        /** Events */
        "onSubmit": (event) => {
            event.target.submit();
        }, //
        "onFormErrors": (event, errors) => {
        },

        /** Render and clear validations */
        "renderFieldValidations": (field, errors) => {
            this.#renderFieldValidations(field, errors);
        }, //
        "clearFieldValidations": (field) => {
            this.#clearFieldValidations(field);
        },

        /** Validations and their messages */
        "validations": validations, //
        "messages": messages
    };

    /**
     * Default constructor
     * @param form
     * @param config
     */
    constructor(form, config = {}) {
        this.#config = Util.deepExtend(this.#config, config);

        // Checks given element is of type FORM
        if (form.tagName !== "FORM") {
            console.error("Given element is not of type FORM.");
        }

        // Prepares the form events
        else {
            this.#form = form;

            // Sets the submit event
            this.#form.addEventListener("submit", (e) => {
                e.preventDefault();
                const errors = this.#validateForm();

                let hasErrors = false;
                for (let i = 0; i < Object.keys(errors).length; i++) {
                    const fieldName = Object.keys(errors)[i];
                    const fieldErrors = errors[fieldName];
                    if (fieldErrors.length > 0) {
                        hasErrors = true;
                        break;
                    }
                }

                if (!hasErrors) this.#config.onSubmit(e); else this.#config.onFormErrors(e, errors);
            });

            // Sets the input event on the fields
            const fields = this.#form.querySelectorAll("input,textarea,select");
            for (let i = 0; i < fields.length; i++) {
                const field = fields[i];
                field.addEventListener("input", () => {
                    this.#validateField(field);
                });
            }
        }
    }

    /**
     * Clears errors in a field
     * @param field
     */
    #clearFieldValidations(field) {
        const unorderedList = field.parentNode.querySelector("ul.list-unstyled.text-danger");
        if (unorderedList != null) unorderedList.remove();
        field.classList.remove("is-invalid");
        field.classList.remove("is-valid");
    }

    /**
     * Displays the errors in a field
     * @param field
     * @param errors
     */
    #renderFieldValidations(field, errors) {
        let listItems = "";
        for (let i = 0; i < errors.length; i++) {
            // language=HTML
            listItems += `
                <li>${errors[i]}</li>
            `;
        }

        // language=HTML
        const unorderedList = document.createRange().createContextualFragment(`
            <ul class="list-unstyled text-danger">${listItems}</ul>
        `);
        field.after(unorderedList);
        field.classList.add("is-invalid");
    }

    /**
     * Validates a specific field
     * @param field
     * @returns {*[]}
     */
    #validateField(field) {
        const errors = [];

        this.#config.clearFieldValidations(field);

        const dataset = field.dataset;
        for (let i = 0; i < Object.keys(validations).length; i++) {
            const name = Object.keys(validations)[i];
            if (dataset.hasOwnProperty(name)) {
                const isValid = validations[name](this.#form, field, dataset[name]);
                if (!isValid) {
                    const message = messages[name](dataset[name]);
                    errors.push(message);
                }
            }
        }

        if (errors.length > 0) {
            this.#config.renderFieldValidations(field, errors);
        }

        return errors;
    }

    /**
     * Validates the complete form
     * @returns {{}}
     */
    #validateForm() {
        const errors = {};

        // Obtains the fields
        const fields = this.#form.querySelectorAll("input,textarea,select");
        for (let i = 0; i < fields.length; i++) {
            const field = fields[i];
            if (field.hasAttribute("name")) {
                const fieldErrors = this.#validateField(field);
                errors[field.getAttribute("name")] = fieldErrors;
            }
        }

        return errors;
    }

    /**
     *
     * @returns {boolean}
     */
    isValid() {
        const errors = this.#validateForm();

        for (const fieldName in errors) {
            if (errors[fieldName].length > 0) {
                return false;
            }
        }

        return true;
    }
}

/**
 * Available default validations
 * @type {{alphanumeric: (function(*, *, *): *), date: (function(*, *, *): *), postalCodeUs: (function(*, *, *): *), blank: (function(*, *, *): *), max: (function(*, *, *): *), minLength: (function(*, *, *): *), ip: (function(*, *, *): *), notEqualsTo: (function(*, *, *): *), phoneUs: (function(*, *, *): *), required: (function(*, *, *): boolean), url: (function(*, *, *): *), number: (function(*, *, *): *), min: (function(*, *, *): *), ipv4: (function(*, *, *): *), ipv6: (function(*, *, *): *), digits: (function(*, *, *): *), creditCard: (function(*, *, *): *), equalsTo: (function(*, *, *): *), email: (function(*, *, *): *), maxLength: (function(*, *, *): *)}}
 */
const validations = {
    /**
     *
     * @param form
     * @param field
     * @param config
     * @returns {boolean}
     */
    "blank": (form, field, config) => {
        const value = field.value;
        return value === null || value.trim() === "";
    },

    /**
     *
     * @param form
     * @param field
     * @param config
     * @returns {boolean}
     */
    "required": (form, field, config) => {
        field.value;
        return !(validations.blank(form, field, config));
    },

    /**
     *
     * @param form
     * @param field
     * @param config
     * @returns {boolean}
     */
    "email": (form, field, config) => {
        const value = field.value;
        return validations.blank(form, field, config) || /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(value);
    },

    /**
     *
     * @param form
     * @param field
     * @param config
     * @returns {boolean}
     */
    "digits": (form, field, config) => {
        const value = field.value;
        return validations.blank(form, field, config) || /^\d+$/.test(value);
    },

    /**
     *
     * @param form
     * @param field
     * @param config
     * @returns {boolean}
     */
    "number": (form, field, config) => {
        const value = field.value;
        return validations.blank(form, field, config) || /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value);
    },

    /**
     *
     * @param form
     * @param field
     * @param config
     * @returns {boolean}
     */
    "alphanumeric": (form, field, config) => {
        const value = field.value;
        return validations.blank(form, field, config) || /^\w+$/i.test(value);
    },

    /**
     *
     * @param form
     * @param field
     * @param config
     * @returns {boolean}
     */
    "minLength": (form, field, config) => {
        const value = field.value;
        return validations.blank(form, field, config) || value.length >= parseInt(config);
    },

    /**
     *
     * @param form
     * @param field
     * @param config
     * @returns {boolean}
     */
    "maxLength": (form, field, config) => {
        const value = field.value;
        return validations.blank(form, field, config) || value.length <= parseInt(config);
    },

    /**
     *
     * @param form
     * @param field
     * @param config
     * @returns {boolean}
     */
    "min": (form, field, config) => {
        const value = field.value;
        return validations.blank(form, field, config) || (validations.number(form, field, config) && parseFloat(value) >= parseFloat(config));
    },

    /**
     *
     * @param form
     * @param field
     * @param config
     * @returns {boolean}
     */
    "max": (form, field, config) => {
        const value = field.value;
        return validations.blank(form, field, config) || (validations.number(form, field, config) && parseFloat(value) <= parseFloat(config));
    },

    /**
     *
     * @param form
     * @param field
     * @param config
     * @returns {boolean}
     */
    "equalsTo": (form, field, config) => {
        const value = field.value;

        const otherField = form.querySelector(config);
        const otherValue = otherField.value;

        return validations.blank(form, field, config) || value === otherValue;
    },

    /**
     *
     * @param form
     * @param field
     * @param config
     * @returns {boolean}
     */
    "notEqualsTo": (form, field, config) => {
        const value = field.value;

        const otherField = form.querySelector(config);
        const otherValue = otherField.value;

        return validations.blank(form, field, config) || value !== otherValue;
    },

    /**
     *
     * @param form
     * @param field
     * @param config
     * @returns {boolean}
     */
    "creditCard": (form, field, config) => {
        const value = field.value;
        return validations.blank(form, field, config) || / (^4[0-9]{12}(?:[0-9]{3})?$)|(^(?:5[1-5][0-9]{2}|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12}$)|(3[47][0-9]{13})|(^3(?:0[0-5]|[68][0-9])[0-9]{11}$)|(^6(?:011|5[0-9]{2})[0-9]{12}$)|(^(?:2131|1800|35\d{3})\d{11}$)/.test(value);
    },

    /**
     *
     * @param form
     * @param field
     * @param config
     * @returns {boolean}
     */
    "postalCodeUs": (form, field, config) => {
        const value = field.value;
        return validations.blank(form, field, config) || /^\d{5}(?:[-\s]\d{4})?$/.test(value);
    },

    /**
     *
     * @param form
     * @param field
     * @param config
     * @returns {boolean}
     */
    "phoneUs": (form, field, config) => {
        const value = field.value;
        return validations.blank(form, field, config) || /^(\+?1-?)?(\([2-9]([02-9]\d|1[02-9])\)|[2-9]([02-9]\d|1[02-9]))-?[2-9]\d{2}-?\d{4}$/.test(value);
    },

    /**
     *
     * @param form
     * @param field
     * @param config
     * @returns {boolean}
     */
    "url": (form, field, config) => {
        const value = field.value;
        return validations.blank(form, field, config) || /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/.test(value);
    },

    /**
     *
     * @param form
     * @param field
     * @param config
     * @returns {boolean}
     */
    "ipv4": (form, field, config) => {
        const value = field.value;
        return validations.blank(form, field, config) || /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/i.test(value);
    },

    /**
     *
     * @param form
     * @param field
     * @param config
     * @returns {boolean}
     */
    "ipv6": (form, field, config) => {
        const value = field.value;
        return validations.blank(form, field, config) || /^((([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))$/i.test(value);
    },

    /**
     *
     * @param form
     * @param field
     * @param config
     * @returns {boolean}
     */
    "ip": (form, field, config) => {
        field.value;
        return validations.blank(form, field, config) || validations.ipv4(form, field, config) || validations.ipv6(form, field, config);
    },

    /**
     *
     * @param form
     * @param field
     * @param config
     * @returns {boolean}
     */
    "date": (form, field, config) => {
        const value = field.value;
        return validations.blank(form, field, config) || (new Date(value) !== "Invalid Date") && !isNaN(new Date(value));
    }
};

/**
 * Available default validation messages
 * @type {{alphanumeric: (function(*): string), date: (function(*): string), postalCodeUs: (function(*): string), blank: (function(*): string), max: (function(*): string), minLength: (function(*): string), ip: (function(*): string), notEqualsTo: (function(*): string), phoneUs: (function(*): string), required: (function(*): string), url: (function(*): string), number: (function(*): string), min: (function(*): string), ipv4: (function(*): string), ipv6: (function(*): string), digits: (function(*): string), creditCard: (function(*): string), equalsTo: (function(*): string), email: (function(*): string), maxLength: (function(*): string)}}
 */
const messages = {
    /**
     *
     * @param config
     * @returns {string}
     */
    "blank": (config) => {
        return "This field must be empty.";
    },

    /**
     *
     * @param config
     * @returns {string}
     */
    "required": (config) => {
        return "This field is required.";
    },

    /**
     *
     * @param config
     * @returns {string}
     */
    "email": (config) => {
        return "Please enter a valid email address.";
    },

    /**
     *
     * @param config
     * @returns {string}
     */
    "digits": (config) => {
        return "Only digits are allowed.";
    },

    /**
     *
     * @param config
     * @returns {string}
     */
    "number": (config) => {
        return "Please enter a valid number.";
    },

    /**
     *
     * @param config
     * @returns {string}
     */
    "alphanumeric": (config) => {
        return "Only letters and numbers are allowed.";
    },

    /**
     *
     * @param config
     * @returns {string}
     */
    "minLength": (config) => {
        return `Please enter at least ${config} characters.`;
    },

    /**
     *
     * @param config
     * @returns {string}
     */
    "maxLength": (config) => {
        return `Please enter no more than ${config} characters.`;
    },

    /**
     *
     * @param config
     * @returns {string}
     */
    "min": (config) => {
        return `The value must be at least ${config}.`;
    },

    /**
     *
     * @param config
     * @returns {string}
     */
    "max": (config) => {
        return `The value must be no more than ${config}.`;
    },

    /**
     *
     * @param config
     * @returns {string}
     */
    "equalsTo": (config) => {
        return "The value must match.";
    },

    /**
     *
     * @param config
     * @returns {string}
     */
    "notEqualsTo": (config) => {
        return "The value must not match.";
    },

    /**
     *
     * @param config
     * @returns {string}
     */
    "creditCard": (config) => {
        return "Please enter a valid credit card number.";
    },

    /**
     *
     * @param config
     * @returns {string}
     */
    "postalCodeUs": (config) => {
        return "Please enter a valid US postal code.";
    },

    /**
     *
     * @param config
     * @returns {string}
     */
    "phoneUs": (config) => {
        return "Please enter a valid US phone number.";
    },

    /**
     *
     * @param config
     * @returns {string}
     */
    "url": (config) => {
        return "Please enter a valid URL.";
    },

    /**
     *
     * @param config
     * @returns {string}
     */
    "ipv4": (config) => {
        return "Please enter a valid IPv4 address.";
    },

    /**
     *
     * @param config
     * @returns {string}
     */
    "ipv6": (config) => {
        return "Please enter a valid IPv6 address.";
    },

    /**
     *
     * @param config
     * @returns {string}
     */
    "ip": (config) => {
        return "Please enter a valid IP address.";
    },

    /**
     *
     * @param config
     * @returns {string}
     */
    "date": (config) => {
        return "Please enter a valid date.";
    }
};

export { BValidate as default };
