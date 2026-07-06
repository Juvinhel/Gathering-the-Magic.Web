namespace API.File
{
    export const deckFormats: Format<Deck>[] = [];
    export const collectionFormats: Format<Collection>[] = [];

    export async function saveDeck(deck: API.Deck, format: string | Format<Deck> = "YAML"): Promise<{ format: string, text: string; }>
    {
        format = typeof format === "object" ? format : deckFormats.first(x => x.name.equals(format as string, false));

        return { format: format.name, text: await format.save(deck) };
    }

    export async function loadDeck(text: string, format: string | Format<Deck> = "YAML", full: boolean = true): Promise<API.Deck>
    {
        format = typeof format === "object" ? format : deckFormats.first(x => x.name.equals(format as string, false));
        text = text?.replaceAll(/(?:\r\n|\r|\n)/, "\n");

        const deck = await format.load(text);
        if (full) await populateEntriesFromIdentifiers(deck);

        return deck as API.Deck;
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
            for await (const card of API.getCards(entries.map(e => e.set ? { set: e.set, no: e.no } : { name: e.name })))
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
}