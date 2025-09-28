namespace Views.Workbench
{
    export class SectionHeaderElement extends HTMLElement
    {
        constructor (section: SectionElement)
        {
            super();

            this.section = section;

            this.append(...this.build());

            this.addEventListener("click", this.clicked.bind(this));
            this.addEventListener("rightclick", showContextMenu.bind(this.section));

            this.draggable = true;
            this.addEventListener("dragstart", dragStart.bind(this));
            this.addEventListener("dragover", dragOver.bind(this));
            this.addEventListener("dragleave", dragLeave.bind(this));
            this.addEventListener("dragend", dragEnd.bind(this));
            this.addEventListener("drop", drop.bind(this));

            this.section.addEventListener("calccardcount", this.calcCardCount.bind(this));
        }

        public section: SectionElement;

        private build()
        {
            return [
                <div class={ ["move-actions", this.section.topLevel ? "none" : null] }>
                    <a class={ ["up-button"] } onclick={ this.moveUp.bind(this) }><color-icon src="img/icons/chevron-up.svg" /></a>
                    <a class={ ["down-button"] } onclick={ this.moveDown.bind(this) }><color-icon src="img/icons/chevron-down.svg" /></a>
                </div>,
                <EditBoxElement class={ ["title", this.section.topLevel ? "disabled" : null] } onchange={ this.titleChange.bind(this) } text={ this.section.title } />,
                <div class="actions">
                    <span class="card-count">{ this.section.quantity }</span>
                    <a class={ ["add-section-button"] } onclick={ this.addSection.bind(this) }><color-icon src="img/icons/add-section.svg" /></a>
                    <a class={ ["dissolve-button", this.section.topLevel ? "none" : null] } onclick={ this.dissolveClick.bind(this) }><color-icon src="img/icons/unlink.svg" /></a>
                    <a class={ ["delete-button", this.section.topLevel ? "none" : null] } onclick={ this.deleteClick.bind(this) }><color-icon src="img/icons/delete.svg" /></a>
                    <a class={ ["move-to-button", this.section.topLevel ? "none" : null] } onclick={ this.moveTo.bind(this) }><color-icon src="img/icons/arrow-right.svg" /></a>
                </div>
            ];
        }

        private clickables = ["INPUT", "A", "BUTTON"];
        private clicked(event: Event)
        {
            if (event.composedPath().some(x => this.clickables.includes((x as HTMLElement).tagName))) return;

            const anySelected = this.section.querySelectorAll("my-entry.selected").length > 0;

            if (!App.multiselect)
            {
                const workbench = this.closest("my-workbench") as WorkbenchElement;
                for (const element of workbench.querySelectorAll("my-entry.selected") as NodeListOf<EntryElement>)
                    element.selected = false;
            }

            for (const entry of this.section.querySelectorAll("my-entry") as NodeListOf<EntryElement>)
                entry.selected = !anySelected;
        }

        public moveUp()
        {
            this.section.moveUp();
        }

        public moveDown()
        {
            this.section.moveDown();
        }

        private titleChange(event: Event)
        {
            const input = event.currentTarget as EditBoxElement;
            this.section.title = input.text;
        }

        public addSection()
        {
            this.section.addSection();
        }

        private async dissolveClick()
        {
            const result = await UI.Dialog.confirm({ title: "Dissolve Section", text: "Do you really want to delete this section and move all of its contents to the parent?" });
            if (!result) return;

            this.dissolve();
        }

        public dissolve()
        {
            this.section.dissolve();
        }

        private async deleteClick()
        {
            const result = await UI.Dialog.confirm({ title: "Delete Section", text: "Do you really want to delete this section and all of its contents?" });
            if (!result) return;

            this.delete();
        }

        public delete()
        {
            this.section.delete();
        }

        public clear()
        {
            this.section.clear();
        }

        public async moveTo()
        {
            await this.section.moveTo();
        }

        private calcCardCount(event: Event)
        {
            const cardCount = this.querySelector(".card-count") as HTMLSpanElement;
            cardCount.textContent = this.section.quantity.toFixed(0);
        }
    }

    customElements.define("my-section-header", SectionHeaderElement);
}