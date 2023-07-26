export interface TableHeader {
	columnName: string;
	subColumnName?: string;
}

export interface TableData {
	data: string | JSX.Element;
	subData?: string;
	copySubData?: boolean;
}
