namespace Views.Dialogs
{
    export function ImportDeck()
    {
        return <div class="import-deck">
            <select class="format-select">
                {
                    API.File.deckFormats.map(x =>
                        <option format={ x } selected={ x.name == "Text" }>{ x.name } ({ x.extensions.first() })</option>
                    )
                }
            </select>
            <textarea class="text-input" placeholder="input text" />
            <button class="ok-button" onclick={ okClick }>OK</button>
            <button class="cancel-button" onclick={ cancelClick }>Cancel</button>
        </div>;
    }

    async function okClick(event: Event)
    {
        const target = event.currentTarget as HTMLElement;
        const importDeck = target.closest(".import-deck");
        const select = importDeck.querySelector(".format-select") as HTMLSelectElement;
        const option = select.selectedOptions[0] as HTMLOptionElement;
        const textInput = importDeck.querySelector(".text-input") as HTMLTextAreaElement;

        const format = option["format"] as API.File.Format<API.Deck>;
        const text = textInput.value;

        const deck = await API.File.loadDeck(text, format);
        importDeck["deck"] = deck;

        UI.Dialog.close(importDeck);
    }

    function cancelClick(event: Event)
    {
        const target = event.currentTarget as HTMLElement;
        const openDeck = target.closest(".import-deck");
        UI.Dialog.close(openDeck);
    }
}