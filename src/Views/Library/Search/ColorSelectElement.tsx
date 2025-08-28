namespace Views.Library.Search
{
    export class ColorSelectElement extends HTMLElement
    {
        constructor ()
        {
            super();

            this.append(...this.build());
        }

        private build()
        {
            return [
                <div>
                    <label for="select-white"><img src={ App.symbols.first(x => x.code == "W").icon } /></label>
                    <input id="select-white" type="checkbox" value="W" onchange={ this.changeColor.bind(this) } />
                </div>,

                <div>
                    <label for="select-blue"><img src={ App.symbols.first(x => x.code == "U").icon } /></label>
                    <input id="select-blue" type="checkbox" value="U" onchange={ this.changeColor.bind(this) } />
                </div>,

                <div>
                    <label for="select-black"><img src={ App.symbols.first(x => x.code == "B").icon } /></label>
                    <input id="select-black" type="checkbox" value="B" onchange={ this.changeColor.bind(this) } />
                </div>,

                <div>
                    <label for="select-red"><img src={ App.symbols.first(x => x.code == "R").icon } /></label>
                    <input id="select-red" type="checkbox" value="R" onchange={ this.changeColor.bind(this) } />
                </div>,

                <div>
                    <label for="select-green"><img src={ App.symbols.first(x => x.code == "G").icon } /></label>
                    <input id="select-green" type="checkbox" value="G" onchange={ this.changeColor.bind(this) } />
                </div>,

                <div>
                    <label for="select-colorless"><img src={ App.symbols.first(x => x.code == "C").icon } /></label>
                    <input id="select-colorless" type="checkbox" value="C" onchange={ this.changeColorless.bind(this) } />
                </div>,
            ];
        }

        public get color(): string
        {
            let value = "";
            for (const selectInput of this.querySelectorAll("input[type=\"checkbox\"]") as NodeListOf<HTMLInputElement>)
                if (selectInput.checked)
                    value += selectInput.value;
            return value;
        }

        private changeColor(event: Event)
        {
            const colorSelectInput = event.currentTarget as HTMLInputElement;

            if (colorSelectInput.checked)
            {
                const colorlessSelect = this.querySelector("#select-colorless") as HTMLInputElement;
                colorlessSelect.checked = false;
            }
        }

        private changeColorless(event: Event)
        {
            const colorlessSelectInput = event.currentTarget as HTMLInputElement;

            if (colorlessSelectInput.checked)
                for (const selectInput of this.querySelectorAll("input[type=\"checkbox\"]") as NodeListOf<HTMLInputElement>)
                    if (selectInput != colorlessSelectInput)
                        selectInput.checked = false;
        }
    }

    customElements.define("my-color-select", ColorSelectElement);
}