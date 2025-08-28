namespace Views
{
    export function parseSymbolText(text: string)
    {
        if (!text) return "";

        return text.replaceAll(/\{.*?\}/, (value) =>
        {
            const code = value.substring(1, value.length - 1).trim().toUpperCase();
            const symbol = App.symbols.first(x => x.code == code);

            return `<i class="symbol" style="background-image: url('${symbol.icon}')">${value}</i>`;
        });
    }
}