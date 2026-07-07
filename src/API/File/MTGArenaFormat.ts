namespace API.File
{
    export const MTGArenaFormat = new class MTGArenaFormat implements Format<Deck>
    {
        public name = "MTG Arena";
        public extensions = ["txt"];
        public mimeTypes = ["text/plain"];

        public async save(deck: Deck): Promise<string>
        {
            return this.create(deck);
        }

        public create(deck: API.Deck): string
        {
            const commanders: string[] = ("commanders" in deck) ? deck.commanders : [];
            let main: Entry[] = API.collapse(deck.sections.first(s => s.title == "main"));
            let side: Entry[] = API.collapse(deck.sections.first(s => s.title == "side"));

            let text = "About\n";
            text += "Name " + deck.name + "\n";
            text += "\n";

            if (commanders.length > 0)
            {
                text += "Commander\n";
                for (const commander of commanders)
                {
                    const entry = main.first(x => x.name == commander);
                    text += this.writeLine(1, entry);

                    entry.quantity -= 1;
                    if (entry.quantity == 0) main.remove(entry);
                }
                text += "\n";
            }

            text += "Deck\n";
            for (const entry of main)
                text += this.writeLine(entry.quantity, entry);

            if (side && side.length > 0)
            {
                text += "\n";
                text += "Sideboard\n";
                for (const entry of side)
                    text += this.writeLine(entry.quantity, entry);
            }

            text = text.replaceAll(/(?:\r\n|\r|\n)/, "\r\n");
            return text;
        }

        private writeLine(quantity: number, card: API.Card): string
        {
            let ret = "";
            ret += quantity.toFixed() + " " + card.name;
            if (card.set) ret += " (" + card.set + ") " + card.no;
            ret += "\n";
            return ret;
        }

        private sectionsRegex = /^\s*(About(?<about>.*?))?(Commander(?<commander>.*?))?(Deck(?<deck>.*?))(Sideboard(?<sideboard>.*?))?\s*$/s;
        public async load(text: string): Promise<Deck>
        {
            text = text?.replaceAll(/(?:\r\n|\r|\n)/, "\n");

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

            text = text.trim();

            const match = text.match(this.sectionsRegex);
            let aboutSection: string;
            let commanderSection: string;
            let deckSection: string;
            let sideboardSection: string;
            if (match)
            {
                aboutSection = match.groups["about"];
                commanderSection = match.groups["commander"];
                deckSection = match.groups["deck"];
                sideboardSection = match.groups["sideboard"];
            }
            else
                deckSection = text;

            if (aboutSection)
            {
                const header = this.parseAboutHeader(aboutSection);
                if ("Name" in header)
                    deck.name = header.Name;
            }

            if (commanderSection)
            {
                const mainSection: Section = deck.sections.first(s => s.title == "main");
                for (const line of commanderSection.splitLines().map(x => x.trim()).filter(x => !!x))
                {
                    const entry = this.parseLine(line);
                    if (entry)
                    {
                        mainSection.items.push(entry as Entry);
                        deck.commanders.push(entry.name);
                    }
                }
            }

            const mainSection: Section = deck.sections.first(s => s.title == "main");
            for (const line of deckSection.splitLines().map(x => x.trim()).filter(x => !!x))
            {
                const entry = this.parseLine(line);
                if (entry) mainSection.items.push(entry as Entry);
            }

            if (sideboardSection)
            {
                const sideSection: Section = deck.sections.first(s => s.title == "side");
                for (const line of sideboardSection.splitLines().map(x => x.trim()).filter(x => !!x))
                {
                    const entry = this.parseLine(line);
                    if (entry) sideSection.items.push(entry as Entry);
                }
            }

            return deck;
        }

        private parseAboutHeader(about: string): { [key: string]: string; }
        {
            const ret: { [key: string]: string; } = {};
            for (const line of about.splitLines().map(x => x.trim()).filter(x => !!x))
            {
                const [key, value] = line.splitFirst(" ");
                ret[key] = value?.trim();
            }
            return ret;
        }

        private lineRegex = /^\s*((?<quantity>[0-9]+)\s+)?(?<name>[^\(\)]+)(\s+(?<set>\(\s*[^\(\)]+\s*\))\s+(?<no>.*)?)?\s*$/;
        private parseLine(line: string): { quantity: number, name: string; set?: string; no?: string; }
        {
            const match = line.match(this.lineRegex);
            if (match)
            {
                const quantity = parseInt(match.groups.quantity?.trim() ?? "1");
                const name = match.groups["name"].trim();
                const set = match.groups.set?.substring(1).substrEnd(1);
                const no = match.groups.no;

                const ret: { quantity: number, name: string; set?: string; no?: string; } = { quantity, name };
                if (set)
                {
                    ret.set = set;
                    ret.no = no;
                }
                return ret;
            }
            return null;
        }
    }();

    deckFormats.push(MTGArenaFormat);
}