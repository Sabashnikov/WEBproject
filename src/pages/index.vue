<template>
    <div class="home">
    <header>
        <div class="header">
        <h1 class="titlehead">В поход!</h1>
        <img src="@/assets/logo.jpg" class="logoimage">
        <div>
            <button id="personalCabinet" class="buttonlk">
            <router-link to="/person" class="adark">Личный кабинет</router-link>
            </button>
            <button id="planTrip" class="buttonplan">
            <router-link to="/map">Запланировать поход</router-link>
            </button>
        </div>
        </div>
        <p id="headerLine" class="line"></p>
    </header>

    <main>
        <h1 class="title">{{ mainTitle }}</h1>
        <div class="container">
        <br>
        <div class="content">
            <p>{{ description }}</p>
            <br>
            <h3 class="section-title" id="section1">1. {{ sections[0].title }}</h3>
            <p>{{ sections[0].content }}</p>
            <br>
            <h3 class="section-title" id="section2">2. {{ sections[1].title }}</h3>
            <p>{{ sections[1].content }}</p>
            <br>
            <button id="startButton" class="buttonbegin" @click="startPlanning">
            <span style="text-decoration: none">Начать</span>
            </button>
        </div> 
        <div>
            <img :src="require('@/assets/main.jpg')" class="mainimage">
        </div>
    </div>

    <div class="routes-container" v-if="showRoutes">
        <h2>Популярные места для походов в области</h2>
        <div class="route-list">
        <div v-for="(route, index) in popularRoutes" :key="index" class="route-item">
            <h3>{{ route.name }}</h3>
            <img :src="require(`@/assets/${route.image}`)" :alt="route.name" class="route-image">
            <p><strong>Сложность:</strong> {{ route.difficulty }}</p>
            <p><strong>Длительность:</strong> {{ route.duration }}</p>
            <button @click="selectRoute(route)" class="selectButton">Выбрать</button>
        </div>
        </div>
    </div>

    <div v-if="selectedRoute" class="selected-route">
        <h3>Вы выбрали: {{ selectedRoute.name }}</h3>
        <p>Теперь вы можете перейти к планированию этого маршрута.</p>
        <button @click="goToPlanning" class="planBut">Перейти к планированию</button>
        <button @click="deselectRoute" class="closeBut">Отмена</button>
    </div>
</main>

    <footer>
        <p class="footertitle">В поход!</p>
        <div class="link">
            <router-link to="/person" style="color:white">Личный кабинет</router-link> 
            <router-link to="/map" style="color:white">Запланировать поход</router-link> 
        </div>
    </footer>
</div>
</template>

<script>
export default {
    name: 'HomeView',
    data() {
    return {
        mainTitle: 'Для всех любителей активного отдыха',
        description: 'Наш сайт поможет вам легко и быстро спланировать идеальный поход! Независимо от того, являетесь ли вы опытным туристом или только начинаете своё путешествие, мы предоставим вам все необходимые инструменты для комфортного и безопасного отдыха на природе.',
        mainImage: 'main.jpg',
        showRoutes: true,
        selectedRoute: null,
        sections: [
        {
            title: 'Выбор местности для похода',
            content: 'С помощью интерактивной карты вы можете выбрать идеальное место для вашего следующего похода. Просто укажите желаемую местность и сайт предложит вам лучшие варианты для вашего приключения.'
        },
        {
            title: 'Автоматическая генерация списка снаряжения',
            content: 'На основе выбранного маршрута и условий похода, система автоматически сгенерирует для вас полный список необходимого снаряжения.'
        }
        ],
        popularRoutes: [
        {
            name: 'Пустынские озера',
            image: 'пустынские-озера.jpg',
            difficulty: 'Средний',
            duration: 'От 3 дней',
            id: 1
        },
        {
            name: 'Керженец',
            image: 'керженец.jpg',
            difficulty: 'Легкий',
            duration: '3 дня',
            id: 2
        },
        {
            name: 'Река Пьяна',
            image: 'пьяна.jpg',
            difficulty: 'Легкий',
            duration: '3 дня',
            id: 3
        }
        ]
    }
    },
    methods: {
    startPlanning() {
        this.$router.push('/map');
    },
    selectRoute(route) {
        this.selectedRoute = route;
        alert("Выбран маршрут: " + this.selectedRoute.name);
    },
    deselectRoute() {
        this.selectedRoute = null;
    },
    goToPlanning() {
        this.selectedRoute = null;
        this.startPlanning();
    }
    }
}
</script>

<style scoped>
    @import '@/assets/style.css';
</style>