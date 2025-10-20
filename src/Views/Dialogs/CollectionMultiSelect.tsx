namespace Views.Dialogs
{
    export async function showCollectionMultiSelect(args?: { collections?: { [name: string]: Data.Collection; } | Data.Collection[]; }): Promise<Data.Collection[]>
    {
        const collections: Data.Collection[] = args?.collections == null ? Object.values(App.collections) : (Array.isArray(args.collections) ? args.collections : Object.values(args.collections));
        console.log("collections", collections);
        const element = <div class="collections-multi-select">
            <div class="list">
                {
                    collections.orderBy(c => c.name, String.localeCompare).map((c, i) =>
                        <div>
                            <input id={ "collection" + i.toFixed() } type="checkbox" title={ c.name } collection={ c } checked={ true }>{ c.name }</input>
                            <label for={ "collection" + i.toFixed() } title={ c.name }>{ c.name }</label>
                        </div>)
                }
            </div>
            <button class="ok-button" onclick={ function (event: Event) { result = true; UI.Dialog.close(event.currentTarget as Element); } }>OK</button>
            <button class="cancel-button" onclick={ function (event: Event) { result = false; UI.Dialog.close(event.currentTarget as Element); } }>Cancel</button>
        </div> as HTMLElement;

        let result: boolean = false;
        await UI.Dialog.show(element, { title: "Select Collections", allowClose: true });
        if (!result) return [];

        return [...element.querySelectorAll("input[type=checkbox]:checked")].map(x => x["collection"] as Data.Collection);
    }
}