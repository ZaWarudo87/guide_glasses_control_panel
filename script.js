const backendAPI = "https://blocks-equity-lotus-spokesman.trycloudflare.com/";

        function toggleSection(sectionId) {
            const content = document.getElementById(sectionId + '-content');
            const arrow = document.getElementById(sectionId + '-arrow');
            
            if (content.classList.contains('expanded')) {
                content.classList.remove('expanded');
                arrow.classList.remove('rotate-180');
            } else {
                content.classList.add('expanded');
                arrow.classList.add('rotate-180');
            }
        }

        function toggleStoreDetails(storeId) {
            const details = document.getElementById(storeId + '-details');
            const arrow = document.getElementById(storeId + '-arrow');
            
            if (details.classList.contains('expanded')) {
                details.classList.remove('expanded');
                arrow.classList.remove('rotate-180');
            } else {
                details.classList.add('expanded');
                arrow.classList.add('rotate-180');
            }
        }

        function toggleFavorite(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (e.target.classList.contains('bg-pink-500')) {
                e.target.classList.remove('bg-pink-500', 'hover:bg-pink-600');
                e.target.classList.add('bg-gray-500', 'hover:bg-gray-600');
                addFavoriteStore(e.target.closest('.flex-1').querySelector('h3').textContent, true);
            } else {
                e.target.classList.remove('bg-gray-500', 'hover:bg-gray-600');
                e.target.classList.add('bg-pink-500', 'hover:bg-pink-600');
                addFavoriteStore(e.target.closest('.flex-1').querySelector('h3').textContent, false);
            }
        }

        async function getGeoPos(){
            return new Promise((resolve) => {
                navigator.geolocation.getCurrentPosition(function(position) {
                    resolve([position.coords.latitude, position.coords.longitude]);
                }, function(error){
                    alert("Error: " + error.message);
                    resolve([0, 0]);
                });
            });
        }

        async function initMap(){
            const [la, ln] = await getGeoPos();
            const myPos = {lat: la, lng: ln};
            const map = new google.maps.Map(document.getElementById("map"), {
                zoom: 15,
                center: myPos,
            });
        }

        async function addFavoriteStore(store, add){
            try{
                const response = await fetch(backendAPI + "add_favorite?add=" + add + "&place_id=" + store.place_id);
                if(!response.ok) throw new Error("Network response was not ok");
                loadFavoriteStores();
            }catch(error){
                console.error("Failed to add to favorite:", error);
            }
        }

        async function loadFavoriteStores(){
            const fs = document.getElementById("favorite-stores");
            try{
                const response = await fetch(backendAPI + "favorite_stores");
                if(!response.ok) throw new Error("Network response was not ok");
                const data = await response.json();
                let i = 1;
                data.forEach(store => {
                    const sd = document.createElement("div");
                    sd.className = "border rounded-lg p-3 hover:bg-gray-50 transition-colors";
                    sd.innerHTML = `
                        <div class="flex justify-between items-center cursor-pointer" onclick="toggleStoreDetails(&#39;fav${i}&#39;)">
                            <div class="flex-1">
                                <h3 class="font-semibold text-gray-800">${store.name}</h3>
                                <div class="flex items-center space-x-4 text-sm text-gray-600">
                                    <span>☆ ${store.rating}</span>
                                    <span>${store.price}</span>
                                </div>
                            </div>
                            <div class="flex items-center space-x-2">
                                <button class="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-full text-sm transition-colors" onclick="toggleFavorite(event)">♡</button>
                                <svg id="fav${i}-arrow" class="w-4 h-4 text-gray-400 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </div>
                        </div>
                        <div id="fav${i}-details" class="collapse-content mt-3">
                            <div class="text-sm text-gray-600 space-y-1">
                                <p><strong>Address: </strong>${store.details.address}</p>
                                <p><strong>Distance: </strong>${store.details.distance} m</p>
                                <p><strong>Business Hours: </strong>${store.details.open}</p>
                            </div>
                        </div>
                    `;
                    fs.appendChild(sd);
                    i += 1;
                });
            }catch (error){
                console.error("Error fetching favorite stores:", error);
                fs.innerHTML = `<p class="text-gray-500 text-center">Failed to load favorite stores.</p>`;
            }
        }

        async function loadNearbyStores(){
            const [lat, lng] = await getGeoPos();
            if(lat == 0 && lng == 0){
                console.error("Failed to get current location.");
                return;
            }

            const ns = document.getElementById("nearby-stores-content").firstElementChild;
            try{
                const response = await fetch(backendAPI + "nearby_stores?lat=" + lat + "&lng=" + lng);
                if(!response.ok) throw new Error("Network response was not ok");
                const data = await response.json();
                ns.innerHTML = "";
                let i = 1;
                data.forEach(store => {
                    const sd = document.createElement("div");
                    sd.className = "border rounded-lg p-3 hover:bg-gray-50 transition-colors";
                    const color = store.favorite ? "gray" : "pink";
                    sd.innerHTML = `
                        <div class="flex justify-between items-center cursor-pointer" onclick="toggleStoreDetails(&#39;store${i}&#39;)">
                            <div class="flex-1">
                                <h3 class="font-semibold text-gray-800">${store.name}</h3>
                                <div class="flex items-center space-x-4 text-sm text-gray-600">
                                    <span>☆ ${store.rating}</span>
                                    <span>${store.price}</span>
                                </div>
                            </div>
                            <div class="flex items-center space-x-2">
                                <button class="bg-${color}-500 hover:bg-${color}-600 text-white px-3 py-1 rounded-full text-sm transition-colors" onclick="toggleFavorite(event)">♡</button>
                                <svg id="store${i}-arrow" class="w-4 h-4 text-gray-400 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </div>
                        </div>
                        <div id="store${i}-details" class="collapse-content mt-3">
                            <div class="text-sm text-gray-600 space-y-1">
                                <p><strong>Address: </strong>${store.details.address}</p>
                                <p><strong>Distance: </strong>${store.details.distance} m</p>
                                <p><strong>Opening: </strong>${store.details.open}</p>
                            </div>
                        </div>
                    `;
                    ns.appendChild(sd);
                    i += 1;
                });
            }catch(error){
                console.error("Error fetching nearby stores:", error);
                ns.innerHTML = `<p class="text-gray-500 text-center">Failed to load favorite stores.</p>`;
            }
        }

        async function initLogin(){
            try{
                const response = await fetch(backendAPI + "init");
                if (!response.ok) throw new Error("Network response was not ok");
                const data = await response.json();
                console.log("Initialization successful:", data);
            }catch(error){
                console.error("Error during initialization:", error);
            }
        }

        document.addEventListener("DOMContentLoaded", function(){
            if(!navigator.geolocation){
                alert("Geolocation is not supported by this browser.");
            }
            initMap({lat: 0, lng: 0});
            initLogin();
            loadFavoriteStores();
            setInterval(() => {
                loadNearbyStores();
            }, 30000);
        });