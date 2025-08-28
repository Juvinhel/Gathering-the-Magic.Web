declare const CSV: CSV;

declare interface CSV
{
    fetch(options: FetchOptions): Promise<Dataset>;
}

declare interface FetchOptions
{
    data?: string;
    url?: string;
    file?: File;
}

declare interface Dataset
{
    records: DatasetRow[];
    // list of fields
    fields: string[];
    metadata: any;
}

declare type DatasetRow = string[];