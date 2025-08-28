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

            this.addEventListener("rightclick", this.showContextMenu.bind(this));
            this.addEventListener("calccardcount", this.calcCardCount.bind(this));
            this.addEventListener("rendered", this.calcCardCount.bind(this));

            this.draggable = true;
            this.addEventListener("dragstart", dragStart);
            this.addEventListener("dragend", dragEnd);
        }

        private build(section: Data.Section)
        {
            return [
                <div class="header" ondragover={ dragOver } ondragleave={ dragLeave } ondrop={ drop }>
                    <div class={ ["move-actions", this.topLevel ? "none" : null] }>
                        <a class={ ["up-button"] } onclick={ this.moveUp.bind(this) }><color-icon src="img/icons/chevron-up.svg" /></a>
                        <a class={ ["down-button"] } onclick={ this.moveDown.bind(this) }><color-icon src="img/icons/chevron-down.svg" /></a>
                    </div>
                    <h2 class={ ["title", this.topLevel ? null : "double-click-to-edit"] } { ...(this.topLevel ? null : { ondblclick: doubleClickToEdit }) } onchange={ this.titleChange.bind(this) } >{ section.title }</h2>
                    <div class="actions">
                        <span class="card-count">0</span>
                        <a class={ ["add-section-button"] } onclick={ this.addSection.bind(this) }><color-icon src="img/icons/add-section.svg" /></a>
                        <a class={ ["dissolve-button", this.topLevel ? "none" : null] } onclick={ this.dissolve.bind(this) }><color-icon src="img/icons/unlink.svg" /></a>
                        <a class={ ["delete-button", this.topLevel ? "none" : null] } onclick={ this.delete.bind(this) }><color-icon src="img/icons/delete.svg" /></a>
                        <a class={ ["move-to-button", this.topLevel ? "none" : null] } onclick={ this.showMoveDialog.bind(this) }><color-icon src="img/icons/arrow-right.svg" /></a>
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

        private showContextMenu(event: PointerEvent)
        {
            UI.ContextMenu.show(event,
                this.topLevel ? null : <menu-button title="Move Up" onclick={ this.moveUp.bind(this) }><color-icon src="img/icons/chevron-up.svg" /><span>Move Up</span></menu-button>,
                this.topLevel ? null : <menu-button title="Move Down" onclick={ this.moveDown.bind(this) }><color-icon src="img/icons/chevron-down.svg" /><span>Move Down</span></menu-button>,
                <menu-button title="Add Sub-Section" onclick={ this.addSection.bind(this) }><color-icon src="img/icons/add-section.svg" /><span>Add Sub-Section</span></menu-button>,
                this.topLevel ? null : <menu-button title="Dissolve Section" onclick={ this.dissolve.bind(this) }><color-icon src="img/icons/unlink.svg" /><span>Dissolve</span></menu-button>,
                this.topLevel ? null : <menu-button title="Delete Section" onclick={ this.delete.bind(this) }><color-icon src="img/icons/delete.svg" /><span>Delete</span></menu-button>,
                this.topLevel ? null : <menu-button title="Move Section" onclick={ this.showMoveDialog.bind(this) }><color-icon src="img/icons/arrow-right.svg" /><span>Move to ...</span></menu-button>
            );
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

        private addSection()
        {
            const list = this.querySelector(".list");
            const newSection = new SectionElement({ title: "", items: [] }, false);

            list.appendChild(newSection);
            const title = newSection.querySelector(".title") as HTMLElement;
            title.dispatchEvent(new MouseEvent("dblclick", { bubbles: true, cancelable: true }));
            title.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        private async dissolve()
        {
            const result = await UI.Dialog.confirm({ title: "Dissolve Section", text: "Do you really want to delete this section and move all of its contents to the parent?" });
            if (!result) return;

            const listElement = this.querySelector(".list");
            const items = [...listElement.children];
            this.replaceWith(...items);
        }

        private async delete()
        {
            const result = await UI.Dialog.confirm({ title: "Delete Section", text: "Do you really want to delete this section and all of its contents?" });
            if (!result) return;

            if (this) this.remove();
        }

        public async showMoveDialog()
        {
            const workbench = this.closest("my-workbench") as WorkbenchElement;
            const sectionElements = [...workbench.querySelectorAll("my-section") as NodeListOf<SectionElement>].filter(x => x != this).filter(x => !this.contains(x));
            const sectionNames = sectionElements.map(x => getSectionPath(x));

            const result = await selectSection(sectionNames);
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