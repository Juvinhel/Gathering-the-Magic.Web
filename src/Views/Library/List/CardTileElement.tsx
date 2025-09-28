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

            this.addEventListener("click", this.clicked.bind(this));
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
                <div class={ ["image", "card"] }><img src="img/card-back.png" lazy-image={ this.card.img } /></div>,
                <color-icon class="in-deck" src="img/icons/deck.svg" />
            ];
        }

        public card: Data.API.Card;
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

        private clickables = ["INPUT", "A", "BUTTON"];
        private clicked(event: MouseEvent)
        {
            if (event.composedPath().some(x => this.clickables.includes((x as HTMLElement).tagName))) return;

            const selected = this.selected;

            if (!App.multiselect)
            {
                const cardList = this.closest("my-card-list") as CardListElement;
                for (const cardTile of cardList.querySelectorAll("my-card-tile.selected") as NodeListOf<CardTileElement>)
                    cardTile.selected = false;
            }

            this.selected = !selected;
        }

        private showContextMenu(event: PointerEvent)
        {
            const editor = this.closest("my-editor") as Editor.EditorElement;
            UI.ContextMenu.show(event,
                <menu-button class={ editor.useWorkbench ? null : "none" } title="Insert Cards" onclick={ this.showInsertCards.bind(this) }><color-icon src="img/icons/arrow-right.svg" /><span>Insert into ...</span></menu-button>,
                <menu-button title="Scryfall" onclick={ () => window.open(this.card.links.Scryfall, '_blank') }><color-icon src="img/icons/scryfall-black.svg" /><span>Scryfall</span></menu-button>,
                this.card.links.EDHREC ? <menu-button title="EDHREC" onclick={ () => window.open(this.card.links.EDHREC, '_blank') }><color-icon src="img/icons/edhrec.svg" /><span>EDHREC</span></menu-button> : null,
            );
        }

        private async showInsertCards(event: Event)
        {
            const editor = this.closest("my-editor") as Editor.EditorElement;
            const workbench = editor.querySelector("my-workbench") as Workbench.WorkbenchElement;
            const sectionElements = [...workbench.querySelectorAll("my-section") as NodeListOf<Workbench.SectionElement>];
            const sectionTitles = sectionElements.map(s => s.path);

            const cardList = this.closest("my-card-list");
            const selectedCards = [...cardList.querySelectorAll("my-card-tile.selected")] as CardTileElement[];
            if (!selectedCards.length) selectedCards.push(this);

            const result = await Workbench.selectSection("Insert " + selectedCards.length.toFixed(0) + " cards into Section", sectionTitles);
            if (!result) return;
            const selectedSection = sectionElements[result.index];

            const cards = selectedCards.map(x => Object.clone(x.card));
            const entryElements = cards.map(c => new Workbench.EntryElement({ quantity: 1, ...c }));
            const list = selectedSection.querySelector(".list");
            list.append(...entryElements);
            entryElements.last().scrollIntoView({ block: "center", behavior: "smooth" });
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

            if (this.selected)
            {
                const cards: Data.API.Card[] = [];
                const cardList = this.closest("my-card-list") as CardListElement;
                for (const cardTile of cardList.querySelectorAll("my-card-tile.selected") as NodeListOf<CardTileElement>)
                    cards.push(cardTile.card);
                event.dataTransfer.setData("text", JSON.stringify(cards));
            }
            else
                event.dataTransfer.setData("text", JSON.stringify(this.card));

            event.dataTransfer.effectAllowed = "all";
        }
    }

    customElements.define("my-card-tile", CardTileElement);
}