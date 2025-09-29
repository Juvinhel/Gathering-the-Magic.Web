/// <reference path="File.ts" />

namespace Data.File
{
    export const CODFile = new class CODFile implements File<Deck>
    {
        public name = "COD";
        public extensions = ["cod"];
        public mimeTypes = ["application/cod"];

        public async save(deck: Deck): Promise<string>
        {
            const xmlDoc = document.implementation.createDocument(null, "cockatrice_deck");
            const cockatrice_deck = xmlDoc.getElementsByTagName("cockatrice_deck")[0];

            const deckName = xmlDoc.createElement("deckname");
            deckName.textContent = deck.name;
            cockatrice_deck.append(deckName);

            const comments = xmlDoc.createElement("comments");
            comments.textContent = deck.description;
            cockatrice_deck.append(comments);

            if (deck.commanders && deck.commanders.length >= 1)
            {
                const bannerCard = xmlDoc.createElement("bannerCard");
                bannerCard.setAttribute("providerId", "");
                bannerCard.textContent = deck.commanders[0];
                cockatrice_deck.append(bannerCard);
            }

            for (const section of deck.sections)
            {
                const zone = xmlDoc.createElement("zone");
                zone.setAttribute("name", section.title);
                for (const entry of getEntries(section))
                {
                    const card = xmlDoc.createElement("card");
                    const name = entry.name.includes(" // ") ? entry.name.splitFirst(" // ")[0].trim() : entry.name;
                    card.setAttribute("number", entry.quantity.toFixed(0));
                    card.setAttribute("name", name);
                    zone.append(card);
                }

                cockatrice_deck.append(zone);
            }

            const serializer = new XMLSerializer();
            const text = serializer.serializeToString(xmlDoc);

            return "<?xml version=\"1.0\"?>\n" + text;
        }

        public async load(xml: string): Promise<Deck>
        {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xml, "text/xml");

            const root = xmlDoc.getElementsByTagName("cockatrice_deck")[0];

            const deckName = root.getElementsByTagName("deckname")[0]?.textContent ?? "";
            const comments = root.getElementsByTagName("comments")[0]?.textContent;
            const bannerCard = root.getElementsByTagName("bannerCard")[0]?.textContent;

            const zones = [...root.getElementsByTagName("zone")];

            const deck: Deck = {
                name: deckName,
                description: comments,
                commanders: [],
                sections: [
                    { title: "main", "items": [] },
                    { title: "side", "items": [] },
                    { title: "maybe", "items": [] }]
            };

            const mainZone = zones.first(x => x.getAttribute("name").equals("main", false));
            if (mainZone)
            {
                const mainSection = deck.sections[0];
                for (const card of mainZone.children)
                {
                    const quantity = parseInt(card.getAttribute("number") ?? "1");
                    const name = card.getAttribute("name");

                    mainSection.items.push({ quantity, name } as Entry);
                }
            }

            const sideZone = zones.first(x => x.getAttribute("name").equals("side", false));
            if (sideZone)
            {
                const sideSection = deck.sections[1];
                for (const card of sideZone.children)
                {
                    const quantity = parseInt(card.getAttribute("number") ?? "1");
                    const name = card.getAttribute("name");

                    sideSection.items.push({ quantity, name } as Entry);
                }
            }

            const maybeZone = zones.first(x => x.getAttribute("name").equals("maybe", false));
            if (maybeZone)
            {
                const maybeSection = deck.sections[1];
                for (const card of maybeZone.children)
                {
                    const quantity = parseInt(card.getAttribute("number") ?? "1");
                    const name = card.getAttribute("name");

                    maybeSection.items.push({ quantity, name } as Entry);
                }
            }

            if (bannerCard)
                deck.commanders.push(bannerCard);

            await populateEntriesFromIdentifiers(deck);

            return deck;
        }
    }();

    deckFileFormats.push(CODFile);
}