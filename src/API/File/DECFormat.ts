/// <reference path="File.ts" />

namespace API.File
{
    export const DECFormat = new class DECFormat implements Format<Deck>
    {
        public name = "DEC";
        public extensions = ["dec"];
        public mimeTypes = ["application/dec"];

        public async save(deck: Deck): Promise<string>
        {
            let text = "";
            text += "//Name: " + deck.name + "\n";

            text += "\n";
            text += "//Main\n";
            const mainSection = deck.sections.first(x => x.title == "main");
            const addLine = (entry: API.Entry, sideboard?: boolean) =>
            {
                if (sideboard) text += "SB:";
                text += entry.quantity + " " + entry.name;
                if (deck.commanders && deck.commanders.includes(entry.name))
                    text += " # !Commander";
                text += "\n";
            };
            for (const item of mainSection.items)
                if ("name" in item)
                    addLine(item);

            for (const item of mainSection.items)
                if ("title" in item)
                {
                    text += "\n";
                    text += "//" + item.title + "\n";
                    for (const entry of getEntries(item))
                        addLine(entry);
                }

            const sideSection = deck.sections.first(x => x.title == "side");
            if (sideSection.items.length > 0)
            {
                text += "\n";
                text += "//Sideboard\n";
                for (const item of sideSection.items)
                    if ("name" in item)
                        addLine(item, true);

                for (const item of sideSection.items)
                    if ("title" in item)
                    {
                        text += "\n";
                        text += "//" + item.title + "\n";
                        for (const entry of getEntries(item))
                            addLine(entry, true);
                    }
            }

            text = text.replaceAll(/(?:\r\n|\r|\n)/, "\r\n");
            return text;
        }

        public async load(text: string): Promise<Deck>
        {
            text = text?.replaceAll(/(?:\r\n|\r|\n)/, "\n");

            const lines = text.splitLines().map(x => x.trim());
            let name: string = null;
            let group: string = "";
            const groups: { [section: string]: string[]; } = {};
            for (const line of lines)
            {
                if (!line) continue;
                const nameMatch = line.match(/^\/\/\s*name:\s*(?<name>.*)$/i);
                if (nameMatch)
                {
                    name = nameMatch.groups["name"].trim();
                    continue;
                }

                const sectionMatch = line.match(/^\/\/\s*(?<section>.*)$/);
                if (sectionMatch)
                {
                    group = sectionMatch.groups["section"].trim();
                    continue;
                }

                const arr = groups[group] ??= [];
                arr.push(line);
            }

            const deck: Deck = {
                name,
                description: null,
                commanders: [],
                tags: [],
                sections: [
                    { title: "main", items: [] },
                    { title: "side", items: [] },
                    { title: "maybe", items: [] }
                ]
            };

            for (const group of Object.entries(groups))
            {
                for (const line of group[1])
                {
                    const entry = line.match(/^((?<location>[^:]+):\s*)?(?<quantity>[0-9]+)(\s+\[(?<set>[^\\[\\]#]+)\])?\s+(?<name>[^#]*)(?<attributes>#.*)?$/);
                    const location = entry.groups["location"] ?? "";
                    const quantity = parseInt(entry.groups["quantity"].trim());
                    const name = entry.groups["name"].trim();
                    const attributes = entry.groups["attributes"]?.trim();

                    if (attributes && attributes.toLowerCase().includes("commander"))
                        deck.commanders.push(name);

                    const topSection = location?.toLowerCase() == "sb" ? deck.sections.first(x => x.title == "side") : deck.sections.first(x => x.title == "main");

                    let sectionName = group[0];
                    if (topSection.title == "main" && group[0].toLowerCase() == "main") sectionName = null;
                    if (topSection.title == "side" && (group[0].toLowerCase() == "side" || group[0].toLowerCase() == "sideboard")) sectionName = null;

                    if (!sectionName) topSection.items.push({ quantity, name } as Entry);
                    else
                    {
                        //@ts-ignore
                        let section: Section = topSection.items.first(x => x.title == sectionName);
                        if (!section)
                        {
                            section = { title: sectionName, items: [] };
                            topSection.items.push(section);
                        }
                        section.items.push({ quantity, name } as Entry);
                    }
                }
            }

            return deck;
        }
    }();

    deckFormats.push(DECFormat);
}