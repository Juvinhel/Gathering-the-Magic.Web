namespace Data
{
    export function isBasicLand(name: string): boolean
    {
        if (name.toLowerCase() === "Plains".toLowerCase()) return true;
        if (name.toLowerCase() === "Island".toLowerCase()) return true;
        if (name.toLowerCase() === "Swamp".toLowerCase()) return true;
        if (name.toLowerCase() === "Mountain".toLowerCase()) return true;
        if (name.toLowerCase() === "Forest".toLowerCase()) return true;
        return false;
    }
}