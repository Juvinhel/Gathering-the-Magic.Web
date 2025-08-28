namespace Views.Workbench
{
    export async function selectSection(sections: string[]): Promise<{ index: number, section: string; } | null>
    {
        const result = await UI.Dialog.show(<div class="section-select-dialog">
            <select class="move-to-section">
                { sections.map((section, index) => <option value={ index }>{ section }</option>) }
            </select>
            <button onclick={ (event: Event) =>
            {
                const dialog = (event.currentTarget as HTMLElement).closest(".section-select-dialog");
                dialog.classList.add("ok");
                UI.Dialog.close(event.currentTarget as Element);
            } }>OK</button>
            <button onclick={ (event: Event) => UI.Dialog.close(event.currentTarget as Element) }>Cancel</button>
        </div>, { allowClose: true, title: "select section" });

        const dialog = result as HTMLElement;
        const ok = dialog.classList.contains("ok");
        if (!ok) return;

        const selectedSectionIndex = parseInt(dialog.querySelector("select").value);
        return { index: selectedSectionIndex, section: sections[selectedSectionIndex] };
    }
}