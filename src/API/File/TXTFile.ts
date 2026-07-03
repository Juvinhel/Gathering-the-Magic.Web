namespace API.File
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

        public create(deck: API.Deck | API.Section | API.Entry[]): string
        {
            const commanders: string[] = ("commanders" in deck) ? deck.commanders : [];
            let main: Entry[];
            let side: Entry[];
            if ("sections" in deck)
            {
                main = API.collapse(deck.sections.first(s => s.title == "main"));
                side = API.collapse(deck.sections.first(s => s.title == "side"));
            }
            else if ("title" in deck) main = API.collapse(deck);
            else main = deck;

            let text = "";
            if (commanders.length > 0)
            {
                text += "// Commander";
                for (const commander of commanders)
                {
                    const entry = main.first(x => x.name == commander);
                    text += this.writeLine(1, entry);

                    entry.quantity -= 1;
                    if (entry.quantity == 0) main.remove(entry);
                }
                // text += "\r\n"; breaks tabletop simulator
            }

            if (text) text += "// Mainboard";
            for (const entry of main.sortBy(x => x.name))
                text += this.writeLine(entry.quantity, entry);

            if (side && side.length > 0)
            {
                text += "\r\n";
                text += "Sideboard\r\n";
                for (const entry of side.sortBy(x => x.name))
                    text += this.writeLine(entry.quantity, entry);
            }

            return text;
        }

        private writeLine(quantity: number, card: API.Card): string
        {
            let ret = "";
            ret += quantity.toFixed() + " " + card.name;
            ret += " (" + card.set + ") " + card.no;
            ret += "\r\n";
            return ret;
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