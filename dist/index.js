/** Boilerplate for Scripting Apps
 * @param [APIKEY] {string}
 */
const { Converter, AirtableUtils, RemoteConnection } = (function (APIKEY) {
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
				step(
					(generator = generator.apply(
						thisArg,
						_arguments || []
					)).next()
				)
			})
		}
	/** Airtable Scripting Block Utitilies
	 * VERSION: 0.0.2
	 */
	/** Mappings Type Deffinitions
	 * @typedef Mappings {any}
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
	/**
	 * @typedef Methods {Object}
	 * @property get {string} - GET
	 * @property post {string} - POST
	 * @property patch {string} - PATCH
	 * @property put {string} - PUT
	 * @property delete {string} - DELETE
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
	/** Formated a date for Airtable's Date Field
	 * @param [date] {string | Date} - The date to be converted
	 * @returns {string}
	 */
	function getFormatedDate(date) {
		let _date
		if (typeof date === 'string') {
			_date = new Date(date)
		} else if (date) {
			_date = date
		} else if (!date) {
			_date = new Date()
		}
		if (isNaN(Number(_date.getTime())))
			throw new Error(`ERROR: Invalid date ${date}`)
		return `${_date.getMonth()}-${_date.getDate()}-${_date.getFullYear()}`
	}
	/** @param [time] {string | Date} - The Time to be converted
	 * 	@param [opts] {{military: boolean}} - Should be returned in military time
	 * @returns {string}
	 */
	function getFormatedTime(time, opts) {
		let _time
		if (typeof time === 'string') {
			time = time.toLowerCase()
			if (time.includes('am') || time.includes('pm')) {
				time =
					time.substring(0, time.indexOf(':') + 3) +
					' ' +
					time.slice(-2)
			}
			_time = new Date('01/01/1970 ' + time)
		} else if (time) {
			_time = time
		} else if (!time) {
			_time = new Date()
		}
		if (isNaN(Number(_time.getTime())))
			throw new Error(`ERROR: Invalid date ${time}`)
		const hour = _time.getHours()
		const minute = _time.getMinutes()
		return (opts === null || opts === void 0 ? void 0 : opts.military)
			? `${hour}:${minute}`
			: `${hour <= 12 ? hour : hour - 12}:${minute} ${
					hour < 12 ? 'AM' : 'PM'
			  }`
	}
	/** Returns a date in ISO format
	 * @param [date] {string | Date}
	 * @returns {string}
	 */
	function getISOFormattedDate(date) {
		const _date = this.getFormatedDate(date)
		return new Date(_date + ' 00:00:00').toISOString()
	}
	/** Returns a date in ISO format
	 * @param [date] {string | Date}
	 * @param [time] {string | Date}
	 * @returns {string}
	 */
	function getISOFormattedDateTime(date, time) {
		const _date = this.getFormatedDate(date)
		const _time = this.getFormatedTime(time, { military: true })
		return new Date(`${_date} ${_time}`).toISOString()
	}
	const Converter = {
		getFormatedDate,
		getFormatedTime,
		getISOFormattedDate,
		getISOFormattedDateTime,
	}
	function _formatKey(key) {
		return key
			.split('-')
			.map((word, i) =>
				i !== 0
					? word.substring(0, 1).toUpperCase() + word.substring(1)
					: word
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
	 * @param viewId {string} - The view you want
	 */
	function selectView(base, tableId, viewId) {
		const table = this.selectTable(base, tableId)
		return table.getView(viewId)
	}
	/** Selects a field from a table
	 * @param base {base} - The global base object
	 * @param tableId {string} - The Table's ID
	 * @param fieldId {string} - The fields ID
	 */
	function selectField(base, tableId, fieldId) {
		const table = this.selectTable(base, tableId)
		if (table === null)
			throw new Error(
				`Table Id ${tableId} does not excist in base ${base.name}`
			)
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
				if (typeof value === 'string' && value.includes(' ')) {
					// User entered date time
					const [date, time] = value.split(' ')
					convertedValue = this.onverter.getISOFormattedDateTime(
						date,
						time
					)
				} else {
					// Pre-formated date time
					convertedValue = this.onverter.getISOFormattedDateTime(
						value,
						value
					)
				}
			} else {
				convertedValue = this.onverter.getISOFormattedDate(value)
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
					return value
						.filter((val) => val)
						.map((val) => ({ name: val }))
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
		const _mappings = _getFieldsInTable(tableId, mappings)
		let newRecord
		try {
			/** Builds an object with the key being the field id and value the cell value */
			newRecord = _mappings.reduce((acc, map) => {
				let key, value
				key = (
					options === null || options === void 0
						? void 0
						: options.useFieldId
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
					if (map.fieldType == this.fieldTypes.CREATED_TIME)
						return acc
					if (!options || !options.noNull) acc[map.fieldId] = null
					return acc
				}
				switch (map.fieldType) {
					case this.fieldTypes.EMAIL:
					case this.fieldTypes.URL:
					case this.fieldTypes.MULTILINE_TEXT:
					case this.fieldTypes.SINGLE_LINE_TEXT:
					case this.fieldTypes.PHONE_NUMBER:
					case this.fieldTypes.RICH_TEXT:
						acc[map.fieldId] = handleString(fields[key])
						break
					case this.fieldTypes.NUMBER:
						acc[map.fieldId] = Number(fields[key])
						break
					case this.fieldTypes.CHECKBOX:
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
					case this.fieldTypes.DATE:
						acc[map.fieldId] = handleDateTime(fields[key], false)
						break
					case this.fieldTypes.DATE_TIME:
						acc[map.fieldId] = handleDateTime(fields[key], true)
						break
					case this.fieldTypes.MULTIPLE_RECORD_LINKS:
						if (!Array.isArray(fields[key]))
							throw new Error(key + ' is required to be an array')
						value = fields[key]
						if (typeof value[0] === 'string') {
							throw new Error(
								'Multi Options are required to be an object'
							)
						} else {
							value = fields[key]
							acc[map.fieldId] = value.map((r) => ({ id: r.id }))
						}
						break
					case this.fieldTypes.SINGLE_COLLABORATOR:
					case this.fieldTypes.SINGLE_SELECT:
						value = fields[key]
						acc[map.fieldId] = handleSelects(value, false)
						break
					case this.fieldTypes.MULTIPLE_SELECTS:
						acc[map.fieldId] = handleSelects(fields[key], true)
						break
					case this.fieldTypes.CREATED_TIME: // Acceptions
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
	function convertRecordFieldsToNames(
		tableId,
		records,
		mappings,
		fields,
		opts
	) {
		if (!records || !records.length) return null
		const key = opts && opts.useIds ? 'fieldId' : 'refName'
		if (!fields || !fields.length)
			fields = _getFieldsInTable(tableId, mappings)
		return records.map((rec) => {
			if (!rec) throw new Error('Records Array has invalid items')
			const fieldValues = {}
			fields.forEach((f) => {
				let value = rec.getCellValue(f.fieldId)
				if (value === null || value === undefined)
					return (fieldValues[f[key]] = null)
				switch (f.fieldType) {
					case this.fieldTypes.NUMBER:
						fieldValues[f[key]] = !isNaN(Number(value))
							? value
							: Number(value)
						break
					case this.fieldTypes.RICH_TEXT:
						fieldValues[f[key]] = value
						break
					case this.fieldTypes.CHECKBOX:
						fieldValues[f[key]] = value
						break
					case this.fieldTypes.SINGLE_SELECT:
					case this.fieldTypes.SINGLE_COLLABORATOR:
						fieldValues[f[key]] = value
						break
					case this.fieldTypes.MULTIPLE_RECORD_LINKS:
					case this.fieldTypes.MULTIPLE_SELECTS:
						fieldValues[f[key]] = Array.isArray(value)
							? value
							: [value]
						break
					default:
						fieldValues[f[key]] = rec.getCellValueAsString(
							f.fieldId
						)
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
	 * @param [sorts] {Object} - How to sort the returned records
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
	 * @param records {Object} - Converted records to be created
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
			yield _throttleTableUsage(updates, (r) =>
				table.updateRecordsAsync(r)
			)
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
		return _throttleTableUsage(recordsIds, (r) =>
			table.deleteRecordsAsync(r)
		)
	}
	const AirtableUtils = {
		fieldTypes: {
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
		},
		selectTable,
		selectView,
		selectField,
		convertRecordFieldsToIds,
		convertRecordFieldsToNames,
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
				throw new Error(
					'ERROR: Unable to make Remote Request. No API Key'
				)
			const headers = new Headers()
			headers.append('Accept', 'application/json')
			headers.append('Content-Type', 'application/json')
			headers.append('authorization', 'Bearer ' + this.apiKey)
			headers.append('x-airtable-user-agent', this.userAgent)
			// headers.append('x-api-version', this.packageVersion)
			baseId && headers.append('x-airtable-application-id', baseId)
			return headers
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
								opts === null || opts === void 0
									? void 0
									: opts.baseId
							),
							method: method,
							body: payload ? JSON.stringify(payload) : null,
						}
					)
					if (!res.ok)
						throw new Error(
							`Fetch Error: ${
								res.statusText
							} - ${res.status.toString()}`
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
					if (response) results = [...results, response]
					payload.splice(0, 1)
				}
				return results
			})
		},
		_doUpdateRequest: function (baseId, tableId, method, payload, opts) {
			return __awaiter(this, void 0, void 0, function* () {
				let results = []
				if (payload) {
					payload = Array.isArray(payload) ? payload : [payload]
					const result = yield this._throttleRequests(
						`${baseId}/${tableId}`,
						method,
						payload,
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
		_convertRemoteRecords: function (tableId, records, mappings, opts) {
			if (!records || !records.length) return null
			if (!mappings)
				throw new Error('Cannot convert remote records. No mappings.')
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
						case this.fieldTypes.NUMBER:
							fieldValues[f[key]] = !isNaN(Number(value))
								? value
								: Number(value)
							break
						case this.fieldTypes.CHECKBOX:
						case this.fieldTypes.RICH_TEXT:
						case this.fieldTypes.SINGLE_SELECT:
						case this.fieldTypes.SINGLE_COLLABORATOR:
							fieldValues[f[key]] = value
							break
						case this.fieldTypes.MULTIPLE_RECORD_LINKS:
						case this.fieldTypes.MULTIPLE_SELECTS:
							fieldValues[f[key]] = Array.isArray(value)
								? value
								: [value]
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
		 * @param viewId {string}
		 * @param opts {FetchOptions}
		 * @returns {RemoteRecord[]}
		 */
		get: function (baseId, tableId, viewId) {
			return __awaiter(this, void 0, void 0, function* () {
				let results = [],
					offset = ''
				while (offset !== null) {
					const response = yield this._fetch(
						`${baseId}/${tableId}?${
							viewId ? `view=${viewId}&` : ''
						}${offset ? 'offset=' + offset : ''}`,
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
				return yield this._doUpdateRequest(
					baseId,
					tableId,
					'POST',
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
				return yield this._doUpdateRequest(
					baseId,
					tableId,
					'PUT',
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
		 * @returns {Promise<{ id: string, deleted: boolean }[]>}
		 */
		delete: function (baseId, tableId, payload, opts) {
			return __awaiter(this, void 0, void 0, function* () {
				let results = []
				while (payload.length !== 0) {
					let delRecs = '?'
					payload
						.splice(0, 10)
						.forEach((id) => (delRecs += `records[]=${id}&`))
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
	/** Gets all the records from a remote base's specified table
	 * @param baseId {string}
	 * @param tableId {string}
	 * @param mappings {Mappings}
	 * @param [view] {string}
	 * @param [fields] {string[]}
	 * @return {Promise<CustomRecord[]>}
	 */
	function getRemoteRecords(baseId, tableId, mappings, view, fields) {
		return __awaiter(this, void 0, void 0, function* () {
			const records = yield customFetch.get(baseId, tableId, view)
			return customFetch._convertRemoteRecords(tableId, records, mappings)
		})
	}
	/** Gets all the records from a remote base's specified table
	 * @param baseId {string}
	 * @param tableId {string}
	 * @param fields {any}
	 * @param mappings {Mappings}
	 * @return {Promise<CustomRecord[]>}
	 */
	function createRemoteRecords(baseId, tableId, fields, mappings) {
		return __awaiter(this, void 0, void 0, function* () {
			const results = yield customFetch.post(baseId, tableId, fields)
			return customFetch._convertRemoteRecords(tableId, results, mappings)
		})
	}
	/** Gets all the records from a remote base's specified table
	 * @param baseId {string}
	 * @param tableId {string}
	 * @param records {{ id: string, fields: unknown }[]}
	 * @param mappings {Mappings}
	 * @return {Promise<CustomRecord[]>}
	 */
	function updateRemoteRecords(baseId, tableId, records, mappings) {
		return __awaiter(this, void 0, void 0, function* () {
			const results = yield customFetch.patch(baseId, tableId, records)
			return customFetch._convertRemoteRecords(tableId, results, mappings)
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
		getRecords: getRemoteRecords,
		createRecords: createRemoteRecords,
		updateRecords: updateRemoteRecords,
		deleteRecords: deleteRemoteRecords,
	}
	return {
		Converter: Converter,
		AirtableUtils: AirtableUtils,
		RemoteConnection: RemoteConnection,
	}
})(APIKEY)
