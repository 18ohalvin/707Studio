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
    <div class="w-full max-w-[420px] apple-frost-strong border border-white/60 p-8 rounded-[16px] shadow-[0px_20px_50px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.04)] flex flex-col gap-5 animate-apple-pop">
      <!-- Title & Icon -->
      <div class="flex flex-col items-center text-center gap-2.5">
        <div class="size-11 rounded-full bg-black text-white flex items-center justify-center shadow-sm">
          <ShieldCheck v-if="activeTab === 'superadmin'" class="w-5 h-5 stroke-[2.2]" />
          <User v-else class="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <h1 class="font-707 text-[20px] font-normal leading-[26px] text-black">
            {{ activeTab === 'superadmin' ? 'Superadmin Verification' : 'Brand Team Sign In' }}
          </h1>
          <p class="font-707 text-[13px] text-neutral-500 mt-1 leading-relaxed">
            {{ activeTab === 'superadmin' ? 'Enter master passkey for system governance & brand administration.' : 'Sign in to access your assigned brand activations and projects.' }}
          </p>
        </div>
      </div>

      <!-- Segmented Switcher -->
      <div class="w-full bg-black/[0.04] p-1 rounded-[10px] flex items-center gap-1">
        <button
          type="button"
          @click="activeTab = 'brand'"
          :class="[
            'flex-1 py-1.5 px-3 rounded-[7px] text-[13px] font-707 font-medium transition-all text-center cursor-pointer border-none',
            activeTab === 'brand' 
              ? 'bg-white text-black shadow-xs font-semibold' 
              : 'bg-transparent text-neutral-500 hover:text-black'
          ]"
        >
          Brand Account
        </button>
        <button
          type="button"
          @click="activeTab = 'superadmin'"
          :class="[
            'flex-1 py-1.5 px-3 rounded-[7px] text-[13px] font-707 font-medium transition-all text-center cursor-pointer border-none',
            activeTab === 'superadmin' 
              ? 'bg-white text-black shadow-xs font-semibold' 
              : 'bg-transparent text-neutral-500 hover:text-black'
          ]"
        >
          Superadmin PIN
        </button>
      </div>

      <!-- Brand / Team Form -->
      <form v-if="activeTab === 'brand'" class="flex flex-col gap-3.5" @submit.prevent="handleBrandSubmit">
        <div class="flex flex-col gap-1">
          <label class="font-707 text-[11px] font-medium text-neutral-700 tracking-wider uppercase">
            Brand Email / Account ID
          </label>
          <input
            ref="brandIdInput"
            v-model="brandId"
            type="text"
            autocomplete="username"
            placeholder="e.g. sarah.chen@atmos.co.id"
            required
            :class="[
              'w-full h-[46px] px-3.5 rounded-[10px] font-707 text-[14px] outline-none transition-all placeholder:text-neutral-400 focus:bg-white',
              errorMessage 
                ? 'border border-red-400 bg-red-50/20 text-red-900 focus:border-red-500' 
                : 'bg-black/[0.03] border border-black/15 text-black focus:border-black'
            ]"
            :disabled="isLoading"
            @input="errorMessage = ''"
          />
        </div>

        <div class="flex flex-col gap-1">
          <div class="flex items-center justify-between">
            <label class="font-707 text-[11px] font-medium text-neutral-700 tracking-wider uppercase">
              Password / PIN
            </label>
            <button 
              type="button" 
              @click="handleForgotPin"
              class="font-707 text-[12px] text-neutral-400 hover:text-black transition-colors border-none bg-transparent cursor-pointer"
            >
              Forgot?
            </button>
          </div>
          <div 
            :class="[
              'relative flex items-center rounded-[10px] transition-all focus-within:bg-white',
              errorMessage 
                ? 'border border-red-400 bg-red-50/20 focus-within:border-red-500' 
                : 'bg-black/[0.03] border border-black/15 focus-within:border-black'
            ]"
          >
            <input
              v-model="brandPassword"
              :type="showBrandPassword ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="Enter your password"
              required
              class="w-full h-[46px] px-3.5 pr-10 bg-transparent text-black font-707 text-[14px] outline-none placeholder:text-neutral-400 border-none"
              :disabled="isLoading"
              @input="errorMessage = ''"
            />
            <button 
              type="button" 
              @click="showBrandPassword = !showBrandPassword"
              class="absolute right-3 text-neutral-400 hover:text-black cursor-pointer bg-transparent border-none p-1"
              tabindex="-1"
            >
              <EyeOff v-if="showBrandPassword" class="w-4 h-4" />
              <Eye v-else class="w-4 h-4" />
            </button>
          </div>
        </div>

        <p v-if="errorMessage" class="text-xs text-red-500 font-707 flex items-center gap-1.5 mt-1 animate-apple-pop">
          <AlertCircle class="w-3.5 h-3.5 shrink-0" />
          <span>{{ errorMessage }}</span>
        </p>

        <button
          type="submit"
          class="w-full h-[46px] rounded-[10px] bg-black text-white text-[14px] font-707 font-medium tracking-wide disabled:opacity-50 transition-all apple-press cursor-pointer flex items-center justify-center gap-2 hover:bg-neutral-800 shadow-sm mt-2"
          :disabled="isLoading || !brandId || !brandPassword"
        >
          <span>{{ isLoading ? 'SIGNING IN…' : 'SIGN IN AS BRAND PIC' }}</span>
        </button>
      </form>

      <!-- Superadmin Form -->
      <form v-else class="flex flex-col gap-3.5" @submit.prevent="handleSuperadminSubmit">
        <div class="flex flex-col gap-1">
          <label class="font-707 text-[11px] font-medium text-neutral-700 tracking-wider uppercase">
            Superadmin Master Passkey PIN
          </label>
          <div 
            :class="[
              'relative flex items-center rounded-[10px] transition-all focus-within:bg-white',
              errorMessage 
                ? 'border border-red-400 bg-red-50/20 focus-within:border-red-500' 
                : 'bg-black/[0.03] border border-black/15 focus-within:border-black'
            ]"
          >
            <input
              ref="passwordInput"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="Enter superadmin passkey"
              required
              class="w-full h-[46px] px-3.5 pr-10 bg-transparent text-black font-707 text-[14px] outline-none placeholder:text-neutral-400 border-none"
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

        <p v-if="errorMessage" class="text-xs text-red-500 font-707 flex items-center gap-1.5 mt-1 animate-apple-pop">
          <AlertCircle class="w-3.5 h-3.5 shrink-0" />
          <span>{{ errorMessage }}</span>
        </p>

        <button
          type="submit"
          class="w-full h-[46px] rounded-[10px] bg-black text-white text-[14px] font-707 font-medium tracking-wide disabled:opacity-50 transition-all apple-press cursor-pointer flex items-center justify-center gap-2 hover:bg-neutral-800 shadow-sm mt-2"
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
import { ref, onMounted, watch, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/authStore.ts';
import { useBrandStore } from '../stores/brandStore.ts';
import { useEditorStore } from '../stores/editorStore.ts';
import { FIGMA_ASSETS } from '../constants/figmaAssets.ts';
import { ShieldCheck, User, AlertCircle, Key, ArrowLeft, Eye, EyeOff } from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const brandStore = useBrandStore();
const editorStore = useEditorStore();

const activeTab = ref<'brand' | 'superadmin'>('brand');

const brandId = ref('');
const brandPassword = ref('');
const showBrandPassword = ref(false);

const password = ref('');
const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');

const brandIdInput = ref<HTMLInputElement | null>(null);
const passwordInput = ref<HTMLInputElement | null>(null);

onMounted(() => {
  if (route.query.tab === 'superadmin' || route.query.redirect?.toString().includes('settings') || route.query.redirect?.toString().includes('admin')) {
    activeTab.value = 'superadmin';
  }
  focusActiveInput();
});

watch(activeTab, () => {
  errorMessage.value = '';
  focusActiveInput();
});

async function focusActiveInput() {
  await nextTick();
  if (activeTab.value === 'brand') {
    brandIdInput.value?.focus();
  } else {
    passwordInput.value?.focus();
  }
}

function handleForgotPin() {
  editorStore.showToast('Please contact your Superadmin or #707-design-studio-help to reset password.');
}

async function handleBrandSubmit() {
  if (!brandId.value || !brandPassword.value || isLoading.value) return;

  isLoading.value = true;
  errorMessage.value = '';

  const cleanId = brandId.value.trim();
  const res = await authStore.signIn(cleanId, brandPassword.value);

  isLoading.value = false;

  if (res.success) {
    const found = brandStore.brands.find(b => 
      b.slug.toLowerCase() === cleanId.toLowerCase() || 
      b.name.toLowerCase().includes(cleanId.toLowerCase()) ||
      (authStore.currentUser?.assignedBrands && authStore.currentUser.assignedBrands.includes(b.slug))
    );
    if (found) {
      brandStore.setActiveBrand(found);
    }
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/';
    router.replace(redirect);
    return;
  }

  errorMessage.value = res.error || 'Invalid brand account credentials.';
  brandPassword.value = '';
}

async function handleSuperadminSubmit() {
  if (!password.value || isLoading.value) return;

  isLoading.value = true;
  errorMessage.value = '';

  const cleanPass = password.value.trim();
  // Verified by the server, which also issues the token the rest of the API
  // needs. The passkeys used to be constants in this file.
  const verified = await authStore.verifySuperAdmin(cleanPass);

  isLoading.value = false;

  if (verified) {
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/settings';
    router.replace(redirect);
    return;
  }

  errorMessage.value = 'Incorrect superadmin passkey PIN. Access is restricted to system administrators.';
  password.value = '';
}
</script>
