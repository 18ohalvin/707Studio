<template>
  <div class="h-screen w-screen flex flex-col items-center justify-between bg-[#f5f5f5] text-black font-sans relative select-none p-6">
    <!-- Header: 707 Logo -->
    <header class="w-full flex items-center justify-between max-w-[1100px] py-2">
      <div class="flex items-end gap-[16px] h-[16px]">
        <router-link to="/" class="h-[16px] w-[51px] relative shrink-0 flex items-end cursor-pointer hover:opacity-80 transition-opacity" title="Back to 707 Home">
          <img 
            :src="FIGMA_ASSETS.logo707" 
            alt="707 Logo" 
            class="inset-0 object-contain pointer-events-none size-full"
          />
        </router-link>
        <p class="font-707 text-[14px] text-black font-normal uppercase whitespace-nowrap leading-none flex items-baseline translate-y-[2px]">
          <span class="tracking-[0.24em] mr-2">DESIGN STUDIO</span>
          <span class="tracking-normal font-normal">1.0</span>
        </p>
      </div>

      <router-link 
        to="/" 
        class="flex items-center gap-1.5 px-3 h-[30px] rounded-[6px] border border-black/15 text-[12px] font-707 font-medium hover:bg-black/5 transition-colors text-black"
      >
        <ArrowLeft class="w-3.5 h-3.5" />
        <span>Back to Studio</span>
      </router-link>
    </header>

    <!-- Center Card -->
    <div class="w-full max-w-[400px] backdrop-blur-2xl bg-white/95 border border-white/60 p-8 rounded-[16px] shadow-[0px_20px_50px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.04)] flex flex-col gap-6 animate-apple-pop">
      <div class="flex flex-col items-center text-center gap-3">
        <div class="size-12 rounded-full bg-black text-white flex items-center justify-center shadow-sm">
          <ShieldCheck class="w-6 h-6 stroke-[2.2]" />
        </div>
        <div>
          <h1 class="font-707 text-[20px] font-normal leading-[26px] text-black">
            Superadmin Verification
          </h1>
          <p class="font-707 text-[13px] text-neutral-500 mt-1 leading-relaxed">
            Enter your Superadmin master passkey to manage system governance, brand PICs, and team accounts.
          </p>
        </div>
      </div>

      <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
        <div class="flex flex-col gap-1.5">
          <label class="font-707 text-[11px] font-medium text-neutral-700 tracking-wider uppercase">
            Superadmin Master Passkey
          </label>
          <div class="relative flex items-center">
            <input
              ref="passwordInput"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="Enter passkey (e.g. 707admin)"
              class="w-full h-[48px] px-4 pr-10 rounded-[10px] bg-black/[0.03] border border-black/15 text-black font-707 text-[14px] outline-none focus:border-black focus:bg-white transition-all placeholder:text-neutral-400"
              :disabled="isLoading"
              @input="errorMessage = ''"
            />
            <button 
              type="button" 
              @click="showPassword = !showPassword"
              class="absolute right-3 text-neutral-400 hover:text-black cursor-pointer bg-transparent border-none p-1"
              tabindex="-1"
            >
              <EyeOff v-if="showPassword" class="w-4 h-4" />
              <Eye v-else class="w-4 h-4" />
            </button>
          </div>
        </div>

        <p v-if="errorMessage" class="text-xs text-red-500 font-707 flex items-center gap-1.5">
          <AlertCircle class="w-3.5 h-3.5 shrink-0" />
          <span>{{ errorMessage }}</span>
        </p>

        <button
          type="submit"
          class="w-full h-[48px] rounded-[10px] bg-black text-white text-[14px] font-707 font-medium tracking-wide disabled:opacity-50 transition-all apple-press cursor-pointer flex items-center justify-center gap-2 hover:bg-neutral-800 shadow-sm mt-2"
          :disabled="isLoading || !password"
        >
          <Key class="w-4 h-4" />
          <span>{{ isLoading ? 'VERIFYING…' : 'VERIFY & ENTER SUPERADMIN' }}</span>
        </button>
      </form>
    </div>

    <!-- Footer Space -->
    <footer class="text-center text-[12px] font-707 text-neutral-400">
      707 Design Studio &bull; Version 1.0
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { login } from '../services/apiClient.ts';
import { useAuthStore } from '../stores/authStore.ts';
import { FIGMA_ASSETS } from '../constants/figmaAssets.ts';
import { ShieldCheck, AlertCircle, Key, ArrowLeft, Eye, EyeOff } from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const password = ref('');
const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');
const passwordInput = ref<HTMLInputElement | null>(null);

onMounted(() => {
  passwordInput.value?.focus();
});

async function handleSubmit() {
  if (!password.value || isLoading.value) return;

  isLoading.value = true;
  errorMessage.value = '';

  const cleanPass = password.value.trim();
  
  // 1. Check local Superadmin store passkey verification
  const isVerifiedLocally = authStore.verifySuperAdmin(cleanPass);

  // 2. Also try API login for backend token session
  try {
    await login(cleanPass);
  } catch {}

  isLoading.value = false;

  if (isVerifiedLocally || authStore.isSuperAdmin) {
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/settings';
    router.replace(redirect);
    return;
  }

  errorMessage.value = 'Incorrect superadmin passkey. Access is restricted to system administrators.';
  password.value = '';
}
</script>
