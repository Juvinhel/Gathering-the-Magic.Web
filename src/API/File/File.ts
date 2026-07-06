namespace API.File
{
    export const deckFormats: Format<Deck>[] = [];
    export const collectionFormats: Format<Collection>[] = [];

    export function getDeckFormat(nameOrExtension: string): Format<Deck>
    {
        return deckFormats.first(f => f.name.equals(nameOrExtension as string, false) || f.extensions.some(e => e.equals(nameOrExtension as string, false)));
    }

    export async function saveDeck(deck: API.Deck, format: string | Format<Deck> = "YAML"): Promise<{ format: string, text: string; }>
    {
        format = typeof format === "object" ? format : getDeckFormat(format);
        const text = await format.save(deck);

        return { format: format.name, text };
    }

    export async function loadDeck(text: string, format: string | Format<Deck> = "YAML", full: boolean = true): Promise<API.Deck>
    {
        format = typeof format === "object" ? format : getDeckFormat(format);
        text = text?.replaceAll(/(?:\r\n|\r|\n)/, "\n");

        const deck = await format.load(text);
        if (full) await populateEntriesFromIdentifiers(deck);

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