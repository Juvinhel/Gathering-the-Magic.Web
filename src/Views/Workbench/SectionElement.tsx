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

            this.append(...this.build(section));

            const header = this.querySelector(".header") as HTMLElement;
            header.addEventListener("click", this.clicked.bind(this));
            header.addEventListener("rightclick", showContextMenu.bind(this));

            this.addEventListener("calccardcount", this.calcCardCount.bind(this));
            this.addEventListener("rendered", this.calcCardCount.bind(this));
        }

        private build(section: Data.Section)
        {
            return [
                <div class="header" draggable={ true } ondragstart={ dragStart.bind(this) } ondragover={ dragOver.bind(this) } ondragleave={ dragLeave.bind(this) } ondragend={ dragEnd.bind(this) } ondrop={ drop.bind(this) }>
                    <div class={ ["move-actions", this.topLevel ? "none" : null] }>
                        <a class={ ["up-button"] } onclick={ this.moveUp.bind(this) }><color-icon src="img/icons/chevron-up.svg" /></a>
                        <a class={ ["down-button"] } onclick={ this.moveDown.bind(this) }><color-icon src="img/icons/chevron-down.svg" /></a>
                    </div>
                    <h2 class={ ["title", this.topLevel ? null : "double-click-to-edit"] } { ...(this.topLevel ? null : { ondblclick: doubleClickToEdit }) } onchange={ this.titleChange.bind(this) } >{ section.title }</h2>
                    <div class="actions">
                        <span class="card-count">0</span>
                        <a class={ ["add-section-button"] } onclick={ this.addSection.bind(this) }><color-icon src="img/icons/add-section.svg" /></a>
                        <a class={ ["dissolve-button", this.topLevel ? "none" : null] } onclick={ this.dissolveClick.bind(this) }><color-icon src="img/icons/unlink.svg" /></a>
                        <a class={ ["delete-button", this.topLevel ? "none" : null] } onclick={ this.deleteClick.bind(this) }><color-icon src="img/icons/delete.svg" /></a>
                        <a class={ ["move-to-button", this.topLevel ? "none" : null] } onclick={ this.moveTo.bind(this) }><color-icon src="img/icons/arrow-right.svg" /></a>
                    </div>
                </div>,
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

        public quantity: number;
        public get topLevel() { return this.classList.contains("top-level"); }
        public get selected() { return this.classList.contains("selected"); }
        public set selected(value: boolean)
        {
            this.classList.toggle("selected", value);
            for (const line of this.lines)
                line.selected = value;
        }

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

        private clickables = ["INPUT", "A", "BUTTON"];
        private clicked(event: Event)
        {
            if (event.composedPath().some(x => this.clickables.includes((x as HTMLElement).tagName))) return;
            this.selected = !this.selected;
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

        private titleChange(event: Event)
        {
            const input = event.currentTarget as HTMLInputElement;
            this.title = input.value;
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

        private async dissolveClick()
        {
            const result = await UI.Dialog.confirm({ title: "Dissolve Section", text: "Do you really want to delete this section and move all of its contents to the parent?" });
            if (!result) return;

            this.dissolve();
        }

        public dissolve()
        {
            const listElement = this.querySelector(".list");
            const items = [...listElement.children];
            this.replaceWith(...items);
        }

        private async deleteClick()
        {
            const result = await UI.Dialog.confirm({ title: "Delete Section", text: "Do you really want to delete this section and all of its contents?" });
            if (!result) return;

            this.delete();
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
            this.querySelector(".card-count").textContent = quantity.toFixed(0);
            this.quantity = quantity;
        }
    }

    customElements.define("my-section", SectionElement);
}