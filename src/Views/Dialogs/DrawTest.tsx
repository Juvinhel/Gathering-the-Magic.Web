namespace Views.Dialogs
{
    export function DrawTest(deck: Data.Deck)
    {
        const entries = Data.getEntries(deck.sections.first(s => s.title == "main"));

        const cards: Data.API.Card[] = [];
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
        const currentCards = [...cards.shuffle()];
        const firstDraw = currentCards.splice(0, 7).shuffle();
        const drawState: DrawState = {
            cards,
            currentCards,
            lastDraw: 7
        };

        return <div class="draw-test" drawState={ drawState }>
            <div class="list">{ firstDraw.map(c => cardTile(c)) }</div>
            <div class="actions">
                <a class="link-button" onclick={ redraw } title="Redraw"><color-icon src="img/icons/7.svg" /><span>Redraw</span></a>
                <a class="link-button" onclick={ mulligan } title="Mulligan"><color-icon src="img/icons/m.svg" /><span>Mulligan</span></a>
                <a class="link-button" onclick={ drawOne } title="Draw one"><color-icon src="img/icons/1.svg" /><span>Draw one</span></a>
            </div>
        </div>;
    }

    function cardTile(card: Data.API.Card)
    {
        return <div class="card-tile" card={ card } onclick={ () => showImageDialog(card.img) }>
            <div class="image"><img src="img/card-back.png" lazy-image={ card.img } /></div>
        </div>;
    }

    async function showImageDialog(img: string)
    {
        await UI.Dialog.lightBox({ pages: [{ content: img }] });
    }

    function redraw(event: Event)
    {
        const target = event.currentTarget as HTMLElement;
        const drawTest = target.closest(".draw-test") as DrawTest;
        const list = drawTest.querySelector(".list") as HTMLElement;

        list.clearChildren();

        const drawState = drawTest.drawState;
        drawState.currentCards.length = 0;
        drawState.currentCards.push(...drawState.cards.shuffle());
        drawState.lastDraw = 7;
        const draw = drawState.currentCards.splice(0, 7);

        list.append(...draw.map(c => cardTile(c)));
    }

    function mulligan(event: Event)
    {
        const target = event.currentTarget as HTMLElement;
        const drawTest = target.closest(".draw-test") as DrawTest;
        const list = drawTest.querySelector(".list") as HTMLElement;

        const drawState = drawTest.drawState;
        if (drawState.lastDraw <= 0) return;
        list.clearChildren();

        --drawState.lastDraw;
        drawState.currentCards.length = 0;
        drawState.currentCards.push(...drawState.cards.shuffle());
        const draw = drawState.currentCards.splice(0, drawState.lastDraw);

        list.append(...draw.map(c => cardTile(c)));
    }

    function drawOne(event: Event)
    {
        const target = event.currentTarget as HTMLElement;
        const drawTest = target.closest(".draw-test") as DrawTest;
        const list = drawTest.querySelector(".list") as HTMLElement;

        const drawState = drawTest.drawState;
        const draw = drawState.currentCards.splice(0, 1);

        list.append(...draw.map(c => cardTile(c)));
    }

    interface DrawTest extends HTMLDivElement
    {
        drawState: DrawState;
    }

    type DrawState = {
        cards: Data.API.Card[];
        currentCards: Data.API.Card[];
        lastDraw: number;
    };
}