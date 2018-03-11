import page from './page'
import template from './template'

export default {
    install: function (Vue) {
        Vue.component('my-page', page)
        Vue.component('my-template', template)
    }
}
