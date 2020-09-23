import { CollaboratorData } from "./record";
import { Table, TableId } from "./table";

export type BaseId = string


export interface Base {
	readonly id: BaseId
	readonly name: string
	readonly activeCollaborators: CollaboratorData[]
	readonly tables: Table[]
	getCollaborator(idOrNameOrEmail: string): CollaboratorData
	getTable(tableIdOrName: TableId | string): Table
}