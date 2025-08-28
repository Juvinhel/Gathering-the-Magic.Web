namespace Views.Dialogs
{
    export class DeckStatistics
    {
        constructor (attr: { deck: Data.Deck, simple?: boolean; })
        {
            this.deck = attr.deck;
            this.simple = attr.simple ?? true;
            this.entries = Data.getEntries(this.deck.sections.first(s => s.title == "main"));
        }

        private deck: Data.Deck;
        private entries: Data.Entry[];
        private simple: boolean;

        public render(): Node
        {
            return this.root = <div class="deck-statistics">
                { this.chartsContainer = <div class="charts-container">
                    { this.charts() }
                </div> as HTMLElement }
                <div class="actions">
                    { this.simpleSwap = <a class={ ["link-button", "simple-swap"] } onclick={ this.swapSimple.bind(this) } title={ this.simple ? "Complex" : "Simple" }><color-icon src="img/icons/swap.svg" /><span>{ this.simple ? "Complex" : "Simple" }</span></a> as HTMLElement }
                </div>
            </div> as HTMLElement;
        }

        private root: HTMLElement;
        private chartsContainer: HTMLElement;
        private simpleSwap: HTMLElement;

        private * charts()
        {
            yield this.cardTypesChart();
            yield this.manaProductionChart();
            yield this.manaConsumptionChart();
        }

        private cardTypesChart()
        {
            let typeGroups: { title: string, count: number; }[];
            if (this.simple)
            {
                typeGroups = [
                    { title: "Land", count: 0 },
                    { title: "Creature", count: 0 },
                    { title: "Artifact & Enchantment", count: 0 },
                    { title: "Spell", count: 0 },
                ];

                for (const entry of this.entries)
                {
                    if (entry.type.card.includes("Land"))
                        typeGroups.first(x => x.title == "Land").count += entry.quantity;
                    else if (entry.type.card.includes("Creature"))
                        typeGroups.first(x => x.title == "Creature").count += entry.quantity;
                    else if (entry.type.card.includes("Enchantment") || entry.type.card.includes("Artifact"))
                        typeGroups.first(x => x.title == "Artifact & Enchantment").count += entry.quantity;
                    else
                        typeGroups.first(x => x.title == "Spell").count += entry.quantity;
                }
            }
            else
            {
                const cardTypes = App.types["Card"];
                typeGroups = [];
                for (const cardType of cardTypes)
                {
                    const count = this.entries.filter(x => x.type.card.includes(cardType)).sum(i => i.quantity);
                    if (count > 0) typeGroups.push({ title: cardType, count });
                }
            }

            const cardTypes = {
                labels: typeGroups.map(g => g.title),
                datasets: [{
                    label: "Cards",
                    data: typeGroups.map(g => g.count),
                    backgroundColor: typeGroups.map(x => this.colors[x.title]),
                    hoverOffset: 4
                }]
            };

            return <canvas class="card-types" oninserted={ (event: Event) =>
            {
                const target = event.currentTarget as HTMLElement;
                setTimeout(() =>
                {
                    //@ts-ignore
                    new Chart(target, {
                        type: "pie",
                        data: cardTypes,
                        options: {
                            plugins: {
                                title: {
                                    font: {
                                        size: 16,
                                        bold: true
                                    },
                                    display: true,
                                    text: "Card Types"
                                }
                            }
                        }
                    });
                }, 0);
            } } />;
        }

        private manaProductionChart()
        {
            let typeGroups: { title: string, count: number; }[] = [];
            let b = 0;
            let g = 0;
            let r = 0;
            let u = 0;
            let w = 0;
            let c = 0;

            for (const entry of this.entries)
                if (entry.producedMana && entry.producedMana.length > 0)
                {
                    const fraction = 1 / entry.producedMana.length;
                    if (entry.producedMana.includes("B")) b += fraction;
                    if (entry.producedMana.includes("G")) g += fraction;
                    if (entry.producedMana.includes("R")) r += fraction;
                    if (entry.producedMana.includes("U")) u += fraction;
                    if (entry.producedMana.includes("W")) w += fraction;
                    if (entry.producedMana.includes("C")) c += fraction;
                }

            if (b > 0) typeGroups.push({ title: "Black", count: b });
            if (g > 0) typeGroups.push({ title: "Green", count: g });
            if (r > 0) typeGroups.push({ title: "Red", count: r });
            if (u > 0) typeGroups.push({ title: "Blue", count: u });
            if (w > 0) typeGroups.push({ title: "White", count: w });
            if (c > 0 && !this.simple) typeGroups.push({ title: "Colorless", count: c });

            const manaLands = {
                labels: typeGroups.map(g => g.title),
                datasets: [{
                    label: "Mana",
                    data: typeGroups.map(g => g.count),
                    backgroundColor: typeGroups.map(x => this.colors[x.title]),
                    hoverOffset: 4
                }]
            };
            return <canvas class="mana-production" oninserted={ (event: Event) =>
            {
                const target = event.currentTarget as HTMLElement;
                setTimeout(() =>
                {
                    //@ts-ignore
                    new Chart(target, {
                        type: "pie",
                        data: manaLands,
                        options: {
                            plugins: {
                                title: {
                                    font: {
                                        size: 16,
                                        bold: true
                                    },
                                    display: true,
                                    text: "Mana Production"
                                }
                            }
                        }
                    });
                }, 0);
            } } />;
        }

        private manaConsumptionChart()
        {
            let typeGroups: { title: string, count: number; }[] = [];
            let b = 0;
            let g = 0;
            let r = 0;
            let u = 0;
            let w = 0;

            for (const entry of this.entries)
                if (entry.manaCost)
                {
                    const manaCost = [...entry.manaCost.replace("//", " ").replaceAll(/\s+/, "").matchAll(/(\{.*?\})/g)].map(m => m[0].substring(1, m[0].length - 1));

                    for (const m of manaCost)
                    {
                        if (m == "B") b += 1;
                        if (m == "G") g += 1;
                        if (m == "R") r += 1;
                        if (m == "U") u += 1;
                        if (m == "W") w += 1;
                        if (m.contains("/"))
                        {
                            for (const mm of m.split("/"))
                            {
                                if (mm == "B") b += 0.5;
                                if (mm == "G") g += 0.5;
                                if (mm == "R") r += 0.5;
                                if (mm == "U") u += 0.5;
                                if (mm == "W") w += 0.5;
                            }
                        }
                    }
                }

            if (b > 0) typeGroups.push({ title: "Black", count: b });
            if (g > 0) typeGroups.push({ title: "Green", count: g });
            if (r > 0) typeGroups.push({ title: "Red", count: r });
            if (u > 0) typeGroups.push({ title: "Blue", count: u });
            if (w > 0) typeGroups.push({ title: "White", count: w });

            const manaLands = {
                labels: typeGroups.map(g => g.title),
                datasets: [{
                    label: "Mana",
                    data: typeGroups.map(g => g.count),
                    backgroundColor: typeGroups.map(x => this.colors[x.title]),
                    hoverOffset: 4
                }]
            };
            return <canvas class="mana-consumption" oninserted={ (event: Event) =>
            {
                const target = event.currentTarget as HTMLElement;
                setTimeout(() =>
                {
                    //@ts-ignore
                    new Chart(target, {
                        type: "pie",
                        data: manaLands,
                        options: {
                            plugins: {
                                title: {
                                    font: {
                                        size: 16,
                                        bold: true
                                    },
                                    display: true,
                                    text: "Mana Consumption"
                                }
                            }
                        }
                    });
                }, 0);
            } } />;
        }

        private swapSimple(event: Event)
        {
            this.chartsContainer.clearChildren();

            this.simple = !this.simple;
            this.simpleSwap.title = this.simple ? "Complex" : "Simple";
            this.simpleSwap.querySelector("span").textContent = this.simple ? "Complex" : "Simple";

            this.chartsContainer.append(...this.charts());
        }

        private colors = {
            "Artifact": "hsla(0, 0%, 69%, 1.00)",
            "Artifact & Enchantment": "hsla(0, 0%, 69%, 1.00)",
            "Enchantment Artifact": "hsla(0, 0%, 69%, 1.00)",
            "Battle": "hsla(310, 100%, 69%, 1.00)",
            "Creature": "hsla(0, 100%, 69%, 1.00)",
            "Artifact Creature": "hsla(0, 100%, 69%, 1.00)",
            "Enchantment Creature": "hsla(0, 100%, 69%, 1.00)",
            "Planeswalker": "hsla(22, 100%, 69%, 1.00)",
            "Enchantment": "hsla(54, 100%, 69%, 1.00)",
            "Instant": "hsla(93, 100%, 69%, 1.00)",
            "Sorcery": "hsla(156, 100%, 69%, 1.00)",
            "Spell": "hsla(156, 100%, 69%, 1.00)",
            "Land": "hsla(273, 100%, 69%, 1.00)",

            "Black": "hsla(273, 100%, 69%, 1.00)",
            "Green": "hsla(93, 100%, 69%, 1.00)",
            "Red": "hsla(0, 100%, 69%, 1.00)",
            "Blue": "hsla(239, 100%, 69%, 1.00)",
            "White": "hsla(54, 100%, 69%, 1.00)",
            "Colorless": "hsla(0, 0%, 69%, 1.00)",
        };
    }
}