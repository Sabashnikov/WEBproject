<template>
    <div class="map-view">
        <header>
        <div class="header">
            <h1 class="titlehead">В поход!</h1>
            <img :src="require('@/assets/logo.jpg')" class="logoimage">
            <div>
            <button id="planTrip" class="buttonplan">
                <router-link to="/">Главная</router-link>
            </button>
            <button id="personalCabinet" class="buttonlk">
                <router-link to="/person" class="adark">Личный кабинет</router-link>
            </button>
            </div>
        </div>
        <p id="headerLine" class="line"></p>
        </header>

        <main>
        <h1 class="title">Выберите местность для похода</h1>
        <div id="map" ref="mapContainer"></div>
        <div class="content">
            <div class="buttons">
            <button id="get-gear-button" @click="getGearList">Получить список снаряжения</button>
            <form id="add-gear-form" @submit.prevent="addGear">        
                <button class="addbutton" type="submit">Добавить снаряжение</button>
                <input type="text" id="new-gear" v-model="newGear" placeholder="Введите снаряжение" required />
            </form> 
            </div>
            <div class="AllGear">
            <div class="NeedGear">
                <ul id="gear-list">
                <li v-for="item in gearList" :key="item.id" :class="{
                    'header-item': item.type.includes('header'),
                    'necessary-item': item.type.includes('necessary'),
                    'forest-item': item.type.includes('forest'),
                    'user-item': item.type.includes('item')
                }">
                {{ item.text }}
                </li>
                </ul>
            </div>
            </div>
            <button class="savebutton" @click="saveHike">Сохранить поход</button>
        </div>
        </main>

        <footer>
        <p class="footertitle">В поход!</p>
        <div class="link">
            <router-link to="/person" style="color:white">Личный кабинет</router-link> 
            <router-link to="/" style="color:white">Главная</router-link> 
        </div>
        </footer>
    </div>
</template>

<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default {
    name: 'MapView',
    data() {
    return {
        map: null,
        newGear: '',
        gearList: []
    }
    },
    mounted() {
        this.initMap();
    },
    methods: {
    initMap() {
        this.map = L.map(this.$refs.mapContainer).setView([55.7558, 37.6173], 10);
    
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }).addTo(this.map);

        this.map.on('click', this.handleMapClick);
    },

    handleMapClick(e) {
        if (this.marker) {
            this.map.removeLayer(this.marker);
        }
        this.marker = L.marker(e.latlng).addTo(this.map);
        this.marker.bindPopup('Вы выбрали это место').openPopup();
    },

    addGear() {
        if (this.newGear.trim()) {
        // Проверяем, есть ли уже заголовок "Ваше снаряжение:"
        if (!this.gearList.some(item => item.type === 'our-header')) {
            this.gearList.push({
            type: 'our-header',
            text: 'Ваше снаряжение:',
            id: Date.now()
            });
        }
        this.gearList.push({
            type: 'item',
            text: this.newGear.trim(),
            id: Date.now()
        });
        this.newGear = '';
        }
    },

    async getGearList() {
        try {
        const response = await fetch('db.json');
        const data = await response.json();
        // Очищаем список
        this.gearList = [];

      // Добавляем необходимое снаряжение
        this.gearList.push({
            type: 'necessary-header',
            text: 'Необходимое снаряжение:',
            id: Date.now()
        });

        data.Necessary.forEach((item, index) => {
        this.gearList.push({
            type: 'necessary-item',
            text: `${index + 1}. ${item}`,
            id: Date.now() + index
        });
        });

        // Получаем снаряжение для леса
        await this.getGearForForest();
        } catch (error) {
            console.error('Ошибка при загрузке списка снаряжения:', error);
        }
    },

    async getGearForForest() {
    try {
        const response = await fetch('db.json');
        const data = await response.json();
    
        this.gearList.push({
        type: 'forest-header',
        text: 'Полезное снаряжение для леса:',
        id: Date.now()
        });
    
        data.UsefulForest.forEach((item, index) => {
        this.gearList.push({
            type: 'forest-item',
            text: `${index + 1}. ${item}`,
            id: Date.now() + index
        });
        });
    } catch (error) {
        console.error('Ошибка при загрузке списка снаряжения:', error);
    }
    },

    async saveHike() {
    try {
        const response = await fetch('http://localhost:3000/PersonGear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.gearList.map(item => item.text))
        });

        if (!response.ok) {
        throw new Error('Ошибка сервера');
        } 

        const data = await response.json();
        alert('Данные сохранены в личный кабинет');
        console.log('Ответ сервера:', data);
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось сохранить данные');
        }
    }
    },
}
</script>

<style scoped>
    @import '@/assets/mapstyle.css';
</style>