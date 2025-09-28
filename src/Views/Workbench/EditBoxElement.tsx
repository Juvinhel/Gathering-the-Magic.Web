namespace Views.Workbench
{
    export class EditBoxElement extends HTMLElement
    {
        constructor ()
        {
            super();

            this.append(<span></span>);
        }

        static get observedAttributes()
        {
            return ["text"];
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
            this.addEventListener("keyup", this.doKeyUp, { capture: true });
            this.addEventListener("focusout", this.doFocusOut);
        }

        disconnectedCallback()
        {
            this.removeEventListener("dblclick", this.doDBLClick, { capture: true });
            this.removeEventListener("keyup", this.doKeyUp, { capture: true });
            this.removeEventListener("focusout", this.doFocusOut);
        }

        public get text(): string { return this.getAttribute("text"); }
        public set text(value: string) { this.setAttribute("text", value); }

        private doDBLClick = function (this: EditBoxElement, event: Event)
        {
            if (!this.classList.contains("disabled") && this.firstChild instanceof HTMLSpanElement)
            {
                this.firstChild.remove();
                this.append(<input type="text" value={ this.text } />);
                this.firstChild.focus();
            }
        }.bind(this);

        private doFocusOut = function (this: EditBoxElement, event: Event)
        {
            this.exitEdit();
        }.bind(this);

        private isExiting: boolean = false;
        private exitEdit()
        {
            if (this.isExiting) return;

            this.isExiting = true;
            try
            {
                if (this.firstChild instanceof HTMLInputElement)
                {
                    const newText = this.firstChild.value;

                    this.firstChild.remove();
                    this.append(<span />);

                    if (newText != this.text)
                    {
                        this.text = newText;
                        this.dispatchEvent(new Event("change", { bubbles: true }));
                    }
                    else
                        (this.firstChild as HTMLSpanElement).innerHTML = parseSymbolText(this.text);
                }
            } catch { }
            this.isExiting = false;
        }

        private doKeyUp = function (this: EditBoxElement, event: KeyboardEvent)
        {
            if (this.firstChild instanceof HTMLInputElement)
            {
                if (event.key === "Enter")
                {
                    this.exitEdit();
                    event.preventDefault();
                    event.stopPropagation();
                }
                if (event.key === "Escape")
                {
                    this.firstChild.value = this.text;
                    this.exitEdit();
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
        }.bind(this);
    }

    customElements.define("my-edit-box", EditBoxElement);
} 