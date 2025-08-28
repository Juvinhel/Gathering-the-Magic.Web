namespace Views.Info
{
    export function LegalBadge(mode: string, legality: Data.API.Legality)
    {
        return <span class={ ["legal-badge", legality] }>{ mode }</span>;
    }
}