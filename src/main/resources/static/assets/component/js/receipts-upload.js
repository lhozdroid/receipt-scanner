import Util from "../../util/js/util.js";
import BModal from "../../bmodal/js/bmodal.min.js";

export default class ReceiptsUpload extends HTMLElement {
    #input = null;
    #filepond = null;
    #counter = 0;

    /**
     *
     */
    constructor() {
        super();
    }

    /**
     *
     */
    #initFilepond() {
        FilePond.registerPlugin();
        FilePond.registerPlugin(FilePondPluginFileValidateType);

        this.#filepond = FilePond.create(this.#input);
        this.#filepond.setOptions({
            "server": {
                "url": `${Util.getMeta("context")}api/receipts/upload`, //
                "method": "POST",
                process: {
                    onerror: (response) => {
                        return response;
                    }
                }
            }, //
            "acceptedFileTypes": ["image/*"], //
            "allowRevert": false, //
            "allowRemove": false, //
            "labelIdle": "Click here to upload the receipts",
            "maxParallelUploads": 5,
            "checkValidity": true,
            "labelFileProcessingError": (error) => {
                return error.body;
            }
        });

        this.#filepond.on("processfile", (error, file) => {
            if (!error) {
                this.#counter++;
                this.querySelector("span.total-uploaded").innerHTML = this.#counter;
                setTimeout(() => this.#filepond.removeFile(file.id), 3000);
            }
        });
    }

    /**
     *
     */
    #initTemplate() {
        // language=HTML
        const template = `
            <div>
                <style>
                    .filepond--credits {
                        display: none;
                    }

                    .filepond--drop-label, .filepond--drop-label label {
                        cursor: pointer;
                    }

                    .filepond--root {
                        margin-bottom: 0;
                    }
                </style>
                <div class="row">
                    <div class="col">
                        Total receipts uploaded :
                        <span class="total-uploaded">${this.#counter}</span>
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <input type="file" name="file" accept="image/*, application/pdf" multiple>
                    </div>
                </div>
            </div>
        `;
        this.innerHTML = template;
        this.#input = this.querySelector("input");
    }

    /**
     *
     */
    connectedCallback() {
        this.#initTemplate();
        this.#initFilepond();
    }
}