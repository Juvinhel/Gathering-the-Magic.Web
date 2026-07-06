namespace Views.Dialogs
{
    export function ArtworkSelectDialog(entry: API.Entry)
    {
        return <div class="artwork-select" oninserted={ (e: Event) => load(e, entry) } entry={ entry }>
            <div class="list">

            </div>
            <div class="actions">
                <button class="cancel-button" onclick={ cancelClick }>Cancel</button>
                <button class="ok-button" onclick={ okClick }>OK</button>
            </div>
        </div>;
    }

    async function load(e: Event, entry: API.Entry)
    {
        const artworkSelect = e.currentTarget as HTMLDivElement;
        const list = artworkSelect.querySelector(".list") as HTMLDivElement;
        const query = "!\"" + entry.name + "\" unique:prints -set:prm";
        for await (const card of API.search(query))
            list.append(artworkTile(card, card.id == entry.id));
    }

    function artworkTile(card: API.Card, selected: boolean = false)
    {
        return <div class="artwork-tile" card={ card } selected={ selected } onclick={ artworkTileClick }>
            <div class={ ["card-tile", "card"] } >
                <img src="img/card-back.png" lazy-image={ card.img } />
            </div>
        </div>;
    }

    function artworkTileClick(e: Event)
    {
        const currentArtworkTile = e.currentTarget as HTMLDivElement;
        const list = currentArtworkTile.closest(".list") as HTMLDivElement;
        for (const artworkTile of list.querySelectorAll(".artwork-tile"))
            artworkTile.setAttribute("selected", (currentArtworkTile == artworkTile).toString());
    }

    async function okClick(event: Event)
    {
        const target = event.currentTarget as HTMLElement;
        const artworkSelect = target.closest(".artwork-select");
        const entry = artworkSelect["entry"] as API.Entry;

        const artworkTile = artworkSelect.querySelector(".artwork-tile[selected='true']");
        const card = artworkTile["card"] as API.Card;

        for (const key of Object.keys(entry))
            if (key != "quantity" && key != "comment")
                delete entry[key];

        for (const key of Object.keys(card))
            entry[key] = card[key];

        UI.Dialog.close(artworkSelect);
    }

    function cancelClick(event: Event)
    {
        const target = event.currentTarget as HTMLElement;
        const artworkSelect = target.closest(".artwork-select");
        UI.Dialog.close(artworkSelect);
    }
}