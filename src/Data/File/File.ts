namespace Data.File
{
    export async function saveDeck(deck: Deck, format?: Format): Promise<{ format: Format, text: string; }>
    {
        format ??= "YAML";

        switch (format.toUpperCase())
        {
            case "YAML": return { format: YAMLFile.format, text: await YAMLFile.save(deck) };
            case "JSON": return { format: JSONFile.format, text: await JSONFile.save(deck) };
            case "XML": throw new Error("XML FileFormat not implemented yet!");
            case "DEC": return { format: DECFile.format, text: await DECFile.save(deck) };
            case "TXT": return { format: TXTFile.format, text: await TXTFile.save(deck) };
        }
    }

    export async function loadDeck(text: string, format?: Format): Promise<Deck>
    {
        format ??= "YAML";

        let deck: Deck;
        switch (format.toUpperCase())
        {
            case "YAML": deck = await YAMLFile.load(text); break;
            case "JSON": deck = await JSONFile.load(text); break;
            case "XML": throw new Error("XML FileFormat not implemented yet!");
            case "DEC": deck = await DECFile.load(text); break;
            case "TXT": deck = await TXTFile.load(text); break;
        }

        await populate(deck);

        return deck;
    }

    async function populate(deck: Deck)
    {
        const progressDialog = await UI.Dialog.progress({ title: "Gathering card info!", displayType: "Absolute" });
        try
        {
            const entries = getEntries(deck);
            progressDialog.max = entries.length;
            progressDialog.value = 0;

            for await (const card of API.getCards(entries.map(entry => { return { name: entry.name }; })))
            {
                for (const entry of entries.filter(e => e.name == card.name))
                    Object.assign(entry, card);
                ++progressDialog.value;
            }
        }
        finally
        {
            progressDialog.close();
        }
    }

    export function traverse(deck: Deck, func: (entry: Entry) => Entry)
    {
        for (const section of deck.sections)
            traverseSection(section, func);
    }

    function traverseSection(section: Section, func: (entry: Entry) => Entry)
    {
        for (let i = 0; i < section.items.length; ++i)
        {
            const item = section.items[i];
            if ("name" in item)
                section.items[i] = func(item);
            else
                traverseSection(item, func);
        }
    }

    export type Format = DeckFormat | CollectionFormat;
    export type DeckFormat = "YAML" | "JSON" | "XML" | "DEC" | "TXT";
    export type CollectionFormat = "CSV";

    export interface File<T>
    {
        format: Format;
        save(data: T): Promise<string>;
        load(text: string): Promise<T>;
    }
}