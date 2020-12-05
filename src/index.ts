import { Base, BaseId } from './types/base'
import { Mapping, Mappings } from './types/index'
import {
	Record,
	CustomField,
	LockedRecordFields,
	RecordFields,
	SelectField,
	AirtableRecord,
	QuerySorts,
	RemoteRecord,
	RecordId,
	RemoteCustomField,
	RemoteRecordFields,
	LockedRemoteRecordFields,
	Attachment,
} from './types/record'
import {
	Field,
	FieldId,
	NewTable,
	QueryResult,
	RecordSelectOptions,
	Table,
	TableId,
	View,
	ViewId,
} from './types/table'
import { FetchOptions } from './types/fetch'

interface ConverterInterface {
	getFormatedDate(
		date?: string | Date,
		opts?: { military: boolean; asLocalString: boolean; asISOString: boolean }
	): string
	getFormatedTime(
		time?: string | Date,
		opts?: {
			military: boolean
			asLocalString: boolean
			asISOString: boolean
			asUTCString: boolean
		}
	): string
	getFormatedDateTime(
		dateTime?: string | Date,
		opts?: {
			asISOString?: boolean
			military?: boolean
			asLocalString?: boolean
			asUTCString: boolean
		}
	): string
	getTimestamp(timeZoneOffset: number | boolean): string
}

interface UtilsInterface {
	findDay(startDate: Date, dayNumber: number, searchDirection: boolean): Date
}

interface AirtableInterface {
	selectTable(base: Base, tableId: TableId): Table
	selectView(base: Base, tableId: TableId, viewId: ViewId): View
	selectField(base: Base, tableId: TableId, fieldId: FieldId): Field
	getMappings(tableId: TableId, mappings: Mappings, refNames?: string[]): Mapping[]
	convertRecordFieldsToIds(
		tableId: TableId,
		fields: RecordFields,
		mappings: Mappings,
		options?: {
			noNull?: boolean
			useFieldId?: boolean
		}
	): LockedRecordFields
	convertRecordFieldsToNames<T extends RecordFields>(
		tableId: string,
		records: AirtableRecord[],
		mappings: Mappings,
		fields?: Mapping[],
		opts?: {
			useIds?: boolean
			ignoreLinkedFields?: boolean
		}
	): Record<T>[]
	selectRecords(
		base: Base,
		tableId: TableId,
		fields: FieldId[],
		sorts: QuerySorts[],
		color: 'none' | 'bySelectField' | 'byView'
	): Promise<QueryResult>
	createRecords(
		base: Base,
		tableId: TableId,
		records: { fields: RecordFields }[]
	): Promise<string[]>
	createErrorRecord(
		base: Base,
		tableId: string,
		errorName: string,
		errorType: string,
		errorMessage: string,
		mappings: Mappings
	): Promise<void>
	updateRecords(
		base: Base,
		tableId: string,
		updates: Record<RecordFields>[]
	): Promise<void>
	removeRecords(base: Base, tableId: TableId, recordsIds: string[]): Promise<string[]>
}

interface RemoteConnectionInterface {
	createTable(tableData: NewTable[]): Promise<void>
	getRecords<T extends RemoteRecordFields>(
		baseId: BaseId,
		tableId: TableId,
		mappings: Mappings,
		urlParams?: {
			view?: ViewId
			fields?: FieldId[]
			filter?: string
		}
	): Promise<RemoteRecord<T>[]>
	createRecords<T extends RemoteRecordFields>(
		baseId: BaseId,
		tableId: TableId,
		fields: T[],
		mappings: Mappings,
		options?: {
			fieldsOnly?: boolean
			noNull?: boolean
			useFieldId?: boolean
		}
	): Promise<RemoteRecord<T>[]>
	updateRecords<T extends RemoteRecordFields>(
		baseId: BaseId,
		tableId: TableId,
		records: RemoteRecord<T>[],
		mappings: Mappings,
		options?: {
			fieldsOnly?: boolean
			noNull?: boolean
			useFieldId?: boolean
		}
	): Promise<RemoteRecord<T>[]>
	deleteRecords(
		baseId: BaseId,
		tableId: TableId,
		records: RecordId[]
	): Promise<{ id: RecordId; deleted: boolean }[]>
}

interface FetchObject {
	readonly baseUrl: string
	readonly userAgent: string
	readonly packageVersion: string
	readonly airtableVersion: string
	readonly apiKey: string
	_methods: {
		get: 'GET'
		post: 'POST'
		patch: 'PATCH'
		put: 'PUT'
		delete: 'DELETE'
	}
	_applyHeaders(this: FetchObject, baseId?: BaseId): Headers
	_createQueryPramas(urlParams: { [index: string]: string | string[] }): string
	_fetch<T, U>(
		path: string,
		method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
		payload?: U,
		opts?: FetchOptions
	): Promise<T>
	_throttleRequests<T extends RemoteRecordFields, U extends Object>(
		this: FetchObject,
		path: string,
		method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
		payload: U[],
		opts?: FetchOptions
	): Promise<RemoteRecord<T>[]>
	_doUpdateRequest<T extends RemoteRecordFields, U extends Object>(
		baseId: BaseId,
		tableId: TableId,
		method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
		payload?: U | U[],
		opts?: FetchOptions
	): Promise<RemoteRecord<T>[]>
	_convertRemoteRecordFieldsToIds(
		tableId: TableId,
		fields: RemoteRecordFields,
		mappings: Mappings,
		options?: {
			fieldsOnly?: boolean
			noNull?: boolean
			useFieldId?: boolean
		}
	): LockedRemoteRecordFields
	_convertRemoteRecordFieldsToNames<T extends RemoteRecordFields>(
		tableId: string,
		records: RemoteRecord<T>[],
		mappings: Mappings,
		opts?: {
			useIds?: boolean
			ignoreLinkedFields?: boolean
		}
	): RemoteRecord<T>[]
	get<T extends RemoteRecordFields>(
		this: FetchObject,
		baseId: BaseId,
		tableId: TableId,
		urlParams?: {
			view?: ViewId
			fields?: FieldId[]
			filter?: string
		}
	): Promise<RemoteRecord<T>[]>
	post<T extends RemoteRecordFields, U extends LockedRemoteRecordFields>(
		this: FetchObject,
		baseId: BaseId,
		tableId: TableId,
		payload: { fields: U }[],
		opts?: FetchOptions
	): Promise<RemoteRecord<T>[]>
	patch<T extends RemoteRecordFields>(
		this: FetchObject,
		baseId: BaseId,
		tableId: TableId,
		payload: RemoteRecord<RemoteRecordFields>[],
		opts?: FetchOptions
	): Promise<RemoteRecord<T>[]>
	put<T extends RemoteRecordFields, U extends LockedRemoteRecordFields>(
		this: FetchObject,
		baseId: BaseId,
		tableId: TableId,
		payload: U | U[],
		opts?: FetchOptions
	): Promise<RemoteRecord<T>[]>
	delete<U>(
		this: FetchObject,
		baseId: BaseId,
		tableId: TableId,
		payload: U | U[],
		opts?: FetchOptions
	): Promise<{ id: RecordId; deleted: boolean }[]>
}

interface Utilties {
	Converter: ConverterInterface
	AirtableUtils: AirtableInterface
	RemoteConnection: RemoteConnectionInterface
	Utils: UtilsInterface
}

const APIKEY = ''

/** Boilerplate for Scripting Apps
 * @param [APIKEY] {string}
 */
const { Converter, AirtableUtils, RemoteConnection, Utils } = (function (
	APIKEY?: string
): Utilties {
	/** Airtable Scripting Block Utitilies
	 * VERSION: 0.0.3
	 */

	/** Mappings Type Deffinitions
	 * @typedef Mappings {any}
	 */

	/** Mapping
	 * @typedef Mapping {Object}
	 * @property tableId {string}
	 * @property fieldId {string}
	 * @property refName {string}
	 * @property fieldName {string}
	 * @property feildType {string}
	 */

	/** Fetch Class Type Definition
	 * @typedef FetchObject {Object}
	 * @property _methods {Methods}
	 * @property get {Function}
	 * @property post {Function}
	 * @property patch {Function}
	 * @property put {Function}
	 * @property delete {Function}
	 */

	/** Fetch Options Type Declaration
	 * @typedef FetchOptions {Object}
	 * @property [baseId] {string}
	 */

	/** URL Paramters Declaration
	 * @typedef UrlParams {Object}
	 * @property [view] {string}
	 * @property [fields] {string}
	 * @property [filter] {string}
	 */

	/** HTTP Methods Object
	 * @typedef Methods {Object}
	 * @property get {string} - GET
	 * @property post {string} - POST
	 * @property patch {string} - PATCH
	 * @property put {string} - PUT
	 * @property delete {string} - DELETE
	 */

	/** Select Option
	 * @typedef SelectOption {Object}
	 * @property [SelectOption.id] {string}
	 * @property [SelectOption.name] {string}
	 * @property [SelectOption.color] {string}
	 */

	/** Fields Declaration
	 * @typedef Field {Object}
	 * @property id {string}
	 * @property name {string}
	 * @property type {string}
	 * @property isComputed {boolean}
	 * @property isPrimaryField {boolean}
	 * @property [options] {Object}
	 * @property [options.choices] {SelectOption[]}
	 */

	/** Custom Record Type Declaration
	 * @typedef CustomRecord {Object}
	 * @property id {string}
	 * @property name {string}
	 * @property tableId {string}
	 * @property fields {any}
	 */

	/** Update Record Type Declaration
	 * @typedef UpdateRecord {Object}
	 * @property id {string}
	 * @property fields {any}
	 */

	/** Remote Record Type Declaration
	 * @typedef RemoteRecord {Object}
	 * @property id {string}
	 * @property fields {any}
	 * @property [tableId] {string}
	 */

	/** Convert record fields to IDs options declaration
	 * @typedef ConversionOptions {Object}
	 * @property [fieldsOnly] {boolean}
	 * @property [noNull] {boolean}
	 * @property [useFieldId] {boolean}
	 */

	/** The data reuqired to make a table
	 * @typedef NewTableData {Object}
	 * @property NewTableData.name {string}
	 * @property NewTableData.fields {NewTableFields}
	 * @property NewTableData.baseId {string}
	 *
	 * @typedef NewTableFields {Object}
	 * @property NewTableFields.type {string}
	 * @property NewTableFields.name {string}
	 */

	/** Checks if a date is valid
	 * @param date {Date}
	 * @returns {boolean}
	 */
	function _isVaidDate(date: Date): boolean {
		if (!(date instanceof Date)) throw new Error(`Invalid Date ( Not of type Date )`)
		if (isNaN(Number(date.getTime()))) throw new Error(`Invlaid Date ${date}`)
		return true
	}

	/** Formates a number for a date
	 * @param num {number}
	 * @returns {string}
	 */
	function _formatNumber(num: number): string {
		return num < 10 ? '0' + num : num.toString()
	}

	/** Formats a Date for a User
	 * @param [date] {string | Date}
	 * @param [opts] {Object}
	 * @param [opts.asISOString] {boolean}
	 * @param [opts.asLocalString] {boolean}
	 */
	function getFormatedDate(
		date?: string | Date,
		opts?: {
			asISOString?: boolean
			asLocalString?: boolean
		}
	): string {
		let _date: Date = null
		if (!date) {
			_date = new Date()
		} else if (!(date instanceof Date)) {
			if (typeof date !== 'string') {
				throw new Error(
					`Only strings and Date Objects are valid for formDate function. Recieved ${date}`
				)
			}
			_date = new Date(date.split(' ')[0].replace(/-/g, '/'))
			_isVaidDate(_date)
		} else {
			_isVaidDate(date)
			_date = date
		}
		const day = _formatNumber(_date.getDate())
		const month = _formatNumber(_date.getMonth() + 1)
		const year = _date.getFullYear()
		if (opts?.asISOString) return _date.toISOString()
		if (opts?.asLocalString)
			return _date.toLocaleDateString('en-US', {
				timeZone: 'America/New_York',
			})
		return `${month}-${day}-${year}`
	}

	/** @param [time] {string | Date} - The Time to be converted
	 * 	@param [opts] {Object} - Should be returned in military time
	 * 	@param [opts.military] {boolean} - Should be returned in military time
	 *  @param [opts.asISOString] {boolean}
	 *  @param [opts.asLocalString] {boolean}
	 *  @param [opts.asUTCString] {boolean}
	 *  @returns {string}
	 */
	function getFormatedTime(
		time?: string | Date,
		opts?: {
			asISOString?: boolean
			military: boolean
			asLocalString?: boolean
			asUTCString: boolean
		}
	): string {
		let _date: Date = null
		if (!time) {
			_date = new Date()
		} else if (!(time instanceof Date)) {
			if (typeof time !== 'string') {
				throw new Error(
					`Only strings and Date Objects are valid for formatTime function. Recieved ${time}`
				)
			}
			if (time.includes('/') || time.includes('-')) {
				time = time.substring(time.indexOf(' ') + 1)
			}
			if (/^\d+([: A-Za-z\d])+/g.test(time)) {
				/** Shorthand Time with label ( 1p ) */
				const label = time.toLowerCase().includes('p') ? true : false
				time = time.toLowerCase().replace(/[a-z ]/g, '')
				if (time.includes(':')) {
					const [hour, minutes] = time.split(':')
					time = `${
						label && Number(hour) !== 12 ? Number(hour) + 12 : hour
					}:${minutes}`
				} else if (label && Number(time) < 12) {
					time = (Number(time) + 12).toString()
				} else if (!label && Number(time) === 12) {
					time = '0'
				}
			}
			if (!time.includes(':')) {
				/** Shorthand time without label */
				const timeAsNumber = Number(time)
				if (isNaN(timeAsNumber)) throw new Error(`Invalid Time ${time}`)
				if (timeAsNumber < 10) {
					time = `0${timeAsNumber}:00`
				} else {
					time = `${timeAsNumber}:00`
				}
				time = getFormatedDate() + ' ' + time
			} else {
				time = getFormatedDate() + ' ' + time
			}
			_date = new Date(time)
			_isVaidDate(_date)
		} else {
			_isVaidDate(time)
			_date = time
		}
		let hour = _date.getHours()
		const minutes = _formatNumber(_date.getMinutes())
		const label = hour >= 12 ? 'PM' : 'AM'
		if (opts?.military) {
			return `${_formatNumber(hour)}:${minutes}`
		} else if (opts?.asISOString) {
			return _date.toISOString()
		} else if (opts?.asLocalString) {
			return _date.toLocaleTimeString('en-US', {
				timeZone: 'America/New_York',
			})
		} else if (opts?.asUTCString) {
			return _date.toUTCString()
		} else {
			if (hour === 0) hour = 12
			return `${hour > 12 ? Number(hour) - 12 : hour}:${minutes} ${label}`
		}
	}

	/** @param [dateTime] {string | Date} - The Time to be converted
	 * 	@param [opts] {Object} - Should be returned in military time
	 * 	@param [opts.military] {boolean} - Should be returned in military time
	 *  @param [opts.asISOString] {boolean}
	 *  @param [opts.asLocalString] {boolean}
	 *  @param [opts.asUTCString] {boolean}
	 *  @returns {string}
	 */
	function getFormatedDateTime(
		dateTime?: string | Date,
		opts?: {
			asISOString?: boolean
			military?: boolean
			asLocalString?: boolean
			asUTCString?: boolean
		}
	): string {
		let _date: Date = null
		if (!dateTime) {
			_date = new Date()
		} else if (!(dateTime instanceof Date)) {
			if (typeof dateTime !== 'string') {
				throw new Error(
					`Only strings and Date Objects are valid for formatTime function. Recieved ${dateTime}`
				)
			}
			if (
				dateTime.includes(' ') &&
				(dateTime.includes('/') || dateTime.includes('-'))
			) {
				/** Full Date Time */
				let label = dateTime.slice(dateTime.length - 2, dateTime.length)
				dateTime = dateTime.substring(0, dateTime.length - 2) + ' ' + label
			}
			_date = new Date(dateTime)
			_isVaidDate(_date)
		} else {
			_isVaidDate(dateTime)
			_date = dateTime
		}

		const day = _formatNumber(_date.getDate())
		const month = _formatNumber(_date.getMonth() + 1)
		const year = _date.getFullYear()
		let hour = _date.getHours()
		const minutes = _formatNumber(_date.getMinutes())
		const label = hour >= 12 ? 'PM' : 'AM'
		if (opts?.asISOString) {
			return _date.toISOString()
		} else if (opts?.military) {
			return `${month}-${day}-${year} ${hour}:${minutes}`
		} else if (opts?.asLocalString) {
			return _date.toLocaleString('en-US', {
				timeZone: 'America/New_York',
			})
		} else if (opts?.asUTCString) {
			return _date.toUTCString()
		} else {
			if (hour === 0) hour = 12
			return `${month}-${day}-${year} ${
				hour > 12 ? hour - 12 : hour
			}:${minutes} ${label}`
		}
	}

	function getTimestamp(timeZoneOffset: number): string {
		const date = new Date()
		date.setTime(date.getTime() - 1000 * 60 * 60 * timeZoneOffset)
		return date.toLocaleTimeString()
	}

	const Converter: ConverterInterface = {
		getFormatedDate,
		getFormatedTime,
		getTimestamp,
		getFormatedDateTime,
	}

	/** Finds the closest day given a day number and direction
	 * @param startDate {Date} - The date to start from
	 * @param dayNumber {number} - 0 - 6 Day Number
	 * @param searchDirection {boolean} - Search foward or backwards in time
	 * @returns {Date}
	 */
	function findDay(startDate: Date, dayNumber: number, searchDirection: boolean): Date {
		let date = new Date(startDate)
		if (isNaN(startDate.getTime())) throw new Error('Invalid Date')
		if (!searchDirection) {
			while (date.getDay() !== dayNumber) {
				date.setDate(date.getDate() - 1)
			}
		} else {
			while (date.getDay() !== dayNumber) {
				date.setDate(date.getDate() + 1)
			}
		}
		return date
	}

	const Utils: UtilsInterface = {
		findDay,
	}

	function _formatKey(key: string) {
		return key
			.split('-')
			.map((word, i) =>
				i !== 0 ? word.substring(0, 1).toUpperCase() + word.substring(1) : word
			)
			.join('')
	}

	function _getFieldsInTable(tableId: string, mappings: Mappings): Mapping[] {
		const validTable = mappings[0][Object.keys(mappings[0])[0]].findIndex(
			(map) => map.tableId === tableId
		)
		if (validTable === -1) throw new Error(`Invalid table id ${tableId}`)
		return mappings
			.map((map) => {
				let hasTable: Mapping[] = []
				Object.keys(map).forEach((k) => {
					const item = map[k].find(
						(item) => item.tableId === tableId && item.fieldId
					)
					if (item) {
						item.refName = _formatKey(k)
						hasTable.push(item)
					}
				})
				return hasTable
			})
			.flat()
	}

	async function _selectRecords(
		table: Table,
		fields?: string[],
		sorts?: QuerySorts[],
		color?: 'none' | 'bySelectField' | 'byView'
	): Promise<QueryResult> {
		let opts: RecordSelectOptions = {}
		if (fields && fields.length) opts.fields = fields
		if (sorts && sorts.length) opts.sorts = sorts
		if (color) opts.recordColorMode = color
		return table.selectRecordsAsync(opts)
	}

	async function _selectAndLoadRecords(
		table: Table,
		fields?: string[],
		sorts?: QuerySorts[],
		color?: 'none' | 'bySelectField' | 'byView'
	): Promise<QueryResult> {
		return await _selectRecords(table, fields, sorts, color)
	}

	async function _throttleTableUsage(
		records: string[] | Record<RecordFields>[] | RecordFields[],
		func: (
			records: string[] | Record<RecordFields>[] | RecordFields[]
		) => Promise<string[] | void>
	): Promise<string[]> {
		let results: string[] = []
		while (records.length > 0) {
			const round = records.slice(0, 50)
			let r = (await func(round)) as string[] | void
			if (r) results = [...results, ...r]
			records.splice(0, 50)
		}
		return results
	}

	/** Returns all the mappings for a table
	 * @param tableId {string} - The table you want the mappings for
	 * @param mappings {Mappings} - Standard block mappings
	 * @param [refNames] {string[]} - The mappings required
	 * @returns {Mapping[]}
	 */
	function getMappingsForTable(
		tableId: TableId,
		mappings: Mappings,
		refNames?: string[]
	): Mapping[] {
		const mapping = _getFieldsInTable(tableId, mappings)
		return refNames?.length
			? mapping.filter((map) => refNames.includes(map.refName))
			: mapping
	}

	/** Selects a table from the current base
	 * @param base {Base} - The global base object
	 * @param tableId {string} - The table you want to select
	 */
	function selectTable(base: Base, tableId: TableId): Table {
		return base.getTable(tableId)
	}

	/** Select a view from the current base
	 * @param base {Base} - Global Base Object
	 * @param tableId {string} - The Table the view is in
	 * @param viewIdOrName {string} - The view you want
	 * @returns {View}
	 */
	function selectView(base: Base, tableId: TableId, viewIdOrName: ViewId): View {
		const table = selectTable(base, tableId)
		return viewIdOrName.includes('viw')
			? table.getView(viewIdOrName)
			: table.views.find((view) => view.name === viewIdOrName)
	}

	/** Selects a field from a table
	 * @param base {base} - The global base object
	 * @param tableId {string} - The Table's ID
	 * @param fieldId {string} - The fields ID
	 * @returns {Field}
	 */
	function selectField(base: Base, tableId: TableId, fieldId: FieldId): Field {
		const table = this.selectTable(base, tableId) as Table
		if (table === null)
			throw new Error(`Table Id ${tableId} does not excist in base ${base.name}`)
		return table.getField(fieldId)
	}

	/** Creates the fields for the Airtable Blocks API to create or update a record
	 * @param tableId {string} - The Table's ID
	 * @param fields {{[index: string]: any}} - The fields being created or updated
	 * @param mappings {Mappings} - The mappings for the table being updated
	 * @param [options] {Object}
	 * @param [options.fieldsOnly] {boolean} - Returns only the fields you passed in
	 * @param [options.noNull] {boolean} - Exlude an null fields
	 * @param [options.useFieldId] {boolean} - The the mappings filed IDs instead of the reference name
	 * @returns {{[index: string]: any}}
	 */
	function convertRecordFieldsToIds(
		tableId: TableId,
		fields: RecordFields,
		mappings: Mappings,
		options?: {
			fieldsOnly?: boolean
			noNull?: boolean
			useFieldId?: boolean
		}
	): LockedRecordFields {
		/** Validates and returns a value for a string field */
		function handleString(value: string | unknown): string {
			if (typeof value === 'string') return value ? value : ''
			if (value.toString) return value.toString()
			return String(value)
		}

		/** Validates and returns a value for a Date / DateTime field type */
		function handleDateTime(value: Date | string, includesTime: boolean): string {
			/** Date Time Fields */
			let convertedValue: string
			if (includesTime) {
				/** Time Fields Coming in should be GMT based
				 * so converting to UTC gives us the "East Coast" Time
				 * Return as a ISO string
				 */
				convertedValue = new Date(
					getFormatedDateTime(value, { asUTCString: true })
				).toISOString()
			} else {
				convertedValue = getFormatedDate(value, { asISOString: true })
			}
			return convertedValue
		}

		/** Validates and returns a value for a select field type */
		function handleSelects(
			value: string | string[] | SelectField | SelectField[],
			multi: boolean,
			opts?: { useId?: boolean }
		): SelectField | SelectField[] {
			if (!multi && Array.isArray(value))
				throw new Error(`Single Selects can not be arrays`)
			if (multi && !Array.isArray(value))
				throw new Error(
					`Multi Selects must be an array with either an ID or Name`
				)
			if (multi) {
				value = value as string[] | SelectField[]
				if (typeof value[0] === 'string') {
					// List of String
					return (value as string[])
						.filter((val) => val)
						.map((val) => ({ name: val }))
				} else {
					return (value as SelectField[])
						.filter((val) => val && (val.name || val.id))
						.map((r) => (r.id ? { id: r.id } : { name: r.name }))
				}
			} else {
				return typeof value === 'string'
					? { name: value as string }
					: (value as SelectField).id
					? { id: (value as SelectField).id }
					: { name: (value as SelectField).name }
			}
		}

		function handleAttachment(values: Attachment[]): Attachment[] {
			if (!values?.length) throw new Error('Attchements array is empty')
			return values.map((value) => {
				if (!value.url)
					throw new Error('Invalid Attachment. Missing URL or FileName')
				return value
			})
		}

		const _mappings = _getFieldsInTable(tableId, mappings)
		let newRecord: RecordFields
		try {
			/** Builds an object with the key being the field id and value the cell value */
			newRecord = _mappings.reduce<RecordFields>((acc, map) => {
				let key: string, value: CustomField
				key = options?.useFieldId ? map.fieldId : map.refName
				/** Check  for empty values */
				if (fields[key] === null || fields[key] === undefined) {
					if (fields[key] === undefined && options?.fieldsOnly) return acc
					if (map.fieldType == fieldTypes.CREATED_TIME) return acc
					if (!options || !options.noNull) acc[map.fieldId] = null
					return acc
				}
				switch (map.fieldType) {
					case fieldTypes.EMAIL:
					case fieldTypes.URL:
					case fieldTypes.MULTILINE_TEXT:
					case fieldTypes.SINGLE_LINE_TEXT:
					case fieldTypes.PHONE_NUMBER:
					case fieldTypes.RICH_TEXT:
						acc[map.fieldId] = handleString(fields[key] as string)
						break
					case fieldTypes.NUMBER:
						acc[map.fieldId] = Number(fields[key])
						break
					case fieldTypes.CHECKBOX:
						if (typeof fields[key] === 'string') {
							acc[map.fieldId] = fields[key] === 'checked' ? true : false
						} else if (typeof fields[key] === 'boolean') {
							acc[map.fieldId] = fields[key]
						} else {
							throw new Error(
								`Invalid checkbox value: ${fields[key]} for ${map.refName}`
							)
						}
						break
					case fieldTypes.DATE:
						acc[map.fieldId] = handleDateTime(fields[key] as string, false)
						break
					case fieldTypes.DATE_TIME:
						acc[map.fieldId] = handleDateTime(
							fields[key] as string | Date,
							true
						)
						break
					case fieldTypes.MULTIPLE_RECORD_LINKS:
						if (!Array.isArray(fields[key]))
							throw new Error(key + ' is required to be an array')
						value = fields[key] as SelectField[]
						if (typeof value[0] === 'string') {
							throw new Error('Multi Options are required to be an object')
						} else {
							value = fields[key] as SelectField[]
							acc[map.fieldId] = value.map((r) => ({ id: r.id }))
						}
						break
					case fieldTypes.SINGLE_COLLABORATOR:
					case fieldTypes.SINGLE_SELECT:
						acc[map.fieldId] = handleSelects(fields[key] as string, false)
						break
					case fieldTypes.MULTIPLE_SELECTS:
						acc[map.fieldId] = handleSelects(
							fields[key] as SelectField[],
							true
						)
						break
					case fieldTypes.MULTIPLE_ATTACHMENTS:
						acc[map.fieldId] = handleAttachment(fields[key] as Attachment[])
						break
					case fieldTypes.CREATED_TIME: // Acceptions
						break
					default:
						throw new Error(`Invalid field type ${map.fieldType}`)
				}
				return acc
			}, {})
		} catch (error) {
			console.error(error.message)
			return null
		}
		return newRecord
	}

	/** Converts an Airtable Record into a Typed Record Data object
	 * @param tableId {string} - Table id of the record
	 * @param records {Record[]} - Array of Airtable Records
	 * @param mappings {Mappings} - Standard Mappings
	 * @param [fields] {{[index: string]: string }[]}} - Mappings for the fields you would like to be returned
	 * @param [opts] {Object}
	 * @param [opts.useIds] {boolean} - Returns fields with the field Id instead of the reference name
	 * @param [opts.ignoreLinkedFields] {boolean} - Will not return fields that are linked fields
	 * @returns {CustomRecord[]}
	 */
	function convertRecordFieldsToNames<T extends RecordFields>(
		tableId: string,
		records: AirtableRecord[],
		mappings: Mappings,
		fields?: Mapping[],
		opts?: {
			useIds?: boolean
			ignoreLinkedFields?: boolean
		}
	): Record<T>[] {
		if (!records || !records.length) return null
		const key = opts && opts.useIds ? 'fieldId' : 'refName'
		if (!fields || !fields.length) fields = _getFieldsInTable(tableId, mappings)
		return records.map((rec) => {
			if (!rec) throw new Error('Records Array has invalid items')
			const fieldValues: any = {}
			fields.forEach((f) => {
				let value = rec.getCellValue(f.fieldId) as unknown
				if (value === null || value === undefined)
					return (fieldValues[f[key]] = null)
				switch (f.fieldType) {
					case fieldTypes.NUMBER:
						fieldValues[f[key]] = !isNaN(Number(value))
							? (value as number)
							: Number(value)
						break
					case fieldTypes.RICH_TEXT:
						fieldValues[f[key]] = value
						break
					case fieldTypes.CHECKBOX:
						fieldValues[f[key]] = value
						break
					case fieldTypes.SINGLE_SELECT:
					case fieldTypes.SINGLE_COLLABORATOR:
						fieldValues[f[key]] = value
						break
					case fieldTypes.MULTIPLE_RECORD_LINKS:
					case fieldTypes.MULTIPLE_SELECTS:
					case fieldTypes.MULTIPLE_ATTACHMENTS:
						fieldValues[f[key]] = Array.isArray(value) ? value : [value]
						break
					default:
						fieldValues[f[key]] = rec.getCellValueAsString(f.fieldId)
						break
				}
			})
			return {
				id: rec.id,
				name: rec.name,
				tableId: tableId,
				fields: fieldValues,
			}
		})
	}

	/** Selects all the records from a table
	 * @param base {Base} - Global Base Object
	 * @param tableIdOrName {string} - The Table name or ID
	 * @param [fields] {string[]} - The fields you want loaded. null / undefined for all fields
	 * @param [sorts] {Object[]} - How to sort the returned records
	 * @param [sorts.field] {string} - The field ID to sort by
	 * @param [sorts.direction] {string} - The direction to sort. Either asc | desc
	 * @param [color] {string}
	 * @returns {Promise<{recordIds: string[], records: Record[], getRecord(id: string): Record}>}
	 */
	async function selectTableAndRecords(
		base: Base,
		tableIdOrName: string,
		fields?: FieldId[],
		sorts?: QuerySorts[],
		color?: 'none' | 'bySelectField' | 'byView'
	): Promise<QueryResult> {
		const table = this.selectTable(base, tableIdOrName)
		if (!table)
			throw new Error(`Table ID ${tableIdOrName} is not valid in base ${base.name}`)
		return await _selectAndLoadRecords(table, fields, sorts, color)
	}

	/** Creates records
	 * @param base {Base} - Global Base Object
	 * @param tableId {string} - The table's id where the records will be created
	 * @param records {Object[]} - Converted records to be created
	 * @param records.fields {unknown}
	 * @returns {Promise<string[]>}
	 */
	function createRecords(
		base: Base,
		tableId: TableId,
		records: { fields: RecordFields }[]
	): Promise<string[]> {
		const table = this.selectTable(base, tableId)
		return _throttleTableUsage(records, (r: { fields: RecordFields }[]) =>
			table.createRecordsAsync(r)
		).then((ids) => [].concat.apply([], ids))
	}

	/** Creates a record in an errors table if it is mapped
	 * @param base {Base} - Global Base Object
	 * @param tableId {string} - The table's id where the records will be created
	 * @param errorName {string}
	 * @param errorType {string}
	 * @param errorMessage {string}
	 * @param mappings {Mappings} - Standard Mappings
	 * @returns {Promise<string[]>}
	 */
	async function createErrorRecord(
		base: Base,
		tableId: string,
		errorName: string,
		errorType: string,
		errorMessage: string,
		mappings: Mappings
	): Promise<void> {
		const record = this.convertRecordFieldsToIds(
			tableId,
			{
				name: errorName,
				errorType,
				errorMessage,
			},
			mappings
		)
		await this.createRecords(base, tableId, [{ fields: record }])
	}

	/** Updates records in a table
	 * @param base {Base} - Global Base Object
	 * @param tableId {string} - The table's id where the records will be created
	 * @param updates {{ id: string, fields: unknown }[]} - Converted records to be updated. include record id
	 * @returns {Promise<void>}
	 */
	async function updateRecords(
		base: Base,
		tableId: string,
		updates: Record<RecordFields>[]
	): Promise<void> {
		const table = this.selectTable(base, tableId)
		await _throttleTableUsage(updates, (r: Record<RecordFields>[]) =>
			table.updateRecordsAsync(r)
		)
	}

	/** Removes records in a table
	 * @param base {Base} - Global Base Object
	 * @param tableId {string} - The table's id where the records will be created
	 * @param recordsIds {string[]} - String of ids of the records that will be removed
	 * @returns {Promise<void>}
	 */
	function removeRecords(
		base: Base,
		tableId: TableId,
		recordsIds: string[]
	): Promise<string[]> {
		const table = this.selectTable(base, tableId)
		return _throttleTableUsage(recordsIds, (r: string[]) =>
			table.deleteRecordsAsync(r)
		)
	}

	const fieldTypes = {
		SINGLE_LINE_TEXT: 'singleLineText',
		EMAIL: 'email',
		URL: 'url',
		MULTILINE_TEXT: 'multilineText',
		NUMBER: 'number',
		PERCENT: 'percent',
		CURRENCY: 'currency',
		SINGLE_SELECT: 'singleSelect',
		MULTIPLE_SELECTS: 'multipleSelects',
		SINGLE_COLLABORATOR: 'singleCollaborator',
		MULTIPLE_COLLABORATORS: 'multipleCollaborators',
		MULTIPLE_RECORD_LINKS: 'multipleRecordLinks',
		DATE: 'date',
		DATE_TIME: 'dateTime',
		PHONE_NUMBER: 'phoneNumber',
		MULTIPLE_ATTACHMENTS: 'multipleAttachments',
		CHECKBOX: 'checkbox',
		FORMULA: 'formula',
		CREATED_TIME: 'createdTime',
		ROLLUP: 'rollup',
		COUNT: 'count',
		MULTIPLE_LOOKUP_VALUES: 'multipleLookupValues',
		AUTO_NUMBER: 'autoNumber',
		BARCODE: 'barcode',
		RATING: 'rating',
		RICH_TEXT: 'richText',
		DURATION: 'duration',
		LAST_MODIFIED_TIME: 'lastModifiedTime',
		CREATED_BY: 'createdBy',
		LAST_MODIFIED_BY: 'lastModifiedBy',
		BUTTON: 'button',
	}

	const AirtableUtils: AirtableInterface = {
		selectTable,
		selectView,
		selectField,
		convertRecordFieldsToIds,
		convertRecordFieldsToNames,
		getMappings: getMappingsForTable,
		selectRecords: selectTableAndRecords,
		createRecords,
		createErrorRecord,
		updateRecords,
		removeRecords,
	}

	/** A fetch wrapper for communicating with other bases */
	const customFetch: FetchObject = {
		baseUrl: 'https://api.airtable.com/',
		userAgent: `Airtable.js/0.8.1`,
		packageVersion: '0.8.1',
		airtableVersion: '0',
		apiKey: APIKEY ? APIKEY : null,
		_methods: {
			get: 'GET',
			post: 'POST',
			patch: 'PATCH',
			put: 'PUT',
			delete: 'DELETE',
		},
		/** Creates the default headers
		 * @param this {FetchObject}
		 */
		_applyHeaders: function (this: FetchObject, baseId?: BaseId): Headers {
			if (!this.apiKey)
				throw new Error('ERROR: Unable to make Remote Request. No API Key')
			const headers = new Headers()
			headers.append('Accept', 'application/json')
			headers.append('Content-Type', 'application/json')
			headers.append('authorization', 'Bearer ' + this.apiKey)
			headers.append('x-airtable-user-agent', this.userAgent)
			// headers.append('x-api-version', this.packageVersion)
			baseId && headers.append('x-airtable-application-id', baseId)
			return headers
		},
		_createQueryPramas: function (urlParams: {
			[index: string]: string | string[]
		}): string {
			if (!urlParams) return ''
			return Object.entries(urlParams)
				.filter(([key, value]) => value !== null && value !== undefined)
				.map(([key, value]) => {
					if (!value) return ''
					if (Array.isArray(value)) {
						return value
							.map((v) => `${key}=${encodeURIComponent(v)}`)
							.join('&')
					} else {
						return `${key}=${encodeURIComponent(value)}`
					}
				})
				.join('&')
		},
		/** Fetch wrapper
		 * @param path {string}
		 * @param method {string}
		 * @param [payload] {Object}
		 * @param [opts] {FetchOptions}
		 */
		_fetch: async function <T, U>(
			this: FetchObject,
			path: string,
			method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
			payload?: U,
			opts?: FetchOptions
		): Promise<T> {
			let result: T = null
			try {
				const res = await fetch(
					`${this.baseUrl}v${this.airtableVersion}/${path}`,
					{
						headers: this._applyHeaders(opts?.baseId),
						method: method,
						body: payload ? JSON.stringify(payload) : null,
					}
				)
				if (!res.ok)
					throw new Error(
						`Fetch Error: ${res.statusText} - ${res.status.toString()}`
					)
				result = (await res.json()) as T
			} catch (error) {
				console.error(error.message)
				throw new Error('Fetch Error')
			}
			return result
		},
		/** Throttles updates to a remote base to meet write operation restrictions
		 * @param this {FetchObject}
		 * @param path {string}
		 * @param method {string}
		 * @param payload {Object}
		 * @param [opts] {FetchOptions}
		 */
		_throttleRequests: async function <
			T extends RemoteRecordFields,
			U extends Object
		>(
			this: FetchObject,
			path: string,
			method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
			payload: U[],
			opts?: FetchOptions
		): Promise<RemoteRecord<T>[]> {
			let results = [] as RemoteRecord<T>[]
			while (payload.length > 0) {
				const round = payload[0]
				let response = await this._fetch<{ records: RemoteRecord<T>[] }, U>(
					path,
					method,
					round,
					opts
				)
				if (response) results = [...results, ...response.records]
				payload.splice(0, 1)
			}
			return results
		},
		_doUpdateRequest: async function <T extends RemoteRecordFields, U>(
			this: FetchObject,
			baseId: BaseId,
			tableId: TableId,
			method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
			payload?: U[],
			opts?: FetchOptions
		): Promise<RemoteRecord<T>[]> {
			let results: RemoteRecord<T>[] = []
			if (payload) {
				//payload = Array.isArray(payload) ? payload : [payload]
				const _payload: { records: U[] }[] = []
				payload.forEach((item, i) => {
					/** Group every 10 records */
					const index = Math.floor(i % 10)
					if (!_payload[index]) {
						_payload.push({ records: [item] })
					} else {
						_payload[index].records.push(item)
					}
				})
				const result = await this._throttleRequests<T, { records: U[] }>(
					`${baseId}/${tableId}`,
					method,
					_payload,
					opts
				)
				results.push(...result)
			} else {
				const result = await this._fetch<RemoteRecord<T>, null>(
					`${baseId}/${tableId}`,
					method,
					null,
					opts
				)
				results.push(result)
			}
			return results
		},
		/** Creates the fields for the Airtable Blocks API to create or update a record
		 * @param tableId {string} - The Table's ID
		 * @param fields {{[index: string]: any}} - The fields being created or updated
		 * @param mappings {Mappings} - The mappings for the table being updated
		 * @param [options] {Object}
		 * @param [options.fieldsOnly] {boolean} - Returns only the fields you passed in
		 * @param [options.noNull] {boolean} - Exlude an null fields
		 * @param [options.useFieldId] {boolean} - The the mappings filed IDs instead of the reference name
		 * @returns {{[index: string]: any}}
		 */
		_convertRemoteRecordFieldsToIds: function (
			tableId: TableId,
			fields: RemoteRecordFields,
			mappings: Mappings,
			options?: {
				fieldsOnly?: boolean
				noNull?: boolean
				useFieldId?: boolean
			}
		): LockedRemoteRecordFields {
			/** Validates and returns a value for a string field */
			function handleString(value: string | unknown): string {
				if (typeof value === 'string') return value ? value : ''
				if (value.toString) return value.toString()
				return String(value)
			}

			/** Validates and returns a value for a Date / DateTime field type */
			function handleDateTime(value: Date | string, includesTime: boolean): string {
				/** Date Time Fields */
				let convertedValue: string
				if (includesTime) {
					convertedValue = getFormatedDateTime(value, { asISOString: true })
				} else {
					convertedValue = getFormatedDate(value)
				}
				return convertedValue
			}

			const _mappings = _getFieldsInTable(tableId, mappings)
			let newRecord /** Builds an object with the key being the field id and value the cell value */
			newRecord = _mappings.reduce<RemoteRecordFields>((acc, map) => {
				let key: string, value: RemoteCustomField
				key = options?.useFieldId ? map.fieldId : map.refName
				/** Check  for empty values */
				if (fields[key] === null || fields[key] === undefined) {
					if (fields[key] === undefined && options?.fieldsOnly) return acc
					if (map.fieldType == fieldTypes.CREATED_TIME) return acc
					if (!options || !options.noNull) acc[map.fieldId] = null
					return acc
				}
				try {
					switch (map.fieldType) {
						case fieldTypes.EMAIL:
						case fieldTypes.URL:
						case fieldTypes.MULTILINE_TEXT:
						case fieldTypes.SINGLE_LINE_TEXT:
						case fieldTypes.PHONE_NUMBER:
						case fieldTypes.RICH_TEXT:
							acc[map.fieldId] = handleString(fields[key] as string)
							break
						case fieldTypes.NUMBER:
							acc[map.fieldId] = Number(fields[key])
							break
						case fieldTypes.CHECKBOX:
							if (typeof fields[key] === 'string') {
								acc[map.fieldId] =
									fields[key] === 'checked' ? true : false
							} else if (typeof fields[key] === 'boolean') {
								acc[map.fieldId] = fields[key]
							} else {
								throw new Error(
									`Invalid checkbox value: ${fields[key]} for ${map.refName}`
								)
							}
							break
						case fieldTypes.DATE:
							acc[map.fieldId] = handleDateTime(
								fields[key] as string,
								false
							)
							break
						case fieldTypes.DATE_TIME:
							acc[map.fieldId] = handleDateTime(
								fields[key] as string | Date,
								true
							)
							break
						case fieldTypes.MULTIPLE_RECORD_LINKS:
							if (!Array.isArray(fields[key]))
								throw new Error(key + ' is required to be an array')
							value = fields[key] as string[]
							if (typeof value[0] === 'string') {
								throw new Error(
									'Multi Options are required to be an object'
								)
							} else {
								acc[map.fieldId] = fields[key] as string[]
							}
							break
						case fieldTypes.SINGLE_COLLABORATOR:
						case fieldTypes.SINGLE_SELECT:
							acc[map.fieldId] = fields[key] as string
							break
						case fieldTypes.MULTIPLE_SELECTS:
							acc[map.fieldId] = fields[key] as string[]
							break
						case fieldTypes.CREATED_TIME: // Acceptions
							break
						default:
							throw new Error(`Invalid field type ${map.fieldType}`)
					}
				} catch (error) {
					console.error('ERROR CONVERTING FIELDS: ' + error.message)
				}
				return acc
			}, {})
			return newRecord
		},
		_convertRemoteRecordFieldsToNames: function <T extends RemoteRecordFields>(
			tableId: string,
			records: RemoteRecord<T>[],
			mappings: Mappings,
			opts?: {
				useIds?: boolean
				ignoreLinkedFields?: boolean
			}
		): RemoteRecord<T>[] {
			if (!records || !records.length) return null
			if (!mappings) throw new Error('Cannot convert remote records. No mappings.')
			const key = opts && opts.useIds ? 'fieldId' : 'refName'
			const fields = _getFieldsInTable(tableId, mappings)
			return records.map((rec) => {
				if (!rec) throw new Error('Records Array has invalid items')
				const fieldValues: any = {}
				fields.forEach((f) => {
					let value = rec.fields[f.fieldName] as unknown
					if (value === null || value === undefined)
						return (fieldValues[f[key]] = null)
					switch (f.fieldType) {
						case fieldTypes.NUMBER:
							fieldValues[f[key]] = !isNaN(Number(value))
								? (value as number)
								: Number(value)
							break
						case fieldTypes.CHECKBOX:
						case fieldTypes.RICH_TEXT:
						case fieldTypes.SINGLE_SELECT:
						case fieldTypes.SINGLE_COLLABORATOR:
							fieldValues[f[key]] = value
							break
						case fieldTypes.MULTIPLE_RECORD_LINKS:
						case fieldTypes.MULTIPLE_SELECTS:
							fieldValues[f[key]] = Array.isArray(value) ? value : [value]
							break
						default:
							fieldValues[f[key]] = value
							break
					}
				})
				return {
					id: rec.id,
					name: rec.fields[Object.keys(rec.fields)[0]] as string,
					tableId: tableId,
					fields: fieldValues,
				}
			})
		},
		/** Gets records from a remote base
		 * @param this {FetchObject} - The URL path
		 * @param baseId {string}
		 * @param tableId {string}
		 * @param urlParams {UrlParams}
		 * @returns {RemoteRecord[]}
		 */
		get: async function <T extends RemoteRecordFields>(
			this: FetchObject,
			baseId: BaseId,
			tableId: TableId,
			urlParams?: {
				view?: ViewId
				fields?: FieldId[]
				filter?: string
			}
		): Promise<RemoteRecord<T>[]> {
			let results: RemoteRecord<T>[] = [],
				offset = ''
			while (offset !== null) {
				const queryParams = this._createQueryPramas({
					view: urlParams?.view,
					fields: urlParams?.fields,
					filterByFormula: urlParams?.filter,
				})
				const response = await this._fetch<
					{ records: RemoteRecord<T>[]; offset: string },
					null
				>(
					`${baseId}/${tableId}?${queryParams}${
						offset ? '&offset=' + offset : ''
					}`,
					'GET',
					null,
					{ baseId }
				)
				offset = response.offset ? response.offset : null
				results.push(...response.records)
			}
			return results
		},
		/** Creates and sends a post request with optional body data
		 * @param this {FetchObject}
		 * @param baseId {string}
		 * @param tableId {string}
		 * @param payload {Object}
		 * @param [opts] {FetchOptions}
		 * @returns {Promise<CustomRecord[]>}
		 */
		post: async function <T extends RemoteRecordFields, U>(
			this: FetchObject,
			baseId: BaseId,
			tableId: TableId,
			payload: U | U[],
			opts?: FetchOptions
		): Promise<RemoteRecord<T>[]> {
			return await this._doUpdateRequest<T, U>(
				baseId,
				tableId,
				'POST',
				payload,
				opts
			)
		},
		/** Creates and sends a post request with optional body data
		 * @param this {FetchObject}
		 * @param baseId {string}
		 * @param tableId {string}
		 * @param payload {Object}
		 * @param [opts] {FetchOptions}
		 * @returns {Promise<CustomRecord[]>}
		 */
		patch: async function <T extends RemoteRecordFields, U>(
			this: FetchObject,
			baseId: BaseId,
			tableId: TableId,
			payload: U | U[],
			opts?: FetchOptions
		): Promise<RemoteRecord<T>[]> {
			return await this._doUpdateRequest<T, U>(
				baseId,
				tableId,
				'PATCH',
				payload,
				opts
			)
		},
		/** Creates and sends a post request with optional body data
		 * @param this {FetchObject}
		 * @param baseId {string}
		 * @param tableId {string}
		 * @param payload {Object}
		 * @param [opts] {FetchOptions}
		 * @returns {Promise<CustomRecord[]>}
		 */
		put: async function <T extends RemoteRecordFields, U>(
			this: FetchObject,
			baseId: BaseId,
			tableId: TableId,
			payload: U | U[],
			opts?: FetchOptions
		): Promise<RemoteRecord<T>[]> {
			return await this._doUpdateRequest<T, U>(
				baseId,
				tableId,
				'PUT',
				payload,
				opts
			)
		},
		/** Creates and sends a post request with optional body data
		 * @param this {FetchObject}
		 * @param baseId {string}
		 * @param tableId {string}
		 * @param payload {Object}
		 * @param [opts] {FetchOptions}
		 * @returns {Promise<{ id: string, deleted: boolean }[]>}
		 */
		delete: async function <U>(
			this: FetchObject,
			baseId: BaseId,
			tableId: TableId,
			payload: U[],
			opts?: FetchOptions
		): Promise<{ id: RecordId; deleted: boolean }[]> {
			let results: { id: RecordId; deleted: boolean }[] = []
			while (payload.length !== 0) {
				let delRecs = '?'
				payload.splice(0, 10).forEach((id) => (delRecs += `records[]=${id}&`))
				const result = await this._fetch<
					{ id: RecordId; deleted: boolean }[],
					null
				>(`${baseId}/${tableId}${delRecs}`, 'DELETE')
				results.push(...result)
			}
			return results
		},
	}

	/** Creates a Table in a Base
	 * @param tableData {NewTableData[]}
	 * @returns {Promise<void>}
	 */
	function createRemoteTable(tableData: NewTable[]): Promise<void> {
		return new Promise<void>(async (resolve, reject) => {
			let errors = []
			for (let i = 0; i < tableData.length; i++) {
				const data = tableData[i]
				try {
					if (!data.baseId || !data.name)
						throw new Error('Base ID and Table Name Requried')
					await customFetch._fetch<void, NewTable>(
						`meta/bases/${data.baseId}/tables`,
						'POST',
						{
							name: data.name,
							fields: data.fields,
						}
					)
				} catch (error) {
					console.error(`ERROR CREATING TABLE: ${error.message}`)
					errors.push(error.message)
				}
			}
			errors.length ? reject(errors) : resolve()
		})
	}

	/** Gets all the records from a remote base's specified table
	 * @param baseId {string}
	 * @param tableId {string}
	 * @param mappings {Mappings}
	 * @param [urlParams] {UrlParams}
	 * @return {Promise<CustomRecord[]>}
	 */
	async function getRemoteRecords<T extends RemoteRecordFields>(
		baseId: BaseId,
		tableId: TableId,
		mappings: Mappings,
		urlParams?: {
			view?: ViewId
			fields?: FieldId[]
			filter?: string
		}
	): Promise<RemoteRecord<T>[]> {
		const records = await customFetch.get<T>(baseId, tableId, urlParams)
		return customFetch._convertRemoteRecordFieldsToNames<T>(
			tableId,
			records,
			mappings
		)
	}
	/** Gets all the records from a remote base's specified table
	 * @param baseId {string}
	 * @param tableId {string}
	 * @param fields {any}
	 * @param mappings {Mappings}
	 * @param [options] {ConversionOptions}
	 * @return {Promise<CustomRecord[]>}
	 */
	async function createRemoteRecords<
		T extends RemoteRecordFields,
		U extends RemoteRecordFields
	>(
		baseId: BaseId,
		tableId: TableId,
		fields: U | U[],
		mappings: Mappings,
		options?: {
			fieldsOnly?: boolean
			noNull?: boolean
			useFieldId?: boolean
		}
	): Promise<RemoteRecord<T>[]> {
		if (!Array.isArray(fields)) fields = [fields]
		const newRecords = fields.map((field) => ({
			fields: customFetch._convertRemoteRecordFieldsToIds(
				tableId,
				field,
				mappings,
				options
			),
		}))
		const results = await customFetch.post<T, LockedRemoteRecordFields>(
			baseId,
			tableId,
			newRecords
		)
		return customFetch._convertRemoteRecordFieldsToNames<T>(
			tableId,
			results,
			mappings
		)
	}

	/** Gets all the records from a remote base's specified table
	 * @param baseId {string}
	 * @param tableId {string}
	 * @param records {{ id: string, fields: unknown }[]}
	 * @param mappings {Mappings}
	 * @param [options] {ConversionOptions}
	 * @return {Promise<CustomRecord[]>}
	 */
	async function updateRemoteRecords<
		T extends RemoteRecordFields,
		U extends RemoteRecordFields
	>(
		baseId: BaseId,
		tableId: TableId,
		records: RemoteRecord<U>[],
		mappings: Mappings,
		options?: {
			fieldsOnly?: boolean
			noNull?: boolean
			useFieldId?: boolean
		}
	): Promise<RemoteRecord<T>[]> {
		const updates: RemoteRecord<LockedRemoteRecordFields>[] = records.map((rec) => ({
			id: rec.id,
			fields: customFetch._convertRemoteRecordFieldsToIds(
				tableId,
				rec.fields,
				mappings,
				options
			),
		}))
		const results = await customFetch.patch<T>(baseId, tableId, updates)
		return customFetch._convertRemoteRecordFieldsToNames<T>(
			tableId,
			results,
			mappings
		)
	}
	/** Gets all the records from a remote base's specified table
	 * @param baseId {string}
	 * @param tableId {string}
	 * @param records {string[]}
	 * @return {Promise<{ id: string, deleted: boolean }[]>}
	 */
	function deleteRemoteRecords(
		baseId: BaseId,
		tableId: TableId,
		records: RecordId[]
	): Promise<{ id: RecordId; deleted: boolean }[]> {
		return customFetch.delete(baseId, tableId, records)
	}

	const RemoteConnection: RemoteConnectionInterface = {
		createTable: createRemoteTable,
		getRecords: getRemoteRecords,
		createRecords: createRemoteRecords,
		updateRecords: updateRemoteRecords,
		deleteRecords: deleteRemoteRecords,
	}

	return {
		Converter,
		AirtableUtils,
		RemoteConnection,
		Utils,
	}
})(APIKEY)
