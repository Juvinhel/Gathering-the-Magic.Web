namespace Data.File
{
    export const IDECFile = new class IDECFile implements File<Deck>
    {
        public name = "IDEC";
        public extensions = ["idec"];
        public mimeTypes = ["application/idec"];

        public async save(deck: Deck): Promise<string>
        {
            console.log("asC", deck);
            let ret = "";
            ret += "name: " + deck.name + "\r\n";
            if (deck.description)
                ret += "description: " + deck.description + "\r\n";
            if (deck.commanders && deck.commanders.length > 0)
            {
                ret += "commanders: " + "\r\n";
                for (const commander of deck.commanders)
                    ret += "  - " + commander + "\r\n";
            }
            if (deck.tags && deck.tags.length > 0)
            {
                ret += "tags: " + "\r\n";
                for (const tag of deck.tags)
                    ret += "  - " + tag + "\r\n";
            }
            for (const section of deck.sections)
                if (section.items && section.items.length > 0)
                    ret += this.writeSection(0, section);
            return ret;
        }

        private writeSection(indention: number, section: Section): string
        {
            let ret = "  ".repeat(indention) + section.title + ":" + (section.comment?.trim() ? " # " + section.comment.trim() : "") + "\r\n";
            if (section.items)
                for (const item of section.items)
                    if (isSection(item))
                        ret += this.writeSection(indention + 1, item);
                    else if (isEntry(item))
                        ret += "  ".repeat(indention + 1) + "- " + item.quantity + " " + item.name + (item.comment?.trim() ? " # " + item.comment.trim() : "") + "\r\n";
            return ret;
        }

        public async load(text: string): Promise<Deck>
        {
            const ret = { sections: [] } as any as Deck;
            const result = this.parse(text);

            const nameField = result.items.first(x => x.text.startsWith("name:"));
            if (!nameField) throw new Error("Deck name is missing");
            ret.name = nameField.text.splitFirst(":")[1].trim();

            const descriptionField = result.items.first(x => x.text.startsWith("description:"));
            if (descriptionField) ret.description = descriptionField.text.splitFirst(":")[1].trim();

            const commandersField = result.items.first(x => x.text.startsWith("commanders:"));
            if (commandersField) ret.commanders = commandersField.items.map(x => x.text.substring(1).trim());

            const tagsField = result.items.first(x => x.text.startsWith("tags:"));
            if (commandersField) ret.tags = tagsField.items.map(x => x.text.substring(1).trim());

            const mainField = result.items.first(x => x.text.startsWith("main:"));
            if (mainField) ret.sections.push(this.loadSection(mainField) as any);

            const sideField = result.items.first(x => x.text.startsWith("side:"));
            if (sideField) ret.sections.push(this.loadSection(sideField) as any);

            const maybeField = result.items.first(x => x.text.startsWith("maybe:"));
            if (maybeField) ret.sections.push(this.loadSection(maybeField) as any);

            await populateEntriesFromIdentifiers(ret);

            return ret as Deck;
        }

        private sectionRegex = /^(?<title>[^:]+)\s*:\s*(?<comment>#.*)?$/;
        private lineRegex = /^(?<quantity>[0-9]+\s*)?(?<set>\[[a-zA-Z]+\]\s*)?(?<name>[^\[\]\#]*)(?<comment>#.*)?$/;
        private loadSection(p: parserPrimitive): Section
        {
            const ret = { items: [] } as Section;
            const section = p.text.match(this.sectionRegex);
            ret.title = section.groups.title.trim();
            if (section.groups.comment) ret.comment = section.groups.comment.substring(1).trim();

            for (const item of p.items)
            {
                if (item.text.startsWith("-"))
                {
                    const line = item.text.substring(1).trim().match(this.lineRegex);
                    const quantity = parseInt(line.groups.quantity?.trim() ?? "1");
                    const set = line.groups.set?.substring(1).substrEnd(1); // not needed yet
                    const name = line.groups.name.trim();
                    const comment = line.groups.comment?.substring(1).trim();

                    const entry = { quantity, name } as Entry;
                    if (comment) entry.comment = comment;
                    ret.items.push(entry);
                }
                else
                    ret.items.push(this.loadSection(item));
            }

            return ret;
        }

        private parse(text: string): parserPrimitive
        {
            const ret = { indention: -1, text: null, items: [] } as parserPrimitive;
            const lastIndetedLine = [];
            for (const line of text.splitLines())
            {
                const [indention, text] = this.getIndention(line);

                const key = { indention, text, items: [] };
                if (indention == 0)
                {
                    ret.items.push(key);
                }
                else
                {
                    const parent = lastIndetedLine[indention - 1];
                    parent.items.push(key);
                }
                lastIndetedLine[indention] = key;
            }

            return ret;
        }


        private getIndention(line: string): [number, string]
        {
            let i = 0;
            while (line[0] == " ")
            {
                ++i;
                line = line.substring(1);
            }
            return [i / 2, line.trimRight()];
        }
    }();

    deckFileFormats.push(IDECFile);
}

type parserPrimitive = { indention: number, text: string, items: parserPrimitive[]; };