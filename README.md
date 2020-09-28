# Airtable Scripting Blocks Boilerplate

This boilerplate code is designed to be used with Mappings produced from the [Airtable Mapping App](https://github.com/chrisryanouellette/airtable_mapper).

# Setup

### Mappings Setup

The first thing you will need to use the Scripting Block Boilerplate are some Mappings. Mappings are a JSON object that tells the script how to convert field ids or names to usable reference names. A field with the name `Request Status` can be mapped to a reference name `reqStatus`. This allows us to access the fields in more convenient way compared to the native `getCellValue(['Request Status'])` or with `fields['Request Status']`.

Mappings require a definition JSON object. This object tells the Mapping App what bases, tables, and fields you will need to create the Mapping. Here is the format of a Mapping definition object.

```json
/** Mapping Definiton Example */
{
	"bases": ["base-name-one"],
	"tables": ["some-table-name", "some-other-table-name"],
	"fields": ["field-name-one", "field-name-two"]
}
```

When records are converted, their properties will be accessible via the field name it was mapped to. The field names will be modified by removing the `-` and camel casing the field name.

> `field-name-one` becomes `fieldNameOne`

Once the Mapping App has provided you with your Mappings, you can copy them into the Scripting App and deconstruct the object like so.

```js
const { bases, tables, mappings } = {
	bases: {
		/** Your mapping bases */
	},
	tables: {
		/** Your mapping tables */
	},
	mappings: {
		/** Your mappings */
	},
}
```

Once you have the Mappings setup and in the Scripting App, you can copy the contents of `./dist/index.js` file into the Scripting App.

# Usage

Please ensure you have read the previous section and have you Mappings created and in the Scripting App before trying to use any of the boilerplate code.

## Loading Records

Loading local records can be done is two simple lines.

```js
/** Scripting blocks have top level await enabled
 * No need to wrap anything in an async iife
 */
const result = await AirtableUtils.selectTableAndRecords(base, tables['some-table-name'])
const records = AirtableUtils.convertRecordFieldsToNames(
	tables['some-table-name'],
	result.records,
	mappings
)

/** Using the records **/
const record = records[0]
console.log(record.id)
console.log(record.name)
console.log(record.tableId)
console.log(record.fields)
console.log(record.fields.someValue)
```

Remote bases work very similarly. You just need to additionally provide the baseId.

```js
const remoteRecords = await RemoteConnection.getRecords(
	bases['some-base'],
	tables['some-table-name'],
	mappings
)

/** Remote records are converted for you */
console.log(remoteRecords[0].fields.someValue)
```

## Creating Records

Create a record can be done like so.

```js
const newRecord = {
	fieldOne: 'valueOne',
	fieldTwo: 'valueTwo',
	fieldThree: 'valueThree',
}

await AirtableUtils.createRecords(base, tables['some-table-name'], [
	{
		fields: AirtableUtils.convertRecordFieldsToIds(
			tables['some-table-name'],
			newRecord,
			mappings
		),
	},
])
```

Remote bases work very similarly.

```js
const newRecord = {
	fieldOne: 'valueOne',
	fieldTwo: 'valueTwo',
	fieldThree: 'valueThree',
}

await RemoteConnection.createRecords(
	bases['some-base'],
	tables['some-table-name'],
	[
		{
			fields: AirtableUtils.convertRecordFieldsToIds(
				tables['some-table-name'],
				newRecord,
				mappings
			),
		},
	],
	mappings
)
```

## Updating Records

Updating record can be done like so.

```js
await AirtableUtils.updateRecords(base, tables['some-table-name'], [
	{
		id: 'some-record-id',
		fields: AirtableUtils.convertRecordFieldsToIds(
			tables['some-table-name'],
			{ updatedFieldOne: 'New Value', updatedFieldTwo: 'New Value' },
			mappings
		),
	},
])
```

Here is an example with remote records.

```js
await RemoteConnection.updateRemoteRecords(
	bases['some-base'],
	tables['some-table-name'],
	[
		{
			id: 'some-record-id',
			fields: AirtableUtils.convertRecordFieldsToIds(
				tables['some-table-name'],
				newRecord,
				mappings
			),
		},
	],
	mappings
)
```

## Deleting Records

Updating record can be done like so.

```js
await AirtableUtils.removeRecords(base, tables['some-table-name'], [
	'some-record-id',
	'some-other-record-id',
])
```

Here is an example with remote records.

```js
await RemoteConnection.removeRecords(bases['some-base'], tables['some-table-name'], [
	'some-record-id',
	'some-other-record-id',
])
```
