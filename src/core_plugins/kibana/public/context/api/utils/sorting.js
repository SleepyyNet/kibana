/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import _ from 'lodash';


/**
 * The list of field names that are allowed for sorting, but not included in
 * index pattern fields.
 *
 * @constant
 * @type {string[]}
 */
const META_FIELD_NAMES = ['_seq_no', '_doc', '_uid'];

/**
 * Returns a field from the intersection of the set of sortable fields in the
 * given index pattern and a given set of candidate field names.
 *
 * @param {IndexPattern} indexPattern - The index pattern to search for
 *     sortable fields
 * @param {string[]} fields - The list of candidate field names
 *
 * @returns {string[]}
 */
function getFirstSortableField(indexPattern, fieldNames) {
  const sortableFields = fieldNames.filter((fieldName) => (
    META_FIELD_NAMES.includes(fieldName)
    || (indexPattern.fields.byName[fieldName] || { sortable: false }).sortable
  ));
  return sortableFields[0];
}

/**
 * A sort directive in object or string form.
 *
 * @typedef {(SortDirectiveString|SortDirectiveObject)} SortDirective
 */

/**
 * A sort directive in object form.
 *
 * @typedef {Object.<FieldName, (SortDirection|SortOptions)>} SortDirectiveObject
 */

/**
 * A sort order string.
 *
 * @typedef {('asc'|'desc')} SortDirection
 */

/**
 * A field name.
 *
 * @typedef {string} FieldName
 */

/**
 * A sort options object
 *
 * @typedef {Object} SortOptions
 * @property {SortDirection} order
 */

/**
 * Return a copy of the directive with the sort direction reversed. If the
 * field name is '_score', it inverts the default sort direction in the same
 * way as Elasticsearch itself.
 *
 * @param {SortDirective} sortDirective - The directive to reverse the
 *     sort direction of
 *
 * @returns {SortDirective}
 */
function reverseSortDirective(sortDirective) {
  if (_.isString(sortDirective)) {
    return {
      [sortDirective]: (sortDirective === '_score' ? 'asc' : 'desc'),
    };
  } else if (_.isPlainObject(sortDirective)) {
    return _.mapValues(sortDirective, reverseSortDirection);
  } else {
    return sortDirective;
  }
}

/**
 * Return the reversed sort direction.
 *
 * @param {(SortDirection|SortOptions)} sortDirection
 *
 * @returns {(SortDirection|SortOptions)}
 */
function reverseSortDirection(sortDirection) {
  if (_.isPlainObject(sortDirection)) {
    return _.assign({}, sortDirection, {
      order: reverseSortDirection(sortDirection.order),
    });
  } else {
    return (sortDirection === 'asc' ? 'desc' : 'asc');
  }
}


export {
  getFirstSortableField,
  reverseSortDirection,
  reverseSortDirective,
};
