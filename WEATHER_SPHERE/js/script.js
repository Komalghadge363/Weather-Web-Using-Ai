   // Map Initialization
        let map = L.map('map').setView([20.5937, 78.9629], 5);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
        let markers = [];

        // Weather Variables
        let currentWeather = null;
        let currentUnit = 'C';
        let currentCity = '';

        // AI Assistant Variables
        let chatHistory = [];

        // New AI Features
        let weatherMood = '';
        let aiRecommendations = [];
        let energyIndex = 0;
        let productivityScore = 0;

        // Weather Particles
        let weatherParticles = [];

        // Charts
        let pieChart = new Chart(document.getElementById('pieChart'), {
            type: 'pie',
            data: {
                labels: ['Humidity', 'Cloud', 'Wind'],
                datasets: [{
                    data: [50, 20, 30],
                    backgroundColor: ['#6366f1', '#06b6d4', '#10b981']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });

        let hourlyChart = new Chart(document.getElementById('hourlyChart'), {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Temperature °C',
                    data: [],
                    backgroundColor: '#6366f1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        let trendChart = new Chart(document.getElementById('trendChart'), {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Average Temperature',
                    data: [],
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });

        let mlChart = null;

        // Theme Switcher
        function changeTheme(theme) {
            document.body.classList.remove('dark', 'cyber', 'nature');
            if (theme === 'dark') {
                document.body.classList.add('dark');
            } else if (theme === 'cyber') {
                document.body.classList.add('cyber');
            } else if (theme === 'nature') {
                document.body.classList.add('nature');
            }
            
            // Update active theme button
            document.querySelectorAll('.theme-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
            
            // Update weather particles based on theme
            updateWeatherParticles();
        }

        // Alert Functions
        function showAlert(title, description) {
            document.getElementById('alertTitle').textContent = title;
            document.getElementById('alertDesc').textContent = description;
            document.getElementById('alertBanner').style.display = 'flex';
        }

        function closeAlert() {
            document.getElementById('alertBanner').style.display = 'none';
        }

        // Unit Toggle
        function toggleUnit(unit) {
            currentUnit = unit;
            document.getElementById('celsiusBtn').classList.remove('active');
            document.getElementById('fahrenheitBtn').classList.remove('active');
            if (unit === 'C') {
                document.getElementById('celsiusBtn').classList.add('active');
            } else {
                document.getElementById('fahrenheitBtn').classList.add('active');
            }
            displayWeather();
        }

        // AI Assistant Functions
        function sendMessage() {
            const input = document.getElementById('chatInput');
            const message = input.value.trim();
            
            if (!message) return;
            
            // Add user message to chat
            addMessage(message, 'user');
            input.value = '';
            
            // Show typing indicator
            showTypingIndicator();
            
            // Process message and generate AI response
            setTimeout(() => {
                removeTypingIndicator();
                const response = generateAIResponse(message);
                addMessage(response, 'ai');
            }, 1500);
        }

        function addMessage(text, sender) {
            const chatMessages = document.getElementById('chatMessages');
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${sender}-message`;
            messageDiv.textContent = text;
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Store in history
            chatHistory.push({ sender, text });
        }

        function showTypingIndicator() {
            const chatMessages = document.getElementById('chatMessages');
            const typingDiv = document.createElement('div');
            typingDiv.className = 'typing-indicator';
            typingDiv.id = 'typingIndicator';
            typingDiv.innerHTML = `
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            `;
            chatMessages.appendChild(typingDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        function removeTypingIndicator() {
            const typingIndicator = document.getElementById('typingIndicator');
            if (typingIndicator) {
                typingIndicator.remove();
            }
        }

        // Enhanced AI Response with new features
        function generateAIResponse(userMessage) {
            const lowerMessage = userMessage.toLowerCase();
            
            // New AI Features Integration
            if (lowerMessage.includes('mood') || lowerMessage.includes('feel')) {
                return `Based on current conditions, the weather mood is ${weatherMood}. ${getMoodDescription(weatherMood)}`;
            }
            
            if (lowerMessage.includes('energy') || lowerMessage.includes('productivity')) {
                return `Your energy index is ${energyIndex}/100 and productivity score is ${productivityScore}%. ${getEnergyRecommendation(energyIndex)}`;
            }
            
            if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
                if (aiRecommendations.length > 0) {
                    return `Here are my personalized recommendations: ${aiRecommendations.slice(0, 3).join(', ')}.`;
                } else {
                    return "I need current weather data to provide personalized recommendations. Please search for a location first.";
                }
            }
            
            // Existing AI responses
            if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
                return "Hello! I'm your AI weather assistant. I can help you with weather forecasts, analysis, and personalized recommendations. What would you like to know?";
            } else if (lowerMessage.includes('forecast') || lowerMessage.includes('predict')) {
                return "Based on current atmospheric patterns, I predict stable weather conditions for the next 48 hours with a slight chance of precipitation on day 3.";
            } else if (lowerMessage.includes('temperature') || lowerMessage.includes('temp')) {
                if (currentWeather) {
                    const temp = currentUnit === 'C' ? currentWeather.current.temp_c : currentWeather.current.temp_f;
                    return `The current temperature is ${temp}°${currentUnit}. This is within the normal range for this location and season.`;
                } else {
                    return "I don't have current temperature data. Please search for a location first to get detailed weather information.";
                }
            } else if (lowerMessage.includes('rain') || lowerMessage.includes('precipitation')) {
                if (currentWeather && currentWeather.forecast) {
                    const chanceOfRain = currentWeather.forecast.forecastday[0].day.daily_chance_of_rain;
                    return `There's a ${chanceOfRain}% chance of rain today. ${chanceOfRain > 50 ? 'You might want to carry an umbrella!' : 'No need to worry about rain today.'}`;
                } else {
                    return "I need current weather data to provide precipitation information. Please search for a location first.";
                }
            } else if (lowerMessage.includes('health') || lowerMessage.includes('air quality')) {
                if (currentWeather) {
                    const aqi = currentWeather.current.air_quality?.pm2_5 || 0;
                    if (aqi < 12) {
                        return "Air quality is excellent! Perfect for outdoor activities and exercise.";
                    } else if (aqi < 35) {
                        return "Air quality is good. Most people can enjoy outdoor activities safely.";
                    } else if (aqi < 55) {
                        return "Air quality is moderate. Sensitive groups should consider limiting prolonged outdoor exertion.";
                    } else {
                        return "Air quality is poor. Consider limiting outdoor activities, especially if you have respiratory issues.";
                    }
                } else {
                    return "I need current weather data to provide health recommendations. Please search for a location first.";
                }
            } else if (lowerMessage.includes('thank')) {
                return "You're welcome! Is there anything else I can help you with?";
            } else {
                return "I'm your AI weather assistant. I can help with forecasts, current conditions, weather analysis, and personalized recommendations. What specific weather information are you looking for?";
            }
        }

        // New AI Feature: Weather Mood Analysis
        function analyzeWeatherMood(data) {
            const cur = data.current;
            const temp = cur.temp_c;
            const condition = cur.condition.text.toLowerCase();
            const humidity = cur.humidity;
            
            if (temp > 25 && condition.includes('sunny')) {
                return { mood: "Vibrant", description: "Perfect weather for outdoor activities and social gatherings!" };
            } else if (temp > 20 && condition.includes('clear')) {
                return { mood: "Pleasant", description: "Comfortable conditions ideal for productivity and relaxation." };
            } else if (temp < 10 || condition.includes('rain')) {
                return { mood: "Cozy", description: "Great weather for indoor activities, reading, or creative work." };
            } else if (condition.includes('cloud')) {
                return { mood: "Calm", description: "Peaceful atmosphere perfect for focused work and contemplation." };
            } else {
                return { mood: "Balanced", description: "Neutral conditions suitable for various activities." };
            }
        }

        // New AI Feature: Energy Index Calculation
        function calculateEnergyIndex(data) {
            const cur = data.current;
            const temp = cur.temp_c;
            const humidity = cur.humidity;
            const pressure = cur.pressure_mb;
            const aqi = cur.air_quality?.pm2_5 || 25;
            
            let energyScore = 100;
            
            // Temperature impact (ideal 18-22°C)
            if (temp < 15 || temp > 28) energyScore -= 20;
            else if (temp < 17 || temp > 25) energyScore -= 10;
            
            // Humidity impact (ideal 40-60%)
            if (humidity < 30 || humidity > 70) energyScore -= 15;
            else if (humidity < 40 || humidity > 60) energyScore -= 5;
            
            // Air quality impact
            if (aqi > 55) energyScore -= 25;
            else if (aqi > 35) energyScore -= 15;
            
            // Pressure impact (stable is better)
            if (pressure < 1000 || pressure > 1020) energyScore -= 10;
            
            return Math.max(0, Math.min(100, energyScore));
        }

        // New AI Feature: Productivity Score
        function calculateProductivityScore(energyIndex, weatherMood) {
            let baseScore = energyIndex;
            
            // Adjust based on weather mood
            if (weatherMood === "Cozy" || weatherMood === "Calm") baseScore += 10;
            if (weatherMood === "Vibrant") baseScore += 5;
            
            return Math.min(100, baseScore);
        }

        // Helper functions for new AI features
        function getMoodDescription(mood) {
            const descriptions = {
                "Vibrant": "This weather is perfect for social activities, exercise, and outdoor adventures!",
                "Pleasant": "Ideal conditions for both work and leisure activities.",
                "Cozy": "Perfect atmosphere for indoor activities, reading, or creative projects.",
                "Calm": "Great for focused work, meditation, and peaceful activities.",
                "Balanced": "Versatile weather suitable for various types of activities."
            };
            return descriptions[mood] || "Enjoy the current weather conditions!";
        }

        function getEnergyRecommendation(energyIndex) {
            if (energyIndex > 80) {
                return "High energy levels detected! Perfect for physical activities and demanding tasks.";
            } else if (energyIndex > 60) {
                return "Good energy levels. You can handle most activities comfortably.";
            } else if (energyIndex > 40) {
                return "Moderate energy levels. Consider lighter activities and take breaks.";
            } else {
                return "Lower energy levels. Focus on rest and recovery activities.";
            }
        }

        // New Feature: Weather Particles
        function updateWeatherParticles() {
            // Clear existing particles
            weatherParticles.forEach(particle => {
                if (particle.element && particle.element.parentNode) {
                    particle.element.parentNode.removeChild(particle.element);
                }
            });
            weatherParticles = [];
            
            // Create new particles based on current weather
            if (currentWeather) {
                const condition = currentWeather.current.condition.text.toLowerCase();
                const temp = currentWeather.current.temp_c;
                
                if (condition.includes('rain') || condition.includes('drizzle')) {
                    createRainParticles();
                } else if (condition.includes('snow') || temp < 0) {
                    createSnowParticles();
                } else if (condition.includes('sunny') || condition.includes('clear')) {
                    createSunParticles();
                }
            }
        }

        function createRainParticles() {
            for (let i = 0; i < 50; i++) {
                createParticle('raindrop', 2, 15, 'linear-gradient(to bottom, rgba(255,255,255,0.8), rgba(255,255,255,0.2))', 2 + Math.random() * 3);
            }
        }

        function createSnowParticles() {
            for (let i = 0; i < 30; i++) {
                const snowflake = document.createElement('div');
                snowflake.className = 'weather-particle snowflake';
                snowflake.innerHTML = '❄';
                snowflake.style.left = Math.random() * 100 + 'vw';
                snowflake.style.animationDuration = (5 + Math.random() * 10) + 's';
                snowflake.style.animationDelay = Math.random() * 5 + 's';
                snowflake.style.fontSize = (10 + Math.random() * 15) + 'px';
                document.querySelector('.bg-animation').appendChild(snowflake);
                
                weatherParticles.push({
                    element: snowflake,
                    type: 'snow'
                });
            }
        }

        function createSunParticles() {
            for (let i = 0; i < 5; i++) {
                const sunbeam = document.createElement('div');
                sunbeam.className = 'weather-particle sunbeam';
                sunbeam.style.top = (10 + Math.random() * 80) + 'vh';
                sunbeam.style.animationDuration = (3 + Math.random() * 4) + 's';
                sunbeam.style.animationDelay = Math.random() * 2 + 's';
                document.querySelector('.bg-animation').appendChild(sunbeam);
                
                weatherParticles.push({
                    element: sunbeam,
                    type: 'sunbeam'
                });
            }
        }

        function createParticle(type, width, height, background, duration) {
            const particle = document.createElement('div');
            particle.className = `weather-particle ${type}`;
            particle.style.width = width + 'px';
            particle.style.height = height + 'px';
            particle.style.background = background;
            particle.style.left = Math.random() * 100 + 'vw';
            particle.style.animationDuration = duration + 's';
            particle.style.animationDelay = Math.random() * 5 + 's';
            document.querySelector('.bg-animation').appendChild(particle);
            
            weatherParticles.push({
                element: particle,
                type: type
            });
        }

        // New Feature: Calculate Season Percentages
        function calculateSeasonPercentages(data) {
            const cur = data.current;
            const temp = cur.temp_c;
            const condition = cur.condition.text.toLowerCase();
            const humidity = cur.humidity;
            const rainChance = data.forecast.forecastday[0].day.daily_chance_of_rain;
            
            // Initialize percentages
            let rainPercent = 0;
            let summerPercent = 0;
            let winterPercent = 0;
            
            // Calculate rain percentage based on current conditions and forecast
            if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('thunder')) {
                rainPercent += 30;
            }
            
            // Add forecast rain chance
            rainPercent += rainChance * 0.7;
            
            // Calculate summer percentage based on temperature
            if (temp >= 25) {
                summerPercent = Math.min(100, (temp - 25) * 4 + 20);
            } else if (temp >= 20) {
                summerPercent = (temp - 20) * 4;
            }
            
            // Calculate winter percentage based on temperature
            if (temp <= 10) {
                winterPercent = Math.min(100, (10 - temp) * 4 + 20);
            } else if (temp <= 15) {
                winterPercent = (15 - temp) * 4;
            }
            
            // Adjust percentages based on humidity
            if (humidity > 70) {
                rainPercent += 10;
                summerPercent -= 5;
            } else if (humidity < 40) {
                winterPercent += 5;
            }
            
            // Ensure percentages are within bounds
            rainPercent = Math.min(100, Math.max(0, rainPercent));
            summerPercent = Math.min(100, Math.max(0, summerPercent));
            winterPercent = Math.min(100, Math.max(0, winterPercent));
            
            // Normalize if total exceeds 100%
            const total = rainPercent + summerPercent + winterPercent;
            if (total > 100) {
                rainPercent = (rainPercent / total) * 100;
                summerPercent = (summerPercent / total) * 100;
                winterPercent = (winterPercent / total) * 100;
            }
            
            // If all are low, distribute based on temperature
            if (total < 30) {
                if (temp > 20) {
                    summerPercent = 60;
                    rainPercent = 20;
                    winterPercent = 20;
                } else if (temp < 10) {
                    winterPercent = 60;
                    rainPercent = 20;
                    summerPercent = 20;
                } else {
                    rainPercent = 40;
                    summerPercent = 30;
                    winterPercent = 30;
                }
            }
            
            return {
                rain: Math.round(rainPercent),
                summer: Math.round(summerPercent),
                winter: Math.round(winterPercent)
            };
        }

        // Fetch Weather with new AI features
        async function getWeather() {
            const loc = document.getElementById('locationInput').value.trim();
            if (!loc) {
                document.getElementById('error').innerText = "Please enter a city name";
                return;
            }
            
            document.getElementById('error').innerText = "";
            document.getElementById('result').innerHTML = `
                <div class="loading">
                    <div class="loading-spinner"></div>
                </div>
            `;
            
            // Using a free weather API (OpenWeatherMap alternative)
            const apiKey = "2ac83171a0584ec58c5170338250910"; // This is a demo key
            const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${loc}&days=7&aqi=yes`;
            
            try {
                const res = await fetch(url);
                if (!res.ok) throw new Error("City not found or API error");
                const data = await res.json();
                currentWeather = data;
                currentCity = data.location.name;
                
                // Calculate new AI features
                const moodAnalysis = analyzeWeatherMood(data);
                weatherMood = moodAnalysis.mood;
                energyIndex = calculateEnergyIndex(data);
                productivityScore = calculateProductivityScore(energyIndex, weatherMood);
                
                // Generate AI recommendations
                aiRecommendations = generateAIRecommendations(data, moodAnalysis.mood, energyIndex);
                
                displayWeather();
                updateMap(data.location.lat, data.location.lon, data.location.name);
                updateCharts(data);
                updateHourlyChart(data);
                updateMLPrediction(data);
                updateAIInsights(data);
                updateExtendedFeatures(data);
                
                // Check for weather alerts
                checkWeatherAlerts(data);
                
                // Update weather particles
                updateWeatherParticles();
                
                // Fetch city-specific news
                await updateCityNews(currentCity);
                
                // Add AI notification about the new location
                addMessage(`I've analyzed the weather data for ${data.location.name}. The current conditions are ${data.current.condition.text.toLowerCase()} with a temperature of ${data.current.temp_c}°C. Weather mood: ${weatherMood}.`, 'ai');
            } catch (e) {
                document.getElementById('error').innerText = "Failed to fetch weather data. Please try again.";
                document.getElementById('result').innerHTML = `
                    <div class="weather-main">
                        <div class="weather-icon">❌</div>
                        <div class="weather-desc">Failed to load weather data</div>
                    </div>
                `;
            }
        }

        // New AI Feature: Generate personalized recommendations
        function generateAIRecommendations(data, mood, energy) {
            const recommendations = [];
            const cur = data.current;
            const temp = cur.temp_c;
            const condition = cur.condition.text.toLowerCase();
            
            // Activity recommendations based on mood and energy
            if (mood === "Vibrant" && energy > 70) {
                recommendations.push("Outdoor sports", "Social gatherings", "Adventure activities");
            } else if (mood === "Pleasant") {
                recommendations.push("Walking meetings", "Creative work", "Light exercise");
            } else if (mood === "Cozy") {
                recommendations.push("Reading", "Indoor hobbies", "Movie night");
            } else if (mood === "Calm") {
                recommendations.push("Meditation", "Focused work", "Yoga");
            }
            
            // Weather-specific recommendations
            if (temp > 25) {
                recommendations.push("Stay hydrated", "Wear light clothing", "Use sunscreen");
            } else if (temp < 15) {
                recommendations.push("Dress in layers", "Hot beverages", "Indoor activities");
            }
            
            if (condition.includes('rain')) {
                recommendations.push("Carry umbrella", "Waterproof footwear", "Indoor alternatives");
            }
            
            return recommendations.slice(0, 5); // Return top 5 recommendations
        }

        // Display Weather Info
        function displayWeather() {
            if (!currentWeather) return;
            
            const cur = currentWeather.current;
            const loc = currentWeather.location;
            const temp = currentUnit === 'C' ? cur.temp_c : cur.temp_f;
            const unit = currentUnit === 'C' ? '°C' : '°F';
            
            // Update main weather display
            document.getElementById('result').innerHTML = `
                <div class="weather-main">
                    <div class="weather-icon">
                        <img src="${cur.condition.icon}" alt="${cur.condition.text}" />
                    </div>
                    <div class="weather-temp">${temp}${unit}</div>
                    <div class="weather-desc">${cur.condition.text}</div>
                    <div class="weather-location">${loc.name}, ${loc.country}</div>
                </div>
                <div class="weather-details">
                    <div class="weather-detail">
                        <div class="detail-label">Humidity</div>
                        <div class="detail-value">${cur.humidity}%</div>
                    </div>
                    <div class="weather-detail">
                        <div class="detail-label">Wind Speed</div>
                        <div class="detail-value">${cur.wind_kph} km/h</div>
                    </div>
                    <div class="weather-detail">
                        <div class="detail-label">Cloud Cover</div>
                        <div class="detail-value">${cur.cloud}%</div>
                    </div>
                    <div class="weather-detail">
                        <div class="detail-label">Air Quality</div>
                        <div class="detail-value">${cur.air_quality?.pm2_5?.toFixed(1) || 'N/A'}</div>
                    </div>
                </div>
            `;
        }

        // Update Extended Features with new AI data
        function updateExtendedFeatures(data) {
            const cur = data.current;
            const forecast = data.forecast.forecastday[0];
            
            // Calculate health index based on multiple factors
            const temp = cur.temp_c;
            const humidity = cur.humidity;
            const aqi = cur.air_quality?.pm2_5 || 0;
            const uv = cur.uv || 0;
            
            let healthScore = 100;
            
            // Temperature impact (ideal range 18-24°C)
            if (temp < 10 || temp > 30) healthScore -= 20;
            else if (temp < 15 || temp > 26) healthScore -= 10;
            
            // Humidity impact (ideal range 40-60%)
            if (humidity < 30 || humidity > 70) healthScore -= 15;
            else if (humidity < 40 || humidity > 60) healthScore -= 5;
            
            // Air quality impact
            if (aqi > 55) healthScore -= 25;
            else if (aqi > 35) healthScore -= 15;
            else if (aqi > 12) healthScore -= 5;
            
            // UV impact
            if (uv > 8) healthScore -= 10;
            else if (uv > 6) healthScore -= 5;
            
            healthScore = Math.max(0, healthScore);
            
            // Determine health level
            let healthLevel = "good";
            let healthColor = "health-good";
            if (healthScore < 60) {
                healthLevel = "poor";
                healthColor = "health-poor";
            } else if (healthScore < 80) {
                healthLevel = "moderate";
                healthColor = "health-moderate";
            }
            
            // Generate clothing suggestions
            const clothingSuggestions = generateClothingSuggestions(temp, cur.condition.text, humidity);
            
            // Generate activity recommendations
            const activityRecommendations = generateActivityRecommendations(temp, cur.condition.text, forecast.day.daily_chance_of_rain);
            
            // Calculate season percentages
            const seasonPercentages = calculateSeasonPercentages(data);
            
            // Update extended features grid with new AI features
            document.getElementById('extendedFeatures').innerHTML = `
                <div class="feature-card">
                    <div class="feature-icon">🧠</div>
                    <div class="feature-title">AI Weather Mood</div>
                    <div class="feature-content">
                        <p>Current atmospheric personality:</p>
                        <div style="margin: 15px 0; padding: 15px; background: rgba(139, 92, 246, 0.1); border-radius: 12px; text-align: center;">
                            <div style="font-size: 24px; font-weight: 700; color: var(--ai-color);">${weatherMood}</div>
                            <div style="font-size: 14px; color: var(--text-secondary); margin-top: 5px;">${analyzeWeatherMood(data).description}</div>
                        </div>
                    </div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">⚡</div>
                    <div class="feature-title">Energy & Productivity</div>
                    <div class="feature-content">
                        <p>How weather affects your energy levels:</p>
                        <div class="health-index" style="margin-top: 15px;">
                            <span>Energy: ${energyIndex}/100</span>
                            <div class="health-bar">
                                <div class="health-fill ${energyIndex > 70 ? 'health-good' : energyIndex > 50 ? 'health-moderate' : 'health-poor'}" style="width: ${energyIndex}%"></div>
                            </div>
                        </div>
                        <div class="health-index" style="margin-top: 10px;">
                            <span>Productivity: ${productivityScore}%</span>
                            <div class="health-bar">
                                <div class="health-fill ${productivityScore > 70 ? 'health-good' : productivityScore > 50 ? 'health-moderate' : 'health-poor'}" style="width: ${productivityScore}%"></div>
                            </div>
                        </div>
                        <p style="margin-top: 12px; font-size: 14px;">${getEnergyRecommendation(energyIndex)}</p>
                    </div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🌦️</div>
                    <div class="feature-title">Seasonal Characteristics</div>
                    <div class="feature-content">
                        <p>Current seasonal distribution:</p>
                        <div class="season-percentage">
                            <div class="season-title">Seasonal Distribution</div>
                            <div class="season-bars">
                                <div class="season-bar season-rain" style="width: ${seasonPercentages.rain}%">${seasonPercentages.rain}%</div>
                                <div class="season-bar season-summer" style="width: ${seasonPercentages.summer}%">${seasonPercentages.summer}%</div>
                                <div class="season-bar season-winter" style="width: ${seasonPercentages.winter}%">${seasonPercentages.winter}%</div>
                            </div>
                            <div class="season-labels">
                                <div class="season-label">
                                    <span>Rainy</span>
                                    <span class="season-percent">${seasonPercentages.rain}%</span>
                                </div>
                                <div class="season-label">
                                    <span>Summer</span>
                                    <span class="season-percent">${seasonPercentages.summer}%</span>
                                </div>
                                <div class="season-label">
                                    <span>Winter</span>
                                    <span class="season-percent">${seasonPercentages.winter}%</span>
                                </div>
                            </div>
                        </div>
                        <p style="margin-top: 12px; font-size: 14px;">${getSeasonDescription(seasonPercentages)}</p>
                    </div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">❤️</div>
                    <div class="feature-title">Health & Comfort Index</div>
                    <div class="feature-content">
                        <p>Current conditions impact on health and comfort:</p>
                        <div class="health-index">
                            <span>${healthScore}/100</span>
                            <div class="health-bar">
                                <div class="health-fill ${healthColor}" style="width: ${healthScore}%"></div>
                            </div>
                        </div>
                        <p>${healthLevel === 'good' ? 'Excellent conditions for outdoor activities.' : healthLevel === 'moderate' ? 'Moderate conditions. Some precautions advised.' : 'Poor conditions. Limit outdoor exposure.'}</p>
                    </div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">👕</div>
                    <div class="feature-title">AI Clothing Suggestions</div>
                    <div class="feature-content">
                        <p>Recommended clothing for current conditions:</p>
                        <div class="clothing-suggestions">
                            ${clothingSuggestions.map(item => `
                                <div class="clothing-item">${item}</div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🏃‍♂️</div>
                    <div class="feature-title">AI Activity Recommendations</div>
                    <div class="feature-content">
                        <p>Best activities for today's weather:</p>
                        <ul class="feature-list">
                            ${aiRecommendations.map(activity => `
                                <li>${activity}</li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            `;
        }

        // Helper function to generate season description
        function getSeasonDescription(percentages) {
            const maxSeason = Object.keys(percentages).reduce((a, b) => 
                percentages[a] > percentages[b] ? a : b
            );
            
            if (maxSeason === 'rain') {
                return "Rainy conditions dominate. Perfect for indoor activities or enjoying the rain with proper gear.";
            } else if (maxSeason === 'summer') {
                return "Summer characteristics are prominent. Stay hydrated and protect yourself from the sun.";
            } else {
                return "Winter features are noticeable. Dress warmly and enjoy cozy indoor activities.";
            }
        }

        // Generate clothing suggestions based on weather
        function generateClothingSuggestions(temp, condition, humidity) {
            const suggestions = [];
            
            if (temp < 10) {
                suggestions.push("🧥 Heavy jacket", "🧣 Scarf", "🧤 Gloves", "🎩 Warm hat");
            } else if (temp < 18) {
                suggestions.push("🧥 Light jacket", "👖 Long pants", "👟 Closed shoes");
            } else if (temp < 25) {
                suggestions.push("👕 T-shirt", "👖 Light pants", "👟 Comfortable shoes");
            } else {
                suggestions.push("👕 Light shirt", "🩳 Shorts", "👡 Sandals", "🧢 Sun hat");
            }
            
            if (condition.toLowerCase().includes('rain')) {
                suggestions.push("☂️ Umbrella", "🌧️ Raincoat");
            }
            
            if (humidity > 70) {
                suggestions.push("👕 Breathable fabric");
            }
            
            if (temp > 25) {
                suggestions.push("🕶️ Sunglasses", "🧴 Sunscreen");
            }
            
            return suggestions.slice(0, 4); // Return top 4 suggestions
        }

        // Generate activity recommendations
        function generateActivityRecommendations(temp, condition, rainChance) {
            const activities = [];
            
            if (rainChance < 30) {
                if (temp > 20 && temp < 30) {
                    activities.push("Outdoor sports", "Picnic in the park", "Hiking", "Cycling");
                } else if (temp > 15) {
                    activities.push("Walking tour", "Gardening", "Outdoor photography");
                } else {
                    activities.push("Museum visit", "Shopping", "Indoor sports");
                }
            } else {
                activities.push("Movie theater", "Shopping mall", "Museum", "Cooking class");
            }
            
            if (condition.toLowerCase().includes('sunny') && temp > 20) {
                activities.push("Beach visit", "Swimming", "Outdoor dining");
            }
            
            return activities.slice(0, 4); // Return top 4 activities
        }

        // Get UV level description
        function getUVLevel(uv) {
            if (uv < 3) return "Low";
            if (uv < 6) return "Moderate";
            if (uv < 8) return "High";
            if (uv < 11) return "Very High";
            return "Extreme";
        }

        // Get air quality level
        function getAirQualityLevel(aqi) {
            if (aqi < 12) return "Excellent";
            if (aqi < 35) return "Good";
            if (aqi < 55) return "Moderate";
            if (aqi < 150) return "Poor";
            return "Very Poor";
        }

        // Get pollen level
        function getPollenLevel(temp, humidity) {
            if (temp > 15 && temp < 30 && humidity < 70) return "High";
            if (temp > 10 && humidity < 80) return "Moderate";
            return "Low";
        }

        // Check for weather alerts
        function checkWeatherAlerts(data) {
            const cur = data.current;
            const forecast = data.forecast.forecastday[0];
            
            let alertTitle = "";
            let alertDesc = "";
            
            if (cur.temp_c > 35) {
                alertTitle = "Heat Advisory";
                alertDesc = "High temperatures expected. Stay hydrated and avoid prolonged sun exposure.";
            } else if (cur.temp_c < 5) {
                alertTitle = "Cold Weather Alert";
                alertDesc = "Low temperatures expected. Dress warmly and limit time outdoors.";
            }
            
            if (forecast.day.daily_chance_of_rain > 70) {
                if (alertTitle) {
                    alertTitle += " & Heavy Rain";
                    alertDesc += " Heavy rainfall also expected. Carry an umbrella.";
                } else {
                    alertTitle = "Heavy Rain Expected";
                    alertDesc = "High probability of heavy rainfall. Consider indoor alternatives.";
                }
            }
            
            if (cur.wind_kph > 30) {
                if (alertTitle) {
                    alertTitle += " & Strong Winds";
                    alertDesc += " Strong winds also expected. Secure outdoor objects.";
                } else {
                    alertTitle = "Strong Wind Warning";
                    alertDesc = "High wind speeds expected. Exercise caution outdoors.";
                }
            }
            
            if (alertTitle) {
                showAlert(alertTitle, alertDesc);
            } else {
                closeAlert();
            }
        }

        // Update AI Insights
        function updateAIInsights(data) {
            const cur = data.current;
            const forecast = data.forecast.forecastday[0];
            
            // Generate AI insights based on weather data
            let riskLevel = "LOW";
            let riskReason = "No significant weather risks detected.";
            
            if (cur.wind_kph > 30) {
                riskLevel = "MODERATE";
                riskReason = "High wind conditions detected. Secure outdoor objects.";
            }
            
            if (forecast.day.daily_chance_of_rain > 70) {
                riskLevel = "MODERATE";
                riskReason = "High probability of precipitation. Consider indoor alternatives.";
            }
            
            if (cur.air_quality && cur.air_quality.pm2_5 > 50) {
                riskLevel = "MODERATE";
                riskReason = "Air quality is moderate. Sensitive groups should take precautions.";
            }
            
            const temp = cur.temp_c;
            let activityRecommendation = "";
            
            if (temp > 30) {
                activityRecommendation = "Perfect for swimming or indoor activities to avoid heat.";
            } else if (temp > 20) {
                activityRecommendation = "Ideal for outdoor activities like hiking, cycling, or picnics.";
            } else if (temp > 10) {
                activityRecommendation = "Good for brisk walks or light outdoor exercises.";
            } else {
                activityRecommendation = "Best for indoor activities or winter sports if available.";
            }
            
            // Update insights grid
            document.getElementById('aiInsights').innerHTML = `
                <div class="insight-card">
                    <div class="insight-title">🔍 Predictive Analysis</div>
                    <div class="insight-content">Based on current patterns, expect ${forecast.day.condition.text.toLowerCase()} throughout the day with a ${forecast.day.daily_chance_of_rain}% chance of rain.</div>
                </div>
                <div class="insight-card">
                    <div class="insight-title">🌦️ Smart Recommendations</div>
                    <div class="insight-content">${activityRecommendation} ${cur.humidity > 80 ? 'High humidity may make it feel warmer than actual temperature.' : ''}</div>
                </div>
                <div class="insight-card">
                    <div class="insight-title">⚠️ Risk Assessment: ${riskLevel}</div>
                    <div class="insight-content">${riskReason} ${cur.uv > 6 ? 'High UV index detected. Use sun protection.' : ''}</div>
                </div>
            `;
        }

        // Update Map
        function updateMap(lat, lon, name) {
            markers.forEach(m => map.removeLayer(m));
            markers = [];
            const marker = L.marker([lat, lon]).addTo(map)
                .bindPopup(`
                    <div style="text-align:center">
                        <h3>${name}</h3>
                        <p>${currentWeather.current.condition.text}</p>
                        <p>${currentUnit === 'C' ? currentWeather.current.temp_c : currentWeather.current.temp_f}${currentUnit === 'C' ? '°C' : '°F'}</p>
                    </div>
                `)
                .openPopup();
            markers.push(marker);
            map.setView([lat, lon], 8);
        }

        // Update Charts
        function updateCharts(data) {
            const cur = data.current;
            pieChart.data.datasets[0].data = [cur.humidity, cur.cloud, cur.wind_kph];
            pieChart.update();
        }

        // Hourly Chart
        function updateHourlyChart(data) {
            const hours = data.forecast.forecastday[0].hour;
            const labels = hours.map(h => {
                const time = h.time.split(' ')[1];
                return time.substring(0, 5); // Format as HH:MM
            });
            
            hourlyChart.data.labels = labels;
            hourlyChart.data.datasets[0].data = hours.map(h => h.temp_c);
            hourlyChart.update();
        }

        // ML Prediction (simplified)
        async function updateMLPrediction(data) {
            const temps = data.forecast.forecastday[0].hour.map((h, i) => h.temp_c);
            const xs = tf.tensor2d([...temps.keys()].map(i => [i]));
            const ys = tf.tensor2d(temps.map(t => [t]));
            
            const model = tf.sequential();
            model.add(tf.layers.dense({units: 1, inputShape: [1]}));
            model.compile({optimizer: 'sgd', loss: 'meanSquaredError'});
            await model.fit(xs, ys, {epochs: 200});
            
            const preds = model.predict(xs).dataSync();
            
            if (mlChart) mlChart.destroy();
            
            mlChart = new Chart(document.getElementById('mlPredictionChart'), {
                type: 'line',
                data: {
                    labels: [...temps.keys()],
                    datasets: [
                        {
                            label: 'Actual Temperature °C',
                            data: temps,
                            borderColor: '#6366f1',
                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                            fill: true,
                            tension: 0.4
                        },
                        {
                            label: 'AI Predicted Temperature °C',
                            data: preds,
                            borderColor: '#ef4444',
                            borderDash: [5, 5],
                            fill: false,
                            tension: 0.4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }

        // Fetch City-Specific Weather News
        async function updateCityNews(cityName) {
            document.getElementById('currentCity').textContent = cityName;
            document.getElementById('newsContent').innerHTML = `
                <div class="loading">
                    <div class="loading-spinner"></div>
                </div>
            `;
            
            try {
                // In a real application, you would use a news API here
                // For demonstration, we'll use mock data based on the city
                const mockNews = generateCityNews(cityName);
                
                // Simulate API delay
                setTimeout(() => {
                    document.getElementById('newsContent').innerHTML = mockNews;
                }, 1000);
                
            } catch (error) {
                console.error("Error fetching news:", error);
                document.getElementById('newsContent').innerHTML = `
                    <div class="error">
                        Unable to load news for ${cityName}. Please try again later.
                    </div>
                `;
            }
        }

        // Generate mock city-specific news
        function generateCityNews(cityName) {
            const newsTemplates = {
                "Mumbai": [
                    {
                        title: "Heavy Rainfall Expected in Mumbai This Weekend",
                        content: "The India Meteorological Department has issued a heavy rainfall alert for Mumbai and surrounding areas. Residents advised to take necessary precautions.",
                        source: "Times of India",
                        time: "2 hours ago"
                    },
                    {
                        title: "Mumbai Coastal Areas Face High Tide Warning",
                        content: "Authorities have issued warnings for high tides along Mumbai's coastline. Fishermen advised to avoid venturing into the sea.",
                        source: "Hindustan Times",
                        time: "5 hours ago"
                    },
                    {
                        title: "Air Quality Improves in Mumbai After Recent Rains",
                        content: "The Air Quality Index in Mumbai has shown significant improvement following the recent spell of rainfall across the city.",
                        source: "Indian Express",
                        time: "1 day ago"
                    }
                ],
                "Delhi": [
                    {
                        title: "Heatwave Conditions to Continue in Delhi",
                        content: "Temperatures in Delhi are expected to remain high with heatwave conditions likely to persist for the next 3-4 days.",
                        source: "NDTV",
                        time: "3 hours ago"
                    },
                    {
                        title: "Delhi Records Highest Temperature of the Season",
                        content: "The capital city recorded 45.2°C today, the highest temperature so far this summer season.",
                        source: "The Hindu",
                        time: "6 hours ago"
                    },
                    {
                        title: "Air Quality Deteriorates in Delhi Due to Dust Storms",
                        content: "Strong winds carrying dust from neighboring states have led to a significant drop in Delhi's air quality.",
                        source: "Times Now",
                        time: "1 day ago"
                    }
                ],
                "Chennai": [
                    {
                        title: "Chennai Braces for Cyclonic Activity",
                        content: "Weather models indicate possible cyclonic formation in the Bay of Bengal that may affect Chennai in the coming days.",
                        source: "The Hindu",
                        time: "4 hours ago"
                    },
                    {
                        title: "Heavy Rains Lash Chennai, Waterlogging Reported",
                        content: "Several areas in Chennai experienced waterlogging following heavy overnight rains. Traffic disruptions reported in low-lying areas.",
                        source: "Deccan Chronicle",
                        time: "8 hours ago"
                    },
                    {
                        title: "Chennai Temperature Drops After Thunderstorms",
                        content: "The city experienced a significant drop in temperature following intense thunderstorms yesterday evening.",
                        source: "Times of India",
                        time: "2 days ago"
                    }
                ],
                "Kolkata": [
                    {
                        title: "Kolkata Experiences Unseasonal Rainfall",
                        content: "The city witnessed unexpected rainfall today, bringing relief from the ongoing heatwave conditions.",
                        source: "The Telegraph",
                        time: "2 hours ago"
                    },
                    {
                        title: "Humidity Levels Rise in Kolkata",
                        content: "Meteorological department reports increasing humidity levels in Kolkata, making the weather feel warmer than actual temperatures.",
                        source: "Anandabazar Patrika",
                        time: "5 hours ago"
                    },
                    {
                        title: "Kolkata Records Highest Humidity of the Year",
                        content: "The relative humidity in Kolkata touched 92% today, making it the most humid day of the year so far.",
                        source: "Times of India",
                        time: "1 day ago"
                    }
                ],
                "Bangalore": [
                    {
                        title: "Bangalore Weather: Pleasant Conditions to Continue",
                        content: "The city is expected to experience pleasant weather with occasional light showers over the next few days.",
                        source: "Deccan Herald",
                        time: "3 hours ago"
                    },
                    {
                        title: "Bangalore Records Lowest Temperature in a Month",
                        content: "The city witnessed its coolest morning in over a month with temperatures dropping to 18°C.",
                        source: "The Hindu",
                        time: "7 hours ago"
                    },
                    {
                        title: "Moderate Rainfall Expected in Bangalore Suburbs",
                        content: "Weather department predicts moderate rainfall in Bangalore's outskirts over the weekend.",
                        source: "Times of India",
                        time: "1 day ago"
                    }
                ]
            };
            
            // Default news if city not in our templates
            const defaultNews = [
                {
                    title: `Weather Conditions in ${cityName}`,
                    content: `Current weather patterns in ${cityName} show typical seasonal variations with no extreme conditions expected in the coming days.`,
                    source: "WeatherSphere AI",
                    time: "Just now"
                },
                {
                    title: `Regional Climate Analysis for ${cityName}`,
                    content: `Our AI systems are analyzing long-term climate patterns in the ${cityName} region to provide more accurate seasonal forecasts.`,
                    source: "Climate AI",
                    time: "2 hours ago"
                },
                {
                    title: "AI Improves Local Weather Prediction Accuracy",
                    content: "New machine learning models are showing significant improvements in hyperlocal weather forecasting accuracy.",
                    source: "Tech Weather",
                    time: "1 day ago"
                }
            ];
            
            const news = newsTemplates[cityName] || defaultNews;
            
            return news.map(item => `
                <div class="news-card">
                    <div class="news-title">${item.title}</div>
                    <div class="news-content">${item.content}</div>
                    <div class="news-meta">
                        <span class="news-source">${item.source}</span>
                        <span>${item.time}</span>
                    </div>
                </div>
            `).join('');
        }

        // Initialize with default data
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize with sample data for demonstration
            updateExtendedFeatures({
                current: {
                    temp_c: 22,
                    humidity: 65,
                    condition: { text: "Partly Cloudy" },
                    air_quality: { pm2_5: 25 },
                    uv: 5,
                    vis_km: 10,
                    wind_kph: 15
                },
                forecast: {
                    forecastday: [{
                        day: {
                            daily_chance_of_rain: 30,
                            condition: { text: "Partly Cloudy" }
                        },
                        astro: {
                            sunrise: "06:15 AM",
                            sunset: "06:45 PM",
                            moon_phase: "Waxing Crescent"
                        }
                    }]
                }
            });
            
            updateCityNews('Global');
            
            // Add event listener for Enter key in search input
            document.getElementById('locationInput').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    getWeather();
                }
            });
            
            // Add event listener for Enter key in chat input
            document.getElementById('chatInput').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    sendMessage();
                }
            });
        });