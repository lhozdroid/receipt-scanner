export default class Util {
    /**
     *
     * @param base
     * @param extensions
     * @returns {{}|*}
     */
    static extend(base, ...extensions) {
        if (!base) return {};

        for (const obj of extensions) {
            if (!obj) continue;

            for (const [key, value] of Object.entries(obj)) {
                switch (Object.prototype.toString.call(value)) {
                    case "[object Object]":
                        base[key] = base[key] || {};
                        base[key] = Util.extend(base[key], value);
                        break;
                    case "[object Array]":
                        base[key] = Util.extend(new Array(value.length), value);
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
     * @param localDateTime
     * @returns {string}
     */
    static formatLocalDateTime(localDateTime) {
        const d = new Date(localDateTime);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0'); // Ensure 2 digits
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');

        return `${month}/${day}/${year} ${hours}:${minutes}`;
    }

    /**
     *
     * @param name
     * @returns {string}
     */
    static getMeta(name) {
        return document.querySelector(`meta[name='${name}']`).getAttribute("content");
    }

    /**
     *
     * @param text
     * @returns {string}
     */
    static snakeToTitleCase(text) {
        return text
            .split('_') //
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) //
            .join(' ');
    }

}