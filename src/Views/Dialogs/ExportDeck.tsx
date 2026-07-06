namespace Views.Dialogs
{
    export function ExportDeck(args: { deck: API.Deck; })
    {
        return <div class="export-deck">
            <select class="format-select" onchange={ (event: Event) => selectFormat(event, args.deck) } >
                {
                    API.File.deckFormats.map(x =>
                        <option format={ x } selected={ x.name == "Text" }>{ x.name } ({ x.extensions.first() })</option>
                    )
                }
            </select>
            <textarea class="text-output" readOnly={ true } value={ API.File.TXTFormat.create(args.deck) } />
            <div class="actions">
                <a class="link-button" onclick={ selectAllText } title="Select all text"><color-icon src="img/icons/select.svg" /><span>Select</span></a>
            </div>
        </div>;
    }

    async function selectFormat(event: Event, deck: API.Deck)
    {
        const select = event.currentTarget as HTMLSelectElement;
        const option = select.selectedOptions[0] as HTMLOptionElement;
        const exportDeck = select.closest(".export-deck") as HTMLElement;
        const textOutput = exportDeck.querySelector("textarea");

        const format = option["format"] as API.File.Format<API.Deck>;
        const file = await API.File.saveDeck(deck, format);
        textOutput.value = file.text;
    }

    function selectAllText(event: Event)
    {
        const target = event.currentTarget as HTMLElement;
        const exportDeck = target.closest(".export-deck") as HTMLElement;
        const textOutput = exportDeck.querySelector("textarea");

        textOutput.select();
    }
}