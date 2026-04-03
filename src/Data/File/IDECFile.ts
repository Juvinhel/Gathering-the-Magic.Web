namespace Data.File
{
    export const IDECFile = new class IDECFile implements File<Deck>
    {
        public name = "IDEC";
        public extensions = ["idec"];
        public mimeTypes = ["application/idec"];

        public async save(deck: Deck): Promise<string>
        {
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
            let ret = "  ".repeat(indention) + section.title + ":\r\n";
            if (section.comment)
                for (const commentLine of section.comment.splitLines())
                    ret += "  ".repeat(indention + 1) + "# " + commentLine + "\r\n";

            if (section.items)
                for (const item of section.items)
                    if (isSection(item))
                        ret += this.writeSection(indention + 1, item);
                    else if (isEntry(item))
                        ret += this.writeEntry(indention + 1, item);
            return ret;
        }

        private writeEntry(indention: number, entry: Entry): string
        {
            let ret = "";
            ret += "  ".repeat(indention) + "- " + entry.quantity + " " + entry.name + "\r\n";
            if (entry.comment)
                for (const commentLine of entry.comment.splitLines())
                    ret += "  ".repeat(indention + 1) + "# " + commentLine + "\r\n";
            return ret;
        }

        public async load(text: string): Promise<Deck>
        {
            const ret = { sections: [] } as any as Deck;
            const result = this.parse(text);

            const nameField = getProperty(result, "name");
            if (!nameField || !nameField.value) throw new Error("Deck name is missing");
            ret.name = nameField.value;

            const descriptionField = getProperty(result, "description");
            if (descriptionField && descriptionField.value) ret.description = descriptionField.value;

            const commandersField = getProperty(result, "commanders");
            if (commandersField && commandersField.tokens.filter(x => x.type == "item").length) ret.commanders = commandersField.tokens.filter(x => x.type == "item").map(x => x.text);

            const tagsField = getProperty(result, "tags");
            if (tagsField && tagsField.tokens.filter(x => x.type == "item").length) ret.tags = tagsField.tokens.filter(x => x.type == "item").map(x => x.text);

            const mainField = getProperty(result, "main");
            if (mainField) ret.sections.push(this.loadSection(mainField) as any);
            else ret.sections.push({ title: "main", items: [] });

            const sideField = getProperty(result, "side");
            if (sideField) ret.sections.push(this.loadSection(sideField) as any);
            else ret.sections.push({ title: "side", items: [] });

            const maybeField = getProperty(result, "maybe");
            if (maybeField) ret.sections.push(this.loadSection(maybeField) as any);
            else ret.sections.push({ title: "maybe", items: [] });

            await populateEntriesFromIdentifiers(ret);

            return ret as Deck;
        }

        private sectionRegex = /^\s*(?<title>[^:]+)\s*:\s*$/;
        private lineRegex = /^\s*(?<quantity>[0-9]+)?\s*(?<name>[^\(\)]*)\s*((?<set>\(\s*[^\(\)]+\s*\))\s*(?<setno>.*)?)?\s*$/;
        private loadSection(p: token): Section
        {
            const ret = { items: [] } as Section;
            const section = p.text.match(this.sectionRegex);
            ret.title = section.groups.title.trim();
            const comment = this.getComment(p);
            if (comment) ret.comment = comment;

            for (const token of p.tokens)
            {
                switch (token.type)
                {
                    case "property":
                        ret.items.push(this.loadSection(token));
                        break;
                    case "item":
                        const line = token.text.match(this.lineRegex);
                        const quantity = parseInt(line.groups.quantity?.trim() ?? "1");
                        const name = line.groups.name.trim();
                        const set = line.groups.set?.substring(1).substrEnd(1); // not needed yet
                        const setNo = line.groups.setno; // not needed yet
                        const comment = this.getComment(token);

                        const entry = { quantity, name } as Entry;
                        if (comment) entry.comment = comment;
                        ret.items.push(entry);
                        break;
                }
            }

            return ret;
        }

        private getComment(token: token): string
        {
            let ret = "";
            for (const comment of token.tokens.filter(x => x.type == "comment"))
                ret += comment.text + "\r\n";
            return ret.trim() ?? null;
        }

        private parse(text: string): { tokens: token[]; }
        {
            const ret = { tokens: [] };
            const layers: token[] = [];
            for (const line of text.splitLines())
            {
                const [indention, text] = this.getIndention(line);
                if (!text) continue;

                let token: token;
                if (text.startsWith("#"))
                {   // comment
                    token = { type: "comment", text: text.substring(1).trim(), tokens: [] };
                }
                else if (text.startsWith("-"))
                {   // item
                    token = { type: "item", text: text.substring(1).trim(), tokens: [] };
                }
                else 
                {   // property
                    const [key, value] = text.splitFirst(":");

                    const ptoken: propertyToken = { type: "property", text: text.trim(), tokens: [], key: key.trim() };
                    if (value?.trim()) ptoken.value = value.trim();
                    token = ptoken;
                }

                if (indention == 0)
                    ret.tokens.push(token);
                else
                {
                    const parent = layers[indention - 1];
                    parent.tokens.push(token);
                }

                layers.length = indention + 1; // cut off everything that comes after
                layers[indention] = token;
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

//type parserPrimitive = { indention: number, text: string, items: parserPrimitive[]; };
type token = { type: "property" | "item" | "comment", text: string, tokens: token[]; };
type propertyToken = token & { key: string, value?: string; };

function isProperty(token: token): token is propertyToken
{
    return "key" in token;
}

function getProperty(token: { tokens: token[]; }, key: string): propertyToken
{
    return token.tokens.first(x => isProperty(x) && x.key == key) as propertyToken;
}