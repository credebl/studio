import type { ChangeEvent } from "react";

export interface TableHeader {
	columnName: string;
	subColumnName?: string;
	width?: string;
}

export interface TableData {
	clickId?: string | null;
	data: Data[];
}

export interface Data {
	data: string | JSX.Element;
	subData?: string;
}

export interface IDataTable {
	header: TableHeader[];
	data: TableData[];
	loading: boolean;
	onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
	refresh: () => void;
	currentPage: any;
	onPageChange: (page: number) => void;
	totalPages: number;
	searchSortByValue: (value: any) => void;
	isPagination?: boolean;
	isSearch: boolean;
	isRefresh: boolean;
	isSort: boolean;
	isHeader: boolean;
	message: string;
	discription: string;
	noExtraHeight?: boolean;
	callback?: (clickId: string | null | undefined) => void;
	displaySelect?: boolean;
	showBtn?: boolean;
	pageInfo?:
		| {
				totalItem: number | undefined;
				nextPage: number | undefined;
				lastPage: number | undefined;
		  }
		| {};
	sortOrder?:string;
}
