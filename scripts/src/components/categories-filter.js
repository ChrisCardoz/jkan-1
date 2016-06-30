import $ from 'jquery'
import {chain, pick, omit, filter, defaults} from 'lodash'

import TmplListGroupItem from '../templates/list-group-item'
import {setContent, slugify, createDatastandardFilters, collapseListGroup} from '../util'

export default class {
  constructor (opts) {
    const categories = this._categoriesWithCount(opts.datastandards, opts.params)
    const categoriesMarkup = categories.map(TmplListGroupItem)
    setContent(opts.el, categoriesMarkup)
    collapseListGroup(opts.el)
  }

  // Given an array of datastandards, returns an array of their categories with counts
  _categoriesWithCount (datastandards, params) {
    return chain(datastandards)
      .filter('category')
      .flatMap(function (value, index, collection) {
        // Explode objects where category is an array into one object per category
        if (typeof value.category === 'string') return value
        const duplicates = []
        value.category.forEach(function (category) {
          duplicates.push(defaults({category: category}, value))
        })
        return duplicates
      })
      .groupBy('category')
      .map(function (datastandardsInCat, category) {
        const filters = createDatastandardFilters(pick(params, ['coordinator']))
        const filteredDatastandards = filter(datastandardsInCat, filters)
        const categorySlug = slugify(category)
        const selected = params.category && params.category === categorySlug
        const itemParams = selected ? omit(params, 'category') : defaults({category: categorySlug}, params)
        return {
          title: category,
          url: '?' + $.param(itemParams),
          count: filteredDatastandards.length,
          unfilteredCount: datastandardsInCat.length,
          selected: selected
        }
      })
      .orderBy('unfilteredCount', 'desc')
      .value()
  }
}
