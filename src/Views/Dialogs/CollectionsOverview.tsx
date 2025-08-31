namespace Views.Dialogs
{
    export function CollectionsOverview()
    {
        return <div class="collections-overview">
            <div>
                <span>Name</span>
                <span>Cards</span>
                <span>Import Date</span>
                <span />
            </div>
            {
                Object.entries(App.collections).orderBy(x => x[1].name).map(e =>
                    <div>
                        <span>{ e[1].name }</span>
                        <span>{ Object.values(e[1].cards).sum() }</span>
                        <span>{ e[1].importDate.toLocaleString() }</span>
                        <a class="link-button" onclick={ (event: Event) => deleteCollection(event, e[0]) }><color-icon src="img/icons/delete.svg" /></a>
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