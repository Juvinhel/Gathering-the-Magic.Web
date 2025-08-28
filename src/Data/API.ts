namespace Data.API
{
    export async function init()
    {
        allSuperTypes = await Scryfall.catalogue("supertypes");
    }

    export async function symbology(): Promise<Symbol[]>
    {
        const scryfallSymbols = await Scryfall.symbology();
        const ret: Symbol[] = [];
        for (const scryfallSymbol of scryfallSymbols)
        {
            const code = scryfallSymbol.symbol.substring(1, scryfallSymbol.symbol.length - 1).trim().toUpperCase();
            ret.push({ code, description: scryfallSymbol.english, icon: scryfallSymbol.svg_uri });
        }
        return ret;
    }

    export async function typology(): Promise<Typology>
    {
        return {
            Super: await Scryfall.catalogue("supertypes"),
            Card: await Scryfall.catalogue("card-types"),
            Artifact: await Scryfall.catalogue("artifact-types"),
            Battle: await Scryfall.catalogue("battle-types"),
            Creature: await Scryfall.catalogue("creature-types"),
            Enchantment: await Scryfall.catalogue("enchantment-types"),
            Land: await Scryfall.catalogue("land-types"),
            Planeswalker: await Scryfall.catalogue("planeswalker-types"),
            Spell: await Scryfall.catalogue("spell-types")
        };
    }

    export async function sets(): Promise<Set[]>
    {
        const ret: Set[] = [];
        const scryfallSets = await Scryfall.sets();
        while (scryfallSets.length > 0)
        {
            for (let i = 0; i < scryfallSets.length; ++i)
            {
                const scryfallSet = scryfallSets[i];
                if (!scryfallSet.parent_set_code)
                {
                    ret.push({
                        code: scryfallSet.code,
                        name: scryfallSet.name,
                        icon: scryfallSet.icon_svg_uri,
                        released: scryfallSet.released_at ? new Date(scryfallSet.released_at) : null,
                    });
                    scryfallSets.removeAt(i);
                    --i;
                }
                else 
                {
                    const parentSet = ret.first(x => x.code == scryfallSet.parent_set_code);
                    if (parentSet)
                    {
                        parentSet.subSets ??= [];
                        const set = {
                            code: scryfallSet.code,
                            name: scryfallSet.name,
                            icon: scryfallSet.icon_svg_uri,
                            released: scryfallSet.released_at ? new Date(scryfallSet.released_at) : null,
                            parent: parentSet,
                        };
                        parentSet.subSets.push(set);
                        ret.push(set);
                        scryfallSets.removeAt(i);
                        --i;
                    }
                }
            }
        }
        return ret.filter(x => x.parent == null);
    }

    export async function keywords(): Promise<string[]>
    {
        const [abilityWords, keywordAbilities, keywordActions] = await Promise.all([
            Scryfall.catalogue("ability-words"),
            Scryfall.catalogue("keyword-abilities"),
            Scryfall.catalogue("keyword-actions")]);

        return [].concat(keywordAbilities, keywordActions, abilityWords);
    }

    export async function getIdentifierFromUrl(url: string | URL): Promise<Identifier>
    {
        if (typeof url === "string") url = URL.parse(url);

        if (url.host == "scryfall.com")
        {
            const path = url.pathname.trimChar("/").split("/");
            const set = path[1].toString();
            const no = path[2];
            return { set, no };
        }
        else if (url.host == "cards.scryfall.io")
        {
            const path = url.pathname.trimChar("/").split("/");
            const id = path.last().splitFirst(".")[0].toString();
            return { id };
        }
        else if (url.host == "edhrec.com")
        {
            const path = url.pathname.trimChar("/").split("/");
            const name = path.last().splitFirst("?")[0].toString();
            return { name };
        }

        // make params key case insensitive
        const oldParams = [...url.searchParams];
        for (const [name, value] of oldParams)
        {
            url.searchParams.delete(name, value);
            url.searchParams.append(name.toLowerCase(), value);
        }

        const name = url.searchParams.get("card");
        if (name) return { name };
        const set = url.searchParams.get("set");
        const no = url.searchParams.get("collector_number") ?? url.searchParams.get("collector-number");
        if (set && no) return { set, no };
        const scryfallID = url.searchParams.get("scryfall_id") ?? url.searchParams.get("scryfall-id");
        if (scryfallID) return { id: scryfallID };
        const oracleID = url.searchParams.get("oracle_id") ?? url.searchParams.get("oracle-id");
        if (oracleID) return { id: oracleID };
        const id = url.searchParams.get("id");
        if (id) return { id };
        throw new DataError("Unknown Card in url", { url });
    }

    export function search(query: string): AsyncIterablePromise<Card>
    {
        return new AsyncIterablePromise(doSearch(query));
    }

    async function* doSearch(query: string)
    {
        for await (const scryfallCard of Scryfall.search(query))
            yield buildCard(scryfallCard);
    }

    export async function getCard(identifier: Identifier): Promise<Card>
    {
        return (await getCards([identifier]))[0];
    }

    export function getCards(identifiers: Identifier[]): AsyncIterablePromise<Card>
    {
        return new AsyncIterablePromise(doGetCards(identifiers));
    }

    async function* doGetCards(identifiers: Identifier[])
    {
        const scryfallIdentifiers = identifiers.map(i =>
        {
            if ("no" in i) return { set: i.set, collector_number: i.no };
            if ("name" in i) return { name: i.name };
            if ("id" in i) return { id: i.id };
            throw new DataError("Unknown Identifier", { identifier: i });
        });

        for await (const scryfallCard of Scryfall.getCollection(scryfallIdentifiers))
        {
            if (!scryfallCard) throw new DataError("Identifier not found!");
            yield buildCard(scryfallCard);
        }
    }

    function buildCard(scryfallCard: Scryfall.Card): Card
    {
        let card: Card;
        card = {
            name: scryfallCard.name,
            id: scryfallCard.id,
            set: scryfallCard.set,
            no: scryfallCard.collector_number,

            img: getImageURI(scryfallCard.image_uris),
            manaCost: scryfallCard.mana_cost,
            manaValue: scryfallCard.cmc,
            typeLine: scryfallCard.type_line,
            type: null,
            keywords: scryfallCard.keywords,
            text: scryfallCard.oracle_text,
            layout: scryfallCard.layout,
            isTransform: TransformLayouts.includes(scryfallCard.layout),
            isFlip: FlipLayouts.includes(scryfallCard.layout),
            isSplit: SplitLayouts.includes(scryfallCard.layout),

            links: {
                Scryfall: scryfallCard.scryfall_uri,
            },
            legalities: {},
            price: scryfallCard.prices.eur ? parseFloat(scryfallCard.prices.eur) : 0,
            producedMana: scryfallCard.produced_mana,
            colorIdentity: scryfallCard.color_identity,
            //@ts-ignore
            faces: [],
        };

        if (scryfallCard.card_faces && scryfallCard.card_faces.length > 0)
        {
            for (const cardFace of scryfallCard.card_faces)
            {
                card.faces.push({
                    name: cardFace.name,
                    img: getImageURI(cardFace.image_uris),
                    manaCost: cardFace.mana_cost,
                    manaValue: cardFace.cmc,
                    text: cardFace.oracle_text,
                    typeLine: cardFace.type_line,
                    type: parseType(cardFace.type_line),
                    loyalty: cardFace.loyalty,
                    power: cardFace.power,
                    toughness: cardFace.toughness,
                });
            }
        }

        if (card.img == null) card.img = card.faces[0].img;
        if (card.manaCost == null) card.manaCost = card.faces[0].manaCost;
        if (card.text == null) card.text = card.faces[0].text;
        if (card.typeLine == null) card.typeLine = card.faces[0].typeLine + " // " + card.faces[1].typeLine;

        card.type = parseType(card.typeLine);
        if (scryfallCard.related_uris?.edhrec)
            card.links.EDHREC = scryfallCard.related_uris?.edhrec;
        if (scryfallCard.legalities)
            for (const entry of Object.entries(scryfallCard.legalities))
            {
                const mode = entry[0];
                let legality = entry[1] as string;
                if (legality == "not_legal") legality = "non-legal";
                card.legalities[mode] = legality as Legality;
            }

        return card;
    }

    let allSuperTypes: string[];
    function parseType(line: string): Type
    {
        const ret = {} as Type;
        if (line.contains("//")) line = line.splitFirst("//")[0].trim();

        const [main, sub] = line.splitFirst("—");
        const mainTypes = main.trim().split(/\s+/);
        const subTypes = sub?.trim()?.split(/\s+/) ?? [];

        const superTypes: string[] = [];
        const cardTypes: string[] = [];

        for (const mainType of mainTypes)
        {
            if (allSuperTypes.includes(mainType))
                superTypes.push(mainType);
            else
                cardTypes.push(mainType);
        }

        ret.super = superTypes;
        ret.card = cardTypes;
        ret.sub = subTypes;
        return ret;
    }

    function getImageURI(imageURIs: Scryfall.ImageURIs): string
    {
        return imageURIs?.png ?? imageURIs?.large ?? imageURIs?.normal ?? imageURIs?.small;
    }

    export type Symbol = {
        code: string;
        description: string;
        icon: string;
    };

    export type Identifier = NameIdentifier | IDIdentifier | SetIdentifier;
    export type NameIdentifier = { name: string; };
    export type IDIdentifier = { id: string; };
    export type SetIdentifier = { set: string; no: string; };

    export function isIdentifierOnly(identifier: Identifier | Card): identifier is Identifier
    {
        if ("name" in identifier && Object.entries(identifier).length == 1) return true;
        if ("id" in identifier && Object.entries(identifier).length == 1) return true;
        if ("set" in identifier && "no" in identifier && Object.entries(identifier).length == 2) return true;
        return false;
    }

    export type Card = {
        name: string;
        id: string;
        set: string;
        no: string;

        img: string;
        manaCost: string;
        manaValue: number;
        typeLine: string;
        type: Type;
        text: string;

        layout: string;
        faces: [CardFace, CardFace?];

        isTransform: boolean;
        isFlip: boolean;
        isSplit: boolean;

        keywords: string[];
        legalities: { [mode: string]: Legality; };
        price: number;
        producedMana?: ProducedMana;
        colorIdentity: Colors[];
        links: {
            [title: string]: string;
            Scryfall: string;
            EDHREC?: string;
        };
    };

    export const TransformLayouts = ["transform", "modal", "modal_dfc", "reversible_card"];
    export const FlipLayouts = ["flip"];
    export const SplitLayouts = ["split"];

    export type CardFace = {
        name: string;
        img: string;
        manaCost: string;
        manaValue: number;
        typeLine: string;
        type: Type;
        text: string;
        power?: string;
        toughness?: string;
        loyalty?: string;
    };

    export type ProducedMana = Colors[];
    export type Colors = "B" | "G" | "R" | "U" | "W" | "C";

    export type Backside = {
        img?: string;
        type: Type;
        text: string;
    };

    export type Legality = "legal" | "restricted" | "non-legal" | "banned";

    export type Typology = { [category: string]: string[]; };

    export type Type = {
        super: string[];
        card: string[];
        sub: string[];
    };

    export type Set = {
        code: string;
        name: string;
        icon: string;
        released?: Date;
        parent?: Set;
        subSets?: Set[];
    };
}