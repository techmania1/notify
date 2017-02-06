// Primary classes
import Vue from 'vue'
import VueRouter from 'vue-router'

// Primary component
import App from './App.vue'
import jQuery from 'jQuery'
window.jQuery = jQuery
window.$ = jQuery;

// Routed components
import Foo from './Foo.vue'
import Bar from './Bar.vue'
import Baz from './Baz.vue'
import NotFound from './NotFound.vue'

Vue.use(VueRouter)

const routes = [{
        path: '/',
        component: App,
        children: [{
                path: '/foo/:id/',
                component: Foo
            },
            {
                path: '/bar',
                component: Bar
            },
            {
                path: '/baz',
                component: Baz
            }
        ]
    },
    {
        path: '/*',
        component: NotFound
    }
]

const router = new VueRouter({
    mode: 'history',
    routes: routes
})

const app = new Vue({
  router,
  data: {}
}).$mount('#app')
