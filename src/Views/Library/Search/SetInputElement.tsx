namespace Views.Library.Search
{
    export class SetInputElement extends HTMLElement
    {
        constructor ()
        {
            super();

            this.append(...this.build());
        }

        private build()
        {
            return [
                <input class="value-input" type="text" placeholder="Input set" onkeyup={ this.keyup.bind(this) } onfocus={ this.focused.bind(this) } />,
                <drop-down onopen={ this.opened.bind(this) } autoAttach={ true }>
                    <ul class="set-list" onkeyup={ this.keyup.bind(this) } >{ this.setList(App.sets) }</ul>
                </drop-down>
            ];
        }

        public get values(): string[]
        {
            const input = this.querySelector(".value-input") as HTMLInputElement;
            return input.value.split(/\s+/).filter(x => x.length > 0);
        }

        private * setList(sets: Data.API.Set[], padding: number = 0)
        {
            for (const set of sets)
            {
                yield <li style={ { paddingLeft: padding + ".125em" } } title={ set.code } onclick={ this.clicked.bind(this) }>
                    <color-icon src={ set.icon } />
                    <span>{ set.code }</span>
                    <span class="sub-text">{ set.name }</span>
                    <span class="sub-text">{ this.formatDate(set.released) }</span>
                </li>;
                if (set.subSets)
                    for (const subSets of this.setList(set.subSets, padding + 1))
                        yield subSets;
            }
        }

        private formatDate(date: Date)
        {
            if (!date) return "";
            return date.getMonth().toFixed(0).padLeft("0", 2) + "." + date.getFullYear().toFixed(0).padLeft("0", 4);
        }

        private dropDown: HTMLDropDown;
        private focused(event: Event)
        {
            this.dropDown = this.querySelector("drop-down") as HTMLDropDown;
            this.dropDown.show();
        }

        private keyup(event: KeyboardEvent)
        {
            event.preventDefault();
            event.stopPropagation();

            if (event.code == "Escape")
                this.dropDown.close();

            if (event.code == "Enter")
            {
                this.dropDown.close();

                const search = this.closest("my-search") as SearchElement;
                search.beginSearch();
            }
        }

        private opened(event: Event)
        {
            this.dropDown = event.currentTarget as HTMLDropDown;
        }

        private clicked(event: Event)
        {
            //@ts-ignore
            if (event.detail == 1)
            {
                const li = event.currentTarget as HTMLLIElement;
                const valueInput = this.querySelector(".value-input") as HTMLInputElement;

                if (valueInput.value) valueInput.value += " ";
                valueInput.value += li.title;
            }
            //@ts-ignore
            else if (event.detail == 2)
                this.dblclicked(event);
        }

        private dblclicked(event: Event)
        {
            const li = event.currentTarget as HTMLLIElement;
            const valueInput = this.querySelector(".value-input") as HTMLInputElement;

            const index = valueInput.value.indexOf(li.textContent);
            if (valueInput.value[index - 1] == "!") return;
            valueInput.value = valueInput.value.substring(0, index) + "!" + valueInput.value.substring(index);
        }
    }

    customElements.define("my-set-input", SetInputElement);
}