namespace Views.Dialogs
{
    export function ArtworkSelectDialog(entry: API.Entry)
    {
        return <div class="artwork-select" oninserted={ (e: Event) => load(e, entry) } entry={ entry }>
            <div class="filters">
                <span>Filter: </span>
                <multi-select class="set-select-filter" onchange={ (event: Event) => filterChange(event) } />
            </div>
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
        const setSelectFilter = artworkSelect.querySelector(".set-select-filter") as HTMLMultiSelect;

        const sets: API.Set[] = [];
        const query = "oracleid:" + entry["oracle-id"] + " unique:prints -set:prm";
        for await (const card of API.search(query, "released"))
        {
            const set = getTopSet(card.set);
            list.append(artworkTile(card, set.code, card.id == entry.id));
            if (!sets.includes(set)) sets.push(set);
            console.log("card", card);
        }

        setSelectFilter.options = sets.map(x => ({ title: x.name, value: x.code }));
    }

    function getTopSet(code: string): API.Set
    {
        let set = App.flatSets.first(x => x.code == code);
        while (set.parent) set = set.parent;
        return set;
    }

    function filterChange(event: Event)
    {
        const filterSelect = event.currentTarget as HTMLMultiSelect;
        const artworkSelect = filterSelect.closest(".artwork-select");
        const list = artworkSelect.querySelector(".list") as HTMLDivElement;

        const setCodes = filterSelect.values;
        for (const artworkTile of list.querySelectorAll(".artwork-tile") as NodeListOf<HTMLElement>)
        {
            const filterSet = artworkTile.getAttribute("filter-set");
            artworkTile.style.display = setCodes.length == 0 || setCodes.includes(filterSet) ? "initial" : "none";
        }
    }

    function artworkTile(card: API.Card, filterSet: string, selected: boolean = false)
    {
        return <div class="artwork-tile" card={ card } filter-set={ filterSet } selected={ selected } onclick={ artworkTileClick }>
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