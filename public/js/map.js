const customIcon = L.divIcon({
    className: "custom-marker",
    html: `
        <div class="marker-wrapper">
            <div class="marker-circle"></div>
            <div class="marker-icon">
                <i class="fa-solid fa-house"></i>
            </div>
        </div>
    `,
    iconSize: [60, 60],
    iconAnchor: [30, 30],
});


const map = L.map("map").setView([coordinates[1], coordinates[0]], 10);

L.tileLayer("https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png", {
    attribution: "&copy; Stadia Maps & OpenStreetMap"
}).addTo(map);

L.marker([coordinates[1], coordinates[0]],{
    icon: customIcon
})
    .addTo(map)
    .bindPopup(`
    <div style="text-align:center;">
        <h6><b>${listingTitle}</b></h6>
        <a href="https://www.google.com/maps/dir/?api=1&destination=${coordinates[1]},${coordinates[0]}"
           target="_blank"
           style="text-decoration:none;color:#ff385c;">
           🧭 Get Directions
        </a>
    </div>
`)
    .openPopup();


    L.circle([coordinates[1], coordinates[0]], {
    radius: 400,
    color: "#ff385c",
    fillColor: "#ff385c",
    fillOpacity: 0.15,
    weight: 1
}).addTo(map);