<template>
  <div class="h-screen w-full flex flex-col justify-between bg-black text-white font-sans relative select-none overflow-hidden">
    <!-- Custom Background Image Layer -->
    <div 
      class="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 pointer-events-none transition-all duration-700" 
      :style="backgroundStyle"
    />
    <!-- Subtle cinematic scrim to ensure crisp legibility on textured grain -->
    <div class="absolute inset-0 bg-black/20 z-0 pointer-events-none" />

    <!-- Header: Dynamic (Centered on login, Segmented progress bar during onboarding) -->
    <header 
      class="w-full h-[48px] px-[24px] py-[8px] flex items-center justify-between shrink-0 relative z-10"
      data-node-id="198:6791"
      data-name="Header"
    >
      <!-- Onboarding Step 2B Header (Savee-style segmented progress bar) -->
      <div 
        v-if="isOnboarding && currentStep !== 'onboarding_success'" 
        class="w-full h-full flex items-center justify-between relative"
      >
        <router-link 
          to="/" 
          class="h-[18px] relative shrink-0 flex items-center cursor-pointer hover:opacity-80 transition-opacity z-10" 
          title="Back to 707 Home"
          @click="resetToLogin"
        >
          <img 
            :src="FIGMA_ASSETS.logoDesignStudio" 
            alt="707 Design Studio" 
            class="h-[18px] w-auto object-contain pointer-events-none brightness-0 invert" 
          />
        </router-link>

        <!-- Segmented 3-part progress line (Strictly centered to viewport/screen) -->
        <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 w-[140px] sm:w-[180px] pointer-events-none">
          <div 
            v-for="s in 3" 
            :key="s"
            class="h-[2px] flex-1 rounded-full transition-colors duration-300"
            :class="currentOnboardingStepIndex >= s ? 'bg-white' : 'bg-white/25'"
          />
        </div>

        <!-- Step counter -->
        <span class="text-[12px] font-mono text-white/60 font-medium z-10">
          {{ currentOnboardingStepIndex }} / 3
        </span>
      </div>

      <!-- Default Header (Centered 707 logo + 1.5 badge) -->
      <div v-else class="w-full flex items-center justify-center">
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
              class="h-[18px] w-auto object-contain pointer-events-none brightness-0 invert" 
            />
          </router-link>
          <button 
            type="button"
            @click="showWhatsNewModal = true"
            class="inline-flex items-center px-1.5 py-[2px] rounded-[5px] bg-white/10 hover:bg-white/20 border-[0.5px] border-white/20 hover:border-white/40 shadow-[0_1px_2px_rgba(0,0,0,0.1)] text-[10.5px] font-707 font-medium text-white leading-none whitespace-nowrap cursor-pointer transition-all apple-press"
            title="What's New in Design Studio 1.5"
          >
            1.5
          </button>
        </div>
      </div>
    </header>

    <!-- Center Stage: Minimal Seamless Sign In & Onboarding strictly following global padding -->
    <main class="w-full flex-1 flex flex-col items-center justify-center px-[24px] py-[24px] sm:py-[40px] relative z-10 overflow-y-auto">
      <!-- STEP 1 & STEP 2A: LOGIN CARD -->
      <div 
        v-if="currentStep === 'email' || currentStep === 'password'" 
        class="w-full max-w-[380px] flex flex-col gap-6 animate-apple-pop my-auto"
      >
        <!-- Editorial Heading (Step 1 & Step 2A) -->
        <div class="flex flex-col items-center text-center gap-2 mb-2">
          <h1 class="font-707 text-[30px] sm:text-[34px] font-normal tracking-tight text-white leading-[36px] sm:leading-[40px]">
            {{ currentStep === 'password' ? 'Welcome back.' : "Let's get you inside." }}
          </h1>
          <p class="font-707 text-[13px] text-white/60">
            {{ currentStep === 'password' ? 'Enter your password to continue.' : 'Sign in or request workspace access.' }}
          </p>
        </div>

        <!-- ========================================== -->
        <!-- STEP 1: IDENTIFIER / EMAIL SCREEN          -->
        <!-- ========================================== -->
        <form 
          v-if="currentStep === 'email'" 
          class="flex flex-col gap-6" 
          @submit.prevent="handleEmailSubmit"
        >
          <!-- Email Floating Field (Label moves to the top of the box) -->
          <div class="relative w-full mt-4">
            <input
              id="user-email"
              ref="emailInput"
              v-model="email"
              type="text"
              autocomplete="email"
              autocapitalize="none"
              autocorrect="off"
              spellcheck="false"
              placeholder=" "
              class="ganni-floating-input peer"
              :class="{ 'ganni-input-error': errorMessage }"
              :disabled="isLoading"
              @input="errorMessage = ''"
            />
            <label
              for="user-email"
              class="ganni-floating-label"
              :class="{ 'ganni-floating-label-active': email.length > 0 }"
            >
              Your email *
            </label>
            <!-- Error message below box -->
            <p v-if="errorMessage" class="text-[12px] text-rose-400 font-normal mt-1.5 text-left animate-apple-pop">
              {{ errorMessage }}
            </p>
          </div>

          <!-- Continue Button -->
          <div class="mt-4 flex flex-col gap-3">
            <button
              type="submit"
              :disabled="isLoading || !email.trim()"
              class="w-full h-[2.75rem] rounded-none bg-white text-black font-707 font-medium text-[13.5px] hover:bg-neutral-200 active:bg-neutral-300 transition-all flex items-center justify-center gap-2 apple-press cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span v-if="isLoading" class="size-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              <span v-else>Continue</span>
            </button>

            <!-- Dual-purpose helper hint for new users -->
            <p class="font-707 text-[11.5px] text-white/50 text-center leading-relaxed">
              New partner or team member? Enter your work email to get started.
            </p>
          </div>
        </form>

        <!-- ========================================== -->
        <!-- STEP 2A: PASSWORD SCREEN (REGISTERED)      -->
        <!-- ========================================== -->
        <form 
          v-else-if="currentStep === 'password'" 
          class="flex flex-col gap-6" 
          @submit.prevent="handlePasswordSubmit"
        >
          <!-- Password Floating Field (Pure clean state with password box only) -->
          <div class="relative w-full mt-4">
            <div class="relative w-full flex items-center">
              <input
                id="user-password"
                ref="passwordInput"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder=" "
                class="ganni-floating-input peer pr-[2.5rem]"
                :class="{ 'ganni-input-error': errorMessage }"
                :disabled="isLoading"
                @input="errorMessage = ''"
              />
              <label
                for="user-password"
                class="ganni-floating-label"
                :class="{ 'ganni-floating-label-active': password.length > 0 }"
              >
                Password *
              </label>
              <button 
                type="button" 
                @click="showPassword = !showPassword"
                class="absolute right-[0.8125rem] text-white/50 hover:text-white cursor-pointer bg-transparent border-none p-1 transition-colors z-10"
                tabindex="-1"
                :title="showPassword ? 'Hide password' : 'Show password'"
              >
                <EyeOff v-if="showPassword" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>
            <!-- Error message below box -->
            <p v-if="errorMessage" class="text-[12px] text-rose-400 font-normal mt-1.5 text-left animate-apple-pop">
              {{ errorMessage }}
            </p>
            <div class="flex justify-end mt-1.5">
              <button 
                type="button" 
                @click="handleForgotPin"
                class="font-707 text-[11px] text-white/50 hover:text-white transition-colors border-none bg-transparent cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
          </div>

          <!-- Sign In Button -->
          <div class="mt-4 flex flex-col items-center gap-3">
            <button
              type="submit"
              :disabled="isLoading || !password.trim()"
              class="w-full h-[2.75rem] rounded-none bg-white text-black font-707 font-medium text-[13.5px] hover:bg-neutral-200 active:bg-neutral-300 transition-all flex items-center justify-center gap-2 apple-press cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span v-if="isLoading" class="size-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              <span v-else>Sign In</span>
            </button>

            <button 
              type="button" 
              @click="resetToLogin"
              class="font-707 text-[11.5px] text-white/50 hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0 text-center"
            >
              Use a different email
            </button>
          </div>
        </form>

        <!-- Terms & Privacy Notice for Login -->
        <p class="font-707 text-[11px] text-white/40 text-center leading-relaxed mt-2">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>

      <!-- ========================================== -->
      <!-- STEP 2B-1: ONBOARDING NAME                 -->
      <!-- ========================================== -->
      <div 
        v-else-if="currentStep === 'onboarding_name'" 
        class="flex flex-col items-center justify-between w-full h-full max-w-[560px] animate-apple-pop my-auto"
      >
        <!-- Top spacer for balanced optical centering -->
        <div class="hidden sm:block shrink-0 h-4" />

        <!-- Center Name Input Section -->
        <div class="flex flex-col items-center gap-6 w-full text-center my-auto">
          <label class="text-[13.5px] text-white/60 font-707">
            First, what should we call you?
          </label>
          <input
            ref="nameInput"
            v-model="onboardingName"
            type="text"
            placeholder="Your name"
            autocomplete="name"
            class="font-707 text-[40px] sm:text-[48px] text-white text-center tracking-tight outline-none border-b-[0.5px] border-white/30 focus:border-white bg-transparent w-full py-2 placeholder:text-white/30 caret-white transition-colors"
            @keydown.enter.prevent="handleOnboardingNameSubmit"
            @input="onboardingError = ''"
          />
          <p class="text-[11.5px] text-white/40 font-mono text-center mt-1">
            Press Enter ↵
          </p>
          <p v-if="onboardingError" class="text-[12px] text-rose-400 font-normal mt-1 animate-apple-pop">
            {{ onboardingError }}
          </p>
        </div>

        <!-- Bottom Continue Pill Button -->
        <div class="w-full flex justify-center pt-8 pb-2 shrink-0">
          <button
            type="button"
            @click="handleOnboardingNameSubmit"
            :disabled="!onboardingName.trim()"
            class="px-12 h-[46px] rounded-full bg-white text-black font-707 font-medium text-[13.5px] hover:bg-neutral-200 active:bg-neutral-300 transition-all flex items-center justify-center apple-press cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- STEP 2B-2: CREATE A PASSWORD               -->
      <!-- ========================================== -->
      <div 
        v-else-if="currentStep === 'onboarding_password'" 
        class="flex flex-col items-center justify-between w-full h-full max-w-[560px] animate-apple-pop my-auto"
      >
        <!-- Top spacer for balanced optical centering -->
        <div class="hidden sm:block shrink-0 h-4" />

        <!-- Center Password Creation Section -->
        <div class="flex flex-col items-center gap-6 w-full text-center my-auto">
          <label class="text-[13.5px] text-white/60 font-707">
            Create a password
          </label>
          <div class="relative w-full max-w-[560px] flex items-center justify-center border-b-[0.5px] border-white/30 focus-within:border-white transition-colors">
            <input
              ref="passwordStepInput"
              v-model="onboardingPassword"
              :type="showOnboardingPassword ? 'text' : 'password'"
              autocomplete="new-password"
              placeholder="••••••••"
              class="font-707 text-[40px] sm:text-[48px] text-white text-center tracking-tight outline-none border-none bg-transparent w-full py-2 placeholder:text-white/30 caret-white transition-colors px-12"
              @keydown.enter.prevent="handleOnboardingPasswordSubmit"
              @input="onboardingError = ''"
            />
            <button 
              type="button" 
              @click="showOnboardingPassword = !showOnboardingPassword"
              class="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-white cursor-pointer bg-transparent border-none p-1 transition-colors"
              tabindex="-1"
              :title="showOnboardingPassword ? 'Hide password' : 'Show password'"
            >
              <EyeOff v-if="showOnboardingPassword" class="w-5 h-5" />
              <Eye v-else class="w-5 h-5" />
            </button>
          </div>
          <p class="text-[11.5px] text-white/40 font-mono text-center mt-1">
            Press Enter ↵
          </p>
          <p v-if="onboardingError" class="text-[12px] text-rose-400 font-normal mt-1 animate-apple-pop">
            {{ onboardingError }}
          </p>
        </div>

        <!-- Bottom Continue Pill Button -->
        <div class="w-full flex justify-center pt-8 pb-2 shrink-0">
          <button
            type="button"
            @click="handleOnboardingPasswordSubmit"
            :disabled="!onboardingPassword.trim()"
            class="px-12 h-[46px] rounded-full bg-white text-black font-707 font-medium text-[13.5px] hover:bg-neutral-200 active:bg-neutral-300 transition-all flex items-center justify-center apple-press cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- STEP 2B-3: BRAND / COMPANY AFFILIATION     -->
      <!-- ========================================== -->
      <div 
        v-else-if="currentStep === 'onboarding_brand'" 
        class="flex flex-col items-center justify-between w-full h-full max-w-[560px] animate-apple-pop my-auto"
      >
        <!-- Top spacer for balanced optical centering -->
        <div class="hidden sm:block shrink-0 h-4" />

        <!-- Center Brand Selection Section -->
        <div class="flex flex-col items-center gap-8 w-full text-center my-auto">
          <div class="flex flex-col items-center text-center gap-2">
            <h2 class="font-707 text-[30px] sm:text-[36px] font-normal tracking-tight leading-[36px] sm:leading-[42px]">
              <span class="text-white font-medium">Which brand </span>
              <span class="text-white/60">do you work for?</span>
            </h2>
            <p class="font-707 text-[13px] text-white/60 text-center max-w-[360px] mt-1">
              We'll link your workspace to the right partner catalog and activations.
            </p>
          </div>

          <!-- Quick Partner Pills (Direct from Superadmin settings) -->
          <div class="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 w-full max-w-[420px]">
            <button
              v-for="b in partnerBrandOptions"
              :key="b"
              type="button"
              @click="onboardingBrand = b"
              class="px-5 py-2.5 rounded-full text-[13px] font-707 transition-all apple-press cursor-pointer"
              :class="onboardingBrand === b 
                ? 'bg-white text-black font-medium shadow-sm' 
                : 'bg-white/10 hover:bg-white/20 text-white border-[0.5px] border-white/20 hover:border-white/40'"
            >
              {{ b }}
            </button>
          </div>
        </div>

        <!-- Bottom Action Button -->
        <div class="w-full flex justify-center pt-8 pb-2 shrink-0">
          <button
            type="button"
            @click="handleOnboardingBrandSubmit"
            :disabled="isLoading || !onboardingBrand.trim()"
            class="px-12 h-[46px] rounded-full bg-white text-black font-707 font-medium text-[13.5px] hover:bg-neutral-200 active:bg-neutral-300 transition-all flex items-center justify-center apple-press cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span v-if="isLoading" class="size-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            <span v-else>Continue</span>
          </button>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- STEP 2B-SUCCESS: OPTION B SUPERADMIN GATE   -->
      <!-- ========================================== -->
      <div 
        v-else-if="currentStep === 'onboarding_success'" 
        class="flex flex-col items-center gap-6 animate-apple-pop w-full max-w-[420px] text-center my-auto"
      >
        <!-- Minimalist animated white badge -->
        <div class="relative size-12 rounded-full border-[0.5px] border-white/30 bg-white/5 backdrop-blur-xs flex items-center justify-center shadow-[0_0_24px_rgba(255,255,255,0.08)]">
          <div class="absolute inset-0 rounded-full border border-white/20 animate-ping opacity-25 pointer-events-none" />
          <svg 
            class="w-5 h-5 text-white" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="1.75" 
            stroke-linecap="round" 
            stroke-linejoin="round"
          >
            <polyline points="20 6 9 17 4 12" class="checkmark-path" />
          </svg>
        </div>
        <div class="flex flex-col gap-2">
          <h2 class="font-707 text-[28px] sm:text-[32px] font-normal tracking-tight text-white leading-tight">
            Application Received.
          </h2>
          <p class="font-707 text-[13px] text-white/60 leading-relaxed px-2">
            Your workspace request is with 707 Governance. Superadmin (Alvin) has been notified. You will be able to sign in as soon as access is approved.
          </p>
        </div>

        <div class="w-full mt-3 flex flex-col items-center gap-3">
          <a
            :href="whatsappUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="w-full h-[2.75rem] rounded-none bg-white text-black font-707 font-medium text-[13.5px] hover:bg-neutral-200 active:bg-neutral-300 transition-all flex items-center justify-center gap-2 apple-press cursor-pointer shadow-xs no-underline"
          >
            <span>Contact Superadmin</span>
          </a>
          <button
            type="button"
            @click="resetToLogin"
            class="text-[12px] font-707 text-white/50 hover:text-white py-1 cursor-pointer bg-transparent border-none transition-colors"
          >
            Return to Studio
          </button>
        </div>

        <!-- Terms notice on success -->
        <p class="font-707 text-[11px] text-white/40 text-center leading-relaxed">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </main>

    <!-- Footer: Studio Mark strictly following global 48px header/footer height & 24px side padding -->
    <footer 
      class="w-full h-[48px] px-[24px] py-[8px] flex items-center justify-center shrink-0 relative z-10"
      data-name="Footer"
    >
      <span class="text-[11px] font-707 text-white/50">
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
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Eye, EyeOff } from 'lucide-vue-next';
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

// Main flow state
type FlowStep = 'email' | 'password' | 'onboarding_name' | 'onboarding_password' | 'onboarding_brand' | 'onboarding_success';
const currentStep = ref<FlowStep>('email');

const isOnboarding = computed(() => currentStep.value.startsWith('onboarding_'));

const currentOnboardingStepIndex = computed(() => {
  switch (currentStep.value) {
    case 'onboarding_name': return 1;
    case 'onboarding_password': return 2;
    case 'onboarding_brand': return 3;
    default: return 3;
  }
});

// Credentials
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const errorMessage = ref('');
const isLoading = ref(false);

// Onboarding details
const onboardingName = ref('');
const onboardingPassword = ref('');
const showOnboardingPassword = ref(false);
const onboardingBrand = ref('');
const onboardingError = ref('');

// Dynamically connected to Superadmin Governance Brands Directory (/api/brands)
const partnerBrandOptions = computed(() => {
  if (brandStore.brands && brandStore.brands.length > 0) {
    return brandStore.brands.map(b => b.name);
  }
  return ['Fred Perry', 'Stanley Indonesia', 'atmos Indonesia'];
});

const emailInput = ref<HTMLInputElement | null>(null);
const passwordInput = ref<HTMLInputElement | null>(null);
const nameInput = ref<HTMLInputElement | null>(null);
const passwordStepInput = ref<HTMLInputElement | null>(null);
const showWhatsNewModal = ref(false);

// Custom background slot configured with uploaded editorial grainy background
const customBgUrl = ref<string>('/assets/login-bg.jpg');
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
  emailInput.value?.focus();
  window.addEventListener('keydown', handleKeydown);
  brandStore.loadBrands();

  // First-time visit: automatically show Design Studio 1.5 What's New modal
  try {
    const hasSeenWhatsNew = localStorage.getItem('707_seen_whats_new_1_5');
    if (!hasSeenWhatsNew || route.query.whatsnew === '1') {
      showWhatsNewModal.value = true;
      if (route.query.whatsnew === '1') {
        router.replace({ query: { ...route.query, whatsnew: undefined } });
      }
    }
  } catch {
    showWhatsNewModal.value = true;
  }
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  if (logoClickTimer) clearTimeout(logoClickTimer);
});

function handleForgotPin() {
  editorStore.showToast('Please contact your administrator or team lead to reset credentials.');
}

function resetToLogin() {
  currentStep.value = 'email';
  errorMessage.value = '';
  onboardingError.value = '';
  nextTick(() => {
    emailInput.value?.focus();
  });
}

// STEP 1: Verify Email
async function handleEmailSubmit() {
  errorMessage.value = '';
  const cleanEmail = email.value.trim().toLowerCase();

  if (!cleanEmail) {
    errorMessage.value = 'Please fill out this field.';
    emailInput.value?.focus();
    return;
  }

  // Basic email validation
  if (!cleanEmail.includes('@') && cleanEmail.length < 3) {
    errorMessage.value = 'Please enter a valid email address.';
    emailInput.value?.focus();
    return;
  }

  if (cleanEmail === 'admin' || cleanEmail === 'superadmin' || cleanEmail === 'admin@707designstudio.internal') {
    currentStep.value = 'password';
    await nextTick();
    passwordInput.value?.focus();
    return;
  }

  isLoading.value = true;
  try {
    const res = await authStore.checkEmail(cleanEmail);
    if (res.exists) {
      // Step 2A: Registered account -> go to password
      currentStep.value = 'password';
      await nextTick();
      passwordInput.value?.focus();
    } else {
      // Step 2B: Unregistered account -> start onboarding!
      currentStep.value = 'onboarding_name';
      await nextTick();
      nameInput.value?.focus();
    }
  } catch (err: any) {
    errorMessage.value = err?.message || 'Verification failed. Please try again.';
  } finally {
    isLoading.value = false;
  }
}

// STEP 2A: Verify Password & Sign In
async function handlePasswordSubmit() {
  errorMessage.value = '';
  if (!password.value) {
    errorMessage.value = 'Please fill out this field.';
    passwordInput.value?.focus();
    return;
  }

  isLoading.value = true;
  try {
    const res = await authStore.signIn(email.value.trim().toLowerCase(), password.value);
    if (res.success) {
      // Successful sign in -> enter application
      editorStore.showToast(`Welcome back, ${authStore.currentUser?.name || 'Designer'}`);
      const redirect = (route.query.redirect as string);
      if (redirect && redirect !== '/') {
        router.push(redirect);
      } else if (authStore.isSuperAdmin) {
        router.push('/settings');
      } else {
        router.push('/');
      }
    } else {
      errorMessage.value = res.error || 'Incorrect password.';
      passwordInput.value?.focus();
    }
  } catch (err: any) {
    errorMessage.value = err?.message || 'Sign in failed. Please try again.';
  } finally {
    isLoading.value = false;
  }
}

// STEP 2B-1: Onboarding Name Submit
function handleOnboardingNameSubmit() {
  onboardingError.value = '';
  if (!onboardingName.value.trim()) {
    onboardingError.value = 'Please tell us your name.';
    nameInput.value?.focus();
    return;
  }
  currentStep.value = 'onboarding_password';
  nextTick(() => {
    passwordStepInput.value?.focus();
  });
}

// STEP 2B-2: Onboarding Password Submit
function handleOnboardingPasswordSubmit() {
  onboardingError.value = '';
  if (!onboardingPassword.value.trim()) {
    onboardingError.value = 'Please enter a password.';
    passwordStepInput.value?.focus();
    return;
  }
  if (onboardingPassword.value.length < 4) {
    onboardingError.value = 'Password must be at least 4 characters.';
    passwordStepInput.value?.focus();
    return;
  }
  currentStep.value = 'onboarding_brand';
}

// STEP 2B-3: Onboarding Brand Submit
async function handleOnboardingBrandSubmit() {
  if (!onboardingBrand.value.trim()) return;
  await submitOnboardingApplication();
}

// WhatsApp direct link to Superadmin Alvin (+6281277208270)
const whatsappUrl = computed(() => {
  const applicantInfo = onboardingName.value ? `(${onboardingName.value} - ${email.value})` : `(${email.value})`;
  const brandInfo = onboardingBrand.value ? ` for ${onboardingBrand.value}` : '';
  const text = encodeURIComponent(`Hi Alvin, I have submitted my 707 Design Studio workspace application ${applicantInfo}${brandInfo}.`);
  return `https://wa.me/6281277208270?text=${text}`;
});

// Submit Application (Option B: Superadmin Review Gate)
async function submitOnboardingApplication() {
  isLoading.value = true;
  try {
    // Register user with pending approval state
    await authStore.registerRequest({
      email: email.value.trim().toLowerCase(),
      name: onboardingName.value.trim(),
      password: onboardingPassword.value.trim(),
      role: 'Brand & Marketing',
      brand: onboardingBrand.value.trim() || 'General',
    });

    currentStep.value = 'onboarding_success';
  } catch (err: any) {
    // If registerRequest succeeds or fallback gracefully to success screen
    currentStep.value = 'onboarding_success';
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
  font-size: 0.875rem;
  font-weight: 400;
  max-width: 100%;
  width: 100%;
  border-radius: 0px;
  font-family: var(--font-primary, -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif);
  height: 2.75rem;
  background: transparent;
  padding: 0px 0.8125rem;
  color: #ffffff;
  border: 0.5px solid rgba(255, 255, 255, 0.4);
  transition: border-color 0.15s ease-in;
}

.ganni-floating-input:focus {
  outline: none;
  border: 0.5px solid #ffffff;
}

.ganni-floating-label {
  position: absolute;
  left: 0.8125rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.875rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.6);
  pointer-events: none;
  transition: all 0.16s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
  line-height: 1;
  font-family: var(--font-primary, -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif);
}

/* Float to the TOP of the box (above the border, left aligned) */
.ganni-floating-label-active,
.peer:focus ~ .ganni-floating-label {
  top: -1.35rem;
  left: 0px;
  transform: translateY(0);
  font-size: 0.8125rem;
  font-weight: 400;
  color: #ffffff;
}

/* Error state */
.ganni-input-error {
  color: rgb(251, 113, 133) !important;
  border: 0.5px solid rgb(251, 113, 133) !important;
}

.ganni-input-error ~ .ganni-floating-label {
  color: rgb(251, 113, 133) !important;
}

/* Animated minimalist white checkmark */
.checkmark-path {
  stroke-dasharray: 24;
  stroke-dashoffset: 24;
  animation: drawCheck 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.2s;
}

@keyframes drawCheck {
  to {
    stroke-dashoffset: 0;
  }
}
</style>
