<template>
  <div class="min-h-screen w-full flex flex-col justify-between bg-[#fbfbfb] text-black font-sans relative select-none p-6 sm:p-8 overflow-hidden">
    <!-- Future Background Container Layer (Prepared for custom background asset) -->
    <div 
      class="absolute inset-0 bg-[#fbfbfb] z-0 pointer-events-none transition-all duration-700" 
      :style="backgroundStyle"
    />

    <!-- Top Header: Centered 707 Design Studio Logo (Clickable to Home, No Back Button) -->
    <header class="w-full flex items-center justify-center py-4 sm:py-6 relative z-10">
      <div class="flex items-center gap-[10px] h-[20px]">
        <router-link 
          to="/" 
          class="h-[18px] relative shrink-0 flex items-center cursor-pointer hover:opacity-80 transition-opacity" 
          title="Back to 707 Home"
          @click="handleLogoClick"
        >
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
    </header>

    <!-- Center Stage: Minimal Seamless Sign In (No Container Box) -->
    <main class="w-full flex-1 flex items-center justify-center py-6 relative z-10">
      <div class="w-full max-w-[360px] flex flex-col gap-6 animate-apple-pop">
        <!-- Editorial Heading -->
        <div class="flex flex-col items-center text-center gap-2">
          <h1 class="font-707 text-[30px] sm:text-[34px] font-normal tracking-tight text-black leading-[36px] sm:leading-[40px]">
            Let's get you inside.
          </h1>
          <p class="font-707 text-[13px] text-neutral-400">
            Sign in to your workspace.
          </p>
        </div>

        <!-- Sign In Form -->
        <form class="flex flex-col gap-3 mt-2" @submit.prevent="handleBrandSubmit">
          <!-- Email / Username Floating Field -->
          <div class="relative w-full">
            <input
              id="brand-id"
              ref="brandIdInput"
              v-model="brandId"
              type="text"
              autocomplete="username"
              autocapitalize="none"
              autocorrect="off"
              spellcheck="false"
              placeholder=" "
              required
              class="ganni-floating-input peer"
              :class="{ 'ganni-input-error': errorMessage }"
              :disabled="isLoading"
              @input="errorMessage = ''"
            />
            <label
              for="brand-id"
              class="ganni-floating-label"
              :class="{ 'ganni-floating-label-active': brandId.length > 0 }"
            >
              Email or username
            </label>
          </div>

          <!-- Password Floating Field -->
          <div class="flex flex-col gap-1.5">
            <div class="relative w-full flex items-center">
              <input
                id="brand-password"
                v-model="brandPassword"
                :type="showBrandPassword ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder=" "
                required
                class="ganni-floating-input peer pr-[2.5rem]"
                :class="{ 'ganni-input-error': errorMessage }"
                :disabled="isLoading"
                @input="errorMessage = ''"
              />
              <label
                for="brand-password"
                class="ganni-floating-label"
                :class="{ 'ganni-floating-label-active': brandPassword.length > 0 }"
              >
                Password
              </label>
              <button 
                type="button" 
                @click="showBrandPassword = !showBrandPassword"
                class="absolute right-[0.8125rem] text-[#8a8d8d] hover:text-black cursor-pointer bg-transparent border-none p-1 transition-colors z-10"
                tabindex="-1"
                :title="showBrandPassword ? 'Hide password' : 'Show password'"
              >
                <EyeOff v-if="showBrandPassword" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>
            <div class="flex justify-end">
              <button 
                type="button" 
                @click="handleForgotPin"
                class="font-707 text-[11px] text-[#8a8d8d] hover:text-black transition-colors border-none bg-transparent cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
          </div>

          <!-- Error Feedback -->
          <div v-if="errorMessage" class="p-2.5 rounded-[4px] bg-red-50/80 border-[0.5px] border-red-200 text-[rgb(179,0,0)] text-[12px] font-707 flex items-center gap-1.5 animate-apple-pop">
            <AlertCircle class="w-3.5 h-3.5 shrink-0 text-[rgb(179,0,0)]" />
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Continue Button -->
          <div class="mt-2">
            <button
              type="submit"
              :disabled="isLoading || !brandId.trim() || !brandPassword.trim()"
              class="w-full h-[2.75rem] rounded-none bg-black text-white font-707 font-medium text-[13.5px] hover:bg-neutral-800 active:bg-neutral-900 transition-all flex items-center justify-center gap-2 apple-press cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span v-if="isLoading" class="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span v-else>Continue</span>
            </button>
          </div>
        </form>

        <!-- Minimal Terms & Privacy Notice -->
        <p class="font-707 text-[11px] text-neutral-400 text-center leading-relaxed">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </main>

    <!-- Footer: Studio Mark -->
    <footer class="w-full max-w-[1200px] mx-auto flex items-center justify-center py-2 relative z-10">
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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Eye, EyeOff, AlertCircle } from 'lucide-vue-next';
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

// Custom background slot (ready for user-provided background)
const customBgUrl = ref<string>('');
const backgroundStyle = computed(() => {
  if (!customBgUrl.value) return {};
  return {
    backgroundImage: `url(${customBgUrl.value})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  };
});

// Discreet developer shortcuts to jump to /dev without public UI
let logoClickCount = 0;
let logoClickTimer: ReturnType<typeof setTimeout> | null = null;

function handleLogoClick() {
  logoClickCount++;
  if (logoClickTimer) clearTimeout(logoClickTimer);
  if (logoClickCount >= 3) {
    logoClickCount = 0;
    router.push('/dev');
    return;
  }
  logoClickTimer = setTimeout(() => {
    logoClickCount = 0;
  }, 1000);
}

function handleKeydown(e: KeyboardEvent) {
  // Cmd+Shift+D or Ctrl+Shift+D for quick /dev access
  if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
    e.preventDefault();
    router.push('/dev');
  }
}

onMounted(() => {
  brandIdInput.value?.focus();
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  if (logoClickTimer) clearTimeout(logoClickTimer);
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

<style scoped>
.ganni-floating-input {
  -webkit-font-smoothing: antialiased;
  text-size-adjust: 100%;
  overflow-wrap: break-word;
  box-sizing: border-box;
  appearance: none;
  box-shadow: none;
  margin: 0px;
  outline: none;
  transition: border-color 0.15s ease-in, background-color 0.15s ease-in;
  font-size: 0.875rem;
  font-weight: 400;
  max-width: 100%;
  width: 100%;
  border-radius: 0px;
  font-family: var(--font-primary, -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif);
  height: 2.75rem;
  background: rgb(241, 241, 241);
  padding: 1.05rem 0.8125rem 0.2rem 0.8125rem;
  color: #222222;
  border-width: 0.0625rem;
  border-style: solid;
  border-color: #dddddd;
}

.ganni-floating-input:focus {
  outline: none;
  border-color: #000000;
  background: rgb(241, 241, 241);
}

.ganni-floating-label {
  position: absolute;
  left: 0.8125rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.875rem;
  font-weight: 400;
  color: #8a8d8d;
  pointer-events: none;
  transition: all 0.16s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
  line-height: 1;
  font-family: var(--font-primary, -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif);
}

/* Active State: When input has focus OR already has a typed value */
.ganni-floating-label-active,
.peer:focus ~ .ganni-floating-label {
  top: 0.42rem;
  transform: translateY(0);
  font-size: 0.65rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  color: #8a8d8d;
}

.peer:focus ~ .ganni-floating-label {
  color: #000000;
}

.ganni-input-error {
  color: rgb(179, 0, 0) !important;
  border-color: rgb(179, 0, 0) !important;
}

.ganni-input-error ~ .ganni-floating-label {
  color: rgb(179, 0, 0) !important;
}
</style>
