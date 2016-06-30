import $ from 'jquery'
import {chain, pick, omit, filter, defaults} from 'lodash'

import TmplListGroupItem from '../templates/list-group-item'
import {setContent, slugify, createDatastandardFilters, collapseListGroup} from '../util'

export default class {
  constructor (opts) {
    const coordinators = this._coordinatorsWithCount(opts.datastandards, opts.params)
    const coordinatorsMarkup = coordinators.map(TmplListGroupItem)
    setContent(opts.el, coordinatorsMarkup)
    collapseListGroup(opts.el)
  }

  _coordinatorsWithCount (datastandards, params) {
    return chain(datastandards)
      .groupBy('coordinator')
      .map(function (datastandardsInOrg, coordinator) {
        const filters = createDatastandardFilters(pick(params, ['category']))
        const filteredDatastandards = filter(datastandardsInOrg, filters)
        const orgSlug = slugify(coordinator)
        const selected = params.coordinator && params.coordinator === orgSlug
        const itemParams = selected ? omit(params, 'coordinator') : defaults({coordinator: orgSlug}, params)
        return {
          title: coordinator,
          url: '?' + $.param(itemParams),
          count: filteredDatastandards.length,
          unfilteredCount: datastandardsInOrg.length,
          selected: selected
        }
      })
      .orderBy('unfilteredCount', 'desc')
      .value()
  }
}
