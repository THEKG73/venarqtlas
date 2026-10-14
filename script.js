// (Mantén la inicialización del mapa y la capa base igual que antes...)
const map = L.map('map', {
    minZoom: 3,
    worldCopyJump: false,
    maxBoundsViscosity: 1.0
}).setView([-0.2059, -78.4879], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    noWrap: true,
    attribution: '&copy; OpenStreetMap contributors'
    updateWhenIdle: true,
    keepBuffer: 2,
    detectRetina: false
}).addTo(map);

fetch('./atlasOp.kml')
    .then(response => response.text())
    .then(kmlText => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(kmlText, 'text/xml');
        const placemarks = xmlDoc.querySelectorAll('Placemark');
        const bounds = [];

        placemarks.forEach(placemark => {
            // Obtener el ID único que ya tiene tu KML
            const placemarkId = placemark.getAttribute('id') || '';
            
            const nameNode = placemark.querySelector('name');
            const nombre = nameNode ? nameNode.textContent.trim() : "Ubicación";

            const descNode = placemark.querySelector('description');
            const descText = descNode ? descNode.textContent.trim() : "";

            const coordsNode = placemark.querySelector('Point coordinates');
            if (coordsNode) {
                const coordsArr = coordsNode.textContent.trim().split(',');
                if (coordsArr.length >= 2) {
                    const lng = parseFloat(coordsArr[0]);
                    const lat = parseFloat(coordsArr[1]);
                    bounds.push([lat, lng]);

                    // CREAR ENLACE DINÁMICO: Redirige a detalle.html enviando el ID por la URL
                    const urlExterna = `detalle.html?id=${placemarkId}`;

                    let popupContent = `
                        <div style="font-family: sans-serif; padding: 4px; max-width: 240px;">
                            <h3 style="margin: 0 0 6px 0; font-size: 15px;">
                                <a href="${urlExterna}" target="_blank" style="color: #2980b9; text-decoration: none;">
                                    ${nombre} ↗
                                </a>
                            </h3>
                            <div style="color: #555; font-size: 13px; line-height: 1.4;">
                                ${descText}
                            </div>
                        </div>
                    `;

                    const marker = L.marker([lat, lng]).addTo(map);
                    marker.bindPopup(popupContent);
                }
            }
        });

        if (bounds.length > 0) {
            const kmlBounds = L.latLngBounds(bounds);
            map.fitBounds(kmlBounds);
            map.setMaxBounds(kmlBounds.pad(0.5));
        }
    });
