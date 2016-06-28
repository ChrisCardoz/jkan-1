import $ from 'jquery'
import {chain, pick, omit, filter, defaults} from 'lodash'

import TmplListGroupItem from '../templates/list-group-item'
import {setContent, slugify, createDatasetFilters, collapseListGroup} from '../util'

export default class {
  constructor (opts) {
    const coordinators = this._coordinatorsWithCount(opts.datasets, opts.params)
    const coordinatorsMarkup = coordinators.map(TmplListGroupItem)
    setContent(opts.el, coordinatorsMarkup)
    collapseListGroup(opts.el)
  }

  _coordinatorsWithCount (datasets, params) {
    return chain(datasets)
      .groupBy('coordinator')
      .map(function (datasetsInOrg, coordinator) {
        const filters = createDatasetFilters(pick(params, ['category']))
        const filteredDatasets = filter(datasetsInOrg, filters)
        const orgSlug = slugify(coordinator)
        const selected = params.coordinator && params.coordinator === orgSlug
        const itemParams = selected ? omit(params, 'coordinator') : defaults({coordinator: orgSlug}, params)
        return {
          title: coordinator,
          url: '?' + $.param(itemParams),
          count: filteredDatasets.length,
          unfilteredCount: datasetsInOrg.length,
          selected: selected
        }
      })
      .orderBy('unfilteredCount', 'desc')
      .value()
  }
}
