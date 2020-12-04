'use strict'

/** Boilerplate for Scripting Apps
 * @param [APIKEY] {string}
 */
const { Converter, AirtableUtils, RemoteConnection, Utils } = (function (APIKEY) {
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
	var __awaiter =
		(this && this.__awaiter) ||
		function (thisArg, _arguments, P, generator) {
			function adopt(value) {
				return value instanceof P
					? value
					: new P(function (resolve) {
							resolve(value)
					  })
			}
			return new (P || (P = Promise))(function (resolve, reject) {
				function fulfilled(value) {
					try {
						step(generator.next(value))
					} catch (e) {
						reject(e)
					}
				}
				function rejected(value) {
					try {
						step(generator['throw'](value))
					} catch (e) {
						reject(e)
					}
				}
				function step(result) {
					result.done
						? resolve(result.value)
						: adopt(result.value).then(fulfilled, rejected)
				}
				step((generator = generator.apply(thisArg, _arguments || [])).next())
			})
		}
	/** Checks if a date is valid
	 * @param date {Date}
	 * @returns {boolean}
	 */
	function _isVaidDate(date) {
		if (!(date instanceof Date)) throw new Error(`Invalid Date ( Not of type Date )`)
		if (isNaN(Number(date.getTime()))) throw new Error(`Invlaid Date ${date}`)
		return true
	}
	/** Formates a number for a date
	 * @param num {number}
	 * @returns {string}
	 */
	function _formatNumber(num) {
		return num < 10 ? '0' + num : num.toString()
	}
	/** Formats a Date for a User
	 * @param [date] {string | Date}
	 * @param [opts] {Object}
	 * @param [opts.asISOString] {boolean}
	 * @param [opts.asLocalString] {boolean}
	 */
	function getFormatedDate(date, opts) {
		let _date = null
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
		if (opts === null || opts === void 0 ? void 0 : opts.asISOString)
			return _date.toISOString()
		if (opts === null || opts === void 0 ? void 0 : opts.asLocalString)
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
	function getFormatedTime(time, opts) {
		let _date = null
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
		if (opts === null || opts === void 0 ? void 0 : opts.military) {
			return `${hour}:${minutes}`
		} else if (opts === null || opts === void 0 ? void 0 : opts.asISOString) {
			return _date.toISOString()
		} else if (opts === null || opts === void 0 ? void 0 : opts.asLocalString) {
			return _date.toLocaleTimeString('en-US', {
				timeZone: 'America/New_York',
			})
		} else if (opts === null || opts === void 0 ? void 0 : opts.asUTCString) {
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
	function getFormatedDateTime(dateTime, opts) {
		let _date = null
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
		if (opts === null || opts === void 0 ? void 0 : opts.asISOString) {
			return _date.toISOString()
		} else if (opts === null || opts === void 0 ? void 0 : opts.military) {
			return `${month}-${day}-${year} ${hour}:${minutes}`
		} else if (opts === null || opts === void 0 ? void 0 : opts.asLocalString) {
			return _date.toLocaleString('en-US', {
				timeZone: 'America/New_York',
			})
		} else if (opts === null || opts === void 0 ? void 0 : opts.asUTCString) {
			return _date.toUTCString()
		} else {
			if (hour === 0) hour = 12
			return `${month}-${day}-${year} ${
				hour > 12 ? hour - 12 : hour
			}:${minutes} ${label}`
		}
	}
	function getTimestamp(timeZoneOffset) {
		const date = new Date()
		date.setTime(date.getTime() - 1000 * 60 * 60 * timeZoneOffset)
		return date.toLocaleTimeString()
	}
	const Converter = {
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
	function findDay(startDate, dayNumber, searchDirection) {
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
	const Utils = {
		findDay,
	}
	function _formatKey(key) {
		return key
			.split('-')
			.map((word, i) =>
				i !== 0 ? word.substring(0, 1).toUpperCase() + word.substring(1) : word
			)
			.join('')
	}
	function _getFieldsInTable(tableId, mappings) {
		const validTable = mappings[0][Object.keys(mappings[0])[0]].findIndex(
			(map) => map.tableId === tableId
		)
		if (validTable === -1) throw new Error(`Invalid table id ${tableId}`)
		return mappings
			.map((map) => {
				let hasTable = []
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
	function _selectRecords(table, fields, sorts, color) {
		return __awaiter(this, void 0, void 0, function* () {
			let opts = {}
			if (fields && fields.length) opts.fields = fields
			if (sorts && sorts.length) opts.sorts = sorts
			if (color) opts.recordColorMode = color
			return table.selectRecordsAsync(opts)
		})
	}
	function _selectAndLoadRecords(table, fields, sorts, color) {
		return __awaiter(this, void 0, void 0, function* () {
			return yield _selectRecords(table, fields, sorts, color)
		})
	}
	function _throttleTableUsage(records, func) {
		return __awaiter(this, void 0, void 0, function* () {
			let results = []
			while (records.length > 0) {
				const round = records.slice(0, 50)
				let r = yield func(round)
				if (r) results = [...results, ...r]
				records.splice(0, 50)
			}
			return results
		})
	}
	/** Returns all the mappings for a table
	 * @param tableId {string} - The table you want the mappings for
	 * @param mappings {Mappings} - Standard block mappings
	 * @param [refNames] {string[]} - The mappings required
	 * @returns {Mapping[]}
	 */
	function getMappingsForTable(tableId, mappings, refNames) {
		const mapping = _getFieldsInTable(tableId, mappings)
		return (refNames === null || refNames === void 0 ? void 0 : refNames.length)
			? mapping.filter((map) => refNames.includes(map.refName))
			: mapping
	}
	/** Selects a table from the current base
	 * @param base {Base} - The global base object
	 * @param tableId {string} - The table you want to select
	 */
	function selectTable(base, tableId) {
		return base.getTable(tableId)
	}
	/** Select a view from the current base
	 * @param base {Base} - Global Base Object
	 * @param tableId {string} - The Table the view is in
	 * @param viewIdOrName {string} - The view you want
	 * @returns {View}
	 */
	function selectView(base, tableId, viewIdOrName) {
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
	function selectField(base, tableId, fieldId) {
		const table = this.selectTable(base, tableId)
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
	function convertRecordFieldsToIds(tableId, fields, mappings, options) {
		/** Validates and returns a value for a string field */
		function handleString(value) {
			if (typeof value === 'string') return value ? value : ''
			if (value.toString) return value.toString()
			return String(value)
		}
		/** Validates and returns a value for a Date / DateTime field type */
		function handleDateTime(value, includesTime) {
			/** Date Time Fields */
			let convertedValue
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
		function handleSelects(value, multi, opts) {
			if (!multi && Array.isArray(value))
				throw new Error(`Single Selects can not be arrays`)
			if (multi && !Array.isArray(value))
				throw new Error(
					`Multi Selects must be an array with either an ID or Name`
				)
			if (multi) {
				value = value
				if (typeof value[0] === 'string') {
					// List of String
					return value.filter((val) => val).map((val) => ({ name: val }))
				} else {
					return value
						.filter((val) => val && (val.name || val.id))
						.map((r) => (r.id ? { id: r.id } : { name: r.name }))
				}
			} else {
				return typeof value === 'string'
					? { name: value }
					: value.id
					? { id: value.id }
					: { name: value.name }
			}
		}
		function handleAttachment(values) {
			if (!(values === null || values === void 0 ? void 0 : values.length))
				throw new Error('Attchements array is empty')
			return values.map((value) => {
				if (!value.url)
					throw new Error('Invalid Attachment. Missing URL or FileName')
				return value
			})
		}
		const _mappings = _getFieldsInTable(tableId, mappings)
		let newRecord
		try {
			/** Builds an object with the key being the field id and value the cell value */
			newRecord = _mappings.reduce((acc, map) => {
				let key, value
				key = (
					options === null || options === void 0 ? void 0 : options.useFieldId
				)
					? map.fieldId
					: map.refName
				/** Check  for empty values */
				if (fields[key] === null || fields[key] === undefined) {
					if (
						fields[key] === undefined &&
						(options === null || options === void 0
							? void 0
							: options.fieldsOnly)
					)
						return acc
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
						acc[map.fieldId] = handleString(fields[key])
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
						acc[map.fieldId] = handleDateTime(fields[key], false)
						break
					case fieldTypes.DATE_TIME:
						acc[map.fieldId] = handleDateTime(fields[key], true)
						break
					case fieldTypes.MULTIPLE_RECORD_LINKS:
						if (!Array.isArray(fields[key]))
							throw new Error(key + ' is required to be an array')
						value = fields[key]
						if (typeof value[0] === 'string') {
							throw new Error('Multi Options are required to be an object')
						} else {
							value = fields[key]
							acc[map.fieldId] = value.map((r) => ({ id: r.id }))
						}
						break
					case fieldTypes.SINGLE_COLLABORATOR:
					case fieldTypes.SINGLE_SELECT:
						acc[map.fieldId] = handleSelects(fields[key], false)
						break
					case fieldTypes.MULTIPLE_SELECTS:
						acc[map.fieldId] = handleSelects(fields[key], true)
						break
					case fieldTypes.MULTIPLE_ATTACHMENTS:
						acc[map.fieldId] = handleAttachment(fields[key])
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
	function convertRecordFieldsToNames(tableId, records, mappings, fields, opts) {
		if (!records || !records.length) return null
		const key = opts && opts.useIds ? 'fieldId' : 'refName'
		if (!fields || !fields.length) fields = _getFieldsInTable(tableId, mappings)
		return records.map((rec) => {
			if (!rec) throw new Error('Records Array has invalid items')
			const fieldValues = {}
			fields.forEach((f) => {
				let value = rec.getCellValue(f.fieldId)
				if (value === null || value === undefined)
					return (fieldValues[f[key]] = null)
				switch (f.fieldType) {
					case fieldTypes.NUMBER:
						fieldValues[f[key]] = !isNaN(Number(value))
							? value
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
	function selectTableAndRecords(base, tableIdOrName, fields, sorts, color) {
		return __awaiter(this, void 0, void 0, function* () {
			const table = this.selectTable(base, tableIdOrName)
			if (!table)
				throw new Error(
					`Table ID ${tableIdOrName} is not valid in base ${base.name}`
				)
			return yield _selectAndLoadRecords(table, fields, sorts, color)
		})
	}
	/** Creates records
	 * @param base {Base} - Global Base Object
	 * @param tableId {string} - The table's id where the records will be created
	 * @param records {Object[]} - Converted records to be created
	 * @param records.fields {unknown}
	 * @returns {Promise<string[]>}
	 */
	function createRecords(base, tableId, records) {
		const table = this.selectTable(base, tableId)
		return _throttleTableUsage(records, (r) =>
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
	function createErrorRecord(
		base,
		tableId,
		errorName,
		errorType,
		errorMessage,
		mappings
	) {
		return __awaiter(this, void 0, void 0, function* () {
			const record = this.convertRecordFieldsToIds(
				tableId,
				{
					name: errorName,
					errorType,
					errorMessage,
				},
				mappings
			)
			yield this.createRecords(base, tableId, [{ fields: record }])
		})
	}
	/** Updates records in a table
	 * @param base {Base} - Global Base Object
	 * @param tableId {string} - The table's id where the records will be created
	 * @param updates {{ id: string, fields: unknown }[]} - Converted records to be updated. include record id
	 * @returns {Promise<void>}
	 */
	function updateRecords(base, tableId, updates) {
		return __awaiter(this, void 0, void 0, function* () {
			const table = this.selectTable(base, tableId)
			yield _throttleTableUsage(updates, (r) => table.updateRecordsAsync(r))
		})
	}
	/** Removes records in a table
	 * @param base {Base} - Global Base Object
	 * @param tableId {string} - The table's id where the records will be created
	 * @param recordsIds {string[]} - String of ids of the records that will be removed
	 * @returns {Promise<void>}
	 */
	function removeRecords(base, tableId, recordsIds) {
		const table = this.selectTable(base, tableId)
		return _throttleTableUsage(recordsIds, (r) => table.deleteRecordsAsync(r))
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
	const AirtableUtils = {
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
	const customFetch = {
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
		_applyHeaders: function (baseId) {
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
		_createQueryPramas: function (urlParams) {
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
		_fetch: function (path, method, payload, opts) {
			return __awaiter(this, void 0, void 0, function* () {
				let result = null
				try {
					const res = yield fetch(
						`${this.baseUrl}v${this.airtableVersion}/${path}`,
						{
							headers: this._applyHeaders(
								opts === null || opts === void 0 ? void 0 : opts.baseId
							),
							method: method,
							body: payload ? JSON.stringify(payload) : null,
						}
					)
					if (!res.ok)
						throw new Error(
							`Fetch Error: ${res.statusText} - ${res.status.toString()}`
						)
					result = yield res.json()
				} catch (error) {
					console.error(error.message)
					throw new Error('Fetch Error')
				}
				return result
			})
		},
		/** Throttles updates to a remote base to meet write operation restrictions
		 * @param this {FetchObject}
		 * @param path {string}
		 * @param method {string}
		 * @param payload {Object}
		 * @param [opts] {FetchOptions}
		 */
		_throttleRequests: function (path, method, payload, opts) {
			return __awaiter(this, void 0, void 0, function* () {
				let results = []
				while (payload.length > 0) {
					const round = payload[0]
					let response = yield this._fetch(path, method, round, opts)
					if (response) results = [...results, ...response.records]
					payload.splice(0, 1)
				}
				return results
			})
		},
		_doUpdateRequest: function (baseId, tableId, method, payload, opts) {
			return __awaiter(this, void 0, void 0, function* () {
				let results = []
				if (payload) {
					//payload = Array.isArray(payload) ? payload : [payload]
					const _payload = []
					payload.forEach((item, i) => {
						/** Group every 10 records */
						const index = Math.floor(i % 10)
						if (!_payload[index]) {
							_payload.push({ records: [item] })
						} else {
							_payload[index].records.push(item)
						}
					})
					const result = yield this._throttleRequests(
						`${baseId}/${tableId}`,
						method,
						_payload,
						opts
					)
					results.push(...result)
				} else {
					const result = yield this._fetch(
						`${baseId}/${tableId}`,
						method,
						null,
						opts
					)
					results.push(result)
				}
				return results
			})
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
		_convertRemoteRecordFieldsToIds: function (tableId, fields, mappings, options) {
			/** Validates and returns a value for a string field */
			function handleString(value) {
				if (typeof value === 'string') return value ? value : ''
				if (value.toString) return value.toString()
				return String(value)
			}
			/** Validates and returns a value for a Date / DateTime field type */
			function handleDateTime(value, includesTime) {
				/** Date Time Fields */
				let convertedValue
				if (includesTime) {
					convertedValue = getFormatedDateTime(value, { asISOString: true })
				} else {
					convertedValue = getFormatedDate(value)
				}
				return convertedValue
			}
			const _mappings = _getFieldsInTable(tableId, mappings)
			let newRecord /** Builds an object with the key being the field id and value the cell value */
			newRecord = _mappings.reduce((acc, map) => {
				let key, value
				key = (
					options === null || options === void 0 ? void 0 : options.useFieldId
				)
					? map.fieldId
					: map.refName
				/** Check  for empty values */
				if (fields[key] === null || fields[key] === undefined) {
					if (
						fields[key] === undefined &&
						(options === null || options === void 0
							? void 0
							: options.fieldsOnly)
					)
						return acc
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
							acc[map.fieldId] = handleString(fields[key])
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
							acc[map.fieldId] = handleDateTime(fields[key], false)
							break
						case fieldTypes.DATE_TIME:
							acc[map.fieldId] = handleDateTime(fields[key], true)
							break
						case fieldTypes.MULTIPLE_RECORD_LINKS:
							if (!Array.isArray(fields[key]))
								throw new Error(key + ' is required to be an array')
							value = fields[key]
							if (typeof value[0] === 'string') {
								throw new Error(
									'Multi Options are required to be an object'
								)
							} else {
								acc[map.fieldId] = fields[key]
							}
							break
						case fieldTypes.SINGLE_COLLABORATOR:
						case fieldTypes.SINGLE_SELECT:
							acc[map.fieldId] = fields[key]
							break
						case fieldTypes.MULTIPLE_SELECTS:
							acc[map.fieldId] = fields[key]
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
		_convertRemoteRecordFieldsToNames: function (tableId, records, mappings, opts) {
			if (!records || !records.length) return null
			if (!mappings) throw new Error('Cannot convert remote records. No mappings.')
			const key = opts && opts.useIds ? 'fieldId' : 'refName'
			const fields = _getFieldsInTable(tableId, mappings)
			return records.map((rec) => {
				if (!rec) throw new Error('Records Array has invalid items')
				const fieldValues = {}
				fields.forEach((f) => {
					let value = rec.fields[f.fieldName]
					if (value === null || value === undefined)
						return (fieldValues[f[key]] = null)
					switch (f.fieldType) {
						case fieldTypes.NUMBER:
							fieldValues[f[key]] = !isNaN(Number(value))
								? value
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
					name: rec.fields[Object.keys(rec.fields)[0]],
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
		get: function (baseId, tableId, urlParams) {
			return __awaiter(this, void 0, void 0, function* () {
				let results = [],
					offset = ''
				while (offset !== null) {
					const queryParams = this._createQueryPramas({
						view:
							urlParams === null || urlParams === void 0
								? void 0
								: urlParams.view,
						fields:
							urlParams === null || urlParams === void 0
								? void 0
								: urlParams.fields,
						filterByFormula:
							urlParams === null || urlParams === void 0
								? void 0
								: urlParams.filter,
					})
					const response = yield this._fetch(
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
			})
		},
		/** Creates and sends a post request with optional body data
		 * @param this {FetchObject}
		 * @param baseId {string}
		 * @param tableId {string}
		 * @param payload {Object}
		 * @param [opts] {FetchOptions}
		 * @returns {Promise<CustomRecord[]>}
		 */
		post: function (baseId, tableId, payload, opts) {
			return __awaiter(this, void 0, void 0, function* () {
				return yield this._doUpdateRequest(baseId, tableId, 'POST', payload, opts)
			})
		},
		/** Creates and sends a post request with optional body data
		 * @param this {FetchObject}
		 * @param baseId {string}
		 * @param tableId {string}
		 * @param payload {Object}
		 * @param [opts] {FetchOptions}
		 * @returns {Promise<CustomRecord[]>}
		 */
		patch: function (baseId, tableId, payload, opts) {
			return __awaiter(this, void 0, void 0, function* () {
				return yield this._doUpdateRequest(
					baseId,
					tableId,
					'PATCH',
					payload,
					opts
				)
			})
		},
		/** Creates and sends a post request with optional body data
		 * @param this {FetchObject}
		 * @param baseId {string}
		 * @param tableId {string}
		 * @param payload {Object}
		 * @param [opts] {FetchOptions}
		 * @returns {Promise<CustomRecord[]>}
		 */
		put: function (baseId, tableId, payload, opts) {
			return __awaiter(this, void 0, void 0, function* () {
				return yield this._doUpdateRequest(baseId, tableId, 'PUT', payload, opts)
			})
		},
		/** Creates and sends a post request with optional body data
		 * @param this {FetchObject}
		 * @param baseId {string}
		 * @param tableId {string}
		 * @param payload {Object}
		 * @param [opts] {FetchOptions}
		 * @returns {Promise<{ id: string, deleted: boolean }[]>}
		 */
		delete: function (baseId, tableId, payload, opts) {
			return __awaiter(this, void 0, void 0, function* () {
				let results = []
				while (payload.length !== 0) {
					let delRecs = '?'
					payload.splice(0, 10).forEach((id) => (delRecs += `records[]=${id}&`))
					const result = yield this._fetch(
						`${baseId}/${tableId}${delRecs}`,
						'DELETE'
					)
					results.push(...result)
				}
				return results
			})
		},
	}
	/** Creates a Table in a Base
	 * @param tableData {NewTableData[]}
	 * @returns {Promise<void>}
	 */
	function createRemoteTable(tableData) {
		return new Promise((resolve, reject) =>
			__awaiter(this, void 0, void 0, function* () {
				let errors = []
				for (let i = 0; i < tableData.length; i++) {
					const data = tableData[i]
					try {
						if (!data.baseId || !data.name)
							throw new Error('Base ID and Table Name Requried')
						yield customFetch._fetch(
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
		)
	}
	/** Gets all the records from a remote base's specified table
	 * @param baseId {string}
	 * @param tableId {string}
	 * @param mappings {Mappings}
	 * @param [urlParams] {UrlParams}
	 * @return {Promise<CustomRecord[]>}
	 */
	function getRemoteRecords(baseId, tableId, mappings, urlParams) {
		return __awaiter(this, void 0, void 0, function* () {
			const records = yield customFetch.get(baseId, tableId, urlParams)
			return customFetch._convertRemoteRecordFieldsToNames(
				tableId,
				records,
				mappings
			)
		})
	}
	/** Gets all the records from a remote base's specified table
	 * @param baseId {string}
	 * @param tableId {string}
	 * @param fields {any}
	 * @param mappings {Mappings}
	 * @param [options] {ConversionOptions}
	 * @return {Promise<CustomRecord[]>}
	 */
	function createRemoteRecords(baseId, tableId, fields, mappings, options) {
		return __awaiter(this, void 0, void 0, function* () {
			if (!Array.isArray(fields)) fields = [fields]
			const newRecords = fields.map((field) => ({
				fields: customFetch._convertRemoteRecordFieldsToIds(
					tableId,
					field,
					mappings,
					options
				),
			}))
			const results = yield customFetch.post(baseId, tableId, newRecords)
			return customFetch._convertRemoteRecordFieldsToNames(
				tableId,
				results,
				mappings
			)
		})
	}
	/** Gets all the records from a remote base's specified table
	 * @param baseId {string}
	 * @param tableId {string}
	 * @param records {{ id: string, fields: unknown }[]}
	 * @param mappings {Mappings}
	 * @param [options] {ConversionOptions}
	 * @return {Promise<CustomRecord[]>}
	 */
	function updateRemoteRecords(baseId, tableId, records, mappings, options) {
		return __awaiter(this, void 0, void 0, function* () {
			const updates = records.map((rec) => ({
				id: rec.id,
				fields: customFetch._convertRemoteRecordFieldsToIds(
					tableId,
					rec.fields,
					mappings,
					options
				),
			}))
			const results = yield customFetch.patch(baseId, tableId, updates)
			return customFetch._convertRemoteRecordFieldsToNames(
				tableId,
				results,
				mappings
			)
		})
	}
	/** Gets all the records from a remote base's specified table
	 * @param baseId {string}
	 * @param tableId {string}
	 * @param records {string[]}
	 * @return {Promise<{ id: string, deleted: boolean }[]>}
	 */
	function deleteRemoteRecords(baseId, tableId, records) {
		return customFetch.delete(baseId, tableId, records)
	}
	const RemoteConnection = {
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
