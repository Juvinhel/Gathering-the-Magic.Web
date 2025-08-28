namespace Views.Editor
{
    export function Menu()
    {
        return <div class="menu">
            <menu-button title="File">
                <color-icon src="img/icons/file.svg" />
                <span>File</span>
                <drop-down>
                    <menu-button onclick={ newDeck } title="New Deck"><color-icon src="img/icons/file.svg" /><span>New Deck</span></menu-button>
                    <menu-button onclick={ saveDeck } title="Save Deck"><color-icon src="img/icons/save.svg" /><span>Save Deck</span></menu-button>
                    <menu-button onclick={ loadDeck } title="Load Deck"><color-icon src="img/icons/deck.svg" /><span>Load Deck</span></menu-button>
                    <menu-button onclick={ loadCollections } title="Load Collections"><color-icon src="img/icons/collection.svg" /><span>Load Collections</span></menu-button>
                </drop-down>
            </menu-button>
            <menu-button title="View">
                <color-icon src="img/icons/view.svg" />
                <span>View</span>
                <drop-down>
                    <menu-button class={ ["show-mana", App.config.showMana ? "marked" : null] } onclick={ showMana } title="Show Mana"><color-icon src="img/icons/mana.svg" /><span>Show Mana</span></menu-button>
                    <menu-button class={ ["show-type", App.config.showType ? "marked" : null] } onclick={ showType } title="Show Type"><color-icon src="img/icons/type.svg" /><span>Show Type</span></menu-button>
                </drop-down>
            </menu-button>
            <menu-button title="Tools">
                <color-icon src="img/icons/tools.svg" />
                <span>Tools</span>
                <drop-down>
                    <menu-button onclick={ sortCards } title="Sort Cards"><color-icon src="img/icons/sort.svg" /><span>Sort Cards</span></menu-button>
                    <menu-button onclick={ showDeckList } title="Show Deck List"><color-icon src="img/icons/numbered-list.svg" /><span>Show Deck List</span></menu-button>
                    <menu-button onclick={ showMissingCards } title="Show Missing Cards"><color-icon src="img/icons/missing-card.svg" /><span>Show Missing Cards</span></menu-button>
                    <menu-button onclick={ showDrawTest } title="Show Draw Test"><color-icon src="img/icons/cards.svg" /><span>Show Draw Test</span></menu-button>
                    <menu-button onclick={ showDeckStatistics } title="Show Deck Statistics"><color-icon src="img/icons/pie-chart.svg" /><span>Show Deck Statistics</span></menu-button>
                </drop-down>
            </menu-button>
            <menu-button title="About">
                <color-icon src="img/icons/info.svg" />
                <span>About</span>
                <drop-down>
                    <div>
                        <menu-button onclick={ siteInfo } title="Site Info"><color-icon src="img/icons/info.svg" /><span>Site Info</span></menu-button>
                    </div>
                </drop-down>
            </menu-button>
        </div>;
    }

    async function newDeck(event: MouseEvent)
    {
        try
        {
            const target = event.currentTarget as HTMLElement;
            const editor = target.closest("my-editor") as Editor.EditorElement;
            const workbench = editor.querySelector("my-workbench") as Workbench.WorkbenchElement;

            const result = await UI.Dialog.confirm({ title: "Create new Deck?", text: "Create a new Deck?\nAll unsaved progress will be lost!" });
            if (!result) return;

            await workbench.loadData({ name: "New Deck", description: "My new deck", sections: [{ title: "main", items: [] }, { title: "side", items: [] }, { title: "maybe", items: [] }] });

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
        try
        {
            const target = event.currentTarget as HTMLElement;
            const editor = target.closest("my-editor") as Editor.EditorElement;
            const workbench = editor.querySelector("my-workbench") as Workbench.WorkbenchElement;

            const deck = workbench.getData();

            await Data.SaveLoad.SaveDeck(deck);

            const unsavedProgress = editor.querySelector(".unsaved-progress") as HTMLElement;
            unsavedProgress.classList.toggle("none", true);
        }
        catch (error)
        {
            UI.Dialog.error(error);
        }
    }

    async function loadDeck(event: MouseEvent)
    {
        try
        {
            const target = event.currentTarget as HTMLElement;
            const editor = target.closest("my-editor") as Editor.EditorElement;
            const workbench = editor.querySelector("my-workbench") as Workbench.WorkbenchElement;

            const deck = await Data.SaveLoad.LoadDeck();
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

    async function loadCollections(event: Event)
    {
        try
        {
            const collections = await Data.SaveLoad.LoadCollections();

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

        const option = await UI.Dialog.options({ title: "Sort Cards by ...", options: ["Name", "Mana Value"], allowEmpty: true });
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
        const selectCollectionOption = await UI.Dialog.options({ title: "Select Collection for Comparison", options: selectCollectionOptions, allowEmpty: true });
        if (!selectCollectionOption) return;

        let collapsedEntries: Data.Entry[];
        switch (selectCardsOption)
        {
            case "*": collapsedEntries = Data.collapse(deck); break;
            case "main": collapsedEntries = Data.collapse(deck.sections.first(s => s.title == "main")); break;
            case "side": collapsedEntries = Data.collapse(deck.sections.first(s => s.title == "side")); break;
            case "maybe": collapsedEntries = Data.collapse(deck.sections.first(s => s.title == "maybe")); break;
        }

        const collection = App.collections[selectCollectionOption];
        for (const entry of collapsedEntries)
            entry.quantity -= collection.cards[entry.name] ?? 0;
        collapsedEntries = collapsedEntries.filter(x => x.quantity > 0);

        await UI.Dialog.show(Views.Dialogs.MissingCards(editor, collapsedEntries), { allowClose: true, title: "Missing Cards List" });
    }

    async function showDeckList(event: Event)
    {
        const target = event.currentTarget as HTMLElement;
        const editor = target.closest("my-editor") as Editor.EditorElement;
        const workbench = editor.querySelector("my-workbench") as Workbench.WorkbenchElement;

        const deck = workbench.getData();

        const collapsedEntries = Data.collapse(deck.sections.first(s => s.title == "main"));

        await UI.Dialog.show(Views.Dialogs.DeckList(editor, collapsedEntries), { allowClose: true, title: "Card List" });
    }

    async function showMana(event: Event)
    {
        const target = event.currentTarget as HTMLElement;
        const editor = target.closest("my-editor") as Editor.EditorElement;
        const workbench = editor.querySelector("my-workbench") as Workbench.WorkbenchElement;

        App.config.showMana = !App.config.showMana;
        Data.saveConfig(App.config);
        target.classList.toggle("marked", App.config.showMana);

        workbench.refreshColumns();
    }

    async function showType(event: Event)
    {
        const target = event.currentTarget as HTMLElement;
        const editor = target.closest("my-editor") as Editor.EditorElement;
        const workbench = editor.querySelector("my-workbench") as Workbench.WorkbenchElement;

        App.config.showType = !App.config.showType;
        Data.saveConfig(App.config);
        target.classList.toggle("marked", App.config.showType);

        workbench.refreshColumns();
    }

    async function showDrawTest(event: Event)
    {
        const target = event.currentTarget as HTMLElement;
        const editor = target.closest("my-editor") as Editor.EditorElement;
        const workbench = editor.querySelector("my-workbench") as Workbench.WorkbenchElement;

        const deck = workbench.getData();

        UI.Dialog.show(Dialogs.DrawTest(deck), { allowClose: true, title: "Draw Test" });
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
}