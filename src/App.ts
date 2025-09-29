class App
{
    public static async Start(args?: {
        library?: boolean,
        workbench?: boolean;
    })
    {
        const useLibrary = args?.library ?? true;
        const useWorkbench = args?.workbench ?? true;

        [this.config, , this.symbols, this.types, this.sets, this.keywords] = await Promise.all([
            Data.loadConfig(),
            Data.API.init(),
            Data.API.symbology(),
            Data.API.typology(),
            Data.API.sets(),
            Data.API.keywords(),
        ]);

        this.collections = JSON.parse(localStorage.getItem("collections"), (key: string, value: any) =>
        {
            if (key == "importDate") return new Date(value);
            return value;
        }) ?? {};

        if (Data.SaveLoadCollection.default)
        {
            const collections = await Data.SaveLoadCollection.default();
            if (collections)
                for (const collection of collections)
                    this.collections[collection.name] = collection;
        }

        document.body.style.setProperty("--card-size", App.config.cardSize == "Large" ? "14em" : "8em");

        initChartJS();
        UI.LazyLoad.ErrorImageUrl = "img/icons/not-found.png";
        UI.LazyLoad.LoadingImageUrl = "img/icons/spinner.svg";
        UI.LazyLoad.Start();
        Views.initGlobalDrag();

        window.addEventListener("mousemove", (event: MouseEvent) => this.pressCTRL(event.ctrlKey), { capture: true, passive: true });
        window.addEventListener("keydown", (event: KeyboardEvent) => this.pressCTRL(event.ctrlKey), { capture: true, passive: true });
        window.addEventListener("keyup", (event: KeyboardEvent) => this.pressCTRL(event.ctrlKey), { capture: true, passive: true });

        //! weird bug
        window.addEventListener("keyup", (event: KeyboardEvent) => (document.querySelector("my-workbench") as Views.Workbench.WorkbenchElement).keyup(event));
        window.addEventListener("keyup", this.globalShortcuts.bind(this));

        document.addEventListener('visibilitychange', App.visibilityChange);

        // START
        const editor = new Views.Editor.EditorElement(useLibrary, useWorkbench);
        document.querySelector("main").append(editor);

        if (useWorkbench)
        {
            const lastDeck: Data.Deck = (localStorage.get("last-deck") ?? App.sampleDeck) as Data.Deck;

            const workbench = editor.querySelector("my-workbench") as Views.Workbench.WorkbenchElement;
            await workbench.loadData(await Data.File.loadDeck(JSON.stringify(lastDeck), "JSON"));

            const unsavedProgress = document.body.querySelector(".unsaved-progress") as HTMLElement;
            unsavedProgress.classList.toggle("none", true);
        }
    }

    private static visibilityChange = function (this: typeof App, event: Event)
    {
        if (document.visibilityState == "hidden")
        {
            Data.saveConfig(App.config);

            localStorage.set("collections", App.collections);

            const editor = document.querySelector("my-editor") as Views.Editor.EditorElement;
            const workbench = editor.querySelector("my-workbench") as Views.Workbench.WorkbenchElement;
            const deck: Data.Deck = workbench.getData();

            localStorage.set("last-deck", Data.File.JSONFile.removeExtendData(deck));
        }
    }.bind(this);

    public static symbols: Data.API.Symbol[];
    public static types: Data.API.Typology;
    public static sets: Data.API.Set[];
    public static keywords: string[];

    public static collections: { [name: string]: Data.Collection; } = {};
    public static config: Data.Config;

    private static ctrl: boolean = false;
    private static pressCTRL(pressed: boolean)
    {
        if (pressed != this.ctrl)
        {
            this.ctrl = pressed;
            this.multiselect = pressed;
        }
    }

    private static internal_multiselect: boolean = false;
    public static get multiselect(): boolean { return this.internal_multiselect; }
    public static set multiselect(value: boolean)
    {
        this.internal_multiselect = value;
        for (const element of document.querySelectorAll(".multi-select"))
            element.classList.toggle("marked", value);
    }

    private static globalShortcuts(event: KeyboardEvent)
    {
        if (event.code == "Escape")
        {
            for (const element of document.querySelectorAll("my-entry.selected, my-card-tile.selected") as NodeListOf<Views.Workbench.EntryElement | Views.Library.List.CardTileElement>)
                element.selected = false;
        }
    }

    public static sampleDeck = {
        name: "Sample Deck",
        description: "This is a sample deck for demonstration purposes.",

        commanders: ["Ashe, Princess of Dalmasca", "Aerith Gainsborough"],

        sections: [
            {
                title: "main",
                items: [
                    { quantity: 1, name: "Ashe, Princess of Dalmasca" },
                    { quantity: 1, name: "Aerith Gainsborough" },
                    {
                        title: "Subsection",
                        items: [
                            { quantity: 3, name: "Cloudbound Moogle" },
                            { quantity: 4, name: "Coeurl" }
                        ]
                    }
                ]
            }
        ]
    };
}