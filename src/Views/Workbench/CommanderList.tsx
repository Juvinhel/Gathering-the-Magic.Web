namespace Views.Workbench
{
    export function CommanderList()
    {
        return <ul class="commander-list"
            onchildrenchanged={ refreshCommanders } />;
    }

    function refreshCommanders(event: UI.Events.ChildrenChangedEvent)
    {
        const commanderList = event.currentTarget as HTMLElement;
        const commanders = [...commanderList.querySelectorAll("li")].map(x => x.textContent);
        const workbench = commanderList.closest("my-workbench");
        for (const entry of workbench.querySelectorAll("my-entry") as NodeListOf<EntryElement>)
        {
            const name = entry.querySelector(".name").textContent;
            const commanderButton = entry.querySelector(".commander-button");
            commanderButton.classList.toggle("checked", commanders.includes(name));
        }
        commanderList.dispatchEvent(new Event("change"));
    }
}