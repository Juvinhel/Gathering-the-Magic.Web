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
            let main: Entry[];
            let side: Entry[];
            if ("sections" in deck)
            {
                main = Data.collapse(deck.sections.first(s => s.title == "main"));
                side = Data.collapse(deck.sections.first(s => s.title == "side"));
            }
            else if ("title" in deck) main = Data.collapse(deck);
            else main = deck;

            let textCommanders = "";
            if (commanders.length > 0)
            {
                for (const commander of commanders)
                {
                    textCommanders += "1 " + commander + "\r\n";

                    const entry = main.first(x => x.name == commander);
                    entry.quantity -= 1;
                    if (entry.quantity == 0) main.remove(entry);
                }
                textCommanders += "\r\n";
            }

            let text = "";
            for (const entry of main.sortBy(x => x.name))
                text += entry.quantity.toFixed() + " " + entry.name + "\r\n";
            if (side && side.length > 0)
            {
                text += "\r\n";
                text += "Sideboard\r\n";
                for (const entry of side.sortBy(x => x.name))
                    text += entry.quantity.toFixed() + " " + entry.name + "\r\n";
            }

            return textCommanders + text;
        }

        public async load(text: string): Promise<Deck>
        {
            const lines = text.splitLines().map(x => x.trim());
            let main: string[];
            let side: string[];
            if (lines.some(x => x.equals("Sideboard", false)))
            {
                const i = lines.findIndex(x => x.equals("Sideboard", false));
                main = lines.slice(0, i);
                side = lines.slice(i + 1);
            }
            else
                main = lines;

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
            for (const line of main)
            {
                const entry = this.parseLine(line);
                if (entry) mainSection.items.push(entry as Entry);
            }

            if (side)
            {
                const sideSection: Section = deck.sections.first(s => s.title == "side");
                for (const line of side)
                {
                    const entry = this.parseLine(line);
                    if (entry) sideSection.items.push(entry as Entry);
                }
            }

            await populateEntriesFromIdentifiers(deck);

            return deck;
        }

        private lineRegex = /^\s*((?<quantity>[0-9]+)\s+)?(?<name>[^#]+)\s*$/;
        private parseLine(line: string): { quantity: number, name: string; }
        {
            const match = line.match(this.lineRegex);
            if (match)
            {
                const quantity = parseInt(match.groups.quantity?.trim() ?? "1");
                const name = match.groups["name"].trim();

                return { quantity, name };
            }
            return null;
        }
    }();

    deckFileFormats.push(TXTFile);
}