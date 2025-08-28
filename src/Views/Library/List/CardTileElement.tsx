namespace Views.Library.List
{
    export class CardTileElement extends HTMLElement
    {
        constructor (card: Data.API.Card)
        {
            super();

            this.classList.add("card-container");

            this.title = card.name;
            this.card = card;

            this.append(...this.build());

            this.addEventListener("click", this.select.bind(this));
            this.addEventListener("rightclick", this.showContextMenu.bind(this));
            this.addEventListener("dblclick", this.addCard.bind(this));
            this.addEventListener("mouseenter", this.enter.bind(this));
            this.addEventListener("mouseleave", this.leave.bind(this));

            this.draggable = true;
            this.addEventListener("dragstart", this.dragStart.bind(this));
        }

        private build()
        {
            return [
                <div class="image"><img src="img/card-back.png" lazy-image={ this.card.img } /></div>,
                <color-icon class="in-deck" src="img/icons/deck.svg" />
            ];
        }

        public card: Data.API.Card;

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
                <menu-button title="Insert Card" onclick={ this.showInsertCard.bind(this) }><color-icon src="img/icons/arrow-right.svg" /><span>Insert into ...</span></menu-button>,
                <menu-button title="Scryfall" onclick={ () => window.open(this.card.links.Scryfall, '_blank') }><color-icon src="img/icons/scryfall-black.svg" /><span>Scryfall</span></menu-button>,
                this.card.links.EDHREC ? <menu-button title="EDHREC" onclick={ () => window.open(this.card.links.EDHREC, '_blank') }><color-icon src="img/icons/edhrec.svg" /><span>EDHREC</span></menu-button> : null,
            );
        }

        private async showInsertCard(event: Event)
        {
            const editor = this.closest("my-editor") as Editor.EditorElement;
            const workbench = editor.querySelector("my-workbench") as Workbench.WorkbenchElement;
            const sectionElements = [...workbench.querySelectorAll("my-section") as NodeListOf<Workbench.SectionElement>];
            const sectionTitles = sectionElements.map(x => Views.Workbench.getSectionPath(x));

            const result = await Workbench.selectSection(sectionTitles);
            if (!result) return;
            const selectedSection = sectionElements[result.index];

            const entry: Data.Entry = Object.clone(this.card) as Data.Entry;
            entry.quantity = 1;
            const list = selectedSection.querySelector(".list");
            const entryElement = new Workbench.EntryElement(entry);
            list.append(entryElement);
            entryElement.scrollIntoView({ behavior: "smooth" });
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

        private addCard(event: MouseEvent)
        {
            const editor = this.closest("my-editor") as Editor.EditorElement;
            const workbench = editor.querySelector("my-workbench") as Workbench.WorkbenchElement;
            if (workbench) workbench.addCards(this.card);
        }

        private dragStart(event: DragEvent)
        {
            event.stopPropagation();
            event.dataTransfer.setData("text", JSON.stringify(this.card));
            event.dataTransfer.effectAllowed = "all";
        }
    }

    customElements.define("my-card-tile", CardTileElement);
}