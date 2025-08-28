namespace Data.File
{
    export const JSONFile = new class JSONFile implements File<Deck>
    {
        public format: Format = "JSON";

        public async save(deck: Deck): Promise<string>
        {
            const d = JSON.parse(JSON.stringify(deck));
            traverse(d, (entry: Entry) => { return { quantity: entry.quantity, name: entry.name } as Entry; });
            return JSON.stringify(deck);
        }

        public async load(text: string): Promise<Deck>
        {
            return JSON.parse(text);
        }
    }();
}