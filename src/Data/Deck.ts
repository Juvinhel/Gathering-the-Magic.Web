namespace Data
{
    export type Deck = {
        name: string;
        description: string;
        commanders?: string[];

        sections: [
            { title: "main", items: (Entry | Section)[]; },
            { title: "side", items: (Entry | Section)[]; },
            { title: "maybe", items: (Entry | Section)[]; },
        ];
    };

    export type Section = {
        title: string;
        items: (Entry | Section)[];
    };

    export type Entry = API.Card & { quantity: number; };

    export function getEntries(deck: Deck | Section): Entry[]
    {
        return flattenItems("sections" in deck ? deck.sections : deck.items);
    }

    export function isEntry(entryOrSection: Entry | Section): entryOrSection is Entry
    {
        return "quantity" in entryOrSection;
    }

    export function isSection(entryOrSection: Entry | Section): entryOrSection is Section
    {
        return "title" in entryOrSection;
    }

    function flattenItems(items: (Section | Entry)[]): Entry[]
    {
        const ret: Entry[] = [];

        for (const item of items)
            if (isEntry(item))
                ret.push(item);
            else if (isSection(item))
                ret.push(...flattenItems(item.items));

        return ret;
    }

    export function getSections(deck: Deck | Section): IterableIterator<Section>
    {
        return flattenSections("sections" in deck ? deck.sections : deck.items);
    }

    function* flattenSections(items: (Section | Entry)[]): IterableIterator<Section>
    {
        for (const item of items)
        {
            if (isSection(item))
            {   // section
                yield item;
                for (const subSection of flattenSections(item.items))
                    yield subSection;
            }
        }
    }

    export function collapse(deck: Deck | Section | Entry[]): Entry[]
    {   // collapsed multiple entries of the same card down to one entry with summed up quantity
        const entries = Array.isArray(deck) ? deck : Data.getEntries(deck);
        let collapsedEntries: Data.Entry[] = [];
        for (const entry of entries)
        {
            const collapsedEntry = collapsedEntries.first(x => x.name == entry.name);
            if (collapsedEntry) collapsedEntry.quantity += entry.quantity;
            else collapsedEntries.push(Object.clone(entry));
        }
        return collapsedEntries;
    }
}