(function () {
  "use strict";

  var audio = document.getElementById("myAudio");
  var musicButton = document.getElementById("music-toggle");
  var musicStatus = document.getElementById("music-status");
  var hero = document.getElementById("wrap");
  var flare = document.getElementById("heart-flare");
  var continueToMemories = document.getElementById("continue-to-memories");
  var memories = document.getElementById("memories");
  var continueToFinale = document.getElementById("continue-to-finale");
  var finale = document.getElementById("finale");
  var replayButton = document.getElementById("replay-experience");
  var messageTimer = 0;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var lightbox = document.getElementById("photo-lightbox");
  var lightboxImage = document.getElementById("lightbox-image");
  var closeLightboxButton = document.getElementById("close-lightbox");
  var lastPhotoButton = null;
  var particlesCanvas = document.getElementById("celebration-particles");
  var particlesContext = particlesCanvas.getContext("2d");
  var particleFrame = 0;

  function updateMusicControl() {
    var playing = !audio.paused && !audio.ended;
    musicButton.setAttribute("aria-pressed", playing ? "true" : "false");
    musicButton.setAttribute("aria-label", playing ? "Pause birthday music" : "Play birthday music");
    musicButton.title = playing ? "Pause birthday music" : "Play birthday music";
    musicStatus.textContent = playing ? "On" : "Off";
  }

  musicButton.addEventListener("click", function () {
    if (!audio.paused) {
      audio.pause();
      updateMusicControl();
      return;
    }

    try {
      var playback = audio.play();
      if (playback && typeof playback.then === "function") {
        playback.then(updateMusicControl).catch(function () {
          musicStatus.textContent = "Unavailable";
          musicButton.setAttribute("aria-label", "Birthday music could not start");
        });
      }
    } catch (error) {
      musicStatus.textContent = "Unavailable";
      musicButton.setAttribute("aria-label", "Birthday music could not start");
    }
  });

  audio.addEventListener("play", updateMusicControl);
  audio.addEventListener("pause", updateMusicControl);
  audio.addEventListener("ended", updateMusicControl);
  audio.addEventListener("error", function () {
    musicStatus.textContent = "Unavailable";
    musicButton.setAttribute("aria-label", "Birthday music is unavailable");
  });

  window.addEventListener("birthday:heart-open", function () {
    hero.classList.add("tree-started");
    flare.classList.remove("is-animating");
    window.requestAnimationFrame(function () {
      flare.classList.add("is-animating");
    });
  });

  window.addEventListener("birthday:message-ready", function () {
    window.clearTimeout(messageTimer);
    messageTimer = window.setTimeout(function () {
      hero.classList.add("message-visible");
      continueToMemories.hidden = false;
    }, reducedMotion.matches ? 30 : 3450);
  });

  function revealSection(section, heading) {
    section.hidden = false;
    section.classList.remove("is-revealing");
    void section.offsetWidth;
    section.classList.add("is-revealing");
    section.scrollIntoView({
      behavior: reducedMotion.matches ? "auto" : "smooth",
      block: "start"
    });
    if (heading) {
      window.setTimeout(function () {
        heading.focus({ preventScroll: true });
      }, reducedMotion.matches ? 0 : 450);
    }
  }

  continueToMemories.addEventListener("click", function () {
    revealSection(memories, document.getElementById("memories-title"));
  });

  var memoryPhotos = Array.prototype.slice.call(document.querySelectorAll(".memory-photo"));
  memoryPhotos.forEach(function (button) {
    button.addEventListener("click", function () {
      var image = button.querySelector("img");
      lastPhotoButton = button;
      lightboxImage.src = image.currentSrc || image.src;
      lightboxImage.alt = image.alt;
      if (typeof lightbox.showModal === "function") {
        lightbox.showModal();
      } else {
        lightbox.setAttribute("open", "");
      }
      closeLightboxButton.focus();
    });
  });

  function closeLightbox() {
    if (typeof lightbox.close === "function" && lightbox.open) {
      lightbox.close();
    } else {
      lightbox.removeAttribute("open");
    }
  }

  closeLightboxButton.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", function (event) {
    if (event.target === lightbox) closeLightbox();
  });
  lightbox.addEventListener("close", function () {
    lightboxImage.removeAttribute("src");
    if (lastPhotoButton) lastPhotoButton.focus();
  });

  function resizeParticleCanvas() {
    var ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    particlesCanvas.width = Math.round(window.innerWidth * ratio);
    particlesCanvas.height = Math.round(window.innerHeight * ratio);
    particlesCanvas.style.width = window.innerWidth + "px";
    particlesCanvas.style.height = window.innerHeight + "px";
    particlesContext.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function stopCelebration() {
    window.cancelAnimationFrame(particleFrame);
    particleFrame = 0;
    particlesCanvas.hidden = true;
    if (particlesContext) {
      particlesContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }

  function startCelebration() {
    stopCelebration();
    if (reducedMotion.matches || !particlesContext) return;

    resizeParticleCanvas();
    particlesCanvas.hidden = false;

    var colors = ["#f2a9c8", "#a9c9f5", "#f5d59a", "#f4f1ed"];
    var fragments = Array.from({ length: Math.min(46, Math.max(22, Math.floor(window.innerWidth / 16))) }, function () {
      return {
        x: Math.random() * window.innerWidth,
        y: -Math.random() * window.innerHeight,
        width: 2 + Math.random() * 3,
        height: 4 + Math.random() * 5,
        speed: 0.45 + Math.random() * 0.9,
        drift: (Math.random() - 0.5) * 0.45,
        spin: Math.random() * Math.PI,
        color: colors[Math.floor(Math.random() * colors.length)]
      };
    });
    var startedAt = window.performance.now();
    var duration = 6500;

    function draw(now) {
      var progress = Math.min(1, (now - startedAt) / duration);
      particlesContext.clearRect(0, 0, window.innerWidth, window.innerHeight);

      fragments.forEach(function (fragment) {
        fragment.y += fragment.speed;
        fragment.x += fragment.drift;
        fragment.spin += 0.006;
        if (fragment.y > window.innerHeight + 12) {
          fragment.y = -12;
          fragment.x = Math.random() * window.innerWidth;
        }
        particlesContext.save();
        particlesContext.globalAlpha = 0.56 * (1 - progress);
        particlesContext.translate(fragment.x, fragment.y);
        particlesContext.rotate(fragment.spin);
        particlesContext.fillStyle = fragment.color;
        particlesContext.fillRect(-fragment.width / 2, -fragment.height / 2, fragment.width, fragment.height);
        particlesContext.restore();
      });

      if (progress < 1 && !document.hidden) {
        particleFrame = window.requestAnimationFrame(draw);
      } else {
        stopCelebration();
      }
    }

    particleFrame = window.requestAnimationFrame(draw);
  }

  window.addEventListener("resize", function () {
    if (!particlesCanvas.hidden) resizeParticleCanvas();
  });

  continueToFinale.addEventListener("click", function () {
    revealSection(finale, document.getElementById("finale-title"));
    startCelebration();
  });

  replayButton.addEventListener("click", function () {
    window.clearTimeout(messageTimer);
    closeLightbox();
    stopCelebration();
    memories.classList.remove("is-revealing");
    finale.classList.remove("is-revealing");
    memories.hidden = true;
    finale.hidden = true;
    continueToMemories.hidden = true;
    hero.classList.remove("tree-started", "message-visible");
    flare.classList.remove("is-animating");
    document.getElementById("code").style.display = "none";
    window.scrollTo({ top: 0, behavior: reducedMotion.matches ? "auto" : "smooth" });
    if (typeof window.restartBirthdayTree === "function") {
      window.restartBirthdayTree();
    }
  });
})();
