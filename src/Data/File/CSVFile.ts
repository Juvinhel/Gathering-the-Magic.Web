namespace Data.File
{
    export const CSVFile = new class CSVFile implements File<Collection>
    {
        public format: Format = "CSV";

        public async save(collection: Collection): Promise<string>
        {
            throw new Error("Not implemented yet!");
        }

        public async load(text: string): Promise<Collection>
        {   // TODO: other options for loading: SetID + CardNo / ScryfallID / OracleID
            text = text.replaceAll(/(?:\\r\\n|\\r|\\n)/, "\n");

            const dataset = await CSV.fetch({ data: text });

            const collection: Collection = { name: null, cards: {} };
            const header = dataset.fields;
            const nameIndex = findColumn(header, "name");
            const quantityIndex = findColumn(header, "quantity", "qty", "count");
            for (const row of dataset.records)
            {
                const name = row[nameIndex];
                if (!name) continue;

                const quantity = parseInt(row[quantityIndex]) ?? 1;

                if (!(name in collection.cards))
                    collection.cards[name] = quantity;
                else
                    collection.cards[name] += quantity;
            }
            return collection;
        };
    }();

    function findColumn(header: string[], ...names: string[]): number
    {
        for (const name of names)
        {
            const result = header.findIndex(h => h.toUpperCase() == name.toUpperCase());
            if (result >= 0) return result;
        }
        return -1;
    }
}