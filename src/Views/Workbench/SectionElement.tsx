namespace Views.Workbench
{
    export class SectionElement extends HTMLElement
    {
        constructor (section: Data.Section, topLevel: boolean = false)
        {
            super();

            this.classList.add("section");
            if (topLevel) this.classList.add("top-level");
            this.title = section.title;

            // order matters
            this.addEventListener("calccardcount", this.calcCardCount.bind(this));

            this.append(...this.build(section));

            this.addEventListener("rendered", this.calcCardCount.bind(this));
        }

        private build(section: Data.Section)
        {
            return [
                new SectionHeaderElement(this),
                <div class="list"
                    onchildrenchanged={ (event: Event) =>
                    {
                        const list = event.currentTarget as HTMLDivElement;
                        list.dispatchEvent(new Event("calccardcount", { bubbles: true }));
                    } }>
                    { section.items.map(item => "name" in item ? new EntryElement(item) : new SectionElement(item)) }
                </div>
            ];
        }

        public quantity: number = 0;
        public get topLevel() { return this.classList.contains("top-level"); }

        public get lines(): HTMLCollectionOf<SectionElement | EntryElement>
        {
            return this.querySelector(".list").children as HTMLCollectionOf<SectionElement | EntryElement>;
        }

        public get path(): string
        {
            let title = this.title;
            for (const parent of this.findParents())
                if (parent != this && parent instanceof SectionElement)
                    title = parent.title + " > " + title;
            return title;
        }

        public moveUp()
        {
            let sibling = this.previousElementSibling;
            while (sibling && !(sibling instanceof SectionElement || sibling instanceof EntryElement))
                sibling = sibling.previousElementSibling;

            if (sibling) swapElements(sibling, this);
        }

        public moveDown()
        {
            let sibling = this.nextElementSibling;
            while (sibling && !(sibling instanceof SectionElement || sibling instanceof EntryElement))
                sibling = sibling.nextElementSibling;

            if (sibling) swapElements(sibling, this);
        }

        public get title(): string
        {
            return super.title;
        }

        public set title(value: string)
        {
            if (super.title != value)
            {
                super.title = value;
                const header = this.querySelector("my-section-header") as SectionHeaderElement;
                const heading = header?.querySelector("h2");
                if (heading && heading.textContent != super.title)
                    heading.textContent = super.title;
            }
        }

        public addSection()
        {
            const list = this.querySelector(".list");
            const newSection = new SectionElement({ title: "", items: [] }, false);

            list.appendChild(newSection);
            const title = newSection.querySelector(".title") as HTMLElement;
            title.dispatchEvent(new MouseEvent("dblclick", { bubbles: true, cancelable: true }));
            title.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        public dissolve()
        {
            const listElement = this.querySelector(".list");
            const items = [...listElement.children];
            this.replaceWith(...items);
        }

        public delete()
        {
            this.remove();
        }

        public clear()
        {
            const list = this.querySelector(".list");
            list.clearChildren();
        }

        public async moveTo()
        {
            const workbench = this.closest("my-workbench") as WorkbenchElement;
            const sectionElements = [...workbench.querySelectorAll("my-section") as NodeListOf<SectionElement>].filter(x => x != this).filter(x => !this.contains(x));
            const sectionNames = sectionElements.map(s => s.path);

            const result = await selectSection("Move this Section to ...", sectionNames);
            if (!result) return;
            const selectedSection = sectionElements[result.index];

            const list = selectedSection.querySelector(".list");
            this.remove();
            list.append(this);
        }

        private calcCardCount(event: Event)
        {
            const quantity = [...(this.querySelectorAll("my-entry") as NodeListOf<EntryElement>)].sum(e => e.quantity);
            this.quantity = quantity;
        }
    }

    customElements.define("my-section", SectionElement);
}