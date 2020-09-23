import { FieldId, TableId } from "./table";

export interface CollaboratorData {
	id: string
	email: string
	name: string
}

export interface AttachmentDetails {
	url: string
	width?: number
	height?: number
}

export interface Attachment {
	id: string
	url: string
	fileName: string
	size: number
	type: string
	thumbnails: {
		small: AttachmentDetails
		large: AttachmentDetails
	}
}

export interface BarCode {
	text: string
	type: 'upce' | 'code39'
}

export interface SelectField {
	id?: string
	name?: string
	color?: string
}

export type CustomField = 
	string
	| SelectField
	| SelectField[]
	| number
	| boolean
	| CollaboratorData
	| Attachment

export type RecordId = string

export interface RecordFields {
	[ index: string ]: CustomField
}

export interface LockedRecordFields {
	readonly [ index: string ]: CustomField
}

export interface Record<T extends RecordFields> {
	id: RecordId
	name: string
	fields: T
	tableId?: TableId
}

export interface QuerySorts {
	field: string
	direction?: 'asc' | 'desc'
}

export interface AirtableRecord {
	readonly id: RecordId
	readonly name: string
	readonly isDeleted: boolean
	getCellValue(fieldNameOrId: FieldId | string): unknown
	getCellValueAsString(fieldNameOrId: FieldId | string): string
}