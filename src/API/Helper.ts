namespace API
{
    export function sortColors(colors: Colors[]): Colors[]
    {
        return colors.sort((c1, c2) =>
        {
            const i1 = colorToNumber(c1);
            const i2 = colorToNumber(c2);

            return i1 - i2;
        });
    }

    function colorToNumber(s: string): number
    {
        switch (s.toLowerCase())
        {
            case "w": return 1;
            case "u": return 2;
            case "b": return 3;
            case "r": return 4;
            case "g": return 5;
            case "c": return 6;
            default: return 1000;
        }
    }
}