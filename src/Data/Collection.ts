namespace Data
{
    export type Collection = {
        name: string;
        cards: { [name: string]: number; };
        importDate: Date;
    };

    export function combineCollections(name: string, collections: Collection[]): Collection
    {
        const ret = { name, importDate: null, cards: {} } as Data.Collection;
        for (const collection of collections)
        {
            if (ret.importDate == null || collection.importDate > ret.importDate) ret.importDate = collection.importDate;

            for (const card of Object.entries(collection.cards))
            {
                const name = card[0];
                const quantity = card[1];
                if (!(name in ret.cards))
                    ret.cards[name] = quantity;
                else
                    ret.cards[name] += quantity;
            }
        }

        return ret;
    }
}