namespace Views.Dialogs
{
    export function DeckList(args: { deck: Data.Deck | Data.Section | Data.Entry[]; })
    {
        const commanders: string[] = ("commanders" in args.deck) ? args.deck.commanders : [];
        let deck = args.deck;
        if ("sections" in deck) deck = deck.sections.first(s => s.title == "main");
        const cards = Data.collapse(deck);

        let textCommanders = "";
        for (const commander of commanders)
            textCommanders += "1 " + commander + "\r\n";

        let text = "";
        for (const entry of cards.sortBy(x => x.name))
        {
            if (commanders.includes(entry.name))
            {   // commanders are at start of list
                commanders.remove(entry.name);
                entry.quantity -= 1;
                if (entry.quantity == 0) continue;
            }

            text += entry.quantity.toFixed() + " " + entry.name + "\r\n";
        }
        text = textCommanders + text;

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