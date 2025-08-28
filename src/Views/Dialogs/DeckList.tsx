namespace Views.Dialogs
{
    export function DeckList(editor: HTMLElement, cards: Data.Entry[])
    {
        let text = "";
        for (const entry of cards.sortBy(x => x.name))
            text += entry.quantity.toFixed() + " " + entry.name + "\r\n";

        return <div class="deck-list">
            <span>{ text }</span>
            <div class="actions">
                <a class="link-button" onclick={ selectAllText } title="Select all text"><color-icon src="img/icons/select.svg" /><span>Select</span></a>
            </div>
        </div>;
    }

    function selectAllText(event: Event)
    {
        const target = event.currentTarget as HTMLElement;
        const cardList = target.closest(".deck-list") as HTMLElement;
        const span = cardList.querySelector("span");

        const range = document.createRange();
        range.selectNodeContents(span);

        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }
}