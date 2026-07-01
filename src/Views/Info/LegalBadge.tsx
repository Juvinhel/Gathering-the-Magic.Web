namespace Views.Info
{
    export function LegalBadge(mode: string, legality: API.Legality)
    {
        return <span class={ ["legal-badge", legality] }>{ mode }</span>;
    }
}