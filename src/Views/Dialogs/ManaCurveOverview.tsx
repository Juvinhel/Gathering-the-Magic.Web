namespace Views.Dialogs
{
    export class ManaCurveOverview
    {
        constructor (attr: { deck: Data.Deck; })
        {
            this.deck = attr.deck;
            this.entries = Data.getEntries(this.deck.sections.first(s => s.title == "main"));

            const highestManaValue = this.entries.max(x => x.manaValue);
            for (let i = 0; i <= highestManaValue; ++i)
                this.curve[i] = [];

            for (const entry of this.entries)
                if (!entry.type.card.includes("Land"))
                    this.curve[entry.manaValue].push(entry);
        }

        private deck: Data.Deck;
        private entries: Data.Entry[];
        private curve: { [cost: number]: Data.Entry[]; } = {};

        public render(): Node
        {
            return this.root = <div class="mana-curve-overview">
                { this.buildCurve() }
            </div> as HTMLElement;
        }

        private * buildCurve()
        {
            for (const column of Object.entries(this.curve).orderBy(x => parseInt(x[0])))
                yield <div>
                    <span>{ column[0].toString() }</span>
                    <div>{ this.buildColumn(column[1]) }</div>
                    <span><color-icon src="img/icons/trading-card.svg" /><span>{ column[1].sum(x => x.quantity).toString() }</span></span>
                </div>;
        }

        private * buildColumn(entries: Data.Entry[])
        {
            for (const entry of entries.orderBy(x => x.colorOrder))
                for (let i = 0; i < entry.quantity; ++i)
                    yield <div><div class={ ["card-tile", "card"] } title={ entry.name } card={ entry } onclick={ () => showImageDialog(entry.img) }>
                        <img src="img/card-back.png" lazy-image={ entry.img } />
                    </div></div>;
        }

        private root: HTMLElement;
    }

    async function showImageDialog(img: string)
    {
        await UI.Dialog.lightBox({ pages: [{ content: img }] });
    }
}