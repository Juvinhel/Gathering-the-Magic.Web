namespace API.File
{
    export const IDECFormat = new class IDECFormat implements Format<Deck>
    {
        public name = "Ideal Deck";
        public extensions = ["idec"];
        public mimeTypes = ["application/idec"];

        public async save(deck: Deck): Promise<string>
        {
            let text = "";
            text += "name: " + deck.name + "\n";
            if (deck.description)
            {
                const lines = deck.description.splitLines();
                text += "description: " + lines[0] + "\n";
                for (const line of lines.skip(1))
                    text += "# " + line + "\n";
            }
            if (deck.commanders && deck.commanders.length > 0)
            {
                text += "commanders: " + "\n";
                for (const commander of deck.commanders)
                    text += "  - " + commander + "\n";
            }
            if (deck.tags && deck.tags.length > 0)
            {
                text += "tags: " + "\n";
                for (const tag of deck.tags)
                    text += "  - " + tag + "\n";
            }
            for (const section of deck.sections)
                if (section.items && section.items.length > 0)
                    text += this.writeSection(0, section);

            text = text.replaceAll(/(?:\r\n|\r|\n)/, "\r\n");
            return text;
        }

        private writeSection(indention: number, section: Section): string
        {
            let ret = "  ".repeat(indention) + section.title + ":\n";
            if (section.comment)
                for (const commentLine of section.comment.splitLines())
                    ret += "  ".repeat(indention + 1) + "# " + commentLine + "\n";

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
            ret += "  ".repeat(indention) + "- " + entry.quantity + " " + entry.name;
            if (entry.set) ret += " (" + entry.set + ") " + entry.no;
            ret += "\n";
            if (entry.comment)
                for (const commentLine of entry.comment.splitLines())
                    ret += "  ".repeat(indention + 1) + "# " + commentLine + "\n";
            return ret;
        }

        public async load(text: string): Promise<Deck>
        {
            text = text?.replaceAll(/(?:\r\n|\r|\n)/, "\n");

            const ret = { sections: [] } as any as Deck;
            const result = this.parse(text);

            const nameField = getProperty(result, "name");
            if (!nameField || !nameField.value) throw new Error("Deck name is missing");
            ret.name = nameField.value;

            const descriptionField = getProperty(result, "description");
            if (descriptionField && descriptionField.value)
            {
                ret.description = descriptionField.value;
                for (const comment of result.tokens.filter(t => t.type == "comment"))
                    ret.description += "\r\n" + comment.text;
            }

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

            return ret as Deck;
        }

        private sectionRegex = /^\s*(?<title>[^:]+)\s*:\s*$/;
        private lineRegex = /^\s*((?<quantity>[0-9]+)\s+)?(?<name>[^\(\)]+)(\s+(?<set>\(\s*[^\(\)]+\s*\))\s+(?<no>.*)?)?\s*$/;
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
                        try
                        {
                            const quantity = parseInt(line.groups.quantity?.trim() ?? "1");
                            const name = line.groups.name.trim();
                            const set = line.groups.set?.substring(1).substrEnd(1);
                            const no = line.groups.no;
                            const comment = this.getComment(token);

                            const entry = { quantity, name } as Entry;
                            if (set && no)
                            {
                                entry.set = set;
                                entry.no = no;
                            }
                            if (comment) entry.comment = comment;
                            ret.items.push(entry);
                        } catch (error)
                        {

                        }
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

    deckFormats.push(IDECFormat);
}

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