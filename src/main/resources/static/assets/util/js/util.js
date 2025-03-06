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
     * @param name
     * @returns {string}
     */
    static getMeta(name) {
        return document.querySelector(`meta[name='${name}']`).getAttribute("content");
    }
}