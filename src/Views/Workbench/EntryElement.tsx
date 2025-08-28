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

            this.addEventListener("click", this.select.bind(this));
            this.addEventListener("rightclick", this.showContextMenu.bind(this));
            this.addEventListener("mouseenter", this.enter.bind(this));
            this.addEventListener("mouseleave", this.leave.bind(this));

            this.draggable = true;
            this.addEventListener("dragstart", dragStart);
            this.addEventListener("dragover", dragOver);
            this.addEventListener("dragleave", dragLeave);
            this.addEventListener("drop", drop);
            this.addEventListener("dragend", dragEnd);
        }

        private build()
        {
            return [
                <input class="quantity" type="number" value={ this.quantity } min="1" max="99" step="1" onchange={ this.quantityChange.bind(this) } draggable={ true } ondragstart={ preventDrag } />,
                <div class="move">
                    <a class="up-button" onclick={ this.moveUp.bind(this) }><color-icon src="img/icons/chevron-up.svg" /></a>
                    <a class="down-button" onclick={ this.moveDown.bind(this) }><color-icon src="img/icons/chevron-down.svg" /></a>
                </div>,
                <span class="name">{ this.card.name }</span>,
                <span class="type">{ this.card.type.card.join(" ") }</span>,
                <span class="mana" innerHTML={ parseSymbolText(this.card.manaCost) } />,
                <div class="actions">
                    <a class="commander-button" onclick={ this.setAsCommander.bind(this) }><color-icon src="img/icons/helmet.svg" /></a>
                    <a class="delete-button" onclick={ this.delete.bind(this) }><color-icon src="img/icons/delete.svg" /></a>
                    <a class="move-to-button" onclick={ this.showMoveDialog.bind(this) }><color-icon src="img/icons/arrow-right.svg" /></a>
                </div>
            ];
        }

        public card: Data.API.Card;
        public quantity: number;

        private quantityChange(event: Event)
        {
            const input = event.currentTarget as HTMLInputElement;
            this.quantity = parseInt(input.value);
            input.dispatchEvent(new Event("calccardcount", { bubbles: true }));
        }

        private clickables = ["INPUT", "A", "BUTTON"];
        private select(event: MouseEvent)
        {
            if (event.composedPath().some(x => this.clickables.includes((x as HTMLElement).tagName))) return;

            const result = this.classList.toggle("selected");

            const selectedEvent = new CustomEvent("cardselected", { bubbles: true, detail: { card: result ? this.card : null } });
            this.dispatchEvent(selectedEvent);
        }

        private showContextMenu(event: PointerEvent)
        {
            UI.ContextMenu.show(event,
                <menu-button title="Move Up" onclick={ this.moveUp.bind(this) }><color-icon src="img/icons/chevron-up.svg" /><span>Move Up</span></menu-button>,
                <menu-button title="Move Down" onclick={ this.moveDown.bind(this) }><color-icon src="img/icons/chevron-down.svg" /><span>Move Down</span></menu-button>,
                <menu-button title="Set as Commander" onclick={ this.setAsCommander.bind(this) }><color-icon src="img/icons/helmet.svg" /><span>Set as Commander</span></menu-button>,
                <menu-button title="Delete" onclick={ this.delete.bind(this) }><color-icon src="img/icons/delete.svg" /><span>Delete</span></menu-button>,
                <menu-button title="Move Entry" onclick={ this.showMoveDialog.bind(this) }><color-icon src="img/icons/arrow-right.svg" /><span>Move to ...</span></menu-button>,
                <menu-button title="Scryfall" onclick={ () => window.open(this.card.links.Scryfall, '_blank') }><color-icon src="img/icons/scryfall-black.svg" /><span>Scryfall</span></menu-button>,
                this.card.links.EDHREC ? <menu-button title="EDHREC" onclick={ () => window.open(this.card.links.EDHREC, '_blank') }><color-icon src="img/icons/edhrec.svg" /><span>EDHREC</span></menu-button> : null,
            );
            event.stopPropagation();
            event.preventDefault();
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

        public async showMoveDialog()
        {
            const workbench = this.closest("my-workbench") as WorkbenchElement;
            const sectionElements = [...workbench.querySelectorAll("my-section") as NodeListOf<SectionElement>];
            const sectionTitles = sectionElements.map(x => getSectionPath(x));

            const result = await selectSection(sectionTitles);
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

    export function getSectionPath(section: Element): string
    {
        let title = section.querySelector(".title").textContent;
        for (const parent of section.findParents())
            if (parent != section && parent.classList.contains("section"))
                title = parent.querySelector(".title").textContent + " > " + title;
        return title;
    }

    customElements.define("my-entry", EntryElement);
}