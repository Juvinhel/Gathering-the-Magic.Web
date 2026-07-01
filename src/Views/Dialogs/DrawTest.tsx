namespace Views.Dialogs
{
    export function DrawTest(args: { deck: API.Deck; })
    {
        const deck = args.deck;
        const entries = API.getEntries(deck.sections.first(s => s.title == "main"));

        const cards: API.Card[] = [];
        for (const entry of entries)
        {
            if (deck.commanders && deck.commanders.includes(entry.name)) continue;
            for (let i = 0; i < entry.quantity; ++i)
            {
                const card = Object.clone(entry);
                delete card.quantity;
                cards.push(card);
            }
        }

        const length = 7;
        const drawnCards = draw(cards, length, true);

        return <div class="draw-test" cards={ cards }>
            <div class="list">{ drawnCards.map(c => cardTile(c)) }</div>
            <div class="actions">
                <label>Only 3-5 lands start hands</label>
                <input class="minimum-lands-enabled" type="checkbox" checked />
                <a class="link-button" onclick={ redraw } title="Redraw"><color-icon src="img/icons/7.svg" /><span>Redraw</span></a>
                <a class="link-button" onclick={ mulligan } title="Mulligan"><color-icon src="img/icons/m.svg" /><span>Mulligan</span></a>
                <a class="link-button" onclick={ drawOne } title="Draw one"><color-icon src="img/icons/1.svg" /><span>Draw one</span></a>
            </div>
        </div>;
    }

    function cardTile(card: API.Card)
    {
        return <div class={ ["card-tile", "card"] } card={ card } onclick={ () => showImageDialog(card.img) }>
            <img src="img/card-back.png" lazy-image={ card.img } />
        </div>;
    }

    async function showImageDialog(img: string)
    {
        await UI.Dialog.lightBox({ pages: [{ content: img }] });
    }

    function redraw(event: Event)
    {
        const target = event.currentTarget as HTMLElement;
        const drawTest = target.closest(".draw-test") as HTMLDivElement;
        const list = drawTest.querySelector(".list") as HTMLElement;
        const minimumLands = (drawTest.querySelector(".minimum-lands-enabled") as HTMLInputElement).checked;

        list.clearChildren();

        const length = 7;
        const cards = drawTest["cards"] as API.Card[];

        try
        {
            const drawnCards = draw(cards, length, minimumLands);
            list.append(...drawnCards.map(c => cardTile(c)));
        }
        catch (error)
        {
            UI.Dialog.error(error);
        }
    }

    function mulligan(event: Event)
    {
        const target = event.currentTarget as HTMLElement;
        const drawTest = target.closest(".draw-test") as HTMLDivElement;
        const list = drawTest.querySelector(".list") as HTMLElement;
        const minimumLands = (drawTest.querySelector(".minimum-lands-enabled") as HTMLInputElement).checked;
        const oldLength = list.querySelectorAll(".card").length;

        list.clearChildren();

        const length = oldLength <= 1 ? 0 : oldLength - 1;
        const cards = drawTest["cards"] as API.Card[];

        try
        {
            const drawnCards = draw(cards, length, minimumLands);
            list.append(...drawnCards.map(c => cardTile(c)));
        }
        catch (error)
        {
            UI.Dialog.error(error);
        }
    }

    function drawOne(event: Event)
    {
        const target = event.currentTarget as HTMLElement;
        const drawTest = target.closest(".draw-test") as HTMLDivElement;
        const list = drawTest.querySelector(".list") as HTMLElement;

        const length = 1;
        const cards = [...drawTest["cards"]] as API.Card[];
        // remove already drawn cards
        for (const cardTile of list.querySelectorAll(".card"))
        {
            const card = cardTile["card"] as API.Card;
            cards.remove(card);
        }

        try
        {
            const drawnCards = draw(cards, length, false);
            list.append(...drawnCards.map(c => cardTile(c)));
        }
        catch (error)
        {
            UI.Dialog.error(error);
        }
    }

    function draw(cards: API.Card[], count: number, minimumLands: boolean = true): API.Card[]
    {
        if (cards.length < count) throw new Error("Deck does not contain enough cards!");
        if (minimumLands && cards.filter(x => x.type.card.Land).length < 3) throw new Error("Deck does not contain enough land cards!");

        let draw: API.Card[];
        let landCount: number;
        do
        {
            draw = cards.shuffle().slice(0, count);
            landCount = draw.filter(x => x.type.card.Land).length;
            console.log("draw", landCount, draw);
        } while ((minimumLands && count >= 3) && (landCount < 3 || landCount > 5));

        return draw;
    }
}