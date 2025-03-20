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
        if (localDateTime == null || localDateTime.length < 5) {
            return "Not Available.";
        }
        const [year, month, day, hours, minutes] = localDateTime;
        return `${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}/${year} ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
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