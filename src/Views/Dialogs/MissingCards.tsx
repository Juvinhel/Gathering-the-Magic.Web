namespace Views.Dialogs
{
    export function MissingCards(editor: HTMLElement, cards: Data.Entry[])
    {
        const sortedCards = cards.filter(x => !Data.isBasicLand(x.name)).sortBy(x => x.name);

        return <div class="missing-cards">
            <table>
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
            <div class="actions">
                <a class="link-button" onclick={ () => downloadMissingCards(sortedCards) } title="Download as txt"><color-icon src="img/icons/download.svg" /><span>Download</span></a>
                <a class="link-button" onclick={ () => markMissingCards(editor, sortedCards) } title="Highlight missing cards"><color-icon src="img/icons/brush.svg" /><span>Highlight</span></a>
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

    async function markMissingCards(editor: HTMLElement, cards: Data.Entry[])
    {
        const workbench = editor.querySelector("my-workbench");

        for (const entry of workbench.querySelectorAll("my-entry") as NodeListOf<Workbench.EntryElement>)
        {
            const card = entry.card;
            const isMissing = cards.some(c => c.name == card.name);
            entry.classList.toggle("is-missing", isMissing);
        }

        const menu = editor.querySelector(".menu");
        const showMissingCards = menu.querySelector(".show-missing-cards") as HTMLElement;
        showMissingCards.classList.toggle("marked", true);
    }
}