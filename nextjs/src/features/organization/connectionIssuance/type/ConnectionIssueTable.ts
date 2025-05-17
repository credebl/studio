import { JSX } from "react";
import { ITableHtml } from "./Connections";

export interface DataTableProps {
	header: TableHeader[];
	data: ITableData[] | ITableHtml[];
	loading: boolean;
	callback?: (clickId: string | null | undefined) => void;
	displaySelect?: boolean;
	showBtn?: boolean;
	isEmailVerification?: boolean;
}

export interface TableHeader {
	columnName: string;
	subColumnName?: string;
	width?: string;
}

export interface ITableData {
	clickId?: string | null;
	data: Data[];
}

export interface Data {
	handleChange(value: string): void;
	inputType: string;
	data: string | JSX.Element;
	subData?: string;
}