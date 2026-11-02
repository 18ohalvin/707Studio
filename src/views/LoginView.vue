<template>
  <div class="min-h-screen w-full flex flex-col justify-between bg-[#fbfbfb] text-black font-sans relative select-none p-6 sm:p-8 overflow-hidden">
    <!-- Future Background Container Layer (Prepared for custom background asset) -->
    <div 
      class="absolute inset-0 bg-[#fbfbfb] z-0 pointer-events-none transition-all duration-700" 
      :style="backgroundStyle"
    />

    <!-- Header: Dynamic (Centered on login, Segmented progress bar during onboarding) -->
    <header class="w-full px-[24px] py-[16px] sm:py-[20px] relative z-10">
      <!-- Onboarding Step 2B Header (Savee-style segmented progress bar) -->
      <div 
        v-if="isOnboarding && currentStep !== 'onboarding_success'" 
        class="w-full flex items-center justify-between"
      >
        <router-link 
          to="/" 
          class="h-[18px] relative shrink-0 flex items-center cursor-pointer hover:opacity-80 transition-opacity" 
          title="Back to 707 Home"
          @click="resetToLogin"
        >
          <img 
            :src="FIGMA_ASSETS.logoDesignStudio" 
            alt="707 Design Studio" 
            class="h-[18px] w-auto object-contain pointer-events-none"
          />
        </router-link>

        <!-- Segmented 3-part progress line -->
        <div class="flex items-center gap-1.5 w-[140px] sm:w-[180px]">
          <div 
            v-for="s in 3" 
            :key="s"
            class="h-[2px] flex-1 rounded-full transition-colors duration-300"
            :class="currentOnboardingStepIndex >= s ? 'bg-black' : 'bg-neutral-200'"
          />
        </div>

        <!-- Step counter -->
        <span class="text-[12px] font-mono text-neutral-400 font-medium">
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
      </div>
    </header>

    <!-- Center Stage: Minimal Seamless Sign In & Onboarding -->
    <main class="w-full flex-1 flex items-center justify-center py-8 relative z-10">
      <div class="w-full max-w-[420px] flex flex-col gap-8 animate-apple-pop">
        <!-- Editorial Heading (Step 1 & Step 2A) -->
        <div 
          v-if="currentStep === 'email' || currentStep === 'password'" 
          class="flex flex-col items-center text-center gap-2 mb-2"
        >
          <h1 class="font-707 text-[30px] sm:text-[34px] font-normal tracking-tight text-black leading-[36px] sm:leading-[40px]">
            Let's get you inside.
          </h1>
          <p class="font-707 text-[13px] text-neutral-400">
            Sign in to your workspace.
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
            <p v-if="errorMessage" class="text-[12px] text-[rgb(179,0,0)] font-normal mt-1.5 text-left animate-apple-pop">
              {{ errorMessage }}
            </p>
          </div>

          <!-- Continue Button -->
          <div class="mt-4">
            <button
              type="submit"
              :disabled="isLoading || !email.trim()"
              class="w-full h-[2.75rem] rounded-none bg-black text-white font-707 font-medium text-[13.5px] hover:bg-neutral-800 active:bg-neutral-900 transition-all flex items-center justify-center gap-2 apple-press cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span v-if="isLoading" class="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span v-else>Continue</span>
            </button>
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
                class="absolute right-[0.8125rem] text-[#8a8d8d] hover:text-black cursor-pointer bg-transparent border-none p-1 transition-colors z-10"
                tabindex="-1"
                :title="showPassword ? 'Hide password' : 'Show password'"
              >
                <EyeOff v-if="showPassword" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>
            <!-- Error message below box -->
            <p v-if="errorMessage" class="text-[12px] text-[rgb(179,0,0)] font-normal mt-1.5 text-left animate-apple-pop">
              {{ errorMessage }}
            </p>
            <div class="flex justify-end mt-1.5">
              <button 
                type="button" 
                @click="handleForgotPin"
                class="font-707 text-[11px] text-[#8a8d8d] hover:text-black transition-colors border-none bg-transparent cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
          </div>

          <!-- Sign In Button -->
          <div class="mt-4">
            <button
              type="submit"
              :disabled="isLoading || !password.trim()"
              class="w-full h-[2.75rem] rounded-none bg-black text-white font-707 font-medium text-[13.5px] hover:bg-neutral-800 active:bg-neutral-900 transition-all flex items-center justify-center gap-2 apple-press cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span v-if="isLoading" class="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span v-else>Sign In</span>
            </button>
          </div>
        </form>

        <!-- ========================================== -->
        <!-- STEP 2B-1: ONBOARDING NAME (NO PASSWORD)   -->
        <!-- ========================================== -->
        <div 
          v-else-if="currentStep === 'onboarding_name'" 
          class="flex flex-col items-center gap-12 sm:gap-16 animate-apple-pop w-full py-4"
        >
          <div class="flex flex-col items-center gap-4 w-full">
            <label class="text-[13.5px] text-neutral-400 font-707">
              First, what should we call you?
            </label>
            <input
              ref="nameInput"
              v-model="onboardingName"
              type="text"
              placeholder="Your name"
              autocomplete="name"
              class="font-707 text-[40px] sm:text-[48px] text-black text-center tracking-tight outline-none border-b-[0.5px] border-black/25 focus:border-black bg-transparent w-full py-2 placeholder:text-neutral-300 transition-colors"
              @keydown.enter.prevent="handleOnboardingNameSubmit"
              @input="onboardingError = ''"
            />
            <p class="text-[11.5px] text-neutral-400 font-mono text-center mt-1">
              Press Enter ↵
            </p>
            <p v-if="onboardingError" class="text-[12px] text-[rgb(179,0,0)] font-normal mt-1 animate-apple-pop">
              {{ onboardingError }}
            </p>
          </div>

          <div class="w-full flex justify-center mt-4 sm:mt-8">
            <button
              type="button"
              @click="handleOnboardingNameSubmit"
              :disabled="!onboardingName.trim()"
              class="px-12 h-[46px] rounded-full bg-black text-white font-707 font-medium text-[13.5px] hover:bg-neutral-800 active:bg-neutral-900 transition-all flex items-center justify-center apple-press cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
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
          class="flex flex-col items-center gap-12 sm:gap-16 animate-apple-pop w-full py-4"
        >
          <div class="flex flex-col items-center gap-4 w-full">
            <label class="text-[13.5px] text-neutral-400 font-707">
              Create a password
            </label>
            <div class="relative w-full max-w-[420px] flex items-center justify-center">
              <input
                ref="passwordStepInput"
                v-model="onboardingPassword"
                :type="showOnboardingPassword ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="••••••••"
                class="font-707 text-[40px] sm:text-[48px] text-black text-center tracking-tight outline-none border-b-[0.5px] border-black/25 focus:border-black bg-transparent w-full py-2 placeholder:text-neutral-300 transition-colors pr-10"
                @keydown.enter.prevent="handleOnboardingPasswordSubmit"
                @input="onboardingError = ''"
              />
              <button 
                type="button" 
                @click="showOnboardingPassword = !showOnboardingPassword"
                class="absolute right-2 top-1/2 -translate-y-1/2 text-[#8a8d8d] hover:text-black cursor-pointer bg-transparent border-none p-1 transition-colors"
                tabindex="-1"
                :title="showOnboardingPassword ? 'Hide password' : 'Show password'"
              >
                <EyeOff v-if="showOnboardingPassword" class="w-5 h-5" />
                <Eye v-else class="w-5 h-5" />
              </button>
            </div>
            <p class="text-[11.5px] text-neutral-400 font-mono text-center mt-1">
              Press Enter ↵
            </p>
            <p v-if="onboardingError" class="text-[12px] text-[rgb(179,0,0)] font-normal mt-1 animate-apple-pop">
              {{ onboardingError }}
            </p>
          </div>

          <div class="w-full flex justify-center mt-4 sm:mt-8">
            <button
              type="button"
              @click="handleOnboardingPasswordSubmit"
              :disabled="!onboardingPassword.trim()"
              class="px-12 h-[46px] rounded-full bg-black text-white font-707 font-medium text-[13.5px] hover:bg-neutral-800 active:bg-neutral-900 transition-all flex items-center justify-center apple-press cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
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
          class="flex flex-col items-center gap-8 sm:gap-12 animate-apple-pop w-full py-4"
        >
          <div class="flex flex-col items-center text-center gap-2">
            <h2 class="font-707 text-[30px] sm:text-[36px] font-normal tracking-tight leading-[36px] sm:leading-[42px]">
              <span class="text-black font-medium">Which brand </span>
              <span class="text-neutral-400">do you work for?</span>
            </h2>
            <p class="font-707 text-[13px] text-neutral-400 text-center max-w-[360px] mt-1">
              We'll link your workspace to the right partner catalog and activations.
            </p>
          </div>

          <!-- Quick Partner Pills -->
          <div class="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 w-full max-w-[360px]">
            <button
              v-for="b in partnerBrandOptions"
              :key="b"
              type="button"
              @click="onboardingBrand = b"
              class="px-4 py-2 rounded-full text-[12.5px] font-707 transition-all apple-press cursor-pointer"
              :class="onboardingBrand === b 
                ? 'bg-black text-white' 
                : 'bg-transparent text-neutral-700 border-[0.5px] border-black/20 hover:border-black'"
            >
              {{ b }}
            </button>
          </div>

          <!-- Custom Company / Brand Input -->
          <div class="relative w-full max-w-[380px] mt-2">
            <input
              id="onboarding-brand-input"
              v-model="onboardingBrand"
              type="text"
              placeholder=" "
              class="ganni-floating-input peer"
              :disabled="isLoading"
              @keydown.enter.prevent="handleOnboardingBrandSubmit"
            />
            <label
              for="onboarding-brand-input"
              class="ganni-floating-label"
              :class="{ 'ganni-floating-label-active': onboardingBrand.length > 0 }"
            >
              Company or brand name *
            </label>
          </div>

          <div class="flex flex-col items-center gap-3 w-full mt-2">
            <button
              type="button"
              @click="handleOnboardingBrandSubmit"
              :disabled="isLoading || !onboardingBrand.trim()"
              class="px-12 h-[46px] rounded-full bg-black text-white font-707 font-medium text-[13.5px] hover:bg-neutral-800 active:bg-neutral-900 transition-all flex items-center justify-center apple-press cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span v-if="isLoading" class="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span v-else>Submit Application</span>
            </button>
            <button
              type="button"
              @click="skipBrandAndSubmit"
              class="text-center text-[12px] font-707 text-neutral-400 hover:text-black py-1 cursor-pointer bg-transparent border-none"
            >
              Skip for now
            </button>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- STEP 2B-SUCCESS: OPTION B SUPERADMIN GATE   -->
        <!-- ========================================== -->
        <div 
          v-else-if="currentStep === 'onboarding_success'" 
          class="flex flex-col items-center gap-6 animate-apple-pop w-full text-center py-4"
        >
          <div class="size-12 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shadow-xs">
            <Clock class="w-5 h-5" />
          </div>
          <div class="flex flex-col gap-1.5">
            <h2 class="font-707 text-[28px] sm:text-[32px] font-normal tracking-tight text-black">
              Application Received.
            </h2>
            <p class="font-707 text-[13px] text-neutral-400">
              Your workspace request is with 707 Governance.
            </p>
          </div>

          <!-- Application details summary card -->
          <div class="w-full border-[0.5px] border-black/15 p-5 text-left flex flex-col gap-2.5 font-mono text-[12px] bg-black/[0.02]">
            <div class="flex justify-between py-1 border-b-[0.5px] border-black/10">
              <span class="text-neutral-500">Applicant:</span>
              <span class="text-black font-semibold">{{ onboardingName }}</span>
            </div>
            <div class="flex justify-between py-1 border-b-[0.5px] border-black/10">
              <span class="text-neutral-500">Email:</span>
              <span class="text-black truncate max-w-[220px]">{{ email }}</span>
            </div>
            <div class="flex justify-between py-1 border-b-[0.5px] border-black/10">
              <span class="text-neutral-500">Role:</span>
              <span class="text-black">Brand & Marketing</span>
            </div>
            <div class="flex justify-between py-1 border-b-[0.5px] border-black/10">
              <span class="text-neutral-500">Affiliation:</span>
              <span class="text-black">{{ onboardingBrand || 'General' }}</span>
            </div>
            <div class="flex items-center justify-between pt-1">
              <span class="text-neutral-500">Status:</span>
              <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-100/80 text-amber-800 text-[11px] font-medium rounded-full">
                <span class="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                Pending Superadmin Review
              </span>
            </div>
          </div>

          <p class="font-707 text-[12.5px] text-neutral-500 leading-relaxed px-2">
            Superadmin (Alvin) has been notified. You will be able to sign in as soon as access is approved.
          </p>

          <div class="w-full mt-2">
            <button
              type="button"
              @click="resetToLogin"
              class="w-full h-[2.75rem] rounded-none bg-black text-white font-707 font-medium text-[13.5px] hover:bg-neutral-800 apple-press cursor-pointer"
            >
              Return to Studio
            </button>
          </div>
        </div>

        <!-- Minimal Terms & Privacy Notice -->
        <p 
          v-if="!isOnboarding || currentStep === 'onboarding_success'" 
          class="font-707 text-[11px] text-neutral-400 text-center leading-relaxed"
        >
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </main>

    <!-- Footer: Studio Mark -->
    <footer class="w-full px-[24px] flex items-center justify-center py-4 relative z-10">
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
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Eye, EyeOff, Clock } from 'lucide-vue-next';
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

const partnerBrandOptions = [
  'atmos',
  'Fred Perry',
  '707 Store',
  'Independent'
];

const emailInput = ref<HTMLInputElement | null>(null);
const passwordInput = ref<HTMLInputElement | null>(null);
const nameInput = ref<HTMLInputElement | null>(null);
const passwordStepInput = ref<HTMLInputElement | null>(null);
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
  emailInput.value?.focus();
  window.addEventListener('keydown', handleKeydown);
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
    const res = await authStore.signIn(email.value.trim(), password.value);
    if (!res.success) {
      errorMessage.value = res.error || 'Incorrect password. Please verify your credentials and try again.';
      return;
    }

    // Auto-match or activate brand
    if (brandStore.brands.length === 0) {
      await brandStore.loadBrands();
    }
    const found = brandStore.brands.find(b => 
      b.slug.toLowerCase() === email.value.trim().toLowerCase() || 
      (authStore.currentUser?.assignedBrands && authStore.currentUser.assignedBrands.some(ub => ub.toLowerCase() === b.slug.toLowerCase()))
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

// STEP 2B-1: Name Handler
function handleOnboardingNameSubmit() {
  onboardingError.value = '';
  if (!onboardingName.value.trim()) {
    onboardingError.value = 'Please enter your name.';
    nameInput.value?.focus();
    return;
  }
  currentStep.value = 'onboarding_password';
  nextTick(() => {
    passwordStepInput.value?.focus();
  });
}

// STEP 2B-2: Password Handler
function handleOnboardingPasswordSubmit() {
  onboardingError.value = '';
  if (!onboardingPassword.value.trim()) {
    onboardingError.value = 'Please create a password.';
    passwordStepInput.value?.focus();
    return;
  }
  if (onboardingPassword.value.trim().length < 4) {
    onboardingError.value = 'Password should be at least 4 characters.';
    passwordStepInput.value?.focus();
    return;
  }
  currentStep.value = 'onboarding_brand';
}

// STEP 2B-3: Submit Onboarding Application
async function handleOnboardingBrandSubmit() {
  isLoading.value = true;
  try {
    await authStore.registerRequest({
      name: onboardingName.value.trim(),
      email: email.value.trim().toLowerCase(),
      password: onboardingPassword.value.trim(),
      role: 'Brand & Marketing',
      brand: onboardingBrand.value.trim() || 'General'
    });
    currentStep.value = 'onboarding_success';
  } catch (err: any) {
    editorStore.showToast(err?.message || 'Application failed to submit. Please try again.');
  } finally {
    isLoading.value = false;
  }
}

function skipBrandAndSubmit() {
  onboardingBrand.value = 'Independent';
  handleOnboardingBrandSubmit();
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
  color: #222222;
  border: 0.5px solid #000000;
  transition: border-color 0.15s ease-in;
}

.ganni-floating-input:focus {
  outline: none;
  border: 0.5px solid #000000;
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

/* Float to the TOP of the box (above the border, left aligned) */
.ganni-floating-label-active,
.peer:focus ~ .ganni-floating-label {
  top: -1.35rem;
  left: 0px;
  transform: translateY(0);
  font-size: 0.8125rem;
  font-weight: 400;
  color: #000000;
}

/* Error state matching Ganni screenshot */
.ganni-input-error {
  color: rgb(179, 0, 0) !important;
  border: 0.5px solid rgb(179, 0, 0) !important;
}

.ganni-input-error ~ .ganni-floating-label {
  color: rgb(179, 0, 0) !important;
}
</style>

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
  color: #222222;
  border: 0.5px solid #000000;
  transition: border-color 0.15s ease-in;
}

.ganni-floating-input:focus {
  outline: none;
  border: 0.5px solid #000000;
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

/* Float to the TOP of the box (above the border, left aligned) */
.ganni-floating-label-active,
.peer:focus ~ .ganni-floating-label {
  top: -1.35rem;
  left: 0px;
  transform: translateY(0);
  font-size: 0.8125rem;
  font-weight: 400;
  color: #000000;
}

/* Error state matching Ganni screenshot */
.ganni-input-error {
  color: rgb(179, 0, 0) !important;
  border: 0.5px solid rgb(179, 0, 0) !important;
}

.ganni-input-error ~ .ganni-floating-label {
  color: rgb(179, 0, 0) !important;
}
</style>
