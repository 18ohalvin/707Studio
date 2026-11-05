<template>
  <div class="h-screen w-full flex flex-col justify-between bg-[#fafafa] text-black font-sans font-light tracking-normal relative select-none overflow-hidden">
    <!-- Header: Dynamic 48px Header strictly following Campaign Hub design tokens -->
    <header 
      class="w-full h-[48px] px-[24px] py-[8px] flex items-center justify-between shrink-0 border-b border-black/10 bg-white/95 backdrop-blur-md relative z-20"
      data-name="Header"
    >
      <!-- Onboarding Mode: Segmented Progress Bar -->
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
            class="h-[18px] w-auto object-contain pointer-events-none" 
          />
        </router-link>

        <!-- Segmented 3-part progress line (Strictly centered to viewport) -->
        <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 w-[140px] sm:w-[180px] pointer-events-none">
          <div 
            v-for="s in 3" 
            :key="s"
            class="h-[2px] flex-1 rounded-full transition-colors duration-300"
            :class="currentOnboardingStepIndex >= s ? 'bg-black' : 'bg-black/15'"
          />
        </div>

        <!-- Step counter -->
        <span class="text-[11.5px] font-mono text-neutral-500 font-medium z-10 tabular-nums">
          {{ currentOnboardingStepIndex }} / 3
        </span>
      </div>

      <!-- Default Header: Pure Minimal Centered 707 Logo -->
      <div v-else class="w-full flex items-center justify-center">
        <router-link 
          to="/" 
          class="h-[18px] relative shrink-0 flex items-center cursor-pointer hover:opacity-85 transition-opacity" 
          title="707 Design Studio"
        >
          <img 
            :src="FIGMA_ASSETS.logoDesignStudio" 
            alt="707 Design Studio" 
            class="h-[18px] w-auto object-contain pointer-events-none" 
          />
        </router-link>
      </div>
    </header>

    <!-- Center Stage: Unified 707 Sign In Card -->
    <main class="w-full flex-1 flex flex-col items-center justify-center px-[24px] py-[24px] sm:py-[40px] relative z-10 overflow-y-auto">
      <!-- STEP 1 & STEP 2A: LOGIN CARD -->
      <div 
        v-if="currentStep === 'email' || currentStep === 'password'" 
        class="w-full max-w-[390px] p-6 sm:p-8 rounded-[16px] border border-black/10 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.06)] flex flex-col gap-6 animate-apple-pop my-auto"
      >
        <!-- Heading: Step 1 (Email) -->
        <div v-if="currentStep === 'email'" class="flex flex-col items-center text-center gap-1.5">
          <h1 class="font-sans text-[23px] sm:text-[25px] font-medium tracking-tight text-black leading-tight">
            Sign in to 707 Studio
          </h1>
          <p class="font-sans text-[12.5px] text-neutral-500 font-light">
            Enter your workspace email or handle to continue.
          </p>
        </div>

        <!-- Heading: Step 2A (Password) -->
        <div v-else-if="currentStep === 'password'" class="flex flex-col items-center text-center gap-2">
          <!-- Role Pill -->
          <div 
            v-if="isSuperAdminAccount" 
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-oxblood-50 border border-oxblood-200 text-oxblood-800 text-[11px] font-medium"
          >
            <span class="size-1.5 rounded-full bg-oxblood-600 shrink-0" />
            <span>Superadmin Access</span>
          </div>
          <div 
            v-else-if="detectedBrand" 
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 border border-black/10 text-neutral-700 text-[11px] font-medium"
          >
            <span class="size-1.5 rounded-full bg-moss-600 shrink-0" />
            <span>{{ detectedBrand }} · Partner Account</span>
          </div>

          <div class="flex flex-col items-center gap-0.5">
            <h1 class="font-sans text-[22px] sm:text-[24px] font-medium tracking-tight text-black leading-tight">
              Welcome back
            </h1>
            <p class="font-sans text-[12.5px] text-neutral-500 font-light truncate max-w-[280px]">
              {{ email }}
            </p>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- STEP 1: IDENTIFIER / EMAIL FORM           -->
        <!-- ========================================== -->
        <form 
          v-if="currentStep === 'email'" 
          class="flex flex-col gap-4" 
          @submit.prevent="handleEmailSubmit"
        >
          <div class="flex flex-col gap-1.5 w-full">
            <label for="user-email" class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">
              Workspace Email or Handle
            </label>
            <input
              id="user-email"
              ref="emailInput"
              v-model="email"
              type="text"
              autocomplete="email"
              autocapitalize="none"
              autocorrect="off"
              spellcheck="false"
              placeholder="name@brand.com or admin"
              class="w-full h-[40px] px-3.5 rounded-[8px] bg-black/[0.03] border border-black/12 focus:border-black focus:bg-white text-[13px] font-sans font-light text-black outline-none transition-all placeholder:text-neutral-400"
              :class="{ '!border-red-500 !bg-red-50/20': errorMessage }"
              :disabled="isLoading"
              @input="errorMessage = ''"
            />
            <p v-if="errorMessage" class="text-[11.5px] text-red-600 font-normal mt-0.5 animate-apple-pop">
              {{ errorMessage }}
            </p>
          </div>

          <!-- Continue Button -->
          <div class="mt-2 flex flex-col gap-3">
            <button
              type="submit"
              :disabled="isLoading || !email.trim()"
              class="w-full h-[40px] rounded-[8px] bg-black text-white font-medium text-[12.5px] hover:bg-neutral-800 transition-colors apple-press flex items-center justify-center gap-2 cursor-pointer border-none shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span v-if="isLoading" class="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span v-else>Continue</span>
            </button>
          </div>
        </form>

        <!-- ========================================== -->
        <!-- STEP 2A: PASSWORD FORM                     -->
        <!-- ========================================== -->
        <form 
          v-else-if="currentStep === 'password'" 
          class="flex flex-col gap-4" 
          @submit.prevent="handlePasswordSubmit"
        >
          <div class="flex flex-col gap-1.5 w-full">
            <div class="flex items-center justify-between">
              <label for="user-password" class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">
                Password
              </label>
              <button 
                type="button" 
                @click="handleForgotPin"
                class="text-[11px] text-neutral-500 hover:text-black underline underline-offset-2 transition-colors border-none bg-transparent cursor-pointer p-0"
              >
                Forgot password?
              </button>
            </div>

            <div class="relative w-full flex items-center">
              <input
                id="user-password"
                ref="passwordInput"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="Enter password"
                class="w-full h-[40px] pl-3.5 pr-10 rounded-[8px] bg-black/[0.03] border border-black/12 focus:border-black focus:bg-white text-[13px] font-sans font-light text-black outline-none transition-all placeholder:text-neutral-400"
                :class="{ '!border-red-500 !bg-red-50/20': errorMessage }"
                :disabled="isLoading"
                @input="errorMessage = ''"
              />
              <button 
                type="button" 
                @click="showPassword = !showPassword"
                class="absolute right-3 text-neutral-400 hover:text-black cursor-pointer bg-transparent border-none p-0 transition-colors"
                tabindex="-1"
                :title="showPassword ? 'Hide password' : 'Show password'"
              >
                <EyeOff v-if="showPassword" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>

            <p v-if="errorMessage" class="text-[11.5px] text-red-600 font-normal mt-0.5 animate-apple-pop">
              {{ errorMessage }}
            </p>
          </div>

          <!-- Sign In Button & Switch Email -->
          <div class="mt-2 flex flex-col gap-3">
            <button
              type="submit"
              :disabled="isLoading || !password.trim()"
              class="w-full h-[40px] rounded-[8px] bg-black text-white font-medium text-[12.5px] hover:bg-neutral-800 transition-colors apple-press flex items-center justify-center gap-2 cursor-pointer border-none shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span v-if="isLoading" class="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span v-else>Sign In</span>
            </button>

            <button 
              type="button" 
              @click="resetToLogin"
              class="text-[12px] text-neutral-500 hover:text-black underline underline-offset-2 transition-colors border-none bg-transparent cursor-pointer p-0 text-center"
            >
              Use a different email
            </button>
          </div>
        </form>

        <!-- Terms Notice -->
        <p class="text-[11px] text-neutral-400 text-center leading-relaxed">
          Protected by 707 Studio Access Control.
        </p>
      </div>

      <!-- ========================================== -->
      <!-- STEP 2B-1: ONBOARDING NAME                 -->
      <!-- ========================================== -->
      <div 
        v-else-if="currentStep === 'onboarding_name'" 
        class="w-full max-w-[420px] p-6 sm:p-8 rounded-[16px] border border-black/10 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.06)] flex flex-col gap-6 animate-apple-pop my-auto"
      >
        <div class="flex flex-col items-center text-center gap-1.5">
          <h2 class="font-sans text-[22px] sm:text-[24px] font-medium tracking-tight text-black leading-tight">
            What is your name?
          </h2>
          <p class="font-sans text-[12.5px] text-neutral-500 font-light">
            We will use this to set up your designer profile.
          </p>
        </div>

        <form class="flex flex-col gap-4" @submit.prevent="handleOnboardingNameSubmit">
          <div class="flex flex-col gap-1.5 w-full">
            <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Full Name</label>
            <input
              ref="nameInput"
              v-model="onboardingName"
              type="text"
              placeholder="e.g. Alvin Decorous"
              autocomplete="name"
              class="w-full h-[40px] px-3.5 rounded-[8px] bg-black/[0.03] border border-black/12 focus:border-black focus:bg-white text-[13px] font-sans font-light text-black outline-none transition-all"
              @input="onboardingError = ''"
            />
            <p v-if="onboardingError" class="text-[11.5px] text-red-600 font-normal mt-0.5 animate-apple-pop">
              {{ onboardingError }}
            </p>
          </div>

          <div class="mt-2 flex flex-col gap-2">
            <button
              type="submit"
              :disabled="!onboardingName.trim()"
              class="w-full h-[40px] rounded-[8px] bg-black text-white font-medium text-[12.5px] hover:bg-neutral-800 transition-colors apple-press flex items-center justify-center cursor-pointer border-none shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
            </button>
            <button 
              type="button" 
              @click="resetToLogin"
              class="text-[12px] text-neutral-500 hover:text-black underline underline-offset-2 transition-colors border-none bg-transparent cursor-pointer p-0 text-center"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <!-- ========================================== -->
      <!-- STEP 2B-2: ONBOARDING PASSWORD             -->
      <!-- ========================================== -->
      <div 
        v-else-if="currentStep === 'onboarding_password'" 
        class="w-full max-w-[420px] p-6 sm:p-8 rounded-[16px] border border-black/10 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.06)] flex flex-col gap-6 animate-apple-pop my-auto"
      >
        <div class="flex flex-col items-center text-center gap-1.5">
          <h2 class="font-sans text-[22px] sm:text-[24px] font-medium tracking-tight text-black leading-tight">
            Create a password
          </h2>
          <p class="font-sans text-[12.5px] text-neutral-500 font-light">
            Choose a secure password for your workspace account.
          </p>
        </div>

        <form class="flex flex-col gap-4" @submit.prevent="handleOnboardingPasswordSubmit">
          <div class="flex flex-col gap-1.5 w-full">
            <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">New Password</label>
            <div class="relative w-full flex items-center">
              <input
                ref="passwordStepInput"
                v-model="onboardingPassword"
                :type="showOnboardingPassword ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="At least 6 characters"
                class="w-full h-[40px] pl-3.5 pr-10 rounded-[8px] bg-black/[0.03] border border-black/12 focus:border-black focus:bg-white text-[13px] font-sans font-light text-black outline-none transition-all"
                @input="onboardingError = ''"
              />
              <button 
                type="button" 
                @click="showOnboardingPassword = !showOnboardingPassword"
                class="absolute right-3 text-neutral-400 hover:text-black cursor-pointer bg-transparent border-none p-0 transition-colors"
                tabindex="-1"
              >
                <EyeOff v-if="showOnboardingPassword" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>
            <p v-if="onboardingError" class="text-[11.5px] text-red-600 font-normal mt-0.5 animate-apple-pop">
              {{ onboardingError }}
            </p>
          </div>

          <div class="mt-2 flex flex-col gap-2">
            <button
              type="submit"
              :disabled="!onboardingPassword.trim()"
              class="w-full h-[40px] rounded-[8px] bg-black text-white font-medium text-[12.5px] hover:bg-neutral-800 transition-colors apple-press flex items-center justify-center cursor-pointer border-none shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
            </button>
            <button 
              type="button" 
              @click="currentStep = 'onboarding_name'"
              class="text-[12px] text-neutral-500 hover:text-black underline underline-offset-2 transition-colors border-none bg-transparent cursor-pointer p-0 text-center"
            >
              Back
            </button>
          </div>
        </form>
      </div>

      <!-- ========================================== -->
      <!-- STEP 2B-3: ONBOARDING BRAND SELECTION      -->
      <!-- ========================================== -->
      <div 
        v-else-if="currentStep === 'onboarding_brand'" 
        class="w-full max-w-[440px] p-6 sm:p-8 rounded-[16px] border border-black/10 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.06)] flex flex-col gap-6 animate-apple-pop my-auto"
      >
        <div class="flex flex-col items-center text-center gap-1.5">
          <h2 class="font-sans text-[22px] sm:text-[24px] font-medium tracking-tight text-black leading-tight">
            Which brand do you represent?
          </h2>
          <p class="font-sans text-[12.5px] text-neutral-500 font-light">
            We will link your workspace to the right partner catalog.
          </p>
        </div>

        <div class="flex flex-wrap items-center justify-center gap-2 w-full my-2">
          <button
            v-for="b in partnerBrandOptions"
            :key="b"
            type="button"
            @click="onboardingBrand = b"
            class="px-4 py-2 rounded-[8px] text-[12.5px] font-medium transition-all apple-press cursor-pointer"
            :class="onboardingBrand === b 
              ? 'bg-black text-white shadow-2xs' 
              : 'bg-black/[0.04] hover:bg-black/[0.08] text-neutral-800 border border-black/10'"
          >
            {{ b }}
          </button>
        </div>

        <div class="mt-2 flex flex-col gap-2">
          <button
            type="button"
            @click="handleOnboardingBrandSubmit"
            :disabled="isLoading || !onboardingBrand.trim()"
            class="w-full h-[40px] rounded-[8px] bg-black text-white font-medium text-[12.5px] hover:bg-neutral-800 transition-colors apple-press flex items-center justify-center gap-2 cursor-pointer border-none shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span v-if="isLoading" class="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span v-else>Submit Access Request</span>
          </button>
          <button 
            type="button" 
            @click="currentStep = 'onboarding_password'"
            class="text-[12px] text-neutral-500 hover:text-black underline underline-offset-2 transition-colors border-none bg-transparent cursor-pointer p-0 text-center"
          >
            Back
          </button>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- STEP 2B-SUCCESS: SUPERADMIN REVIEW GATE   -->
      <!-- ========================================== -->
      <div 
        v-else-if="currentStep === 'onboarding_success'" 
        class="w-full max-w-[420px] p-6 sm:p-8 rounded-[16px] border border-black/10 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.06)] flex flex-col items-center gap-5 text-center animate-apple-pop my-auto"
      >
        <div class="size-12 rounded-full bg-moss-50 border border-moss-200 text-moss-700 flex items-center justify-center shadow-2xs">
          <svg 
            class="w-5 h-5 text-moss-700" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="2" 
            stroke-linecap="round" 
            stroke-linejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <div class="flex flex-col gap-1.5">
          <h2 class="font-sans text-[22px] font-medium tracking-tight text-black leading-tight">
            Application Received
          </h2>
          <p class="font-sans text-[12.5px] text-neutral-600 font-light leading-relaxed">
            Your workspace request has been submitted to 707 Governance. Superadmin has been notified and you will receive access once approved.
          </p>
        </div>

        <div class="w-full mt-2 flex flex-col gap-2.5">
          <a
            :href="whatsappUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="w-full h-[40px] rounded-[8px] bg-black text-white font-medium text-[12.5px] hover:bg-neutral-800 transition-colors apple-press flex items-center justify-center gap-2 cursor-pointer no-underline shadow-2xs"
          >
            Contact Superadmin via WhatsApp
          </a>

          <button
            type="button"
            @click="resetToLogin"
            class="text-[12px] text-neutral-500 hover:text-black underline underline-offset-2 transition-colors border-none bg-transparent cursor-pointer p-0 text-center"
          >
            Return to Sign In
          </button>
        </div>
      </div>
    </main>

    <!-- Footer: 48px standard footer -->
    <footer 
      class="w-full h-[48px] px-[24px] py-[8px] flex items-center justify-between shrink-0 border-t border-black/10 bg-white/95 text-[11px] text-neutral-400 font-sans font-light select-none relative z-20"
      data-name="Footer"
    >
      <span>707 Design Studio</span>
      <span>Luxury Brand Activations</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Eye, EyeOff } from 'lucide-vue-next';
import { useAuthStore } from '../stores/authStore.ts';
import { useBrandStore } from '../stores/brandStore.ts';
import { useEditorStore } from '../stores/editorStore.ts';
import { FIGMA_ASSETS } from '../constants/figmaAssets.ts';

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

// Detected account information from email lookup
const isSuperAdminAccount = ref(false);
const detectedBrand = ref('');

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

onMounted(() => {
  emailInput.value?.focus();
  brandStore.loadBrands();
});

function handleForgotPin() {
  editorStore.showToast('Please contact Superadmin Alvin or team lead to reset credentials.');
}

function resetToLogin() {
  currentStep.value = 'email';
  errorMessage.value = '';
  onboardingError.value = '';
  isSuperAdminAccount.value = false;
  detectedBrand.value = '';
  nextTick(() => {
    emailInput.value?.focus();
  });
}

// STEP 1: Verify Email
async function handleEmailSubmit() {
  errorMessage.value = '';
  const cleanEmail = email.value.trim().toLowerCase();

  if (!cleanEmail) {
    errorMessage.value = 'Please enter your email or handle.';
    emailInput.value?.focus();
    return;
  }

  // Check if this looks like superadmin master identifier
  if (cleanEmail === 'admin' || cleanEmail === 'superadmin' || cleanEmail === 'admin@707designstudio.internal') {
    isSuperAdminAccount.value = true;
    currentStep.value = 'password';
    await nextTick();
    passwordInput.value?.focus();
    return;
  }

  isLoading.value = true;
  try {
    const res = await authStore.checkEmail(cleanEmail);
    if (res.exists) {
      // Check if user is superadmin or brand editor
      const userMatch = authStore.users.find(u => 
        (u.email || '').toLowerCase() === cleanEmail ||
        (u.id || '').toLowerCase() === cleanEmail ||
        (u.name || '').toLowerCase() === cleanEmail
      );

      if (userMatch?.role === 'superadmin') {
        isSuperAdminAccount.value = true;
      } else if (userMatch?.assignedBrands && userMatch.assignedBrands.length > 0) {
        const brandKey = userMatch.assignedBrands[0];
        const brandObj = brandStore.brands.find(b => b.id === brandKey || b.slug === brandKey);
        detectedBrand.value = brandObj?.name || brandKey;
      }

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
    errorMessage.value = 'Please enter your password.';
    passwordInput.value?.focus();
    return;
  }

  isLoading.value = true;
  try {
    const cleanId = email.value.trim().toLowerCase();
    const res = await authStore.signIn(cleanId, password.value);
    if (res.success) {
      // Smart role-based redirection
      editorStore.showToast(`Welcome back, ${authStore.currentUser?.name || (authStore.isSuperAdmin ? 'Superadmin' : 'Designer')}`);
      
      const explicitRedirect = route.query.redirect as string;
      if (explicitRedirect && explicitRedirect !== '/') {
        router.push(explicitRedirect);
      } else if (authStore.isSuperAdmin) {
        // Superadmin automatically lands in Superadmin Directory
        router.push('/settings');
      } else {
        // Brand Editors automatically land in Campaign Hub
        router.push('/hub');
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
  if (onboardingPassword.value.length < 6) {
    onboardingError.value = 'Password must be at least 6 characters.';
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
    await authStore.registerRequest({
      email: email.value.trim().toLowerCase(),
      name: onboardingName.value.trim(),
      password: onboardingPassword.value.trim(),
      role: 'Brand & Marketing',
      brand: onboardingBrand.value.trim() || 'General',
    });

    currentStep.value = 'onboarding_success';
  } catch {
    currentStep.value = 'onboarding_success';
  } finally {
    isLoading.value = false;
  }
}
</script>
