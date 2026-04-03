namespace Views
{
    export function parseSymbolText(text: string)
    {
        if (!text) return "";

        return text.replaceAll(/(\{.*?\})|(\[.*?\])/, (value) =>
        {
            const type = value[0] == "{" ? "symbol" : "card";
            const code = value.substring(1, value.length - 1).trim();

            if (type == "symbol")
            {
                const symbol = App.symbols.first(x => x.code.equals(code, false));

                return `<i class="symbol" style="background-image: url('${symbol.icon}')">${value}</i>`;
            }
            else
            {
                return `<a href="#" onclick="this.closest('my-editor').querySelector('my-card-info').findCard({ name: '${code}' })">${code}</a>`;
            }
        });
    }
}