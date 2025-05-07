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
        <div class="map-container">
            <div id="map" ref="mapContainer"></div>
                <div class="map-instructions">
                    <h3>Инструкция по работе с картой:</h3>
                    <ul>
                        <li><img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png" alt="Red marker"> - ваше текущее местоположение</li>
                        <li><img src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png" alt="Blue marker"> - ваш маркер места (появляется при клике на карту)</li>
                        <li><img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png" alt="Yellow marker"> - места для кемпинга (кликните по маркеру для вывода информации)</li>
                    </ul>
                    <p>Выберите свое место на карте или кемпинг, чтобы получить информацию о месте и маршруте.</p>
                    <p>После выбора места вы сможете получить список снаряжения.</p>
                </div>
            </div>
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
                    'mountain-item': item.type.includes('mountain'),
                    'river-item': item.type.includes('river'),
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
        gearList: [],
        marker: null,
        userLocationMarker: null, // Маркер местоположения пользователя
        selectedLocation: null,
        hasForests: false,
        hasMountains: false,
        hasRivers: false,
        locationStatus: null,
        campingMarkers: [], // Для хранения маркеров кемпингов
        ourCoords: { lat: 55.7558, lng: 37.6173 } // Координаты заданного места (Москва)
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
        
        // Загружаем популярные места для походов в России
        this.loadRussianCampingSpots();

        // Получаем текущее местоположение пользователя
        this.getUserPosition();

        this.map.on('click', this.handleMapClick);

        
    },

        

    getUserPosition() {
        if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            this.displayLocation,
            this.displayError,
            {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
            }
        );
        } else {
            alert("Геолокация не поддерживается вашим браузером");
        }
    },

    displayLocation(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
    
      // Обновляем данные компонента
    this.selectedLocation = { lat: latitude, lng: longitude };
    
      // Создаем или обновляем маркер пользователя
    const userIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34]
    });

    if (this.userLocationMarker) {
        this.userLocationMarker.setLatLng([latitude, longitude]);
    } else {
        this.userLocationMarker = L.marker([latitude, longitude], {
            icon: userIcon,
            title: "Ваше местоположение"
        }).addTo(this.map);
        }

      // Центрируем карту на пользователе
        this.map.setView([latitude, longitude], 12);
    },

    displayError(error) {
        let errorMessage;
        switch(error.code) {
        case error.PERMISSION_DENIED:
            errorMessage = "Вы запретили доступ к геолокации";
            break;
        case error.POSITION_UNAVAILABLE:
            errorMessage = "Информация о местоположении недоступна";
            break;
        case error.TIMEOUT:
            errorMessage = "Время ожидания истекло";
            break;
        default:
            errorMessage = "Произошла неизвестная ошибка";
        }
        alert(`Ошибка геолокации: ${errorMessage}`);
    },


    

    async handleMapClick(e) {
            if (this.marker) {
                this.map.removeLayer(this.marker);
            }

            // Создаем кастомную иконку
            const customIcon = L.icon({
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                shadowSize: [41, 41]
            });
    
            this.marker = L.marker(e.latlng, {
                icon: customIcon
            }).addTo(this.map);
    
            this.selectedLocation = e.latlng;
            
            // Проверяем тип местности
            const locationCheck = await this.checkLocation(e.latlng);
            
            if (locationCheck === 'city') {
                this.marker.bindPopup('Это городская территория. Пожалуйста, выберите место за пределами города.').openPopup();
                this.locationStatus = 'city';
                return;
            }
            
            if (locationCheck === 'water') {
                this.marker.bindPopup('Это водная территория (море/океан). Пожалуйста, выберите место на суше.').openPopup();
                this.locationStatus = 'water';
                return;
            }
            
            if (locationCheck === 'far') {
                this.marker.bindPopup('Место слишком далеко от населенных пунктов. Пожалуйста, выберите место ближе.').openPopup();
                this.locationStatus = 'far';
                return;
            }
            
            // Если местность подходит, проверяем леса
            this.locationStatus = 'valid';
            this.hasForests = await this.checkForForests(e.latlng);
            this.hasMountains = await this.checkForMountains(e.latlng);
            this.hasRivers = await this.checkForRivers(e.latlng);
            this.selectedLocation = e.latlng;
            const destinationName = 'Выбранная точка';
            const routeInfo = await this.buildRoute(e.latlng, destinationName);
    
            const popupContent = this.createCombinedPopupContentMark(
                destinationName,
                routeInfo,
                this.hasForests,
                this.hasMountains,
                this.hasRivers
            );
    
            // Закрываем предыдущий попап, если есть
            if (this.currentPopup) {
                this.map.closePopup(this.currentPopup);
            }
    
            this.currentPopup = L.popup()
                .setLatLng(e.latlng)
                .setContent(popupContent)
                .openOn(this.map);
        },



    async loadRussianCampingSpots() {
        try {
        const overpassUrl = 'https://overpass-api.de/api/interpreter';
        
        // Улучшенный запрос с фильтрацией стандартных кемпингов
        const query = `
            [out:json][timeout:30];
            area["name"="Россия"]->.russia;
            (
                node["tourism"="camp_site"](area.russia);
            );
            out body;
            >;
            out skel qt;
            out 300; // Жесткое ограничение на 100 результатов
        `;
        
        const response = await fetch(overpassUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'text/plain',
                'Accept': 'application/json'
            },
            body: query
        });

        // Проверка ответа сервера
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
            const errorText = await response.text();
            throw new Error(`Invalid content-type: ${contentType}. Response: ${errorText.substring(0, 300)}`);
        }

        const data = await response.json();
        
        // Проверка и ограничение результатов
        if (!data.elements || !Array.isArray(data.elements)) {
            throw new Error('Invalid data format from Overpass API');
        }

        const limitedElements = data.elements.slice(0, 500); // Гарантируем не более 500 элементов
        // Фильтрация близко расположенных кемпингов
        const filteredElements = this.filterCloseCampings(limitedElements, 0.62); // 0.62 ≈ 62 км

        
        
        // Создаем желтую иконку для маркеров
        const campingIcon = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png',
            iconSize: [25, 31],
            iconAnchor: [12, 21],
            popupAnchor: [1, -34],
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            shadowSize: [31, 31]
        });
    
        // Очищаем предыдущие маркеры
        this.clearCampingMarkers();
        
        // Добавляем маркеры на карту (не более 300)
        filteredElements.forEach(element => {
            if (element.type === 'node') {
                const marker = L.marker([element.lat, element.lon], {
                    icon: campingIcon,
                    title: element.tags?.name || 'Стандартный кемпинг'
                }).addTo(this.map);

                // Обработчик клика
                marker.on('click', async (e) => {
                    try {
                        await this.CheckForGeo(e);
                        const destinationName = element.tags?.name || 'Стандартный кемпинг';
                        const routeInfo = await this.buildRoute(e.latlng, destinationName, true);

                        //alert(this.hasForests);
                        const popupContent = this.createCombinedPopupContentCamp(
                            element,
                            destinationName,
                            routeInfo,
                            this.hasForests,
                            this.hasMountains,
                            this.hasRivers,
                            true
                        );

                        // Закрываем предыдущий попап, если есть
                        if (this.currentPopup) {
                            this.map.closePopup(this.currentPopup);
                        }

                        this.currentPopup = L.popup()
                            .setLatLng(e.latlng)
                            .setContent(popupContent)
                            .openOn(this.map);
        
                        } catch (error) {
                            console.error('Ошибка при обработке маркера:', error);
                        }
                });
                
                this.campingMarkers.push(marker);
            }
        });
        
        console.log(`Успешно загружено ${this.campingMarkers.length} стандартных кемпингов`);
        
        } catch (error) {
            console.error('Ошибка при загрузке кемпингов:', error);
            // Можно добавить уведомление для пользователя
            alert('Не удалось загрузить данные о кемпингах. Пожалуйста, попробуйте позже.');
        }
    },

    // Фильтрует близко расположенные кемпинги
    filterCloseCampings(elements, minDistance) {
        const filtered = [];
        const checked = new Set();
    
        elements.forEach((element, index) => {
            if (checked.has(index)) 
                return;
        
            filtered.push(element);
            checked.add(index);
        
            // Находим все близкие кемпинги
            for (let i = index + 1; i < elements.length; i++) {
                if (checked.has(i)) continue;
            
                const distance = this.calculateDistance(
                    { lat: element.lat, lng: element.lon },
                    { lat: elements[i].lat, lng: elements[i].lon }
                );
            
                if (distance < minDistance) {
                    checked.add(i); // Помечаем как близкий
                }
            }
        });
    
        return filtered;
    },

    // Вычисляет расстояние между точками в градусах 
    calculateDistance(pos1, pos2) {
        const latDiff = Math.abs(pos1.lat - pos2.lat);
        const lngDiff = Math.abs(pos1.lng - pos2.lng);
        return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
    },

        // Метод для очистки маркеров
    clearCampingMarkers() {
        if (this.campingMarkers && this.campingMarkers.length > 0) {
            this.campingMarkers.forEach(marker => {
                if (marker && this.map.hasLayer(marker)) {
                    this.map.removeLayer(marker);
                }
            });
            this.campingMarkers = [];
        }
    },


    async buildRoute(destinationCoords, destinationName, isCamping = false) {
    try {
        // Проверяем, известно ли местоположение пользователя
        if (!this.userLocationMarker) {
            console.warn('Местоположение пользователя не определено');
            return null;
        }

        const userCoords = this.userLocationMarker.getLatLng();
    
        // Используем OSRM API для построения маршрута
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${userCoords.lng},${userCoords.lat};${destinationCoords.lng},${destinationCoords.lat}?overview=full&geometries=geojson`;
    
        const response = await fetch(osrmUrl);
        const routeData = await response.json();

        if (routeData.code !== 'Ok') {
            throw new Error('Не удалось построить маршрут: ' + routeData.message);
        }

        // Очищаем предыдущий маршрут (если есть)
        if (this.routeLayer) {
            this.map.removeLayer(this.routeLayer);
        }

        // Создаем GeoJSON с маршрутом
        const routeGeoJson = {
            type: 'Feature',
            properties: {},
            geometry: routeData.routes[0].geometry
        };

        // Отображаем маршрут на карте
        this.routeLayer = L.geoJSON(routeGeoJson, {
            style: {
                color: '#3388ff',
                weight: 5,
                opacity: 0.7
            }
        }).addTo(this.map);

        const routeInfo = routeData.routes[0];
        const distanceKm = (routeInfo.distance / 1000).toFixed(1);
        const durationHours = Math.floor(routeInfo.duration / 3600);
        const durationMinutes = Math.round((routeInfo.duration % 3600) / 60);

        // Масштабируем карту чтобы показать весь маршрут
        this.map.fitBounds([
            [userCoords.lat, userCoords.lng],
            [destinationCoords.lat, destinationCoords.lng]
        ], { padding: [50, 50] });

        return {
            distanceKm,
            durationHours,
            durationMinutes,
            isCamping
        };
        } catch (error) {
            console.error('Ошибка при построении маршрута:', error);
            return null;
        }
    },

    createCombinedPopupContentCamp(element, destinationName, routeInfo, hasForests, hasMountains, hasRivers, isCamping = false) {
    return `
        <div style="min-width: 250px;">
        <h4 style="margin: 0 0 10px 0;">${isCamping ? 'Выбран кемпинг' : 'Выбрано место'}: ${destinationName}</h4>
        
        ${routeInfo ? `
            <div style="margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
            <p style="margin: 5px 0;"><b>Расстояние:</b> ${routeInfo.distanceKm} км</p>
            <p style="margin: 5px 0;"><b>Примерное время:</b> 
                ${routeInfo.durationHours > 0 ? routeInfo.durationHours + ' ч ' : ''}${routeInfo.durationMinutes} мин</p>
            </div>
        ` : ''}
        
        ${isCamping && element.tags?.operator ? `
            <p style="margin: 5px 0;"><b>Оператор:</b> ${element.tags.operator}</p>
        ` : ''}
        
        <p style="margin: 10px 0 5px 0;"><b>Географические объекты:</b></p>
        <div style="display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px;">
            ${hasForests ? '<span style="background: #e8f5e9; padding: 2px 5px; border-radius: 3px;">🌲 Лес</span>' : ''}
            ${hasMountains ? '<span style="background: #e3f2fd; padding: 2px 5px; border-radius: 3px;">⛰️ Горы</span>' : ''}
            ${hasRivers ? '<span style="background: #e1f5fe; padding: 2px 5px; border-radius: 3px;">🌊 Водоёмы</span>' : ''}
        </div>
        
        <p style="margin: 5px 0 0 0; font-style: italic; color: #666;">
            ${routeInfo ? 'Теперь можно получить список снаряжения' : 'Местоположение пользователя не определено, маршрут не построен'}
        </p>
        </div>
    `;
    },

    createCombinedPopupContentMark(destinationName, routeInfo, hasForests, hasMountains, hasRivers, isCamping = false) {
    return `
        <div style="min-width: 250px;">
        <h4 style="margin: 0 0 10px 0;">${isCamping ? 'Выбран кемпинг' : 'Выбрано место'}: ${destinationName}</h4>
        
        ${routeInfo ? `
            <div style="margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
            <p style="margin: 5px 0;"><b>Расстояние:</b> ${routeInfo.distanceKm} км</p>
            <p style="margin: 5px 0;"><b>Примерное время:</b> 
                ${routeInfo.durationHours > 0 ? routeInfo.durationHours + ' ч ' : ''}${routeInfo.durationMinutes} мин</p>
            </div>
        ` : ''}
        
        <p style="margin: 10px 0 5px 0;"><b>Географические объекты:</b></p>
        <div style="display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px;">
            ${hasForests ? '<span style="background: #e8f5e9; padding: 2px 5px; border-radius: 3px;">🌲 Лес</span>' : ''}
            ${hasMountains ? '<span style="background: #e3f2fd; padding: 2px 5px; border-radius: 3px;">⛰️ Горы</span>' : ''}
            ${hasRivers ? '<span style="background: #e1f5fe; padding: 2px 5px; border-radius: 3px;">🌊 Водоёмы</span>' : ''}
        </div>
        
        <p style="margin: 5px 0 0 0; font-style: italic; color: #666;">
            ${routeInfo ? 'Теперь можно получить список снаряжения' : 'Местоположение пользователя не определено, маршрут не построен'}
        </p>
        </div>
    `;
    },

    // Очистка маршрута (можно вызывать при смене точки назначения)
    clearRoute() {
        if (this.routeLayer) {
            this.map.removeLayer(this.routeLayer);
            this.routeLayer = null;
        }
    },








    async CheckForGeo(e){
        this.locationStatus = 'valid';
        this.hasForests = await this.checkForForests(e.latlng);
        this.hasMountains = await this.checkForMountains(e.latlng);
        this.hasRivers = await this.checkForRivers(e.latlng);
    },

    addGear() {
        if(this.locationStatus != 'valid'){
            alert('Сначала выберите место для похода на карте');
            return;
        }
        // Проверяем наличие заголовка "Необходимое снаряжение"
        const hasNecessaryHeader = this.gearList.some(item => 
        item.type.includes('header') && item.text.includes('Необходимое снаряжение')
        );
    
        if (!hasNecessaryHeader) {
            alert('Сначала получите список снаряжения, нажав кнопку "Получить список снаряжения"');
            return;
        }

        
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
        if(this.locationStatus != 'valid'){
            alert('Место не выбрано');
        }
        else {
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

                // Если есть леса/парки в радиусе, добавляем лесное снаряжение
                if (this.hasForests) {
                    await this.getGearForForest();
                }
                if(this.hasMountains){
                    await this.getGearForMountains();
                }
                if(this.hasRivers){
                    await this.getGearForRivers();
                }
            } catch (error) {
                console.error('Ошибка при загрузке списка снаряжения:', error);
            }
        }
        },





    // Получение видов снаряжения
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

    async getGearForMountains() {
    try {
        const response = await fetch('db.json');
        const data = await response.json();
    
        this.gearList.push({
        type: 'mountain-header',
        text: 'Полезное снаряжение для гор:',
        id: Date.now()
        });
    
        data.UsefulMountains.forEach((item, index) => {
        this.gearList.push({
            type: 'mountain-item',
            text: `${index + 1}. ${item}`,
            id: Date.now() + index
        });
        });
    } catch (error) {
        console.error('Ошибка при загрузке списка снаряжения:', error);
    }
    },

    async getGearForRivers() {
    try {
        const response = await fetch('db.json');
        const data = await response.json();
    
        this.gearList.push({
        type: 'river-header',
        text: 'Полезное снаряжение (водоёмы):',
        id: Date.now()
        });
    
        data.UsefulSea.forEach((item, index) => {
        this.gearList.push({
            type: 'river-item',
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
    },











    async checkLocation(latlng) {
            try {
                // 1. Проверка на городскую территорию
                const isCity = await this.checkIsCity(latlng);
                if (isCity) return 'city';
                
                // 2. Проверка расстояния до населенных пунктов
                const isFarFromSettlements = await this.checkFarFromSettlements(latlng);
                if (isFarFromSettlements) return 'far';

                // 3. Проверка на водную поверхность
                const isWater = await this.checkIsWater(latlng);
                if (isWater) {
                    alert('good');
                    return 'water';
                }

                return 'valid';
                
            } catch (error) {
                console.error('Ошибка при проверке местности:', error);
                return 'error';
            }
        },

        async checkIsWater(latlng) {
            try {
                const overpassUrl = 'https://overpass-api.de/api/interpreter';
                const query = `
                    [out:json];
                    (
                        relation["natural"="water"](${latlng.lat},${latlng.lng});
                    );
                    out body;
                    >;
                    out skel qt;
                `;
                
                const response = await fetch(overpassUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain' },
                    body: query
                });
                
                const data = await response.json();
                return data.elements && data.elements.length > 0;
                
            } catch (error) {
                console.error('Ошибка при проверке водной территории:', error);
                return false;
            }
    },

        async checkIsCity(latlng) {
            try {
                const overpassUrl = 'https://overpass-api.de/api/interpreter';
                const query = `
                    [out:json];
                    (
                        way["landuse"="residential"](around:500,${latlng.lat},${latlng.lng});
                        way["landuse"="industrial"](around:1000,${latlng.lat},${latlng.lng});
                        way["landuse"="commercial"](around:1000,${latlng.lat},${latlng.lng});
                        relation["place"="city"](around:1000,${latlng.lat},${latlng.lng});
                        relation["place"="town"](around:1000,${latlng.lat},${latlng.lng});
                        relation["place"="village"](around:1000,${latlng.lat},${latlng.lng});
                    );
                    out body;
                    >;
                    out skel qt;
                `;
                
                const response = await fetch(overpassUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain' },
                    body: query
                });
                
                const data = await response.json();
                return data.elements && data.elements.length > 0;
                
            } catch (error) {
                console.error('Ошибка при проверке городской территории:', error);
                return false;
            }
        },

        async checkFarFromSettlements(latlng) {
            try {
                const overpassUrl = 'https://overpass-api.de/api/interpreter';
                const query = `
                    [out:json];
                    (
                        node["place"~"city|town|village|hamlet"](around:20000,${latlng.lat},${latlng.lng});
                        way["place"~"city|town|village|hamlet"](around:20000,${latlng.lat},${latlng.lng});
                        relation["place"~"city|town|village|hamlet"](around:20000,${latlng.lat},${latlng.lng});
                    );
                    out body;
                    >;
                    out skel qt;
                `;
                
                const response = await fetch(overpassUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain' },
                    body: query
                });
                
                const data = await response.json();
                // Если нет населенных пунктов в радиусе 20 км - считаем что место слишком далеко
                return !(data.elements && data.elements.length > 0);
                
            } catch (error) {
                console.error('Ошибка при проверке расстояния до населенных пунктов:', error);
                return false;
            }
        },

        async checkForForests(latlng) {
            try {
                const radius = 5000; // 5 км в метрах
                const overpassUrl = 'https://overpass-api.de/api/interpreter';
                
                const query = `
                    [out:json];
                    (
                        way["landuse"="forest"](around:${radius},${latlng.lat},${latlng.lng});
                        way["leisure"="nature_reserve"](around:${radius},${latlng.lat},${latlng.lng});
                        way["boundary"="national_park"](around:${radius},${latlng.lat},${latlng.lng});
                        relation["landuse"="forest"](around:${radius},${latlng.lat},${latlng.lng});
                        relation["natural"="wood"](around:${radius},${latlng.lat},${latlng.lng});
                        relation["leisure"="nature_reserve"](around:${radius},${latlng.lat},${latlng.lng});
                        relation["boundary"="national_park"](around:${radius},${latlng.lat},${latlng.lng});
                    );
                    out body;
                    >;
                    out skel qt;
                `;
                
                const response = await fetch(overpassUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'text/plain'
                    },
                    body: query
                });
                
                const data = await response.json();
                return data.elements && data.elements.length > 0;
                
            } catch (error) {
                console.error('Ошибка при проверке лесов/парков:', error);
                return false;
            }
        },

        async checkForMountains(latlng) {
        try {
            const radius = 5000; // 5 км в метрах
            const overpassUrl = 'https://overpass-api.de/api/interpreter';
        
            const query = `
                [out:json];
                (
                    // Проверяем горные вершины и хребты
                    node["natural"="peak"](around:${radius},${latlng.lat},${latlng.lng});
                    way["natural"="ridge"](around:${radius},${latlng.lat},${latlng.lng});
                    way["natural"="cliff"](around:${radius},${latlng.lat},${latlng.lng});
                
                    // Проверяем горные местности и хребты (relations)
                    relation["natural"="mountain_range"](around:${radius},${latlng.lat},${latlng.lng});
                    relation["natural"="ridge"](around:${radius},${latlng.lat},${latlng.lng});
                
                    // Проверяем горные перевалы
                    node["mountain_pass"="yes"](around:${radius},${latlng.lat},${latlng.lng});
                );
                out body;
                >;
                out skel qt;
            `;
        
            const response = await fetch(overpassUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: query
            });
        
            const data = await response.json();
            return data.elements && data.elements.length > 0;
        
        } catch (error) {
            console.error('Ошибка при проверке горной местности:', error);
            return false;
        }
        },

        async checkForRivers(latlng) {
            try {
                const radius = 5000; // 5 км в метрах
                const overpassUrl = 'https://overpass-api.de/api/interpreter';
        
                const query = `
                [out:json];
                (
                    // Озера и водохранилища
                    way["natural"="water"](around:${radius},${latlng.lat},${latlng.lng});
                    relation["natural"="water"](around:${radius},${latlng.lat},${latlng.lng});
                
                    // Реки и каналы
                    way["waterway"~"river|stream|canal"](around:${radius},${latlng.lat},${latlng.lng});
                
                    // Водохранилища и пруды
                    way["landuse"="basin"](around:${radius},${latlng.lat},${latlng.lng});
                    way["landuse"="reservoir"](around:${radius},${latlng.lat},${latlng.lng});
                );
                out body;
                >;
                out skel qt;
            `;
        
            const response = await fetch(overpassUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: query
            });
        
            const data = await response.json();
            return data.elements && data.elements.length > 0;
        
        } catch (error) {
            console.error('Ошибка при проверке водных объектов:', error);
            return false;
        }
    }
    },
}
</script>

<style scoped>
    @import '@/assets/mapstyle.css';
</style>