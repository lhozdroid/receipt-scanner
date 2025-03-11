export default class ImageZoom {
    #parser = new DOMParser();

    #image = null;
    #imageWidth = null;
    #imageHeight = null;

    #level = null;

    #contents = null;
    #container = null;

    #zoomedImage = null;

    /**
     *
     * @param image
     * @param level
     */
    constructor(image, level = 2) {
        this.#image = image;
        this.#level = level;

        this.#imageWidth = this.#image.offsetWidth;
        this.#imageHeight = this.#image.offsetHeight;

        this.#initContainer();
        this.#initZoomedImage();
    }

    /**
     *
     */
    #initContainer() {
        // language=HTML
        this.#contents = this.#parser.parseFromString(`
            <div>
                <style>
                    .image-zoom-container {
                        position: relative;
                        display: inline-block;
                        overflow: hidden;
                    }

                    .zoomed-image {
                        position: absolute;
                        top: 0;
                        left: 0;
                        pointer-events: none;
                        user-select: none;
                        display: none;
                    }
                </style>
                <div class="image-zoom-container">
                </div>
            </div>
        `, "text/html").body.firstElementChild;
        this.#container = this.#contents.querySelector(".image-zoom-container");

        this.#image.parentNode.insertBefore(this.#contents, this.#image);
        this.#container.appendChild(this.#image);
    }

    /**
     *
     */
    #initZoomedImage() {
        // language=HTML
        this.#zoomedImage = this.#parser.parseFromString(`
            <img class="zoomed-image">
        `, "text/html").body.firstElementChild;
        this.#zoomedImage.src = this.#image.src;

        // Sets the zoomed image dimensions based on the given level.
        this.#zoomedImage.style.width = (this.#imageWidth * this.level) + "px";
        this.#zoomedImage.style.height = (this.#imageHeight * this.level) + "px";

        // Appends the zoomed image to the container.
        this.#container.appendChild(this.#zoomedImage);

        // Binds the event listeners for mouse enter, move, and leave.
        this.#container.addEventListener("mouseenter", (e) => this.#onMouseEnter(e));
        this.#container.addEventListener("mousemove", (e) => this.#onMouseMove(e));
        this.#container.addEventListener("mouseleave", (e) => this.#onMouseLeave(e));
    }

    /**
     *
     * @param event
     */
    #onMouseEnter(event) {
        this.#zoomedImage.style.display = "block";
    }

    /**
     *
     * @param event
     */
    #onMouseLeave(event) {
        this.#zoomedImage.style.display = "none";
    }

    /**
     *
     * @param event
     */
    #onMouseMove(event) {
        const rect = this.#container.getBoundingClientRect();

        // Calculates the cursor position relative to container
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Calculates the maximum offset the zoomed image can move
        const maxOffsetX = this.#zoomedImage.offsetWidth - rect.width;
        const maxOffsetY = this.#zoomedImage.offsetHeight - rect.height;

        // Calculates the new position of the zoomed image
        const offsetX = -(x / rect.width) * maxOffsetX;
        const offsetY = -(y / rect.height) * maxOffsetY;

        // Applies the calculated positions
        this.#zoomedImage.style.left = offsetX + "px";
        this.#zoomedImage.style.top = offsetY + "px";
    }
}
