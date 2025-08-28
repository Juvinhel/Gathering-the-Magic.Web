namespace Views.Library.Search
{
    export const NumericStatOperators = ["=", ">", ">=", "<", "<=", "!="] as const;
    export type NumericStatOperator = typeof NumericStatOperators[number];

    export class NumericStatElement extends HTMLElement
    {
        constructor ()
        {
            super();

            this.append(...this.build());
        }

        private build()
        {
            return [
                <button class="operator" onclick={ this.operatorClick.bind(this) }>=</button>,
                <input class="value" type="number" min="0" step="1" onkeyup={ this.enterSearch.bind(this) } />
            ];
        }

        public get operator(): NumericStatOperator
        {
            return this.querySelector(".operator").textContent as NumericStatOperator;
        }

        public get value(): number | null
        {
            const valueInput = this.querySelector(".value") as HTMLInputElement;
            if (!valueInput.value) return null;
            return parseInt(valueInput.value);
        }

        private operatorClick(event: Event)
        {
            const operatorButton = event.currentTarget as HTMLButtonElement;
            let index = NumericStatOperators.indexOf(operatorButton.textContent as NumericStatOperator);
            ++index;
            if (index >= NumericStatOperators.length) index = 0;
            operatorButton.textContent = NumericStatOperators[index];
        }

        private enterSearch(event: KeyboardEvent)
        {
            if (event.code == "Enter") 
            {
                const search = this.closest("my-search") as SearchElement;
                search.beginSearch();
            }
        }
    }

    customElements.define("my-numeric-stat", NumericStatElement);
}