namespace Views.Dialogs
{
    export function ImportDeck()
    {
        return <div class="import-deck">
            <select class="format-select">
                <option value="cod">COD</option>
                <option value="dec">DEC</option>
                <option value="json">JSON</option>
                <option value="txt" selected={ true }>TXT</option>
                <option value="yaml">YAML</option>
            </select>
            <textarea class="text-input" placeholder="input text" />
            <button class="ok-button" onclick={ okClick }>OK</button>
            <button class="cancel-button" onclick={ cancelClick }>Cancel</button>
        </div>;
    }

    function okClick(event: Event)
    {
        const target = event.currentTarget as HTMLElement;
        const openDeck = target.closest(".import-deck");
        openDeck.classList.toggle("ok", true);
        UI.Dialog.close(openDeck);
    }

    function cancelClick(event: Event)
    {
        const target = event.currentTarget as HTMLElement;
        const openDeck = target.closest(".import-deck");
        UI.Dialog.close(openDeck);
    }
}