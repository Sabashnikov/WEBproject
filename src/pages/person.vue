<template>
    <div class="person-view">
        <header>
        <div class="header">
            <h1 class="titlehead">В поход!</h1>
            <img :src="require('@/assets/logo.jpg')" class="logoimage">
            <h2 class="person">Личный кабинет</h2>
            <div>
            <button id="planTrip" class="buttonplan">
                <router-link to="/">Главная</router-link>
            </button>
            <button id="personalCabinet" class="buttonlk">
                <router-link to="/map" class="adark">Запланировать поход</router-link>
            </button>
            </div>
        </div>
        <p id="headerLine" class="line"></p>
        </header>

        <main>
        <div class="content">
            <h2 class="zagol">Здесь вы можете отредактировать информацию о запланированных походах</h2>
            <div class="list">
                <ul v-if="personGear.length > 0">
                    <li v-for="(item, index) in personGear" :key="index">
                    {{ item }}
                    </li>
                </ul>
                <p v-else>
                У вас нет запланированных походов. Вы можете добавить их перейдя по кнопке "Запланировать поход".
                </p>
            </div>
        </div>
    </main>

    <footer>
        <p class="footertitle">В поход!</p>
        <div class="link">
            <router-link to="/map" style="color:white">Запланировать поход</router-link> 
            <router-link to="/" style="color:white">Главная</router-link> 
        </div>
        </footer>
    </div>
</template>

<script>
export default {
    name: 'PersonView',
    data() {
    return {
        personGear: [],
        isLoading: false,
        error: null
    }
    },
    methods: {
    async fetchPersonGear() {
        this.isLoading = true;
        this.error = null;
        
        try {
        const response = await fetch('db2.json');
        if (!response.ok) {
            throw new Error('Ошибка загрузки файла');
        }
        
        const data = await response.json();
        const gearData = data.PersonGear[0];
        
        if (gearData) {
            // Фильтруем поля, исключая 'id'
            this.personGear = Object.entries(gearData)
                .filter(([key]) => key !== 'id')
                .map(([, value]) => value);
        } else {
            this.personGear = [];
        }
        } catch (error) {
        console.error('Ошибка:', error);
        this.error = error.message;
        } finally {
        this.isLoading = false;
        }
    }
    },
    mounted() {
        this.fetchPersonGear();
    }
}
</script>

<style scoped>
    @import '@/assets/person.css';
</style>