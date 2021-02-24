export default class Cell {
    id: string;
    rels: Array<string>;
    data?: Record<any, any>;
    constructor(id: string, rels: Array<string>, data?: Record<any, any>);
    toConfig(): {
        id: string;
        rels: string[];
        data: Record<any, any> | undefined;
    };
}
