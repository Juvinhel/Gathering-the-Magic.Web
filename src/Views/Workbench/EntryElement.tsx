namespace Views.Workbench
{
    export class EntryElement extends HTMLElement
    {
        constructor (entry: Data.Entry)
        {
            super();

            this.classList.add("card-container");

            const card = JSON.clone(entry);
            delete card.quantity;

            this.title = card.name;
            this.card = card;
            this.quantity = entry.quantity;

            this.append(...this.build());

            this.addEventListener("click", this.clicked.bind(this));
            this.addEventListener("rightclick", showContextMenu.bind(this));
            this.addEventListener("mouseenter", this.enter.bind(this));
            this.addEventListener("mouseleave", this.leave.bind(this));

            this.draggable = true;
            this.addEventListener("dragstart", dragStart.bind(this));
            this.addEventListener("dragover", dragOver.bind(this));
            this.addEventListener("dragleave", dragLeave.bind(this));
            this.addEventListener("drop", drop.bind(this));
            this.addEventListener("dragend", dragEnd.bind(this));
        }

        private build()
        {
            return [
                <input class="quantity" type="number" value={ this.quantity } min="1" max="99" step="1" onchange={ this.quantityChange.bind(this) } draggable={ true } ondragstart={ preventDrag } />,
                <div class="move-actions">
                    <a class="up-button" onclick={ this.moveUp.bind(this) }><color-icon src="img/icons/chevron-up.svg" /></a>
                    <a class="down-button" onclick={ this.moveDown.bind(this) }><color-icon src="img/icons/chevron-down.svg" /></a>
                </div>,
                <span class="name">{ this.card.name }</span>,
                <span class="type">{ this.card.type.card.join(" ") }</span>,
                <span class="mana" innerHTML={ parseSymbolText(this.card.manaCost) } />,
                <div class="card-actions">
                    <a class="commander-button" onclick={ this.setAsCommander.bind(this) }><color-icon src="img/icons/helmet.svg" /></a>
                    <a class="delete-button" onclick={ this.delete.bind(this) }><color-icon src="img/icons/delete.svg" /></a>
                    <a class="move-to-button" onclick={ this.moveTo.bind(this) }><color-icon src="img/icons/arrow-right.svg" /></a>
                </div>,
                <div class="image"><img src="img/card-back.png" lazy-image={ this.card.img } /></div>,
            ];
        }

        public card: Data.API.Card;
        public quantity: number;
        public get selected() { return this.classList.contains("selected"); }
        public set selected(value: boolean)
        {
            this.classList.toggle("selected", value);

            if (value)
            {
                const selectedEvent = new CustomEvent("cardselected", { bubbles: true, detail: { card: this.card } });
                this.dispatchEvent(selectedEvent);
            }
        }

        public get path(): string
        {
            let title = this.title;
            for (const parent of this.findParents())
                if (parent != this && parent instanceof SectionElement)
                    title = parent.title + " > " + title;
            return title;
        }

        private quantityChange(event: Event)
        {
            const input = event.currentTarget as HTMLInputElement;
            this.quantity = parseInt(input.value);
            input.dispatchEvent(new Event("calccardcount", { bubbles: true }));
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

        public setAsCommander()
        {
            const name = this.querySelector(".name").textContent;
            const workbench = this.closest("my-workbench");

            const commanderList = workbench.querySelector(".commander-list");
            const currentCommanders = [...commanderList.querySelectorAll("li")].map(x => x.textContent);
            if (currentCommanders.includes(name))
                currentCommanders.remove(name);
            else
                currentCommanders.push(name);
            commanderList.clearChildren();
            commanderList.append(...currentCommanders.map(x => <li ondblclick={ (event: Event) => (event.currentTarget as HTMLElement).remove() }>{ x }</li>));
        }

        public delete()
        {
            this.remove();
        }

        public async moveTo()
        {
            const workbench = this.closest("my-workbench") as WorkbenchElement;
            const sectionElements = [...workbench.querySelectorAll("my-section") as NodeListOf<SectionElement>];
            const sectionTitles = sectionElements.map(s => s.path);

            const result = await selectSection("Move this Card to ...", sectionTitles);
            if (!result) return;
            const selectedSection = sectionElements[result.index] as HTMLElement;

            const list = selectedSection.querySelector(".list");
            this.remove();
            list.append(this);
        }

        private enter(event: MouseEvent)
        {
            const selectedEvent = new CustomEvent("cardhovered", { bubbles: true, detail: { card: this.card } });
            this.dispatchEvent(selectedEvent);
        }

        private leave(event: MouseEvent)
        {
            const selectedEvent = new CustomEvent("cardhovered", { bubbles: true, detail: { card: null } });
            this.dispatchEvent(selectedEvent);
        }
    }

    customElements.define("my-entry", EntryElement);
}