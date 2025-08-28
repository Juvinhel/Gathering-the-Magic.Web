namespace Views.Library.List
{
    export class CardListElement extends HTMLElement
    {
        constructor ()
        {
            super();

            this.append(...this.build());
        }

        private build()
        {
            return [
                <div class="items" onchildrenchanged={ this.childrenChanged.bind(this) } />,
                <div class="footer">
                    <span class="card-count"><color-icon src="img/icons/trading-card.svg" /><span>0</span></span>
                    <PagingElement />
                </div>
            ];
        }

        private items: AsyncIterablePromise<Data.API.Card>;

        public async showItems(items: AsyncIterablePromise<Data.API.Card>)
        {
            const itemsContainer = this.querySelector(".items") as HTMLElement;
            const pagingContainer = this.querySelector("my-paging") as PagingElement;
            itemsContainer.clearChildren();
            pagingContainer.clearChildren();
            this.items = items;

            if (!items) return;

            this.dispatchEvent(new Event("cardsearchstarted", { bubbles: true }));

            const cardCount = this.querySelector(".card-count > span") as HTMLSpanElement;
            cardCount.textContent = "0";

            try
            {
                const cards: Data.API.Card[] = [];
                pagingContainer.initializePaging(cards);
                for await (const card of this.items)
                {
                    if (this.items != items) return;

                    cards.push(card);
                    cardCount.textContent = cards.length.toFixed();
                    if (cards.length <= 50)
                        itemsContainer.appendChild(new CardTileElement(card));
                    else if (cards.length % 50 == 0)
                        pagingContainer.createPageLinks();
                }
                pagingContainer.createPageLinks();
            }
            catch (error)
            {
                UI.Dialog.error(error);
            }

            this.dispatchEvent(new Event("cardsearchfinished", { bubbles: true }));
        }

        private childrenChanged(event: UI.Events.ChildrenChangedEvent)
        {
            const editor = this.closest("my-editor") as Editor.EditorElement;
            const workbench = editor.querySelector("my-workbench") as Workbench.WorkbenchElement;
            const deck = workbench.getData();
            const entries = Data.getEntries(deck);

            for (const child of event.addedNodes)
                if (child instanceof CardTileElement)
                {
                    const isInDeck = entries.some(e => e.name == child.card.name);
                    child.classList.toggle("is-in-deck", isInDeck);
                }
        }
    }

    customElements.define("my-card-list", CardListElement);
}