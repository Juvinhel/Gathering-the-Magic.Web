namespace Views.Library.Search
{
    export class SearchElement extends HTMLElement
    {
        constructor ()
        {
            super();

            this.append(...this.build());
        }

        private build()
        {
            return [
                <div class="search-content">
                    <div class="query">
                        <input class="query-input" type="search" placeholder="Input your query" onkeyup={ this.enterSearch.bind(this) } /><button onclick={ this.beginSearch.bind(this) }><color-icon src="img/icons/search.svg" /></button>
                    </div>

                    <a class="expander" onclick={ this.expand.bind(this) }><color-icon src="img/icons/chevron-down.svg" /></a>

                    <label>Text:</label>
                    <TextInputElement class="text-input" />

                    <label>Collection:</label>
                    <CollectionSelectElement class="collection-select" />

                    <label>Commander:</label>
                    <ColorSelectElement class="commander-color-select" />

                    <label>Color:</label>
                    <ColorSelectElement class="card-color-select" />
                    <select class="card-color-type-select">
                        <option value="=">Exactly these colors</option>
                        <option value=">=">Including these colors</option>
                        <option value="<=">At most these colors</option>
                    </select>

                    <label>Type:</label>
                    <TypeInputElement class="type-select" />
                    <label>Partial type:</label>
                    <input class="allow-partial-type" type="checkbox" />

                    <label>Mana:</label>
                    <NumericStatElement class="mana-stat" />

                    <label>Power:</label>
                    <NumericStatElement class="power-stat" />

                    <label>Toughness:</label>
                    <NumericStatElement class="toughness-stat" />

                    <label>Loyalty:</label>
                    <NumericStatElement class="loyalty-stat" />

                    <label>Set:</label>
                    <SetInputElement class="set-select" />

                    <label>Allowed:</label>
                    <AllowedModesElement class="allowed-modes" />
                </div>
            ];
        }

        private expand(event: Event)
        {
            const expander = event.currentTarget as HTMLElement;
            const colorIcon = expander.querySelector("color-icon") as HTMLColorIcon;
            const result = this.classList.toggle("expanded");
            colorIcon.src = result ? "img/icons/chevron-up.svg" : "img/icons/chevron-down.svg";
        }

        private enterSearch(event: KeyboardEvent)
        {
            if (event.code == "Enter") this.beginSearch();
        }

        public beginSearch()
        {
            const expander = this.querySelector(".expander");
            const colorIcon = expander.querySelector("color-icon") as HTMLColorIcon;
            this.classList.remove("expanded");
            colorIcon.src = "img/icons/chevron-down.svg";
            UI.Elements.DropDown.closeAll();

            this.doSearch();
        }

        private async doSearch()
        {
            const repository = this.closest("my-library") as LibraryElement;
            const list = repository.querySelector("my-card-list") as List.CardListElement;
            try
            {
                const queryInput = this.querySelector(".query-input") as HTMLInputElement;
                const textInput = this.querySelector(".text-input") as TextInputElement;
                const collectionSelect = this.querySelector(".collection-select") as CollectionSelectElement;
                const commanderColorSelect = this.querySelector(".commander-color-select") as ColorSelectElement;
                const cardColorSelect = this.querySelector(".card-color-select") as ColorSelectElement;
                const cardColorTypeSelect = this.querySelector(".card-color-type-select") as HTMLInputElement;
                const typeInput = this.querySelector(".type-select") as TypeInputElement;
                const allowPartialTypeInput = this.querySelector(".allow-partial-type") as HTMLInputElement;
                const setInput = this.querySelector(".set-select") as SetInputElement;
                const allowedModesSelect = this.querySelector(".allowed-modes") as AllowedModesElement;

                const manaStat = this.querySelector(".mana-stat") as NumericStatElement;
                const powerStat = this.querySelector(".power-stat") as NumericStatElement;
                const toughnessStat = this.querySelector(".toughness-stat") as NumericStatElement;
                const loyaltyStat = this.querySelector(".loyalty-stat") as NumericStatElement;

                const collection = collectionSelect.collection;

                const texts = textInput.values;
                const commanderColor = commanderColorSelect.color;
                const cardColor = cardColorSelect.color;
                const cardColorType = cardColorTypeSelect.value;
                const types = typeInput.values;
                const allowPartialTypes = allowPartialTypeInput.checked;
                const mana = manaStat.value;
                const manaOperator = manaStat.operator;
                const power = powerStat.value;
                const powerOperator = powerStat.operator;
                const toughness = toughnessStat.value;
                const toughnessOperator = toughnessStat.operator;
                const loyalty = loyaltyStat.value;
                const loyaltyOperator = loyaltyStat.operator;
                const sets = setInput.values;
                const allowedModes = allowedModesSelect.modes;

                let query = queryInput.value;
                if (texts && texts.length) query += " (" + texts.map(x => "oracle:" + x).join(" ") + ")";
                if (commanderColor) query += " commander:" + commanderColor;
                if (cardColor) query += " color" + cardColorType + cardColor;
                if (types && types.length) query += " (" + types.map(x => x[0] == "!" ? ("-type:" + x.substring(1)) : ("type:" + x)).join(allowPartialTypes ? " OR " : " ") + ")";
                if (mana != null) query += " cmc" + manaOperator + mana.toFixed();
                if (power != null) query += " pow" + powerOperator + power.toFixed();
                if (toughness != null) query += " tou" + toughnessOperator + toughness.toFixed();
                if (loyalty != null) query += " loy" + loyaltyOperator + loyalty.toFixed();
                if (sets && sets.length) query += " (" + sets.map(x => "set:" + x).join(" OR ") + ")";
                if (allowedModes && allowedModes.length > 0) query += " " + allowedModes.map(m => "legal:" + m).join(" ");

                let cards: AsyncIterablePromise<Data.API.Card>;
                if (query)
                {
                    cards = Data.API.search(query);
                    if (collection)
                        cards = new AsyncIterablePromise(this.filterByCollection(cards, collection));
                }
                else if (collection)
                    cards = Data.API.getCards(Object.keys(collection.cards).map(c => { return { name: c }; }));

                list.showItems(cards);
            }
            catch (error)
            {
                list.showItems(null);
                UI.Dialog.error(error);
            }
        }

        private async * filterByCollection(cards: AsyncIterablePromise<Data.API.Card>, collection: Data.Collection)
        {
            for await (const card of cards)
                if (Object.keys(collection.cards).includes(card.name))
                    yield card;
        }
    }

    customElements.define("my-search", SearchElement);
}
