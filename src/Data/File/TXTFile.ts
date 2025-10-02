namespace Data.File
{
    export const TXTFile = new class TXTFile implements File<Deck>
    {
        public name = "TXT";
        public extensions = ["txt"];
        public mimeTypes = ["text/plain"];

        public async save(deck: Deck): Promise<string>
        {
            return this.create(deck);
        }

        public create(deck: Data.Deck | Data.Section | Data.Entry[]): string
        {
            const commanders: string[] = ("commanders" in deck) ? deck.commanders : [];
            if ("sections" in deck) deck = deck.sections.first(s => s.title == "main");
            const cards = Data.collapse(deck);

            let textCommanders = "";
            if (commanders.length > 0)
            {
                for (const commander of commanders)
                {
                    textCommanders += "1 " + commander + "\r\n";

                    const entry = cards.first(x => x.name == commander);
                    entry.quantity -= 1;
                    if (entry.quantity == 0) cards.remove(entry);
                }
                textCommanders += "\r\n";
            }

            let text = "";
            for (const entry of cards.sortBy(x => x.name))
                text += entry.quantity.toFixed() + " " + entry.name + "\r\n";

            return textCommanders + text;
        }

        public async load(text: string): Promise<Deck>
        {
            const lines = text.splitLines().map(x => x.trim());
            const deck: Deck = {
                name: null,
                description: null,
                commanders: [],
                tags: [],
                sections: [
                    { title: "main", items: [] },
                    { title: "side", items: [] },
                    { title: "maybe", items: [] },
                ],
            };
            const mainSection: Section = deck.sections.first(s => s.title == "main");

            for (const line of lines)
            {
                const entry = line.match(/^\s*(?<quantity>[0-9]+)\s+(?<name>[^#]*)\s*$/);
                if (entry)
                {
                    const quantity = parseInt(entry.groups["quantity"].trim());
                    const name = entry.groups["name"].trim();

                    mainSection.items.push({ quantity, name } as Entry);
                }
            }

            await populateEntriesFromIdentifiers(deck);

            return deck;
        }
    }();

    deckFileFormats.push(TXTFile);
}