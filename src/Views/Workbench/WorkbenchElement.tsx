namespace Views.Workbench
{
    export class WorkbenchElement extends HTMLElement
    {
        constructor ()
        {
            super();

            this.append(...this.build());

            this.addEventListener("calccardcount", this.calcCardCount.bind(this));
            this.addEventListener("scroll", this.scrollSectionStick.bind(this));
            this.addEventListener("change", this.changed.bind(this));
            this.addEventListener("inserted", this.inserted.bind(this));
        }

        public quantity: number;

        private build()
        {
            return [<div class="header">
                <label>Name:</label><h1 class={ ["deck-name", "double-click-to-edit"] } ondblclick={ doubleClickToEdit } />
                <label>Description:</label><span class={ ["deck-description", "double-click-to-edit"] } ondblclick={ doubleClickToEdit } />
                <label>Commanders:</label><CommanderList />
                <label>Cards:</label><span class="deck-card-count" />
            </div>,
            <div class="list" onchildrenchanged={ (event: Event) =>
            {
                const list = event.currentTarget as HTMLDivElement;
                list.dispatchEvent(new Event("calccardcount", { bubbles: true }));
            } } />];
        }

        public async loadData(deck: Data.Deck)
        {
            if (deck.sections == null) deck.sections = [] as any;
            if (deck.sections.some(s => s.title === "main") == false) deck.sections.push({ title: "main", items: [] });
            if (deck.sections.some(s => s.title === "side") == false) deck.sections.push({ title: "side", items: [] });
            if (deck.sections.some(s => s.title === "maybe") == false) deck.sections.push({ title: "maybe", items: [] });

            const nameElement = this.querySelector(".deck-name");
            nameElement.textContent = deck.name;
            const descriptionElement = this.querySelector(".deck-description");
            descriptionElement.textContent = deck.description;

            const listElement = this.querySelector(".list");
            listElement.clearChildren();
            for (const section of deck.sections)
                listElement.append(new SectionElement(section, true));

            const commanderList = this.querySelector(".commander-list");
            commanderList.clearChildren();
            if (deck.commanders)
                commanderList.append(...deck.commanders.map(x => <li ondblclick={ (event: Event) => (event.currentTarget as HTMLElement).remove() }>{ x }</li>));
        }

        public getData(): Data.Deck
        {
            return getDataFromElement(this);
        }

        public async addCards(cards: Data.API.Card | Data.Entry | Data.API.Identifier | (Data.API.Card | Data.Entry | Data.API.Identifier)[], section: string = "main")
        {
            if (!Array.isArray(cards)) cards = [cards];
            const onlyIdentifiers: Data.API.Identifier[] = cards.filter(Data.API.isIdentifierOnly);
            if (onlyIdentifiers.length > 0)
            {
                const retrievedCards = await Data.API.getCards(onlyIdentifiers);
                for (let i = 0; i < retrievedCards.length; ++i)
                    Object.assign(cards[i], retrievedCards[i]);
            }
            for (const card of cards) if (!("quantity" in card)) card["quantity"] = 1;

            let selectedSection: HTMLElement;
            for (const sectionElement of this.querySelectorAll("my-section") as NodeListOf<SectionElement>)
                if ((sectionElement.querySelector(".title") as HTMLElement).textContent == section)
                {
                    selectedSection = sectionElement;
                    break;
                }
            if (!selectedSection) throw new DataError("Cannot find Section: '" + section + "'!", { section });

            for (const entry of cards as Data.Entry[])
            {
                const countUpEntryElement = [...selectedSection.querySelectorAll("my-entry") as NodeListOf<EntryElement>].first(x => x.card.name == entry.name);
                if (countUpEntryElement)
                {
                    const input = countUpEntryElement.querySelector(".quantity") as HTMLInputElement;
                    const oldQuantity = parseInt(input.value);
                    input.value = (oldQuantity + entry.quantity).toFixed();
                }
                else
                {
                    const list = selectedSection.querySelector(".list");
                    list.append(new EntryElement(entry));
                }
            }
        }

        private calcCardCount(event: Event)
        {
            const list = this.querySelector(".list") as HTMLElement;
            const deckCardCount = this.querySelector(".deck-card-count") as HTMLSpanElement;
            const newQuantity = [...list.querySelectorAll("my-entry") as NodeListOf<EntryElement>].sum(e => e.quantity);
            const oldQuantity = this.quantity;

            const mainSection = list.querySelector(":scope > my-section[title=\"main\"]") as SectionElement;
            const sideSection = list.querySelector(":scope > my-section[title=\"side\"]") as SectionElement;

            const mainCardCount = [...mainSection.querySelectorAll("my-entry") as NodeListOf<EntryElement>].sum(e => e.quantity);
            const sideCardCount = [...sideSection.querySelectorAll("my-entry") as NodeListOf<EntryElement>].sum(e => e.quantity);
            deckCardCount.textContent = "main: " + mainCardCount + " / side: " + sideCardCount;

            if (oldQuantity != newQuantity)
            {
                this.quantity = newQuantity;
                this.dispatchEvent(new CustomEvent("deckchanged", { bubbles: true }));
            }
        }

        private scrollSectionStick(event: Event)
        {   // makes section stick to top
            const list = this.querySelector(".list") as HTMLElement;
            const listArea = list.getBoundingClientRect();
            const listScroll = list.getScrollOffset();
            const topOffset = listScroll.y + listArea.top;

            const sections = list.querySelectorAll("my-section") as NodeListOf<SectionElement>;
            let offSection: HTMLElement;
            for (const section of sections)
            {
                const area = section.getBoundingClientRect();
                const offset = area.top - topOffset;
                if (offset < 0) offSection = section;
            }

            for (const section of sections)
            {
                const header = section.querySelector(".header") as HTMLElement;
                header.classList.toggle("sticky", section == offSection);
            }
        }

        private changed(event: Event)
        {
            this.dispatchEvent(new CustomEvent("deckchanged", { bubbles: true }));
        }

        public refreshColumns()
        {
            this.style.setProperty("--entry-columns", `[move] auto [quantity] auto [name] 1fr [type] ${App.config.showType ? "auto" : "0"} [mana] ${App.config.showMana ? "auto" : "0"} [actions] auto`);
        }

        private inserted(event: Event)
        {
            this.refreshColumns();
        }
    }

    function getDataFromElement(element: HTMLElement): any
    {
        if (element instanceof WorkbenchElement)
        {
            const commanders = [...element.querySelectorAll(".commander-list > li")].map(x => x.textContent);
            const name = element.querySelector(".deck-name").textContent;
            const description = element.querySelector(".deck-description").textContent;
            const list = element.querySelector(".list");
            const sections = [...list.children].map(getDataFromElement).filter(x => x != null);
            return { name, description, commanders, sections } as Data.Deck;
        }
        else if (element instanceof SectionElement)
        {
            const title = element.querySelector(".title").textContent;
            const list = element.querySelector(".list");
            const items = [...list.children].map(getDataFromElement).filter(x => x != null);
            return { title, items } as Data.Section;
        }
        else if (element instanceof EntryElement)
        {
            const entry = JSON.clone(element.card) as Data.Entry;
            entry.quantity = element.quantity;
            return entry;
        }

        throw new DataError("Don't know how to handle this element: " + element.className + "!", { element });
    }

    customElements.define("my-workbench", WorkbenchElement);
}