namespace Views.Workbench
{
    export function showContextMenu(this: SectionElement | EntryElement, event: PointerEvent)
    {
        const workbench = this.closest("my-workbench") as WorkbenchElement;
        const hasSelection = this instanceof EntryElement && this.selected && workbench.querySelectorAll("my-entry.selected").length > 1;

        const menuButtons: Node[] = [];

        if (hasSelection)
        {
            menuButtons.push(
                <menu-button title="Move Lines Up" onclick={ moveLinesUp.bind(this) }><color-icon src="img/icons/chevron-up.svg" /><span>Move Lines Up</span></menu-button>,
                <menu-button title="Move Lines Down" onclick={ moveLinesDown.bind(this) }><color-icon src="img/icons/chevron-down.svg" /><span>Move Lines Down</span></menu-button>,
                <menu-button title="Move Lines to ..." onclick={ moveLinesTo.bind(this) }><color-icon src="img/icons/arrow-right.svg" /><span>Move Lines to ...</span></menu-button>,
                <menu-button title="Delete Lines" onclick={ deleteLines.bind(this) }><color-icon src="img/icons/delete.svg" /><span>Delete Lines</span></menu-button>,
                <hr />,
                <menu-button title="Sort Lines by Name" onclick={ sortByName.bind(this) }><color-icon src="img/icons/sort.svg" /><span>Sort by Name</span></menu-button>,
                <menu-button title="Sort Lines by Mana" onclick={ sortByMana.bind(this) }><color-icon src="img/icons/sort.svg" /><span>Sort by Mana</span></menu-button>,
                <menu-button title="Sort Lines by Color Identity" onclick={ sortByColorIdentity.bind(this) }><color-icon src="img/icons/sort.svg" /><span>Sort by Color Identity</span></menu-button>,
            );
        }
        else if (this instanceof EntryElement)
        {
            menuButtons.push(
                <menu-button title="Move Line Up" onclick={ this.moveUp.bind(this) }><color-icon src="img/icons/chevron-up.svg" /><span>Move Line Up</span></menu-button>,
                <menu-button title="Move Line Down" onclick={ this.moveDown.bind(this) }><color-icon src="img/icons/chevron-down.svg" /><span>Move Line Down</span></menu-button>,
                <menu-button title="Move Line to ..." onclick={ this.moveTo.bind(this) }><color-icon src="img/icons/arrow-right.svg" /><span>Move Line to ...</span></menu-button>,
                <menu-button title="Delete Line" onclick={ this.delete.bind(this) }><color-icon src="img/icons/delete.svg" /><span>Delete Line</span></menu-button>,
                <menu-button title="Set as Commander" onclick={ this.setAsCommander.bind(this) }><color-icon src="img/icons/helmet.svg" /><span>Set as Commander</span></menu-button>,
                <menu-button title="Scryfall" onclick={ () => window.open(this.card.links.Scryfall, '_blank') }><color-icon src="img/icons/scryfall-black.svg" /><span>Scryfall</span></menu-button>,
                this.card.links.EDHREC ? <menu-button title="EDHREC" onclick={ () => window.open(this.card.links.EDHREC, '_blank') }><color-icon src="img/icons/edhrec.svg" /><span>EDHREC</span></menu-button> : null,
            );
        }
        else if (this instanceof SectionElement)
        {
            if (this.topLevel)
                menuButtons.push(
                    <menu-button title="Move Section Lines to ..." onclick={ this.moveTo.bind(this) }><color-icon src="img/icons/arrow-right.svg" /><span>Move Section Lines to ...</span></menu-button>,
                    <menu-button title="Clear Section Lines" onclick={ this.clear.bind(this) }><color-icon src="img/icons/delete.svg" /><span>Clear Section Lines</span></menu-button>,
                    <menu-button title="Add Section" onclick={ this.addSection.bind(this) }><color-icon src="img/icons/unlink.svg" /><span>Add Section</span></menu-button>,
                    <hr />,
                    <menu-button title="Sort Section Lines by Name" onclick={ sortByName.bind(this) }><color-icon src="img/icons/sort.svg" /><span>Sort Section Lines by Name</span></menu-button>,
                    <menu-button title="Sort Section Lines by Mana" onclick={ sortByMana.bind(this) }><color-icon src="img/icons/sort.svg" /><span>Sort Section Lines by Mana</span></menu-button>,
                    <menu-button title="Sort Section Lines by Color Identity" onclick={ sortByColorIdentity.bind(this) }><color-icon src="img/icons/sort.svg" /><span>Sort Section Lines by Color Identity</span></menu-button>,
                    <hr />,
                    <menu-button title="Select">
                        <color-icon src="img/icons/hand-select.svg" />
                        <span>Select</span>
                        <drop-down placement="right">
                            <menu-button title="Select Creatures" onclick={ () => selectCardsByType(this, "Creature", false) }><color-icon src="img/icons/card-types/creature.svg" /><span>Creatures</span></menu-button>
                            <menu-button title="Select Artifacts" onclick={ () => selectCardsByType(this, "Artifact") }><color-icon src="img/icons/card-types/artifact.svg" /><span>Artifacts</span></menu-button>
                            <menu-button title="Select Enchantments" onclick={ () => selectCardsByType(this, "Enchantment") }><color-icon src="img/icons/card-types/enchantment.svg" /><span>Enchantments</span></menu-button>
                            <menu-button title="Select Sorceries" onclick={ () => selectCardsByType(this, "Sorcery") }><color-icon src="img/icons/card-types/sorcery.svg" /><span>Sorceries</span></menu-button>
                            <menu-button title="Select Instants" onclick={ () => selectCardsByType(this, "Instant") }><color-icon src="img/icons/card-types/instant.svg" /><span>Instants</span></menu-button>
                            <menu-button title="Select Planeswalker" onclick={ () => selectCardsByType(this, "Planeswalker") }><color-icon src="img/icons/card-types/planeswalker.svg" /><span>Planeswalker</span></menu-button>
                            <menu-button title="Select Battles" onclick={ () => selectCardsByType(this, "Battle") }><color-icon src="img/icons/card-types/battle.svg" /><span>Battles</span></menu-button>
                            <menu-button title="Select Lands" onclick={ () => selectCardsByType(this, "Land", false) }><color-icon src="img/icons/card-types/land.svg" /><span>Lands</span></menu-button>
                        </drop-down>
                    </menu-button>
                );
            else
                menuButtons.push(
                    <menu-button title="Move Section Up" onclick={ this.moveUp.bind(this) }><color-icon src="img/icons/chevron-up.svg" /><span>Move Section Up</span></menu-button>,
                    <menu-button title="Move Section Down" onclick={ this.moveDown.bind(this) }><color-icon src="img/icons/chevron-down.svg" /><span>Move Section Down</span></menu-button>,
                    <menu-button title="Move Section to ..." onclick={ this.moveTo.bind(this) }><color-icon src="img/icons/arrow-right.svg" /><span>Move Section to ...</span></menu-button>,
                    <menu-button title="Delete Section" onclick={ this.delete.bind(this) }><color-icon src="img/icons/delete.svg" /><span>Delete Section</span></menu-button>,
                    <menu-button title="Clear Section Lines" onclick={ this.clear.bind(this) }><color-icon src="img/icons/delete.svg" /><span>Clear Section</span></menu-button>,
                    <menu-button title="Dissolve Section and move Lines to Parent Section" onclick={ this.dissolve.bind(this) }><color-icon src="img/icons/add-section.svg" /><span>Dissolve Section</span></menu-button>,
                    <menu-button title="Add Section" onclick={ this.addSection.bind(this) }><color-icon src="img/icons/unlink.svg" /><span>Add Section</span></menu-button>,
                    <hr />,
                    <menu-button title="Sort Section Lines by Name" onclick={ sortByName.bind(this) }><color-icon src="img/icons/sort.svg" /><span>Sort Section Lines by Name</span></menu-button>,
                    <menu-button title="Sort Section Lines by Mana" onclick={ sortByMana.bind(this) }><color-icon src="img/icons/sort.svg" /><span>Sort Section Lines by Mana</span></menu-button>,
                    <menu-button title="Sort Section Lines by Color Identity" onclick={ sortByColorIdentity.bind(this) }><color-icon src="img/icons/sort.svg" /><span>Sort Section Lines by Color Identity</span></menu-button>,
                    <hr />,
                    <menu-button title="Select">
                        <color-icon src="img/icons/hand-select.svg" />
                        <span>Select</span>
                        <drop-down placement="right">
                            <menu-button title="Select Creatures" onclick={ () => selectCardsByType(this, "Creature", false) }><color-icon src="img/icons/card-types/creature.svg" /><span>Creatures</span></menu-button>
                            <menu-button title="Select Artifacts" onclick={ () => selectCardsByType(this, "Artifact") }><color-icon src="img/icons/card-types/artifact.svg" /><span>Artifacts</span></menu-button>
                            <menu-button title="Select Enchantments" onclick={ () => selectCardsByType(this, "Enchantment") }><color-icon src="img/icons/card-types/enchantment.svg" /><span>Enchantments</span></menu-button>
                            <menu-button title="Select Sorceries" onclick={ () => selectCardsByType(this, "Sorcery") }><color-icon src="img/icons/card-types/sorcery.svg" /><span>Sorceries</span></menu-button>
                            <menu-button title="Select Instants" onclick={ () => selectCardsByType(this, "Instant") }><color-icon src="img/icons/card-types/instant.svg" /><span>Instants</span></menu-button>
                            <menu-button title="Select Planeswalker" onclick={ () => selectCardsByType(this, "Planeswalker") }><color-icon src="img/icons/card-types/planeswalker.svg" /><span>Planeswalker</span></menu-button>
                            <menu-button title="Select Battles" onclick={ () => selectCardsByType(this, "Battle") }><color-icon src="img/icons/card-types/battle.svg" /><span>Battles</span></menu-button>
                            <menu-button title="Select Lands" onclick={ () => selectCardsByType(this, "Land", false) }><color-icon src="img/icons/card-types/land.svg" /><span>Lands</span></menu-button>
                        </drop-down>
                    </menu-button>
                );
        }

        UI.ContextMenu.show(event, ...menuButtons);
        event.stopPropagation();
        event.preventDefault();
    }

    export function moveLinesUp(this: SectionElement | EntryElement)
    {
        const workbench = this.closest("my-workbench") as WorkbenchElement;
        const selectedLines = getSelectedLines(workbench) ?? [this];

        for (const line of selectedLines)
            line.moveUp();
    }

    export function moveLinesDown(this: SectionElement | EntryElement)
    {
        const workbench = this.closest("my-workbench") as WorkbenchElement;
        const selectedLines = getSelectedLines(workbench) ?? [this];

        for (const line of selectedLines.reverse())
            line.moveDown();
    }

    export async function moveLinesTo(this: SectionElement | EntryElement)
    {
        const workbench = this.closest("my-workbench") as WorkbenchElement;
        const selectedLines = [...workbench.querySelectorAll("my-entry.selected")] as (SectionElement | EntryElement)[];

        const sectionElements = [...workbench.querySelectorAll("my-section") as NodeListOf<SectionElement>];
        const sectionNames = sectionElements.map(s => s.path);

        const result = await selectSection("Move " + selectedLines.length.toFixed(0) + " cards to ...", sectionNames);
        if (!result) return;

        const selectedSection = sectionElements[result.index];

        for (const line of selectedLines)
            line.remove();
        selectedSection.querySelector(".list").append(...selectedLines);

        workbench.deselectAll();
    }

    export function deleteLines(this: WorkbenchElement | SectionElement | EntryElement)
    {
        const workbench = this.closest("my-workbench") as WorkbenchElement;
        const selectedLines = getSelectedLines(workbench, false) ?? (this instanceof WorkbenchElement ? [] : [this]);

        for (const line of selectedLines)
            line.delete();
    }

    export async function sortByName(this: SectionElement | EntryElement)
    {
        const workbench = this.closest("my-workbench") as WorkbenchElement;
        const selectedLines = getSelectedLines(workbench) ?? (this instanceof SectionElement ? [...this.lines] : [this]);

        if (selectedLines.length == 1) throw new Error("Only one line selected!");

        const parentElement = selectedLines[0].parentElement;
        const insertPosition = selectedLines[0].previousElementSibling;

        for (const line of selectedLines)
            line.remove();

        const sortedLines = selectedLines.orderBy(x => x.title);
        if (insertPosition) insertPosition.after(...sortedLines);
        else parentElement.prepend(...sortedLines);
    }

    export async function sortByMana(this: SectionElement | EntryElement)
    {
        const workbench = this.closest("my-workbench") as WorkbenchElement;
        const selectedLines = getSelectedLines(workbench) ?? (this instanceof SectionElement ? [...this.lines] : [this]);

        if (selectedLines.length == 1) throw new Error("Only one line selected!");

        const parentElement = selectedLines[0].parentElement;
        const insertPosition = selectedLines[0].previousElementSibling;

        for (const line of selectedLines)
            line.remove();

        const sortedLines = selectedLines.orderBy(x => x instanceof EntryElement ? x.card.manaValue : Number.MAX_SAFE_INTEGER);
        if (insertPosition) insertPosition.after(...sortedLines);
        else parentElement.prepend(...sortedLines);
    }

    export async function sortByColorIdentity(this: SectionElement | EntryElement)
    {
        const workbench = this.closest("my-workbench") as WorkbenchElement;
        const selectedLines = (getSelectedLines(workbench) ?? (this instanceof SectionElement ? [...this.lines] : [this])).filter(x => x instanceof EntryElement);

        if (selectedLines.length == 1) throw new Error("Only one line selected!");

        const parentElement = selectedLines[0].parentElement;
        const insertPosition = selectedLines[0].previousElementSibling;

        for (const line of selectedLines)
            line.remove();

        const sortedLines = selectedLines.orderBy(x => x.card.colorOrder);
        if (insertPosition) insertPosition.after(...sortedLines);
        else parentElement.prepend(...sortedLines);
    }

    function getSelectedLines(workbench: WorkbenchElement, checkLayer: boolean = true): (SectionElement | EntryElement)[]
    {
        const selectedLines = [...workbench.querySelectorAll("my-section.selected:not(.top-level), my-entry.selected")] as (SectionElement | EntryElement)[];
        if (!selectedLines.length) return null;

        if (checkLayer)
        {
            const parent = selectedLines[0].parentElement;
            if (!selectedLines.every(l => l.parentElement == parent)) throw new Error("Some lines have different parents!");
        }

        return selectedLines;
    }

    function selectCardsByType(section: SectionElement, type: string, exclusive: boolean = true)
    {
        const workbench = section.closest("my-workbench") as Workbench.WorkbenchElement;
        for (const element of workbench.querySelectorAll("my-entry.selected") as NodeListOf<Workbench.EntryElement>)
            element.selected = false;

        for (const element of section.querySelectorAll("my-entry") as NodeListOf<Workbench.EntryElement>)
        {
            const match = (exclusive ? element.card.type.card.length == 1 : true) && element.card.type.card.includes(type);
            element.selected = match;
        }
    }
}