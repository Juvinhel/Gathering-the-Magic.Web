namespace Views.Workbench
{
    export class LargeEditBoxElement extends HTMLElement
    {
        constructor ()
        {
            super();

            this.append(<span></span>);
        }

        static get observedAttributes()
        {
            return ["text", "large"];
        }

        attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null)
        {
            switch (name)
            {
                case "text":
                    if (this.firstChild instanceof HTMLSpanElement)
                        this.firstChild.innerHTML = parseSymbolText(newValue);
                    else if (this.firstChild instanceof HTMLInputElement)
                        this.firstChild.value = newValue;
                    break;
            }
        }

        connectedCallback()
        {
            this.addEventListener("dblclick", this.doDBLClick, { capture: true });
        }

        disconnectedCallback()
        {
            this.removeEventListener("dblclick", this.doDBLClick, { capture: true });
        }

        public get text(): string { return this.getAttribute("text"); }
        public set text(value: string) { this.setAttribute("text", value); }

        private doDBLClick = async function (this: EditBoxElement, event: Event)
        {
            if (!this.classList.contains("disabled"))
            {
                const text = await Dialogs.TextEdit("Edit Text", this.text);
                this.text = text?.trim() ?? "";
            }
        }.bind(this);
    }

    customElements.define("my-large-edit-box", LargeEditBoxElement);
} 