import {
    AirtableRecord,
    LockedRecordFields,
    QuerySorts,
    RecordId
} from "./record"

export enum FieldTypes {
    SINGLE_LINE_TEXT = "singleLineText",
    EMAIL = "email",
    URL = "url",
    MULTILINE_TEXT = "multilineText",
    NUMBER = "number",
    PERCENT = "percent",
    CURRENCY = "currency",
    SINGLE_SELECT = "singleSelect",
    MULTIPLE_SELECTS = "multipleSelects",
    SINGLE_COLLABORATOR = "singleCollaborator",
    MULTIPLE_COLLABORATORS = "multipleCollaborators",
    MULTIPLE_RECORD_LINKS = "multipleRecordLinks",
    DATE = "date",
    DATE_TIME = "dateTime",
    PHONE_NUMBER = "phoneNumber",
    MULTIPLE_ATTACHMENTS = "multipleAttachments",
    CHECKBOX = "checkbox",
    FORMULA = "formula",
    CREATED_TIME = "createdTime",
    ROLLUP = "rollup",
    COUNT = "count",
    MULTIPLE_LOOKUP_VALUES = "multipleLookupValues",
    AUTO_NUMBER = "autoNumber",
    BARCODE = "barcode",
    RATING = "rating",
    RICH_TEXT = "richText",
    DURATION = "duration",
    LAST_MODIFIED_TIME = "lastModifiedTime",
    CREATED_BY = "createdBy",
    LAST_MODIFIED_BY = "lastModifiedBy",
    BUTTON = "button"
}

export type FieldType = keyof FieldTypes

type ViewType = 'grid'
	| 'form'
	| 'calendar'
	| 'gallery'
	| 'kanban'

export type FieldId = string

export interface Field {
	id: FieldId
	name: string
	type: FieldType
}

export type ViewId = string

export interface View {
	id: ViewId
	name: string
	type: ViewType
	personalForUserId?: string
}

export interface RecordSelectOptions {
    sorts?: QuerySorts[],
    fields?: (FieldId | string)[],
    recordColorMode?: 'none' | 'bySelectField' | 'byView'
} 

export type TableId = string

export interface Table {
	readonly id: TableId
    readonly name: string
    readonly description: string
    readonly url: string
	readonly primaryFieldId: FieldId
    readonly fields: Field[]
    readonly views: View[]
    getField(fieldIdOrName: FieldId | string): Field
    getView(viewIdOrName: ViewId | string): View
    selectRecordsAsync(options?: RecordSelectOptions): Promise<QueryResult>
    createRecordsAsync(fields: LockedRecordFields[]): Promise<RecordId[]>
    updateRecordsAsync(records: { id: RecordId, fields: LockedRecordFields }[]): Promise<void>
    deleteRecordsAsync(recordIds: RecordId[]): Promise<void>
}

export interface QueryResult {
    recordIds: RecordId[]
    records: AirtableRecord[]
    getRecord(recordId: RecordId): AirtableRecord
}