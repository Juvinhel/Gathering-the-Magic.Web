namespace Views.Workbench
{
    export class TagListElement extends HTMLElement
    {
        constructor ()
        {
            super();
        }

        static get observedAttributes()
        {
            return ["tags"];
        }

        attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null)
        {
            switch (name)
            {
                case "tags":
                    if (this.firstChild instanceof HTMLInputElement)
                        this.firstChild.value = newValue;
                    else
                    {
                        this.clearChildren();
                        const tags = newValue?.split(",").map(x => x.trim()) ?? [];
                        for (const tag of tags)
                            if (tag) this.appendChild(<span title={ tag }>{ tag }</span>);
                    }
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

        public get tags(): string[]
        {
            return this.getAttribute("tags")?.split(",").map(x => x.trim()) ?? [];
        }

        public set tags(value: string[])
        {
            this.setAttribute("tags", value.join(", "));
        }

        private doDBLClick = function (this: TagListElement, event: Event)
        {
            console.log("dbclick");
            if (!this.classList.contains("disabled"))
            {
                this.clearChildren();

                const text = this.tags.join(", ");
                this.append(<input type="text" value={ text } />);
                (this.firstChild as HTMLInputElement).focus();
            }
        }.bind(this);

        private doFocusOut = function (this: TagListElement, event: Event)
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
                    const oldText = this.tags.join(", ");
                    this.firstChild.remove();
                    const tags = newText.split(", ").map(x => x.trim());
                    for (const tag of tags)
                        if (tag) this.appendChild(<span title={ tag }>{ tag }</span>);

                    if (newText != oldText)
                    {
                        this.tags = tags;

                        this.dispatchEvent(new Event("change", { bubbles: true }));
                    }
                }
            } catch { }
            this.isExiting = false;
        }

        private doKeyUp = function (this: TagListElement, event: KeyboardEvent)
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
                    this.firstChild.value = this.tags.join(", ");
                    this.exitEdit();
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
        }.bind(this);
    }

    customElements.define("my-tag-list", TagListElement);
} 