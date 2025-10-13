namespace Views.Dialogs
{
    export function MissingCards(args: { collection: Data.Collection, deck: Data.Deck | Data.Section, workbench?: Workbench.WorkbenchElement; })
    {
        const collection = args.collection;
        const collapsedEntries = Data.collapse(args.deck);
        for (const entry of collapsedEntries)
            entry.quantity -= collection.cards[entry.name] ?? 0;
        const cards = collapsedEntries.filter(x => x.quantity > 0);

        const sortedCards = cards.filter(x => !Data.isBasicLand(x.name)).sortBy(x => x.name);

        let text = "";
        for (const card of sortedCards)
            text += card.quantity.toFixed() + " " + card.name + "\r\n";

        return <div class="missing-cards">
            <table class="table">
                <thead>
                    <tr>
                        <th>Quantity</th>
                        <th>Name</th>
                        <th>Price</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        sortedCards.map(c =>
                            <tr>
                                <td>{ c.quantity }</td>
                                <td title={ c.name }><a href={ c.links.Scryfall } target="_blank">{ c.name }</a></td>
                                <td>{ c.price.toFixed(2) + " €" }</td>
                            </tr>)
                    }
                </tbody>
                <tfoot>
                    <tr>
                        <td>{ sortedCards.sum(c => c.quantity) }</td>
                        <td>Cards</td>
                        <td>{ sortedCards.sum(c => c.price).toFixed(2) + " €" }</td>
                    </tr>
                </tfoot>
            </table>
            <textarea class={ ["text-output", "none"] } readOnly={ true } value={ text } />
            <div class="actions">
                <a class="link-button" onclick={ selectAllText } title="Select all text"><color-icon src="img/icons/select.svg" /><span>Select</span></a>
                <a class="link-button" onclick={ () => downloadMissingCards(sortedCards) } title="Download as txt"><color-icon src="img/icons/download.svg" /><span>Download</span></a>
                { args.workbench ? <a class="link-button" onclick={ () => markMissingCards(args.workbench, sortedCards) } title="Highlight missing cards"><color-icon src="img/icons/brush.svg" /><span>Highlight</span></a> : null }
            </div>
        </div>;
    }

    async function downloadMissingCards(cards: Data.Entry[])
    {
        let file = "";
        for (const entry of cards)
            file += entry.quantity.toFixed() + " " + entry.name + "\r\n";

        DownloadHelper.downloadData("missing cards.txt", file, "text/plain");
    }

    async function markMissingCards(workbench: Workbench.WorkbenchElement, cards: Data.Entry[])
    {
        const missingCards = Object.clone(cards);

        for (const entry of [...(workbench.querySelectorAll("my-entry") as NodeListOf<Workbench.EntryElement>)].reverse())
        {
            const card = entry.card;
            const quantity = entry.quantity;

            const missingCard = missingCards.first(x => x.name == card.name);
            if (missingCard)
            {
                entry.classList.toggle("is-missing", true);
                missingCard.quantity -= quantity;
                if (missingCard.quantity <= 0)
                    missingCards.remove(missingCard);
            }
            else
            {
                entry.classList.toggle("is-missing", false);
            }
        }

        const editor = workbench.closest("my-editor") as Editor.EditorElement;
        const menu = editor.querySelector(".menu");
        if (menu)
        {
            const showMissingCards = menu.querySelector(".show-missing-cards") as HTMLElement;
            showMissingCards.classList.toggle("marked", true);
        }
    }

    function selectAllText(event: Event)
    {
        const target = event.currentTarget as HTMLElement;
        const missingCards = target.closest(".missing-cards") as HTMLElement;
        const textOutput = missingCards.querySelector("textarea");
        const table = missingCards.querySelector("table");
        const select = target.classList.toggle("marked");
        if (select)
        {
            table.classList.toggle("none", true);
            textOutput.classList.toggle("none", false);

            textOutput.select();
        }
        else
        {
            table.classList.toggle("none", false);
            textOutput.classList.toggle("none", true);
        }
    }
}