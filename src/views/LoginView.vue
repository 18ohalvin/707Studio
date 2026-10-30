<template>
  <div class="h-screen w-screen flex flex-col items-center justify-between bg-[#f5f5f5] text-black font-sans relative select-none p-6">
    <!-- Top Header -->
    <header class="w-full flex items-center justify-between max-w-[1100px] py-2">
      <div class="flex items-center gap-[10px] h-[20px]">
        <router-link to="/" class="h-[18px] relative shrink-0 flex items-center cursor-pointer hover:opacity-85 transition-opacity" title="Back to 707 Home">
          <img 
            :src="FIGMA_ASSETS.logoDesignStudio" 
            alt="707 Design Studio" 
            class="h-[18px] w-auto object-contain pointer-events-none"
          />
        </router-link>
        <button 
          type="button"
          @click="showWhatsNewModal = true"
          class="inline-flex items-center px-1.5 py-[2px] rounded-[5px] bg-white hover:bg-neutral-50 border-[0.5px] border-black/10 hover:border-black/30 shadow-[0_1px_2px_rgba(0,0,0,0.04)] text-[10.5px] font-707 font-medium text-black leading-none whitespace-nowrap cursor-pointer transition-all apple-press"
          title="What's New in Design Studio 1.5"
        >
          1.5
        </button>
      </div>

      <router-link 
        to="/" 
        class="flex items-center gap-1.5 px-3 h-[30px] rounded-[6px] border-[0.5px] border-black/15 text-[12px] font-707 font-medium hover:bg-black/5 transition-colors text-black apple-press"
      >
        <ArrowLeft class="w-3.5 h-3.5" />
        <span>Back to Studio</span>
      </router-link>
    </header>

    <!-- Center Card: Minimal Full-Page Sign In -->
    <div class="w-full max-w-[360px] bg-white/95 backdrop-blur-2xl border-[0.5px] border-black/10 p-7 rounded-[20px] shadow-[0px_20px_60px_rgba(0,0,0,0.07),0_1px_3px_rgba(0,0,0,0.04)] flex flex-col gap-5 animate-apple-pop">
      <!-- Title: Very Less Copy -->
      <div class="flex flex-col items-center text-center">
        <h1 class="font-707 text-[22px] font-normal leading-[28px] text-black">
          Sign In
        </h1>
      </div>

      <!-- Brand / Team Sign In Form -->
      <form class="flex flex-col gap-4" @submit.prevent="handleBrandSubmit">
        <!-- Account / Email Field -->
        <div class="flex flex-col gap-1.5">
          <label class="font-707 text-[11px] font-medium text-neutral-500 tracking-wider uppercase">
            Email or Username
          </label>
          <input
            ref="brandIdInput"
            v-model="brandId"
            type="text"
            autocomplete="username"
            autocapitalize="none"
            autocorrect="off"
            spellcheck="false"
            placeholder="name@company.com"
            required
            :class="[
              'w-full h-[44px] px-3.5 rounded-[10px] font-707 text-[13.5px] outline-none transition-all placeholder:text-neutral-400 focus:bg-white',
              errorMessage 
                ? 'border border-red-400 bg-red-50/20 text-red-900 focus:border-red-500' 
                : 'bg-white/80 border-[0.5px] border-black/15 text-black focus:border-black'
            ]"
            :disabled="isLoading"
            @input="errorMessage = ''"
          />
        </div>

        <!-- Password Field -->
        <div class="flex flex-col gap-1.5">
          <div class="flex items-center justify-between">
            <label class="font-707 text-[11px] font-medium text-neutral-500 tracking-wider uppercase">
              Password
            </label>
            <button 
              type="button" 
              @click="handleForgotPin"
              class="font-707 text-[11.5px] text-neutral-400 hover:text-black transition-colors border-none bg-transparent cursor-pointer"
            >
              Forgot?
            </button>
          </div>
          <div 
            :class="[
              'relative flex items-center rounded-[10px] transition-all focus-within:bg-white bg-white/80',
              errorMessage 
                ? 'border border-red-400 bg-red-50/20 focus-within:border-red-500' 
                : 'border-[0.5px] border-black/15 focus-within:border-black'
            ]"
          >
            <input
              v-model="brandPassword"
              :type="showBrandPassword ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="••••••••"
              required
              class="w-full h-[44px] px-3.5 pr-10 bg-transparent text-black font-707 text-[13.5px] outline-none placeholder:text-neutral-400 border-none"
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

        <!-- Error Message -->
        <div v-if="errorMessage" class="p-2.5 rounded-[10px] bg-red-50/80 border-[0.5px] border-red-200 text-red-600 text-[12px] font-707 flex items-center gap-1.5 animate-apple-pop">
          <AlertCircle class="w-3.5 h-3.5 shrink-0" />
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Submit Button -->
        <div class="mt-2">
          <button
            type="submit"
            :disabled="isLoading || !brandId.trim() || !brandPassword.trim()"
            class="w-full h-[44px] rounded-[10px] bg-black text-white font-707 font-medium text-[13.5px] hover:bg-neutral-800 active:bg-neutral-900 transition-all flex items-center justify-center gap-2 apple-press cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span v-if="isLoading" class="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span v-else>Sign In</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Footer: Studio Brand Mark -->
    <footer class="w-full max-w-[1100px] flex items-center justify-center py-2">
      <span class="text-[11px] font-707 text-neutral-400">
        707 Design Studio
      </span>
    </footer>

    <!-- What's New Tour Modal -->
    <WhatsNewModal
      :is-open="showWhatsNewModal"
      @close="showWhatsNewModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ArrowLeft, Eye, EyeOff, AlertCircle } from 'lucide-vue-next';
import { useAuthStore } from '../stores/authStore.ts';
import { useBrandStore } from '../stores/brandStore.ts';
import { useEditorStore } from '../stores/editorStore.ts';
import { FIGMA_ASSETS } from '../constants/figmaAssets.ts';
import WhatsNewModal from '../components/modals/WhatsNewModal.vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const brandStore = useBrandStore();
const editorStore = useEditorStore();

const brandId = ref('');
const brandPassword = ref('');
const showBrandPassword = ref(false);
const errorMessage = ref('');
const isLoading = ref(false);
const brandIdInput = ref<HTMLInputElement | null>(null);
const showWhatsNewModal = ref(false);

onMounted(() => {
  brandIdInput.value?.focus();
});

function handleForgotPin() {
  editorStore.showToast('Please contact your administrator or team lead to reset credentials.');
}

async function handleBrandSubmit() {
  errorMessage.value = '';
  isLoading.value = true;
  
  const inputId = brandId.value.trim();

  try {
    if (authStore.users.length === 0) {
      await authStore.loadUsers();
    }
    if (brandStore.brands.length === 0) {
      await brandStore.loadBrands();
    }

    let res = await authStore.signIn(inputId, brandPassword.value);
    if (!res.success) {
      await authStore.loadUsers();
      res = await authStore.signIn(inputId, brandPassword.value);
    }

    if (!res.success) {
      errorMessage.value = res.error || 'Invalid account identifier or password.';
      return;
    }

    // Auto-match or activate brand
    const found = brandStore.brands.find(b => 
      b.slug.toLowerCase() === inputId.toLowerCase() || 
      b.name.toLowerCase().includes(inputId.toLowerCase()) ||
      (authStore.currentUser?.assignedBrands && authStore.currentUser.assignedBrands.some(ub => ub.toLowerCase() === b.slug.toLowerCase() || ub.toLowerCase() === b.name.toLowerCase()))
    );
    if (found) {
      brandStore.setActiveBrand(found);
    }

    await editorStore.loadProjects();

    // Redirect to destination or home
    const redirect = route.query.redirect as string;
    if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) {
      router.push(redirect);
    } else {
      router.push('/');
    }
  } catch (err: any) {
    errorMessage.value = err?.message || 'Failed to sign in. Please try again.';
  } finally {
    isLoading.value = false;
  }
}
</script>
