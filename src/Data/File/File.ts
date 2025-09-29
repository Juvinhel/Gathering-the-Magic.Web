namespace Data.File
{
    export const deckFileFormats: File<Deck>[] = [];
    export const collectionFileFormats: File<Collection>[] = [];

    export async function saveDeck(deck: Deck, format: string | File<Deck> = "YAML"): Promise<{ format: string, text: string; }>
    {
        let file: File<Deck>;
        if (typeof format == "string")
            file = deckFileFormats.first(x => x.name.equals(format, false));
        else
            file = format;

        return { format: file.name, text: await file.save(deck) };
    }

    export async function loadDeck(text: string, format: string | File<Deck> = "YAML"): Promise<Deck>
    {
        text = text?.replaceAll(/(?:\r\n|\r|\n)/, "\n");

        let file: File<Deck>;
        if (typeof format == "string")
            file = deckFileFormats.first(x => x.name.equals(format, false));
        else
            file = format;

        const deck = await file.load(text);

        return deck;
    }

    export async function populateEntriesFromIdentifiers(deck: Deck)
    {
        const progressDialog = await UI.Dialog.progress({ title: "Gathering card info!", displayType: "Absolute" });
        try
        {
            const entries = getEntries(deck);
            progressDialog.max = entries.length;
            progressDialog.value = 0;

            let i = 0;
            for await (const card of API.getCards(entries.map(entry => { return { name: entry.name }; })))
            {
                const entry = entries[i];
                Object.assign(entry, card);
                ++progressDialog.value;
                ++i;
            }
        }
        finally
        {
            progressDialog.close();
        }
    }

    export interface File<T>
    {
        name: string;
        extensions: string[];
        mimeTypes: string[];

        save(data: T): Promise<string>;
        load(text: string): Promise<T>;
    }
}