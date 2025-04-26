import Vue from 'vue'
import Router from 'vue-router'
import HomeView from '../pages/index.vue'
import MapView from '../pages/map.vue'
import PersonView from '../pages/person.vue'

Vue.use(Router)

export default new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
    {
        path: '/',
        name: 'home',
        component: HomeView
    },
    {
        path: '/map',
        name: 'map',
        component: MapView
    },
    {
        path: '/person',
        name: 'person',
        component: PersonView
    }
    ]
})