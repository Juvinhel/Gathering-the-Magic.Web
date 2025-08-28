namespace Data.Scryfall
{
    const baseUrl = "https://api.scryfall.com";

    export async function getCardBySet(set: string, number: number): Promise<Card>
    {
        const response = await fetch(`${baseUrl}/cards/${set}/${number}`);
        const data = await response.json();
        if (isScryfallError(data)) throw new Error(data.details);
        return data;
    }

    export async function getCardByName(name: string): Promise<Card>
    {
        const response = await fetch(`${baseUrl}/cards/named?exact=${encodeURIComponent(name)}`);
        const data = await response.json();
        if (isScryfallError(data)) throw new Error(data.details);
        return data;
    }

    export async function getCardById(id: string): Promise<Card>
    {
        if (id[0] == "{") id = id.substring(1);
        if (id[id.length - 1] == "}") id = id.substring(0, id.length - 1);

        const response = await fetch(`${baseUrl}/cards/${id}`);
        const data = await response.json();
        if (isScryfallError(data)) throw new Error(data.details);
        return data;
    }

    export function getMultipleCardsByName(names: string[]): AsyncIterablePromise<Card>
    {
        return getCollection(names.map(name => { return { name }; }));
    }

    export function getCollection(identifiers: Identifier[]): AsyncIterablePromise<Card>
    {
        return new AsyncIterablePromise(doGetCollection(identifiers));
    }

    async function* doGetCollection(identifiers: Identifier[])
    {
        const blocks: Identifier[][] = [];
        // search double faced cards (names contain "//") only with first part
        identifiers = identifiers.map(x => "name" in x && x.name.includes("//") ? { name: x.name.splitFirst("//")[0] } : x);
        const ids = [...identifiers];
        while (ids.length) blocks.push(ids.splice(0, 50));

        for (const block of blocks)
        {
            const ids = { identifiers: block };
            const response = await fetch(`${baseUrl}/cards/collection`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(ids)
                }
            );
            const data = await response.json();
            if (isScryfallError(data)) throw new Error(data.details);

            const result: CardList = data;
            const notFound: Identifier[] = result.not_found;
            const found: Card[] = result.data;

            let x = 0;
            for (let i = 0; i < block.length; ++i)
            {
                const identifier = identifiers[i];
                const isNotFound = notFound.some(x =>
                {
                    if ("name" in x) return x["name"] == identifier["name"];
                    if ("id" in x) return x["id"] == identifier["id"];
                    if ("set" in x && "collector_number" in x) return x["set"] == identifier["set"] && x["collector_number"] == identifier["collector_number"];
                    return false;
                });
                if (isNotFound) yield null;
                else
                {
                    yield found[x];
                    ++x;
                }
            }
        }
    }

    export function search(query: string): AsyncIterablePromise<Card>
    {
        return new AsyncIterablePromise(doSearch(query));
    }

    async function* doSearch(query: string)
    {
        let next = `${baseUrl}/cards/search?q=` + encodeURIComponent(query);
        while (next)
        {
            const response = await fetch(next);
            const data = await response.json();
            if (isScryfallError(data)) throw new Error(data.details);

            const result: CardList = data;
            for (const d of result.data) yield d;
            if (result.has_more) next = result.next_page;
            else next = null;
        }
    }

    export async function symbology(): Promise<Symbol[]>
    {
        const response = await fetch(`${baseUrl}/symbology`);
        const data = await response.json();
        if (isScryfallError(data)) throw new Error(data.details);

        const result: SymbolList = data;
        return result.data;
    }

    export async function sets(): Promise<Set[]>
    {
        const response = await fetch(`${baseUrl}/sets`);
        const data = await response.json();
        if (isScryfallError(data)) throw new Error(data.details);

        const result: List<Set> = data;
        return result.data;
    }

    export async function catalogue(catalogueName: CatalogueName): Promise<string[]>
    {
        const response = await fetch(`${baseUrl}/catalog/${catalogueName}`);
        const data = await response.json();
        if (isScryfallError(data)) throw new Error(data.details);

        const result: Catalog = data;
        return result.data;
    }

    type Catalog = {
        object: "catalog";
        uri: string;
        total_values: number;
        data: string[];
    };

    type List<T> = {
        object: "list";
        data: T[];
        has_more: boolean,
        next_page?: URI;
        warnings?: string[];
    };

    type CardList = List<Card> & {
        total_cards?: Integer;
        not_found?: Identifier[];
    };

    type SymbolList = List<Symbol>;
}