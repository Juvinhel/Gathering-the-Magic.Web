namespace Data.Scryfall
{
    export type Identifier = NameIdentifier | IDIdentifier | SetIdentifier;
    export type NameIdentifier = { name: string; };
    export type IDIdentifier = { id: string; };
    export type SetIdentifier = { collector_number: string; set: string; };

    export type Card = CoreCard & GameplayCard & PrintCard;

    export type Prices = {
        "usd": string | null,
        "usd_foil": string | null,
        "usd_etched": string | null,
        "eur": string | null,
        "eur_foil": string | null,
        "tix": string | null,
    };

    export function isSingleFacedCard(card: Card): boolean
    {
        return !("card_faces" in card);
    }

    export function isMultiFacedCard(card: Card): boolean
    {
        return "card_faces" in card;
    }

    export type ImageURIs = {
        small: string,
        normal: string,
        large: string,
        png: string,
        art_crop: string,
        border_crop: string,
    };

    export type Symbol = {
        symbol: string;
        svg_uri: string,
        english: string,
    };

    export type CatalogueName = "supertypes" | "card-types" | "artifact-types" | "battle-types" | "creature-types" | "enchantment-types" | "land-types" | "planeswalker-types" | "spell-types" |
        "keyword-abilities" | "keyword-actions" | "ability-words";

    export type Legality = "legal" | "restricted" | "not_legal" | "banned";

    // NEW
    export type UUID = `${string}-${string}-${string}-${string}-${string}`;
    export type LanguageCode = StringN<2> | StringN<3>;
    export const KnownLanguageCodes = ["en", "es", "fr", "de", "it", "pt", "ja", "ko", "ru", "zhs", "zht", "he", "la", "grc", "ar", "sa", "ph", "qya"];
    export type Integer = number;
    export const CardLayouts = ["normal", "split", "flip", "transform", "modal_dfc", "meld", "leveler", "class", "case", "saga", "adventure", "mutate", "prototype", "battle",
        "planar", "scheme", "vanguard", "token", "double_faced_token", "emblem", "augment", "host", "art_series", "reversible_card"] as const;
    export type CardLayout = typeof CardLayouts[number];
    export type URI = string;
    export const Colors = ["W", "U", "B", "R", "G", "C"] as const;
    export type Color = typeof Colors[number];

    export type CoreCard = {
        object: "card";
        arena_id?: Integer;
        id: UUID;
        lang: LanguageCode;
        mtgo_id?: Integer;
        mtgo_foil_id?: Integer;
        multiverse_ids?: Integer[];
        tcgplayer_id?: Integer;
        tcgplayer_etched_id?: Integer;
        cardmarket_id?: Integer;
        layout: CardLayout;
        oracle_id?: UUID;
        prints_search_uri: URI,
        rulings_uri: URI;
        scryfall_uri: URI;
        uri: URI;
    };

    export type GameplayCard = {
        all_parts?: CardParts[];
        card_faces?: CardFace[];
        cmc: number;
        color_identity: Color[];
        color_indicator?: Color[];
        colors?: Color[];
        defense?: string;
        edhrec_rank?: Integer;
        game_changer?: boolean;
        hand_modifier?: string;
        keywords: string[];
        legalities: { [mode: string]: Legality; };
        life_modifier?: string;
        loyalty?: string;
        mana_cost?: string;
        name: string;
        oracle_text?: string;
        penny_rank?: Integer;
        power?: string;
        produced_mana?: Color[];
        reserved: boolean;
        toughness?: string;
        type_line: string;
    };

    export const CardPartComponents = ["token", "meld_part", "meld_result", "combo_piece"] as const;
    export type CardPartComponent = typeof CardPartComponents[number];
    export type CardParts = {
        id: UUID;
        object: "related_card";
        component: CardPartComponent;
        name: string;
        type_line: string;
        uri: URI;
    };

    export type CardFace = {
        artist?: string;
        artist_ids?: string[];
        cmc?: number;
        color_indicator?: Color[];
        colors?: Color[];
        defense?: string;
        flavor_text?: string;
        illustration_id?: UUID;
        image_uris?: ImageURIs;
        layout?: CardLayout;
        loyalty?: string;
        mana_cost: string;
        name: string;
        object: "card_face";
        oracle_id?: UUID;
        oracle_text?: string;
        power?: string;
        printed_name?: string;
        printed_text?: string;
        printed_type_line?: string;
        toughness?: string;
        type_line?: string;
        watermark?: string;
    };

    export const BorderColors = ["black", "white", "borderless", "yellow", "silver", "gold"] as const;
    export type BorderColor = typeof BorderColors[number];
    export const Finishes = ["foil", "nonfoil", "etched"] as const;
    export type Finish = typeof Finishes[number];
    export const FrameEffects = ["legendary", "miracle", "enchantment", "draft", "devoid", "tombstone", "colorshifted", "inverted", "sunmoondfc", "compasslanddfc", "originpwdfc", "mooneldrazidfc",
        "waxingandwaningmoondfc", "showcase", "extendedart", "companion", "etched", "snow", "lesson", "shatteredglass", "convertdfc", "fandfc", "upsidedowndfc", "spree"] as const;
    export type FrameEffect = typeof FrameEffects[number];
    export const Frames = ["1993", "1997", "2003", "2015", "future"] as const;
    export type Frame = typeof Frames[number];
    export const Games = ["paper", "arena", "mtgo"] as const;
    export type Game = typeof Games[number];
    export const ImageStatuses = ["missing", "placeholder", "lowres", "highres_scan"] as const;
    export type ImageStatus = typeof ImageStatuses[number];
    export const Rarities = ["common", "uncommon", "rare", "special", "mythic", "bonus"] as const;
    export type Rarity = typeof Rarities[number];
    export type DateString = string;
    export const SecurityStamps = ["oval", "triangle", "acorn", "circle", "arena", "heart"] as const;
    export type SecurityStamp = typeof SecurityStamps[number];

    export type PrintCard = {
        artist?: string;
        artist_ids?: string[];
        attraction_lights?: string[];
        booster: boolean;
        border_color: BorderColor;
        card_back_id: UUID;
        collector_number: string;
        content_warning?: boolean;
        digital: boolean;
        finishes: Finish[];
        flavor_name?: string;
        flavor_text?: string;
        frame_effects?: FrameEffect[];
        frame: Frame;
        full_art: boolean;
        games: Game[];
        highres_image: boolean;
        illustration_id?: UUID;
        image_status: ImageStatus;
        image_uris?: ImageURIs;
        oversized: boolean;
        prices: Prices;
        printed_name?: string;
        printed_text?: string;
        printed_type_line?: string;
        promo: boolean;
        promo_types?: string[];
        purchase_uris?: { [site: string]: URI; };
        rarity: Rarity;
        related_uris: RelatedURIs;
        released_at: DateString;
        reprint: boolean;
        scryfall_set_uri: URI;
        set_name: string;
        set_search_uri: URI;
        set_type: string;
        set_uri: URI;
        set: string;
        set_id: UUID;
        story_spotlight: boolean;
        textless: boolean;
        variation: boolean;
        variation_of?: UUID;
        security_stamp?: SecurityStamp;
        watermark?: string;
        preview?: Preview;
    };

    export type RelatedURIs = {
        [site: string]: URI;
        edhrec?: URI;
    };

    export type Preview = {
        previewed_at?: DateString;
        source_uri?: URI;
        source?: string;
    };

    export const SetTypes = ["core", "expansion", "masters", "alchemy", "masterpiece", "arsenal", "from_the_vault", "spellbook", "premium_deck", "duel_deck", "draft_innovation", "treasure_chest",
        "commander", "planechase", "archenemy", "vanguard", "funny", "starter", "box", "promo", "token", "memorabilia", "minigame"] as const;
    export type SetType = typeof SetTypes[number];

    export type Set = {
        id: UUID;
        code: string;
        parent_set_code?: string;

        name: string;
        released_at?: DateString;
        block_code?: string;
        block?: string;
        scryfall_uri: URI;
        set_type: SetType;
        card_count: Integer;
        digital: boolean;
        nonfoil_only: boolean;
        foil_only: boolean;
        icon_svg_uri: URI;
    };

    export type ScryfallError = {
        object: "error";
        status: Integer;
        code: string;
        details: string;
        type?: string;
        warnings?: string[];
    };

    export function isScryfallError(data: any): data is ScryfallError
    {
        return "object" in data && data.object == "error";
    }
}