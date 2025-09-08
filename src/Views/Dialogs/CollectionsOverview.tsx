namespace Views.Dialogs
{
    export function CollectionsOverview(args: { collections: { [name: string]: Data.Collection; }; allowDelete?: boolean; })
    {
        const collections: { [name: string]: Data.Collection; } = args.collections;
        const allowDelete = args.allowDelete ?? true;
        return <div class="collections-overview">
            <div>
                <span>Name</span>
                <span>Cards</span>
                <span>Import Date</span>
                <span />
            </div>
            {
                Object.entries(collections).orderBy(x => x[1].name, String.localeCompare).map(e =>
                    <div>
                        <span title={ e[1].name }>{ e[1].name }</span>
                        <span title={ Object.values(e[1].cards).sum() }>{ Object.values(e[1].cards).sum() }</span>
                        <span title={ e[1].importDate.toLocaleString() }>{ e[1].importDate.toLocaleString() }</span>
                        { allowDelete ? <a class="link-button" onclick={ (event: Event) => deleteCollection(event, e[0]) }><color-icon src="img/icons/delete.svg" /></a> : null }
                    </div>)
            }
        </div>;
    }

    function deleteCollection(event: Event, key: string)
    {
        const target = event.currentTarget as HTMLTableCellElement;
        const row = target.closest("div");
        row.remove();

        delete App.collections[key];
    }
}