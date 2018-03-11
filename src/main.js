import Vue from 'vue'
import App from './App'
import router from './router'
import './js/common'
import './js/index'
import YunserUI from 'yunser-ui-vue'
import 'yunser-ui-vue/dist/yunser-ui.css'
import './scss/main.scss'
import ui from './components/index'
Vue.use(YunserUI)
Vue.use(ui)
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    template: '<App/>',
    components: {App}
})
