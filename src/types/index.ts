export interface Mapping {
	tableId: string
	fieldId?: string
	fieldName?: string
	fieldType?: string
	refName?: string
}

export type Mappings = {
	[index: string]: Mapping[]
}[]

