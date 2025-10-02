namespace Views.Dialogs
{
    export function ExportDeck(args: { deck: Data.Deck; })
    {
        return <div class="export-deck">
            <select class="format-select" onchange={ (event: Event) => selectFormat(event, args.deck) } >
                <option value="cod">COD</option>
                <option value="dec">DEC</option>
                <option value="json">JSON</option>
                <option value="txt" selected={ true }>TXT</option>
                <option value="yaml">YAML</option>
            </select>
            <textarea class="text-output" readOnly={ true } value={ Data.File.TXTFile.create(args.deck) } />
            <div class="actions">
                <a class="link-button" onclick={ selectAllText } title="Select all text"><color-icon src="img/icons/select.svg" /><span>Select</span></a>
            </div>
        </div>;
    }

    async function selectFormat(event: Event, deck: Data.Deck)
    {
        const target = event.currentTarget as HTMLSelectElement;
        const exportDeck = target.closest(".export-deck") as HTMLElement;

        const format = target.value;
        const file = await Data.File.saveDeck(deck, format);

        const textOutput = exportDeck.querySelector("textarea");
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