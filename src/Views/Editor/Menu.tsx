namespace Views.Editor
{
    export function Menu(useLibrary: boolean = true, useWorkbench: boolean = true)
    {
        return <div class="menu">
            <menu-button title="File">
                <color-icon src="img/icons/file.svg" />
                <span>File</span>
                <drop-down>
                    <menu-button class={ useWorkbench ? null : "none" } onclick={ newDeck } title="New Deck"><color-icon src="img/icons/file.svg" /><span>New Deck</span></menu-button>
                    <menu-button class={ [useWorkbench ? null : "none", Data.SaveLoadDeck.save ? null : "none"] } onclick={ saveDeck } title="Save Deck"><color-icon src="img/icons/save.svg" /><span>Save Deck</span></menu-button>
                    <menu-button class={ useWorkbench ? null : "none" } onclick={ saveAsDeck } title="Save As Deck"><color-icon src="img/icons/save.svg" /><span>Save As Deck</span></menu-button>
                    <menu-button class={ useWorkbench ? null : "none" } onclick={ openDeck } title="Open Deck"><color-icon src="img/icons/deck.svg" /><span>Open Deck</span></menu-button>
                    <menu-button class={ useWorkbench ? null : "none" } onclick={ importDeck } title="Import Deck"><color-icon src="img/icons/import.svg" /><span>Import Deck</span></menu-button>
                    <menu-button onclick={ loadCollections } title="Load Collections"><color-icon src="img/icons/collection.svg" /><span>Load Collections</span></menu-button>
                </drop-down>
            </menu-button>
            <menu-button title="Selection">
                <color-icon src="img/icons/hand-select.svg" />
                <span>Selection</span>
                <drop-down>
                    <menu-button class="multi-select" title="Toggle multiselect" onclick={ toggleMultiSelect }><color-icon src="img/icons/multi-select.svg" /><span>Multiselect</span></menu-button>
                    <menu-button class="clear-selection" title="Clear all selections" onclick={ clearSelection }><color-icon src="img/icons/empty-selection.svg" /><span>Unselect</span></menu-button>
                    <hr />
                    <menu-button title="Select All Creatures" onclick={ (event: Event) => selectCardsByType(event, "Creature", false) }><color-icon src="img/icons/card-types/creature.svg" /><span>Select All Creatures</span></menu-button>
                    <menu-button title="Select All Artifacts" onclick={ (event: Event) => selectCardsByType(event, "Artifact") }><color-icon src="img/icons/card-types/artifact.svg" /><span>Select All Artifacts</span></menu-button>
                    <menu-button title="Select All Enchantments" onclick={ (event: Event) => selectCardsByType(event, "Enchantment") }><color-icon src="img/icons/card-types/enchantment.svg" /><span>Select All Enchantments</span></menu-button>
                    <menu-button title="Select All Sorceries" onclick={ (event: Event) => selectCardsByType(event, "Sorcery") }><color-icon src="img/icons/card-types/sorcery.svg" /><span>Select All Sorceries</span></menu-button>
                    <menu-button title="Select All Instants" onclick={ (event: Event) => selectCardsByType(event, "Instant") }><color-icon src="img/icons/card-types/instant.svg" /><span>Select All Instants</span></menu-button>
                    <menu-button title="Select All Planeswalker" onclick={ (event: Event) => selectCardsByType(event, "Planeswalker") }><color-icon src="img/icons/card-types/planeswalker.svg" /><span>Select All Planeswalker</span></menu-button>
                    <menu-button title="Select All Battles" onclick={ (event: Event) => selectCardsByType(event, "Battle") }><color-icon src="img/icons/card-types/battle.svg" /><span>Select All Battles</span></menu-button>
                    <menu-button title="Select All Lands" onclick={ (event: Event) => selectCardsByType(event, "Land", false) }><color-icon src="img/icons/card-types/land.svg" /><span>Select All Lands</span></menu-button>
                </drop-down>
            </menu-button>
            <menu-button title="View">
                <color-icon src="img/icons/view.svg" />
                <span>View</span>
                <drop-down>
                    <menu-button class={ useWorkbench ? null : "none" } onclick={ showGridOrLines } title={ App.config.listMode == "Lines" ? "Show Grid" : "Show Lines" } ><color-icon src={ App.config.listMode == "Lines" ? "img/icons/grid.svg" : "img/icons/lines.svg" } /><span>{ App.config.listMode == "Lines" ? "Show Grid" : "Show Lines" }</span></menu-button>
                    <menu-button onclick={ swapCardSize } title={ App.config.cardSize == "Small" ? "Large Cards" : "Small Cards" }><color-icon src={ App.config.cardSize == "Small" ? "img/icons/scale-up.svg" : "img/icons/scale-down.svg" } /><span>{ App.config.cardSize == "Small" ? "Large Cards" : "Small Cards" }</span></menu-button>
                    <menu-button class={ [useWorkbench ? null : "none", "show-mana", App.config.showMana ? "marked" : null] } onclick={ showMana } title="Show Mana"><color-icon src="img/icons/mana.svg" /><span>Show Mana</span></menu-button>
                    <menu-button class={ [useWorkbench ? null : "none", "show-type", App.config.showType ? "marked" : null] } onclick={ showType } title="Show Type"><color-icon src="img/icons/type.svg" /><span>Show Type</span></menu-button>
                    <menu-button class={ useLibrary ? null : "none" } onclick={ unDockLibrary } title="Undock Library"><color-icon src="img/icons/undock.svg" /><span>Undock Library</span></menu-button>
                </drop-down>
            </menu-button>
            <menu-button title="Tools">
                <color-icon src="img/icons/tools.svg" />
                <span>Tools</span>
                <drop-down>
                    <menu-button class={ useWorkbench ? null : "none" } onclick={ sortCards } title="Sort Cards"><color-icon src="img/icons/sort.svg" /><span>Sort Cards</span></menu-button>
                    <menu-button class={ useWorkbench ? null : "none" } onclick={ showDeckList } title="Show Deck List"><color-icon src="img/icons/numbered-list.svg" /><span>Show Deck List</span></menu-button>
                    <menu-button class={ ["show-missing-cards", useWorkbench ? null : "none"] } onclick={ showMissingCards } title="Show Missing Cards"><color-icon src="img/icons/missing-card.svg" /><span>Show Missing Cards</span></menu-button>
                    <menu-button class={ useWorkbench ? null : "none" } onclick={ showDrawTest } title="Show Draw Test"><color-icon src="img/icons/cards.svg" /><span>Show Draw Test</span></menu-button>
                    <menu-button class={ useWorkbench ? null : "none" } onclick={ showDeckStatistics } title="Show Deck Statistics"><color-icon src="img/icons/pie-chart.svg" /><span>Show Deck Statistics</span></menu-button>
                    <menu-button onclick={ showCollectionsOverview } title="Show Collections"><color-icon src="img/icons/collection.svg" /><span>Show Collections</span></menu-button>
                </drop-down>
            </menu-button>
            <menu-button title="About">
                <color-icon src="img/icons/info.svg" />
                <span>About</span>
                <drop-down>
                    <menu-button onclick={ siteInfo } title="Site Info"><color-icon src="img/icons/info.svg" /><span>Site Info</span></menu-button>
                </drop-down>
            </menu-button>
        </div>;
    }

    async function newDeck(event: MouseEvent)
    {
        const target = event.currentTarget as HTMLElement;
        const editor = target.closest("my-editor") as Editor.EditorElement;
        const workbench = editor.querySelector("my-workbench") as Workbench.WorkbenchElement;

        try
        {
            const result = await UI.Dialog.confirm({ title: "Create new Deck?", text: "Create a new Deck?\nAll unsaved progress will be lost!" });
            if (!result) return;

            await workbench.loadData({ name: "New Deck", description: "My new deck", commanders: [], tags: [], sections: [{ title: "main", items: [] }, { title: "side", items: [] }, { title: "maybe", items: [] }] });

            const unsavedProgress = editor.querySelector(".unsaved-progress") as HTMLElement;
            unsavedProgress.classList.toggle("none", true);
        }
        catch (error)
        {
            UI.Dialog.error(error);
        }
    }

    async function saveDeck(event: MouseEvent)
    {
        const target = event.currentTarget as HTMLElement;
        const editor = target.closest("my-editor") as Editor.EditorElement;
        const workbench = editor.querySelector("my-workbench") as Workbench.WorkbenchElement;

        try
        {
            const deck = workbench.getData();

            await Data.SaveLoadDeck.save(deck);

            const unsavedProgress = editor.querySelector(".unsaved-progress") as HTMLElement;
            unsavedProgress.classList.toggle("none", true);
        }
        catch (error)
        {
            UI.Dialog.error(error);
        }
    }

    async function saveAsDeck(event: MouseEvent)
    {
        const target = event.currentTarget as HTMLElement;
        const editor = target.closest("my-editor") as Editor.EditorElement;
        const workbench = editor.querySelector("my-workbench") as Workbench.WorkbenchElement;

        try
        {
            const deck = workbench.getData();

            await Data.SaveLoadDeck.saveAs(deck);

            const unsavedProgress = editor.querySelector(".unsaved-progress") as HTMLElement;
            unsavedProgress.classList.toggle("none", true);
        }
        catch (error)
        {
            UI.Dialog.error(error);
        }
    }

    async function openDeck(event: MouseEvent)
    {
        const target = event.currentTarget as HTMLElement;
        const editor = target.closest("my-editor") as Editor.EditorElement;
        const workbench = editor.querySelector("my-workbench") as Workbench.WorkbenchElement;

        try
        {
            const deck = await Data.SaveLoadDeck.open();
            if (!deck) return;

            await workbench.loadData(deck);

            const unsavedProgress = editor.querySelector(".unsaved-progress") as HTMLElement;
            unsavedProgress.classList.toggle("none", true);
        }
        catch (error)
        {
            UI.Dialog.error(error);
        }
    }

    async function importDeck(event: Event)
    {
        const target = event.currentTarget as HTMLElement;
        const editor = target.closest("my-editor") as Editor.EditorElement;
        const workbench = editor.querySelector("my-workbench") as Workbench.WorkbenchElement;

        try
        {
            const deckImport = Dialogs.ImportDeck() as HTMLElement;

            await UI.Dialog.show(deckImport, { title: "Import Deck", allowClose: true, icon: "img/icons/import-dialog.svg" });

            const ok = deckImport.classList.contains("ok");
            if (ok)
            {
                const format = (deckImport.querySelector(".format-select") as HTMLSelectElement).value;
                const text = (deckImport.querySelector(".text-input") as HTMLTextAreaElement).value;

                const deck = await Data.File.loadDeck(text, format);

                await workbench.loadData(deck);

                //TODO: make abstract
                localStorage.set("current-deck-file-path", null);

                const unsavedProgress = editor.querySelector(".unsaved-progress") as HTMLElement;
                unsavedProgress.classList.toggle("none", true);
            }
        }
        catch (error)
        {
            UI.Dialog.error(error);
        }
    }

    async function loadCollections(event: Event)
    {
        try
        {
            const collections = await Data.SaveLoadCollection.load();
            if (!collections) return;

            for (const collection of collections)
                App.collections[collection.name] = collection;
        }
        catch (error)
        {
            UI.Dialog.error(error);
        }
    }

    async function sortCards(event: Event)
    {
        const target = event.currentTarget as HTMLElement;
        const editor = target.closest("my-editor") as Editor.EditorElement;
        const workbench = editor.querySelector("my-workbench") as Workbench.WorkbenchElement;

        const option = await UI.Dialog.options({ title: "Sort Cards by ...", options: ["Name", "Mana Value", "Color Identity"], allowEmpty: true });
        if (!option) return;

        const deck = workbench.getData();

        let selector: (e: Data.Entry) => any;
        let compare: (a: any, b: any) => number;
        switch (option)
        {
            case "Name":
                selector = (e: Data.Entry) => e.name;
                compare = String.localeCompare;
                break;
            case "Mana Value":
                selector = (e: Data.Entry) => e.manaValue;
                break;
            case "Color Identity":
                selector = (e: Data.Entry) => e.colorOrder;
                break;
        }

        for (const section of Data.getSections(deck))
        {
            const entries = section.items.filter(item => Data.isEntry(item));
            const sections = section.items.filter(item => Data.isSection(item));
            section.items.length = 0;

            section.items.push(...entries.orderBy(selector, compare));
            section.items.push(...sections);
        }

        workbench.loadData(deck);
    }

    async function showMissingCards(event: Event)
    {
        const target = event.currentTarget as HTMLElement;
        const editor = target.closest("my-editor") as Editor.EditorElement;
        const workbench = editor.querySelector("my-workbench") as Workbench.WorkbenchElement;

        target.classList.toggle("marked", false);
        for (const entry of workbench.querySelectorAll("my-entry.is-missing") as NodeListOf<Workbench.EntryElement>)
            entry.classList.toggle("is-missing", false);

        const deck = workbench.getData();
        const selectCardsOptions: UI.OptionsSelectOption<string>[] = [];
        selectCardsOptions.push({ title: "All " + Data.collapse(deck).sum(x => x.quantity) + " Cards", value: "*" });
        selectCardsOptions.push({ title: "Main " + Data.collapse(deck.sections.first(s => s.title == "main")).sum(x => x.quantity) + " Cards", value: "main" });
        selectCardsOptions.push({ title: "Side " + Data.collapse(deck.sections.first(s => s.title == "side")).sum(x => x.quantity) + " Cards", value: "side" });
        selectCardsOptions.push({ title: "Maybe " + Data.collapse(deck.sections.first(s => s.title == "maybe")).sum(x => x.quantity) + " Cards", value: "maybe" });

        const selectCardsOption = await UI.Dialog.options({ title: "Select Cards for Comparison", options: selectCardsOptions, allowEmpty: true });
        if (!selectCardsOption) return;

        const selectCollectionOptions = Object.keys(App.collections).sort(String.localeCompare);
        selectCollectionOptions.insertAt(0, "All Collections");
        const selectCollectionOption = await UI.Dialog.options({ title: "Select Collection for Comparison", options: selectCollectionOptions, allowEmpty: true });
        if (!selectCollectionOption) return;

        let cards: Data.Deck | Data.Section;
        switch (selectCardsOption)
        {
            case "*": cards = deck; break;
            case "main": cards = deck.sections.first(s => s.title == "main"); break;
            case "side": cards = deck.sections.first(s => s.title == "side"); break;
            case "maybe": cards = deck.sections.first(s => s.title == "maybe"); break;
        }

        const collection = selectCollectionOption == "All Collections" ?
            Data.combineCollections("All Collections", Object.values(App.collections)) :
            App.collections[selectCollectionOption];

        await UI.Dialog.show(<Views.Dialogs.MissingCards collection={ collection } deck={ cards } workbench={ workbench } />, { allowClose: true, title: "Missing Cards List" });
    }

    async function showDeckList(event: Event)
    {
        const target = event.currentTarget as HTMLElement;
        const editor = target.closest("my-editor") as Editor.EditorElement;
        const workbench = editor.querySelector("my-workbench") as Workbench.WorkbenchElement;

        const deck = workbench.getData();

        await UI.Dialog.show(<Views.Dialogs.DeckList deck={ deck } />, { allowClose: true, title: "Card List" });
    }

    function showMana(event: Event)
    {
        const target = event.currentTarget as HTMLElement;
        const editor = target.closest("my-editor") as Editor.EditorElement;
        const workbench = editor.querySelector("my-workbench") as Workbench.WorkbenchElement;

        App.config.showMana = !App.config.showMana;
        target.classList.toggle("marked", App.config.showMana);

        workbench.refreshColumns();
    }

    function showType(event: Event)
    {
        const target = event.currentTarget as HTMLElement;
        const editor = target.closest("my-editor") as Editor.EditorElement;
        const workbench = editor.querySelector("my-workbench") as Workbench.WorkbenchElement;

        App.config.showType = !App.config.showType;
        target.classList.toggle("marked", App.config.showType);

        workbench.refreshColumns();
    }

    function clearSelection(event: Event)
    {
        const target = event.currentTarget as HTMLElement;
        const editor = target.closest("my-editor") as Editor.EditorElement;

        for (const element of editor.querySelectorAll("my-entry.selected, my-card-tile.selected") as NodeListOf<Workbench.EntryElement | Library.List.CardTileElement>)
            element.selected = false;
    }

    function toggleMultiSelect(event: Event)
    {
        App.multiselect = !App.multiselect;
    }

    async function showDrawTest(event: Event)
    {
        const target = event.currentTarget as HTMLElement;
        const editor = target.closest("my-editor") as Editor.EditorElement;
        const workbench = editor.querySelector("my-workbench") as Workbench.WorkbenchElement;

        const deck = workbench.getData();

        UI.Dialog.show(<Dialogs.DrawTest deck={ deck } />, { allowClose: true, title: "Draw Test" });
    }

    async function showDeckStatistics(event: Event)
    {
        const target = event.currentTarget as HTMLElement;
        const editor = target.closest("my-editor") as Editor.EditorElement;
        const workbench = editor.querySelector("my-workbench") as Workbench.WorkbenchElement;

        const deck = workbench.getData();

        UI.Dialog.show(<Views.Dialogs.DeckStatistics deck={ deck } />, { allowClose: true, title: "Deck Statistics" });
    }

    async function siteInfo(event: Event)
    {
        const result = await fetch("manifest.json");
        const manifest = await result.json();

        const name = manifest.name;
        const version = manifest.version;
        const buildDate = new Date(manifest["build-date"]);

        await UI.Dialog.message({
            title: "Site Info",
            text: "Name: " + name + "\r\n" +
                "Version: " + version + "\r\n" +
                "Build Date: " + buildDate.toLocaleString()
        });
    }

    function showCollectionsOverview(event: Event)
    {
        UI.Dialog.show(<Views.Dialogs.CollectionsOverview collections={ App.collections } />, { allowClose: true, title: "Collections Overview" });
    }

    function showGridOrLines(event: Event)
    {
        const menuButton = event.currentTarget as HTMLMenuButton;
        const span = menuButton.querySelector("span");
        const colorIcon = menuButton.querySelector("color-icon") as HTMLColorIcon;
        const editor = menuButton.closest("my-editor") as Editor.EditorElement;
        const workbench = editor.querySelector("my-workbench") as Workbench.WorkbenchElement;

        if (menuButton.title == "Show Grid")
        {
            menuButton.title = "Show Lines";
            span.textContent = "Show Lines";
            colorIcon.src = "img/icons/lines.svg";
            workbench.listMode = "Grid";

            App.config.listMode = "Grid";
        }
        else
        {
            menuButton.title = "Show Grid";
            span.textContent = "Show Grid";
            colorIcon.src = "img/icons/grid.svg";
            workbench.listMode = "Lines";

            App.config.listMode = "Lines";
        }
    }

    function unDockLibrary(event: Event)
    {
        const menuButton = event.currentTarget as HTMLMenuButton;
        const span = menuButton.querySelector("span");
        const colorIcon = menuButton.querySelector("color-icon") as HTMLColorIcon;
        const editor = menuButton.closest("my-editor") as Editor.EditorElement;

        const state = editor.unDock();

        if (state == "Docked")
        {
            menuButton.title = span.textContent = "Undock Search";
            colorIcon.src = "img/icons/undock.svg";
        }
        else
        {
            menuButton.title = span.textContent = "Dock Search";
            colorIcon.src = "img/icons/dock.svg";
        }
    }

    function swapCardSize(event: Event)
    {
        switch (App.config.cardSize)
        {
            case "Large":
                App.config.cardSize = "Small";
                break;
            case "Small":
            default:
                App.config.cardSize = "Large";
                break;
        }

        document.body.style.setProperty("--card-size", App.config.cardSize == "Large" ? "14em" : "8em");

        const menuButton = event.currentTarget as HTMLMenuButton;
        const colorIcon = menuButton.querySelector("color-icon") as HTMLColorIcon;
        const span = menuButton.querySelector("span");
        menuButton.title = span.textContent = App.config.cardSize == "Small" ? "Large Cards" : "Small Cards";
        colorIcon.src = App.config.cardSize == "Small" ? "img/icons/scale-up.svg" : "img/icons/scale-down.svg";
    }

    function selectCardsByType(event: Event, type: string, exclusive: boolean = true)
    {
        const target = event.currentTarget as HTMLElement;
        const editor = target.closest("my-editor") as Editor.EditorElement;
        const workbench = editor.querySelector("my-workbench") as Workbench.WorkbenchElement;

        for (const element of workbench.querySelectorAll("my-entry") as NodeListOf<Workbench.EntryElement>)
        {
            const match = (exclusive ? element.card.type.card.length == 1 : true) && element.card.type.card.includes(type);
            element.selected = match;
        }
    }
}