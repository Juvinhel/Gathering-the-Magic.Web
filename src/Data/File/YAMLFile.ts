namespace Data.File
{
    export const YAMLFile = new class YAMLFile implements File<Deck>
    {
        public format: Format = "YAML";

        public async save(deck: Deck): Promise<string>
        {
            const data: any = { name: deck.name, description: deck.description };
            if (deck.commanders && deck.commanders.length > 0) data.commanders = deck.commanders;
            const addSection = (obj: any, section: Data.Section) =>
            {
                if (section.items.length == 0) 
                {
                    obj[section.title] = null;
                    return;
                }
                obj[section.title] = [];
                for (const item of section.items)
                    if ("name" in item)
                        obj[section.title].push(item.quantity + " " + item.name);
                    else
                    {
                        const o = {};
                        obj[section.title].push(o);
                        addSection(o, item);
                    }
            };

            for (const section of deck.sections)
                addSection(data, section);
            return YAML.stringify(data);
        }

        public async load(yaml: string): Promise<Deck>
        {
            const data = YAML.parse(yaml);
            const deck: Deck = {
                name: data.name,
                description: data.description,
                commanders: [],
                sections: [
                    { title: "main", items: [] },
                    { title: "side", items: [] },
                    { title: "maybe", items: [] }
                ]
            };
            if (data.commanders)
                deck.commanders = typeof data.commanders === "string" ? [data.commanders] : data.commanders;

            if ("main" in data)
            {
                const main: [] = data["main"];
                if (main) deck.sections.first(x => x.title == "main").items = main.map(this.createItem);
            }
            if ("side" in data)
            {
                const side: [] = data["side"];
                if (side) deck.sections.first(x => x.title == "side").items = side.map(this.createItem);
            }
            if ("maybe" in data)
            {
                const maybe: [] = data["maybe"];
                if (maybe) deck.sections.first(x => x.title == "maybe").items = maybe.map(this.createItem);
            }

            return deck;
        }

        private createItem = function (item: string | { [key: string]: []; })
        {
            if (typeof item === "string")
            {
                const [quantityText, name] = item.splitFirst(" ");
                return { quantity: parseInt(quantityText), name: name.trim() };
            }
            else
            {
                const [title, items] = Object.entries(item).first();
                const section = { title, items: [] };
                if (items)
                    for (const item of items)
                        section.items.push(this.createItem(item));
                return section;
            }
        }.bind(this);
    }();
}