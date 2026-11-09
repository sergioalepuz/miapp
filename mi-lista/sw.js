// Service worker de Mi Lista: permite abrir la app sin conexión.
// Estrategia: primero la red (para recibir siempre la última versión);
// si no hay conexión o tarda más de 3 segundos, se usa la copia guardada.

const CACHE = "mi-lista-v1";
const ARCHIVOS = ["./", "./index.html", "./mi_lista.png", "./manifest.json"];
const ESPERA_RED_MS = 3000;

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(claves => Promise.all(claves.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;

  e.respondWith((async () => {
    const cache = await caches.open(CACHE);

    const desdeRed = fetch(req, { cache: "no-cache" }).then(resp => {
      if (resp && resp.ok) cache.put(req, resp.clone());
      return resp;
    });

    const guardado = await cache.match(req, { ignoreSearch: true });
    if (!guardado) return desdeRed;

    // Hay copia guardada: esperamos a la red como mucho ESPERA_RED_MS
    const tiempoAgotado = new Promise(ok => setTimeout(() => ok(guardado), ESPERA_RED_MS));
    try {
      return await Promise.race([desdeRed, tiempoAgotado]);
    } catch (err) {
      return guardado;
    }
  })());
});
