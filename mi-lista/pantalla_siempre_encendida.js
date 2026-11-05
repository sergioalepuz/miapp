    /* ---------- Pantalla siempre encendida ---------- */
    // 1) Función oficial del navegador (Screen Wake Lock)
    // 2) Si el móvil no la concede, un vídeo diminuto en bucle (truco "NoSleep") que arranca con un toque
    const MOSTRAR_ESTADO_PANTALLA = true; // pon false cuando todo funcione, para que no salgan los avisos
    const VIDEO_REPOSO = "data:video/mp4;base64,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";

    let bloqueoPantalla = null;
    let promesaBloqueo = null;
    let videoReposo = null;
    let ultimoEstadoPantalla = "";
    let errorBloqueo = "";

    function estadoPantalla(texto) {
      if (!MOSTRAR_ESTADO_PANTALLA || texto === ultimoEstadoPantalla) return;
      ultimoEstadoPantalla = texto;
      aviso(texto);
    }

    // Método 1: bloqueo oficial
    function pedirBloqueoPantalla() {
      if (!("wakeLock" in navigator)) {
        errorBloqueo = "sin soporte";
        return Promise.resolve();
      }
      if (bloqueoPantalla) return Promise.resolve();
      if (!promesaBloqueo) {
        promesaBloqueo = (async () => {
          try {
            bloqueoPantalla = await navigator.wakeLock.request("screen");
            bloqueoPantalla.addEventListener("release", () => { bloqueoPantalla = null; });
            estadoPantalla("Pantalla encendida (bloqueo)");
          } catch (e) {
            bloqueoPantalla = null;
            errorBloqueo = e.name || "error";
          } finally {
            promesaBloqueo = null;
          }
        })();
      }
      return promesaBloqueo;
    }

    // Método 2 (de reserva): vídeo en bucle. Solo puede arrancar con un toque del usuario.
    async function iniciarVideoReposo() {
      try {
        if (!videoReposo) {
          videoReposo = document.createElement("video");
          videoReposo.setAttribute("playsinline", "");
          videoReposo.setAttribute("muted", "");
          videoReposo.muted = true;
          videoReposo.loop = true;
          videoReposo.src = VIDEO_REPOSO;
        }
        if (videoReposo.paused) await videoReposo.play();
        estadoPantalla("Pantalla encendida (vídeo)");
      } catch (e) {
        estadoPantalla("No se pudo (" + (errorBloqueo || "sin bloqueo") + " / " + (e.name || "vídeo") + ")");
      }
    }

    async function mantenerPantalla(porToque) {
      await pedirBloqueoPantalla();
      if (!bloqueoPantalla && porToque) await iniciarVideoReposo();
    }

    function mantenerPantallaActiva() {
      mantenerPantalla(false);
      // Al volver a la app desde otra, el bloqueo se pierde y el vídeo se pausa: se recupera
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") mantenerPantalla(false);
      });
      // Los toques cuentan como permiso del usuario para el bloqueo y para arrancar el vídeo
      ["pointerup", "touchend"].forEach(evento =>
        document.addEventListener(evento, () => mantenerPantalla(true), { passive: true })
      );
    }
