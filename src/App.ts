class App
{
    public static async Start()
    {
        [this.config, , this.symbols, this.types, this.sets, this.keywords] = await Promise.all([
            Data.loadConfig(),
            Data.API.init(),
            Data.API.symbology(),
            Data.API.typology(),
            Data.API.sets(),
            Data.API.keywords(),
        ]);
        this.collections = localStorage.get("collections") ?? {};

        initChartJS();
        UI.LazyLoad.ErrorImageUrl = "img/icons/not-found.png";
        UI.LazyLoad.LoadingImageUrl = "img/icons/spinner.svg";
        UI.LazyLoad.Start();
        Views.initGlobalDrag();

        document.body.addEventListener("contextmenu", (event: Event) =>
        {
            if (event.composedPath().some(t => t instanceof HTMLAnchorElement || t instanceof HTMLInputElement)) return;
            event.preventDefault();
        });

        document.addEventListener('visibilitychange', App.visibilityChange);
        const lastDeck = localStorage.get("last-deck") ?? App.sampleDeck;

        await UI.Navigator.navigate("main", () => new Views.Editor.EditorElement());

        const workbench = document.querySelector("my-workbench") as Views.Workbench.WorkbenchElement;
        await workbench.loadData(await Data.File.loadDeck(JSON.stringify(lastDeck), "JSON"));

        const unsavedProgress = document.body.querySelector(".unsaved-progress") as HTMLElement;
        unsavedProgress.classList.toggle("none", true);
    }

    private static visibilityChange = function (this: typeof App, event: Event)
    {
        if (document.visibilityState == "hidden")
        {
            localStorage.set("collections", App.collections);

            const editor = document.querySelector("my-editor") as Views.Editor.EditorElement;
            const workbench = editor.querySelector("my-workbench") as Views.Workbench.WorkbenchElement;
            const deck: Data.Deck = workbench.getData();

            localStorage.set("last-deck", deck);
        }
    }.bind(this);

    public static symbols: Data.API.Symbol[];
    public static types: Data.API.Typology;
    public static sets: Data.API.Set[];
    public static keywords: string[];

    public static collections: { [name: string]: Data.Collection; } = {};
    public static config: Data.Config;

    private static sampleDeck = {
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