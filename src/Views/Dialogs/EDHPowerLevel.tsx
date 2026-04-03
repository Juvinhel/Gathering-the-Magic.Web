namespace Views.Dialogs
{
    export function EDHPowerLevel(args: { deck: Data.Deck; })
    {
        return <iframe class="edhpowerlevel-dialog" oninserted={ async (event: Event) =>
        {
            const file = await Data.File.saveDeck(args.deck, "TXT");
            const url = "https://edhpowerlevel.com?d=" + encodeForEDHPowerLevel(file.text);

            const iframe = event.target as HTMLIFrameElement;
            iframe.src = url;
        } } />;
    }

    function encodeForEDHPowerLevel(text: string): string
    {
        const lines: string[] = [];
        for (const line of text.splitLines())
        {
            lines.push(
                line.split("(")[0].replace(/ *\[[^)]*\] */g, " ").replace(/ *<[^)]*> */g, " ").trim());
        }
        let ret = lines.join("~");
        ret = encodeURIComponent(ret).replace(/%20/g, "+") + "~Z~";
        return ret;
    }

    function EDHPowerLevelEncode(d) { var arr = d.split(/[\r\n~]/); arr.forEach((c, i) => { c = c.split("(")[0]; c = c.replace(/ *\[[^)]*\] */g, " "); c = c.replace(/ *<[^)]*> */g, " "); c = c.trim(); arr[i] = c; }); var nd = arr.join("~"); d = encodeURIComponent(nd).replace(/%20/g, "+") + "~Z~"; return d; }
}