export interface TableHeader {
	columnName: string;
	subColumnName?: string;
	width?: string;
}

export interface TableData {
	clickId?: string | null;
	data: Data[];
}

interface Data {
	data: string | JSX.Element;
	subData?: string;
}
