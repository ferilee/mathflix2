<template>
  <router-view></router-view>
  <DemoTour />
  <AppDialog />
  <button
    v-if="canInstall"
    type="button"
    class="fixed right-4 bottom-24 md:bottom-6 z-[220] bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-lg border border-indigo-400/40"
    @click="installApp"
  >
    Install App
  </button>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import DemoTour from "./components/DemoTour.vue";
import AppDialog from "./components/AppDialog.vue";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null);
const isInstalled = ref(false);

const canInstall = computed(() => !!deferredPrompt.value && !isInstalled.value);

const onBeforeInstallPrompt = (event: Event) => {
  event.preventDefault();
  deferredPrompt.value = event as BeforeInstallPromptEvent;
};

const onAppInstalled = () => {
  isInstalled.value = true;
  deferredPrompt.value = null;
};

const installApp = async () => {
  if (!deferredPrompt.value) return;
  await deferredPrompt.value.prompt();
  const choice = await deferredPrompt.value.userChoice;
  if (choice.outcome === "accepted") {
    deferredPrompt.value = null;
  }
};

onMounted(() => {
  window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  window.addEventListener("appinstalled", onAppInstalled);
  isInstalled.value =
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true;
});

onUnmounted(() => {
  window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  window.removeEventListener("appinstalled", onAppInstalled);
});
</script>

<style>
/* Global styles are in style.css */
</style>
