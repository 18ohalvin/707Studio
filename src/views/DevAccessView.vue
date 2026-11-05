<template>
  <div class="h-screen w-screen flex flex-col items-center justify-between bg-[#09090b] text-white font-sans relative select-none p-6">
    <!-- Top Header -->
    <header class="w-full flex items-center justify-between max-w-[1100px] py-2">
      <div class="flex items-center gap-[10px] h-[20px]">
        <router-link to="/" class="h-[18px] relative shrink-0 flex items-center cursor-pointer hover:opacity-85 transition-opacity" title="Back to 707 Home">
          <img 
            :src="FIGMA_ASSETS.logo707" 
            alt="707" 
            class="h-[16px] w-auto invert object-contain pointer-events-none"
          />
        </router-link>
        <span class="inline-flex items-center px-1.5 py-[2px] rounded-[5px] bg-white/10 border-[0.5px] border-white/15 text-[10px] font-mono text-neutral-300 leading-none">
          DEV
        </span>
      </div>

      <router-link 
        to="/" 
        class="flex items-center gap-1.5 px-3 h-[30px] rounded-[6px] border-[0.5px] border-white/15 text-[12px] font-707 font-medium hover:bg-white/10 transition-colors text-white apple-press"
      >
        <ArrowLeft class="w-3.5 h-3.5" />
        <span>Exit to Studio</span>
      </router-link>
    </header>

    <!-- Center Card: Developer / Superadmin Portal -->
    <div class="w-full max-w-[360px] bg-white/[0.04] backdrop-blur-2xl border-[0.5px] border-white/15 p-7 rounded-[20px] shadow-[0px_30px_90px_rgba(0,0,0,0.6)] flex flex-col gap-5 animate-apple-pop relative overflow-hidden">
      <!-- Ambient subtle glow -->
      <div class="absolute -top-12 -right-12 size-36 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <!-- Title & Icon: Minimal -->
      <div class="flex flex-col items-center text-center gap-3 relative z-10">
        <div class="size-10 rounded-full bg-white/10 border border-white/15 text-white flex items-center justify-center shadow-inner">
          <ShieldCheck class="w-5 h-5 stroke-[2]" />
        </div>
        <div class="flex flex-col">
          <h1 class="font-707 text-[20px] font-medium leading-[26px] text-white">
            Superadmin
          </h1>
          <p class="font-707 text-[12px] text-neutral-400 mt-0.5">
            Enter master developer passkey
          </p>
        </div>
      </div>

      <!-- Superadmin Passkey Form -->
      <form class="flex flex-col gap-4 relative z-10" @submit.prevent="handleSuperadminSubmit">
        <div class="flex flex-col gap-1.5">
          <label class="font-707 text-[10.5px] font-mono uppercase tracking-wider text-neutral-400">
            Passkey
          </label>
          <div 
            :class="[
              'relative flex items-center rounded-[10px] transition-all bg-white/[0.06] border-[0.5px]',
              errorMessage 
                ? 'border-red-400 focus-within:border-red-500' 
                : 'border-white/15 focus-within:border-white focus-within:bg-white/[0.09]'
            ]"
          >
            <input
              ref="passkeyInput"
              v-model="passkey"
              :type="showPasskey ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="••••••••••••"
              required
              class="w-full h-[44px] px-3.5 pr-10 bg-transparent text-white font-mono text-[14px] outline-none placeholder:text-neutral-500 border-none"
              :disabled="isLoading"
              @input="errorMessage = ''"
            />
            <button 
              type="button" 
              @click="showPasskey = !showPasskey"
              class="absolute right-3 text-neutral-400 hover:text-white cursor-pointer bg-transparent border-none p-1"
              tabindex="-1"
            >
              <EyeOff v-if="showPasskey" class="w-4 h-4" />
              <Eye v-else class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="p-2.5 rounded-[10px] bg-red-500/10 border-[0.5px] border-red-500/30 text-red-400 text-[12px] font-707 flex items-center gap-1.5 animate-apple-pop">
          <AlertCircle class="w-3.5 h-3.5 shrink-0" />
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Unlock Button -->
        <div class="mt-2">
          <button
            type="submit"
            :disabled="isLoading || !passkey.trim()"
            class="w-full h-[44px] rounded-[10px] bg-white text-black font-707 font-medium text-[13.5px] hover:bg-neutral-200 active:bg-neutral-300 transition-all flex items-center justify-center gap-2 apple-press cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span v-if="isLoading" class="size-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            <span v-else>Unlock Console →</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Footer -->
    <footer class="w-full max-w-[1100px] flex items-center justify-center py-2">
      <span class="text-[11px] font-mono text-neutral-500">
        707 INTERNAL GOVERNANCE
      </span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ArrowLeft, ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-vue-next';
import { useAuthStore } from '../stores/authStore.ts';
import { useEditorStore } from '../stores/editorStore.ts';
import { FIGMA_ASSETS } from '../constants/figmaAssets.ts';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const editorStore = useEditorStore();

const passkey = ref('');
const showPasskey = ref(false);
const errorMessage = ref('');
const isLoading = ref(false);
const passkeyInput = ref<HTMLInputElement | null>(null);

onMounted(() => {
  passkeyInput.value?.focus();
});

async function handleSuperadminSubmit() {
  errorMessage.value = '';
  isLoading.value = true;

  try {
    const success = await authStore.verifySuperAdmin(passkey.value.trim());
    if (!success) {
      errorMessage.value = 'Invalid superadmin passkey.';
      return;
    }

    await editorStore.loadProjects();
    editorStore.showToast('Superadmin access granted.');

    const redirect = route.query.redirect as string;
    if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) {
      router.push(redirect);
    } else {
      router.push('/settings');
    }
  } catch (err: any) {
    errorMessage.value = err?.message || 'Verification error. Please try again.';
  } finally {
    isLoading.value = false;
  }
}
</script>
