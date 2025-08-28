namespace Data.File
{
    export const TXTFile = new class TXTFile implements File<Deck>
    {
        public format: Format = "TXT";

        public async save(deck: Deck): Promise<string>
        {
            let ret = "";

            for (const entry of getEntries(deck.sections.first(x => x.title == "main")))
                ret += entry.quantity.toFixed() + " " + entry.name + "\r\n";

            return ret;
        }

        public async load(text: string): Promise<Deck>
        {
            const lines = text.splitLines().map(x => x.trim());
            const deck: Deck = {
                name: null, description: null, sections: [
                    { title: "main", items: [] },
                    { title: "side", items: [] },
                    { title: "maybe", items: [] },
                ]
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

            return deck;
        }
    }();
}