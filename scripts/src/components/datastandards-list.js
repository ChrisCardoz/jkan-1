/**
 * Usage:
 * <div data-component="datastandards-list">
 *   <h3 class="datastandards-count" data-hook="datastandards-count"></h3>
 *   <input type="text" data-hook="search-query" placeholder="Search..." class="form-control">
 *   <div data-hook="datastandards-items"></div>
 * </div>
 *
 * Optionally, add filters to the component element such as
 *   data-coordinator="sample-department"
 *   data-category="education"
 */
import {pick, defaults, filter} from 'lodash'

import TmplDatastandardItem from '../templates/datastandard-item'
import {queryByHook, setContent, createDatastandardFilters} from '../util'

export default class {
  constructor (opts) {
    const elements = {
      datastandardsItems: queryByHook('datastandards-items', opts.el),
      datastandardsCount: queryByHook('datastandards-count', opts.el),
      searchQuery: queryByHook('search-query', opts.el)
    }

    // Filter datastandards and render in items container
    const paramFilters = pick(opts.params, ['coordinator', 'category'])
    const attributeFilters = pick(opts.el.data(), ['coordinator', 'category'])
    const filters = createDatastandardFilters(defaults(paramFilters, attributeFilters))
    const filteredDatastandards = filter(opts.datastandards, filters)
    const datastandardsMarkup = filteredDatastandards.map(TmplDatastandardItem)
    setContent(elements.datastandardsItems, datastandardsMarkup)

    // // Datastandard count
    const datastandardsCountMarkup = filteredDatastandards.length + ' datastandards'
    setContent(elements.datastandardsCount, datastandardsCountMarkup)

    // Search datastandards listener
    const searchFunction = this._createSearchFunction(filteredDatastandards)
    elements.searchQuery.on('keyup', (e) => {
      const query = e.currentTarget.value

      // Datastandards
      const results = searchFunction(query)
      const resultsMarkup = results.map(TmplDatastandardItem)
      setContent(elements.datastandardsItems, resultsMarkup)

      // Datastandard count
      const resultsCountMarkup = results.length + ' datastandards'
      setContent(elements.datastandardsCount, resultsCountMarkup)
    })
  }

  // Returns a function that can be used to search an array of datastandards
  // The function returns the filtered array of datastandards
  _createSearchFunction (datastandards) {
    const keys = ['title', 'notes']
    return function (query) {
      const lowerCaseQuery = query.toLowerCase()
      return filter(datastandards, function (datastandard) {
        return keys.reduce(function (previousValue, key) {
          return previousValue || (datastandard[key] && datastandard[key].toLowerCase().indexOf(lowerCaseQuery) !== -1)
        }, false)
      })
    }
  }
}

