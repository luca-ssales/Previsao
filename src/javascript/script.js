const form = document.querySelector('#search');
const apikey = '33cb27fb51c88f53e7ec0d648259d41d';
let relogioIntervalo; 

async function getWeatherData(url) {
    try {
        const result = await fetch(url);
        const json = await result.json();

        if (json.cod === 200) {
            showInfo(json);
        } else {
            showAlert('Não foi possível localizar a cidade.');
        }
    } catch (error) {
        showAlert('Erro ao procurar os dados.');
    }
}

window.addEventListener('load', () => {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const apiurl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apikey}&units=metric&lang=pt_br`;
            
            getWeatherData(apiurl);
        }, () => {
            console.log("Geolocalização não permitida. Aguardando pesquisa manual.");
        });
    }
});

form.addEventListener('submit', (event) => {
    event.preventDefault();
    const cityname = document.querySelector('#city_name').value;

    if (!cityname) {
        return showAlert('Precisa de digitar uma cidade...');
    }

    const apiurl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURI(cityname)}&appid=${apikey}&units=metric&lang=pt_br`;
    getWeatherData(apiurl);
});

function showInfo(json) {
    showAlert('');
    document.querySelector("#weather").classList.add('show');

    document.querySelector('#title').innerHTML = `${json.city || json.name}, ${json.sys.country}`;
    document.querySelector('#temp_value').innerHTML = `${json.main.temp.toFixed(1).replace('.', ',')} <sup>ºC</sup>`;
    document.querySelector('#temp_description').innerHTML = `${json.weather[0].description}`;
    document.querySelector('#temp_img').setAttribute('src', `https://openweathermap.org/img/wn/${json.weather[0].icon}@2x.png`);
    document.querySelector('#temp_max').innerHTML = `${json.main.temp_max.toFixed(1).replace('.', ',')} <sup>ºC</sup>`;
    document.querySelector('#temp_min').innerHTML = `${json.main.temp_min.toFixed(1).replace('.', ',')} <sup>ºC</sup>`;
    
    const windKm = (json.wind.speed * 3.6).toFixed(1);
    document.querySelector('#wind_speed').innerHTML = `${windKm} km/h`;
    document.querySelector('#humidity').innerHTML = `${json.main.humidity}%`;

    const formatTime = (timestamp, timezone) => {
        const date = new Date((timestamp + timezone) * 1000);
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    document.querySelector('#sunrise_time').innerHTML = formatTime(json.sys.sunrise, json.timezone);
    document.querySelector('#sunset_time').innerHTML = formatTime(json.sys.sunset, json.timezone);

    const isNight = json.dt >= json.sys.sunset || json.dt <= json.sys.sunrise;

    updateTheme(json.main.temp, json.weather[0].description.toLowerCase(), isNight);

    clearInterval(relogioIntervalo); 

    const atualizarRelogio = () => {
        const dataAtual = new Date();
        const dataCidade = new Date(dataAtual.getTime() + (json.timezone * 1000));
        
        const horas = dataCidade.getUTCHours().toString().padStart(2, '0');
        const minutos = dataCidade.getUTCMinutes().toString().padStart(2, '0');
        
        document.querySelector('#city_time').innerHTML = `⏱️ ${horas}:${minutos}`;
    };

    atualizarRelogio(); 
    relogioIntervalo = setInterval(atualizarRelogio, 1000); 
}

function updateTheme(temp, condition, isNight) {
    const root = document.documentElement;

    if (isNight) {
        root.style.setProperty('--bg-gradient', 'linear-gradient(135deg, #141e30 0%, #243b55 100%)'); 
        root.style.setProperty('--card-gradient', 'linear-gradient(90deg, #2b5876 0%, #4e4376 100%)'); 
        root.style.setProperty('--accent-color', '#7c8fa6'); 
        root.style.setProperty('--text-primary', '#f3f4f6'); 
        root.style.setProperty('--container-bg', 'rgba(20, 30, 48, 0.7)'); 
    }
    else if (temp >= 25) {
        root.style.setProperty('--bg-gradient', 'linear-gradient(135deg, #fef4e2 0%, #fff8ec 100%)'); 
        root.style.setProperty('--card-gradient', 'linear-gradient(90deg, #ff7e38 0%, #ffc674 100%)'); 
        root.style.setProperty('--accent-color', '#ff7e38'); 
        root.style.setProperty('--text-primary', '#372f3f'); 
        root.style.setProperty('--container-bg', 'rgba(255, 255, 255, 0.7)'); 
    } 
    else if (temp < 15 && (condition.includes("chuva") || condition.includes("garoa") || condition.includes("rain"))) {
        root.style.setProperty('--bg-gradient', 'linear-gradient(135deg, #2b45a0 0%, #5d2b7a 100%)'); 
        root.style.setProperty('--card-gradient', 'linear-gradient(90deg, #5c6bc0 0%, #3949ab 100%)'); 
        root.style.setProperty('--accent-color', '#3949ab'); 
        root.style.setProperty('--text-primary', '#f3f4f6'); 
        root.style.setProperty('--container-bg', 'rgba(255, 255, 255, 0.7)'); 
    }
    else if (condition.includes("chuva") || condition.includes("garoa") || condition.includes("nublado") || condition.includes("nuvens")) {
        root.style.setProperty('--bg-gradient', 'linear-gradient(135deg, #444c5a 0%, #5d677a 100%)'); 
        root.style.setProperty('--card-gradient', 'linear-gradient(90deg, #6c788a 0%, #525c6a 100%)'); 
        root.style.setProperty('--accent-color', '#5d677a'); 
        root.style.setProperty('--text-primary', '#f3f4f6'); 
        root.style.setProperty('--container-bg', 'rgba(255, 255, 255, 0.7)'); 
    }
    else {
        root.style.setProperty('--bg-gradient', 'linear-gradient(135deg, #fefbf6 0%, #ebedef 100%)'); 
        root.style.setProperty('--card-gradient', 'linear-gradient(90deg, #81d4fa 0%, #4fc3f7 100%)'); 
        root.style.setProperty('--accent-color', '#039be5'); 
        root.style.setProperty('--text-primary', '#372f3f'); 
        root.style.setProperty('--container-bg', 'rgba(255, 255, 255, 0.7)'); 
    }
}

function showAlert(msg) {
    document.querySelector('#alert').innerHTML = msg;
}