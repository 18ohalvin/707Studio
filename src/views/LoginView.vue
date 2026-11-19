<template>
  <div class="login-shell font-sans">
    <!-- Bottom-edge Blue Ambience (Unified 707 Ecosystem Pattern, pulses on transitions & loading) -->
    <div
      class="login-ambient"
      :class="{ 'is-active': ambientActive || isLoading }"
      aria-hidden="true"
    >
      <div class="login-ambient-mist">
        <div class="login-ambient-blob-veil" />
        <div class="login-ambient-blob-a" />
        <div class="login-ambient-blob-b" />
      </div>
    </div>

    <!-- Header: Centered Logo + 1.5 Badge (Login/Success) OR 3-part Segmented Progress (Onboarding) -->
    <header
      class="login-header"
      data-node-id="198:6791"
      data-name="Header"
    >
      <!-- Onboarding Step 2B Header -->
      <div
        v-if="isOnboarding && currentStep !== 'onboarding_success'"
        class="login-header-onboarding"
      >
        <router-link
          to="/"
          class="login-logo-btn"
          title="Back to 707 Home"
          @click="resetToLogin"
        >
          <img
            :src="FIGMA_ASSETS.logoDesignStudio"
            alt="707 Design Studio"
            class="login-logo-img"
          />
        </router-link>

        <!-- Segmented 3-part progress line (centered to viewport) -->
        <div class="login-progress-track" aria-hidden="true">
          <div
            v-for="s in 3"
            :key="s"
            class="login-progress-seg"
            :class="{ 'is-filled': currentOnboardingStepIndex >= s }"
          />
        </div>

        <!-- Step counter -->
        <span class="login-step-counter">
          {{ currentOnboardingStepIndex }} / 3
        </span>
      </div>

      <!-- Default Header (Centered 707 logo + 1.5 badge) -->
      <div v-else class="login-header-center">
        <router-link
          to="/"
          class="login-logo-btn"
          title="Back to 707 Home"
          @click="handleLogoClick"
        >
          <img
            :src="FIGMA_ASSETS.logoDesignStudio"
            alt="707 Design Studio"
            class="login-logo-img"
          />
        </router-link>
        <span class="login-beta-badge">1.5</span>
      </div>
    </header>

    <!-- Main Center Stage -->
    <main class="login-main">
      <!-- STEP 1 & STEP 2A: LOGIN CARD -->
      <section
        v-if="currentStep === 'email' || currentStep === 'password'"
        class="login-card animate-apple-pop"
        aria-label="Sign in"
      >
        <div class="login-heading-wrap">
          <h1 class="login-title">
            {{ currentStep === 'password' ? 'Welcome back.' : "Let's get you inside." }}
          </h1>
          <p class="login-subtitle">
            {{ currentStep === 'password' ? 'Enter your password to continue.' : 'Sign in or request workspace access.' }}
          </p>
        </div>

        <!-- STEP 1: IDENTIFIER / EMAIL -->
        <form
          v-if="currentStep === 'email'"
          class="login-form"
          novalidate
          @submit.prevent="handleEmailSubmit"
        >
          <div class="login-field-wrap">
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
              class="login-floating-input"
              :class="{ 'is-error': Boolean(errorMessage) }"
              :disabled="isLoading"
              @input="errorMessage = ''"
            />
            <label
              for="user-email"
              class="login-floating-label"
              :class="{ 'is-active': email.length > 0 }"
            >
              Your email *
            </label>
            <p v-if="errorMessage" class="login-error-text animate-apple-pop" role="alert">
              {{ errorMessage }}
            </p>
          </div>

          <div class="login-actions-stack">
            <button
              type="submit"
              :disabled="isLoading || !email.trim()"
              class="login-primary-btn"
            >
              <span v-if="isLoading" class="login-spinner" />
              <span v-else>Continue</span>
            </button>
          </div>
        </form>

        <!-- STEP 2A: PASSWORD (REGISTERED) -->
        <form
          v-else-if="currentStep === 'password'"
          class="login-form"
          novalidate
          @submit.prevent="handlePasswordSubmit"
        >
          <div class="login-field-wrap">
            <div class="login-input-row">
              <input
                id="user-password"
                ref="passwordInput"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder=" "
                class="login-floating-input has-toggle"
                :class="{ 'is-error': Boolean(errorMessage) }"
                :disabled="isLoading"
                @input="errorMessage = ''"
              />
              <label
                for="user-password"
                class="login-floating-label"
                :class="{ 'is-active': password.length > 0 }"
              >
                Password *
              </label>
              <button
                type="button"
                class="login-eye-btn"
                tabindex="-1"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                :title="showPassword ? 'Hide password' : 'Show password'"
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="showPassword" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>

            <p v-if="errorMessage" class="login-error-text animate-apple-pop" role="alert">
              {{ errorMessage }}
            </p>

            <div class="login-forgot-row">
              <button
                type="button"
                class="login-text-btn"
                @click="handleForgotPin"
              >
                Forgot password?
              </button>
            </div>
          </div>

          <div class="login-actions-stack items-center">
            <button
              type="submit"
              :disabled="isLoading || !password.trim()"
              class="login-primary-btn"
            >
              <span v-if="isLoading" class="login-spinner" />
              <span v-else>Sign In</span>
            </button>

            <button
              type="button"
              class="login-text-btn"
              @click="resetToLogin"
            >
              Use a different email
            </button>
          </div>
        </form>

        <p class="login-terms">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </section>

      <!-- STEP 2B-1: ONBOARDING NAME -->
      <section
        v-else-if="currentStep === 'onboarding_name'"
        class="login-onboard-stage animate-apple-pop"
        aria-label="Onboarding step 1"
      >
        <div aria-hidden="true" class="hidden sm:block h-4 shrink-0" />

        <div class="login-onboard-center">
          <label for="onboard-name" class="login-onboard-label">
            First, what should we call you?
          </label>
          <div class="login-big-input-wrap">
            <input
              id="onboard-name"
              ref="nameInput"
              v-model="onboardingName"
              type="text"
              placeholder="Your name"
              autocomplete="name"
              class="login-big-input"
              @keydown.enter.prevent="handleOnboardingNameSubmit"
              @input="onboardingError = ''"
            />
          </div>
          <p class="login-enter-hint">Press Enter ↵</p>
          <p v-if="onboardingError" class="login-error-text text-center animate-apple-pop" role="alert">
            {{ onboardingError }}
          </p>
        </div>

        <div class="login-onboard-footer">
          <button
            type="button"
            class="login-pill-btn"
            :disabled="!onboardingName.trim()"
            @click="handleOnboardingNameSubmit"
          >
            Continue
          </button>
        </div>
      </section>

      <!-- STEP 2B-2: CREATE A PASSWORD -->
      <section
        v-else-if="currentStep === 'onboarding_password'"
        class="login-onboard-stage animate-apple-pop"
        aria-label="Onboarding step 2"
      >
        <div aria-hidden="true" class="hidden sm:block h-4 shrink-0" />

        <div class="login-onboard-center">
          <label for="onboard-password" class="login-onboard-label">
            Create a password
          </label>
          <div class="login-big-input-wrap">
            <input
              id="onboard-password"
              ref="passwordStepInput"
              v-model="onboardingPassword"
              :type="showOnboardingPassword ? 'text' : 'password'"
              autocomplete="new-password"
              placeholder="••••••••"
              class="login-big-input"
              @keydown.enter.prevent="handleOnboardingPasswordSubmit"
              @input="onboardingError = ''"
            />
            <button
              type="button"
              class="login-eye-btn"
              tabindex="-1"
              :aria-label="showOnboardingPassword ? 'Hide password' : 'Show password'"
              :title="showOnboardingPassword ? 'Hide password' : 'Show password'"
              @click="showOnboardingPassword = !showOnboardingPassword"
            >
              <EyeOff v-if="showOnboardingPassword" class="w-5 h-5" />
              <Eye v-else class="w-5 h-5" />
            </button>
          </div>
          <p class="login-enter-hint">Press Enter ↵</p>
          <p v-if="onboardingError" class="login-error-text text-center animate-apple-pop" role="alert">
            {{ onboardingError }}
          </p>
        </div>

        <div class="login-onboard-footer">
          <button
            type="button"
            class="login-pill-btn"
            :disabled="!onboardingPassword.trim()"
            @click="handleOnboardingPasswordSubmit"
          >
            Continue
          </button>
        </div>
      </section>

      <!-- STEP 2B-3: BRAND / COMPANY AFFILIATION -->
      <section
        v-else-if="currentStep === 'onboarding_brand'"
        class="login-onboard-stage animate-apple-pop"
        aria-label="Onboarding step 3"
      >
        <div aria-hidden="true" class="hidden sm:block h-4 shrink-0" />

        <div class="login-onboard-center">
          <div class="flex flex-col items-center gap-2">
            <h2 class="login-onboard-title">
              <strong>Which brand </strong><span>do you work for?</span>
            </h2>
            <p class="login-subtitle max-w-[380px]">
              We'll link your workspace to the right partner catalog and activations.
            </p>
          </div>

          <!-- Partner Brand Pills (Direct from Superadmin Governance Brands Directory) -->
          <div class="login-choice-grid" role="radiogroup" aria-label="Select brand">
            <button
              v-for="b in partnerBrandOptions"
              :key="b"
              type="button"
              role="radio"
              :aria-checked="onboardingBrand === b ? 'true' : 'false'"
              class="login-choice-pill"
              :class="{ 'is-selected': onboardingBrand === b }"
              @click="onboardingBrand = b"
            >
              {{ b }}
            </button>
          </div>

          <p v-if="onboardingError" class="login-error-text text-center animate-apple-pop" role="alert">
            {{ onboardingError }}
          </p>
        </div>

        <div class="login-onboard-footer">
          <button
            type="button"
            class="login-pill-btn"
            :disabled="isLoading || !onboardingBrand.trim()"
            @click="handleOnboardingBrandSubmit"
          >
            <span v-if="isLoading" class="login-spinner" />
            <span v-else>Continue</span>
          </button>
        </div>
      </section>

      <!-- STEP 2B-SUCCESS: SUPERADMIN APPROVAL GATE -->
      <section
        v-else-if="currentStep === 'onboarding_success'"
        class="login-card login-success-card animate-apple-pop"
        aria-label="Application received"
      >
        <div class="login-success-badge" aria-hidden="true">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="20 6 9 17 4 12" class="login-check-path" />
          </svg>
        </div>

        <div class="flex flex-col gap-2">
          <h2 class="login-title login-success-title">
            Application Received.
          </h2>
          <p class="login-subtitle px-2">
            Your workspace request is with 707 Governance. The Superadmin team has been notified. You will be able to sign in as soon as access is approved.
          </p>
        </div>

        <div class="w-full flex flex-col items-center gap-2.5 mt-2">
          <a
            :href="whatsappUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="login-primary-btn"
          >
            <span>Contact Superadmin</span>
          </a>
          <button
            type="button"
            class="login-text-btn"
            @click="resetToLogin"
          >
            Return to Sign In
          </button>
        </div>

        <p class="login-terms">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </section>
    </main>

    <!-- Footer: Centered Brand Mark -->
    <footer class="login-footer" data-name="Footer">
      <span class="login-footer-brand">&copy; 2026 THE 707 COMPANY</span>
    </footer>

    <!-- What's New Tour Modal -->
    <WhatsNewModal
      :is-open="showWhatsNewModal"
      :dark="false"
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

// Bottom-edge ambient pulse during step transitions (matching 707 AI Login)
const ambientActive = ref(false);
let ambientFadeTimer: ReturnType<typeof setTimeout> | null = null;

function pulseAmbience(holdMs = 520) {
  if (ambientFadeTimer) clearTimeout(ambientFadeTimer);
  ambientActive.value = true;
  ambientFadeTimer = setTimeout(() => {
    ambientActive.value = false;
    ambientFadeTimer = null;
  }, holdMs);
}

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
  pulseAmbience(700);

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
  if (ambientFadeTimer) clearTimeout(ambientFadeTimer);
});

function handleForgotPin() {
  editorStore.showToast('Please contact your administrator or team lead to reset credentials.');
}

function resetToLogin() {
  currentStep.value = 'email';
  errorMessage.value = '';
  onboardingError.value = '';
  pulseAmbience(460);
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

  if (!cleanEmail.includes('@') && cleanEmail.length < 3) {
    errorMessage.value = 'Please enter a valid email address.';
    emailInput.value?.focus();
    return;
  }

  if (cleanEmail === 'admin' || cleanEmail === 'superadmin' || cleanEmail === 'admin@707designstudio.internal') {
    pulseAmbience(520);
    currentStep.value = 'password';
    await nextTick();
    passwordInput.value?.focus();
    return;
  }

  isLoading.value = true;
  try {
    const res = await authStore.checkEmail(cleanEmail);
    pulseAmbience(520);
    if (res.exists) {
      currentStep.value = 'password';
      await nextTick();
      passwordInput.value?.focus();
    } else {
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
      editorStore.showToast(`Welcome back, ${authStore.currentUser?.name || 'Designer'}`);
      const redirect = (route.query.redirect as string);
      const isAdminOnlyRedirect = Boolean(redirect && (redirect === '/dev' || redirect.startsWith('/dev/') || redirect === '/settings' || redirect === '/admin'));
      if (redirect && redirect !== '/' && !redirect.startsWith('/login') && (!isAdminOnlyRedirect || authStore.isSuperAdmin)) {
        router.push(redirect);
      } else if (authStore.isSuperAdmin) {
        router.push('/dev');
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
  pulseAmbience(520);
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
  pulseAmbience(520);
  currentStep.value = 'onboarding_brand';
}

// STEP 2B-3: Onboarding Brand Submit
async function handleOnboardingBrandSubmit() {
  if (!onboardingBrand.value.trim()) return;
  await submitOnboardingApplication();
}

// WhatsApp direct link to 707 Superadmin
const whatsappUrl = computed(() => {
  const applicantInfo = onboardingName.value ? `(${onboardingName.value} - ${email.value})` : `(${email.value})`;
  const brandInfo = onboardingBrand.value ? ` for ${onboardingBrand.value}` : '';
  const text = encodeURIComponent(`Hi Superadmin, I have submitted my 707 Design Studio workspace application ${applicantInfo}${brandInfo}.`);
  return `https://wa.me/6281277208270?text=${text}`;
});

// Submit Application (Superadmin Review Gate)
async function submitOnboardingApplication() {
  isLoading.value = true;
  try {
    onboardingError.value = '';
    const result = await authStore.registerRequest({
      email: email.value.trim().toLowerCase(),
      name: onboardingName.value.trim(),
      password: onboardingPassword.value.trim(),
      role: 'Brand & Marketing',
      brand: onboardingBrand.value.trim() || 'General',
    });
    if (!result.success) {
      onboardingError.value = result.error || 'We could not submit your application. Please try again.';
      return;
    }
    pulseAmbience(680);
    currentStep.value = 'onboarding_success';
  } catch (err: any) {
    onboardingError.value = err?.message || 'We could not submit your application. Please try again.';
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
/* =========================================================================
   LOGIN & ONBOARDING GATE — UNIFIED 707 STUDIO v2.3/v2.5 DESIGN TOKENS
   Light Default (#F2F2F2) + True Black Dark (#000000), SF Pro (<= 500 weight)
   ========================================================================= */
.login-shell {
  --login-bg: #f2f2f2;
  --login-fg: #111111;
  --login-muted: #575757;
  --login-subtle: #6b6b6b;
  --login-border: rgba(17, 17, 17, 0.28);
  --login-border-focus: #000000;
  --login-btn-bg: #111111;
  --login-btn-fg: #ffffff;
  --login-btn-hover: #262626;
  --login-pill-bg: rgba(17, 17, 17, 0.05);
  --login-pill-hover: rgba(17, 17, 17, 0.1);
  --login-pill-border: rgba(17, 17, 17, 0.16);
  --login-progress-track: rgba(17, 17, 17, 0.16);
  --login-progress-fill: #111111;
  --login-error: #be123c;
  --login-badge-bg: rgba(17, 17, 17, 0.06);
  --login-badge-border: rgba(17, 17, 17, 0.14);

  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: var(--login-bg);
  color: var(--login-fg);
  font-family: var(--font-apple-ui);
  font-weight: var(--font-weight-ui-default, 350);
  letter-spacing: -0.011em;
  position: relative;
  overflow: hidden;
  user-select: none;
}

/* Bottom-edge Blue Ambience */
.login-ambient {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
  opacity: 0;
  transform: translate3d(0, 12px, 0) scale(0.985);
  transition: opacity 1.4s cubic-bezier(0.22, 1, 0.36, 1), transform 1.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.login-ambient.is-active {
  opacity: 1;
  transform: translate3d(0, 0, 0) scale(1);
  transition: opacity 0.32s cubic-bezier(0.16, 1, 0.3, 1), transform 0.32s cubic-bezier(0.16, 1, 0.3, 1);
}

.login-ambient-mist {
  position: absolute;
  inset: 0;
  filter: blur(52px);
  -webkit-filter: blur(52px);
  transform-origin: 50% 100%;
  will-change: transform, opacity;
}

.login-ambient-blob-a,
.login-ambient-blob-b,
.login-ambient-blob-veil {
  position: absolute;
  pointer-events: none;
}

.login-ambient-blob-veil {
  inset: 0;
  background: radial-gradient(ellipse 115% 18% at 50% 100%,
      rgba(6, 33, 68, 0.24) 0%,
      rgba(6, 33, 68, 0.12) 48%,
      transparent 82%);
}

.login-ambient-blob-a {
  left: 0;
  top: 98%;
  width: 68%;
  height: 20%;
  background: radial-gradient(ellipse at center,
      rgba(6, 33, 68, 0.36) 0%,
      rgba(21, 62, 117, 0.20) 46%,
      transparent 80%);
  animation: loginBlobDriftA 2.6s linear infinite;
}

.login-ambient-blob-b {
  left: 0;
  top: 96%;
  width: 54%;
  height: 16%;
  background: radial-gradient(ellipse at center,
      rgba(29, 78, 137, 0.30) 0%,
      rgba(6, 33, 68, 0.16) 50%,
      transparent 82%);
  animation: loginBlobDriftB 2.6s linear infinite;
  animation-delay: -1.3s;
}

@keyframes loginBlobDriftA {
  0% { transform: translate3d(-75%, -50%, 0); opacity: 0.35; }
  50% { transform: translate3d(55%, -50%, 0); opacity: 0.9; }
  100% { transform: translate3d(185%, -50%, 0); opacity: 0.35; }
}

@keyframes loginBlobDriftB {
  0% { transform: translate3d(-65%, -50%, 0); opacity: 0.4; }
  50% { transform: translate3d(70%, -50%, 0); opacity: 0.85; }
  100% { transform: translate3d(195%, -50%, 0); opacity: 0.4; }
}

@media (prefers-reduced-motion: reduce) {
  .login-ambient-blob-a,
  .login-ambient-blob-b {
    animation: none !important;
  }
}

/* Header */
.login-header {
  width: 100%;
  height: 48px;
  padding: 8px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  position: relative;
  z-index: 10;
}

.login-header-center {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.login-header-onboarding {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.login-logo-btn {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: opacity 0.16s ease;
}

.login-logo-btn:hover {
  opacity: 0.78;
}

.login-logo-img {
  height: 18px;
  width: auto;
  display: block;
  object-fit: contain;
  pointer-events: none;
  transition: filter 0.2s ease;
}

.login-beta-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 7px;
  border-radius: 5px;
  background: var(--login-badge-bg);
  border: 0.5px solid var(--login-badge-border);
  font-size: 10.5px;
  font-weight: 500;
  color: var(--login-fg);
  line-height: 1.2;
  pointer-events: none;
  user-select: none;
}

.login-progress-track {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 6px;
  width: 180px;
  pointer-events: none;
}

.login-progress-seg {
  height: 2px;
  flex: 1;
  border-radius: 9999px;
  background: var(--login-progress-track);
  transition: background-color 0.25s ease;
}

.login-progress-seg.is-filled {
  background: var(--login-progress-fill);
}

.login-step-counter {
  font-family: var(--font-apple-ui);
  font-variant-numeric: tabular-nums;
  font-size: 12px;
  font-weight: 500;
  color: var(--login-muted);
  z-index: 10;
}

/* Main & Card */
.login-main {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;
  z-index: 10;
  overflow-y: auto;
}

.login-card {
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin: auto 0;
}

.login-success-card {
  max-width: 420px;
  align-items: center;
  text-align: center;
}

.login-heading-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  margin-bottom: 6px;
}

.login-title {
  margin: 0;
  font-size: 34px;
  line-height: 40px;
  font-weight: 400;
  letter-spacing: -0.025em;
  color: var(--login-fg);
}

.login-success-title {
  font-size: 30px;
  line-height: 36px;
}

.login-subtitle {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--login-muted);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.login-field-wrap {
  position: relative;
  width: 100%;
  margin-top: 16px;
}

.login-input-row {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}

.login-floating-input {
  box-sizing: border-box;
  appearance: none;
  margin: 0;
  outline: none;
  width: 100%;
  height: 44px;
  border-radius: 0;
  background: transparent;
  padding: 0 13px;
  font-size: 14px;
  font-weight: 400;
  color: var(--login-fg);
  border: 0.5px solid var(--login-border);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.login-floating-input.has-toggle {
  padding-right: 44px;
}

.login-floating-input:focus {
  border: 0.75px solid #000000;
  box-shadow: none;
}

.login-floating-label {
  position: absolute;
  left: 13px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  font-weight: 400;
  color: var(--login-muted);
  pointer-events: none;
  transition: all 0.16s cubic-bezier(0.16, 1, 0.3, 1);
  line-height: 1;
}

.login-floating-label.is-active,
.login-floating-input:focus ~ .login-floating-label,
.login-floating-input:not(:placeholder-shown) ~ .login-floating-label {
  top: -21px;
  left: 0;
  transform: translateY(0);
  font-size: 13px;
  color: var(--login-fg);
}

.login-floating-input.is-error {
  color: var(--login-error);
  border-color: var(--login-error);
}

.login-floating-input.is-error:focus {
  box-shadow: 0 0 0 1px var(--login-error);
}

.login-floating-input.is-error ~ .login-floating-label {
  color: var(--login-error);
}

.login-eye-btn {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--login-muted);
  cursor: pointer;
  border-radius: 6px;
  transition: color 0.15s ease;
}

.login-eye-btn:hover {
  color: var(--login-fg);
}

.login-eye-btn:focus-visible,
.login-primary-btn:focus-visible,
.login-pill-btn:focus-visible,
.login-choice-pill:focus-visible,
.login-text-btn:focus-visible {
  outline: 2px solid #0D72CB;
  outline-offset: 2px;
}

.login-error-text {
  margin: 6px 0 0;
  font-size: 12px;
  font-weight: 400;
  color: var(--login-error);
  text-align: left;
}

.login-forgot-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 4px;
}

.login-actions-stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 4px;
}

.login-primary-btn {
  width: 100%;
  height: 44px;
  border-radius: 0;
  border: none;
  background: var(--login-btn-bg);
  color: var(--login-btn-fg);
  font-size: 13.5px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.15s ease, opacity 0.15s ease, transform 0.12s ease;
}

.login-primary-btn:hover:not(:disabled) {
  background: var(--login-btn-hover);
}

.login-primary-btn:active:not(:disabled) {
  transform: scale(0.985);
}

.login-primary-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.login-spinner {
  width: 16px;
  height: 16px;
  border-radius: 9999px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #ffffff;
  animation: loginSpin 0.7s linear infinite;
}

@keyframes loginSpin {
  to { transform: rotate(360deg); }
}

.login-text-btn {
  background: transparent;
  border: none;
  padding: 6px 8px;
  min-height: 32px;
  font-size: 12px;
  font-weight: 400;
  color: var(--login-muted);
  cursor: pointer;
  transition: color 0.15s ease;
}

.login-text-btn:hover {
  color: var(--login-fg);
}

.login-terms {
  margin: 4px 0 0;
  font-size: 11px;
  color: var(--login-subtle);
  text-align: center;
  line-height: 1.5;
}

/* Onboarding Full-Height Step Layout */
.login-onboard-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 560px;
  min-height: 380px;
  margin: auto 0;
}

.login-onboard-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
  text-align: center;
  margin: auto 0;
}

.login-onboard-footer {
  width: 100%;
  display: flex;
  justify-content: center;
  padding-top: 32px;
  padding-bottom: 8px;
  flex-shrink: 0;
}

.login-onboard-label {
  font-size: 13.5px;
  color: var(--login-muted);
}

.login-big-input-wrap {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 0.5px solid var(--login-border);
  transition: border-color 0.15s ease;
}

.login-big-input-wrap:focus-within {
  border-bottom: 0.75px solid #000000;
}

.login-big-input {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  text-align: center;
  font-size: 44px;
  font-weight: 400;
  line-height: 1.15;
  letter-spacing: -0.025em;
  color: var(--login-fg);
  padding: 8px 48px;
}

.login-big-input::placeholder {
  color: var(--login-progress-track);
}

.login-enter-hint {
  margin: 0;
  font-family: var(--font-apple-ui);
  font-size: 11.5px;
  color: var(--login-subtle);
}

.login-pill-btn {
  padding: 0 48px;
  height: 46px;
  border-radius: 9999px;
  border: none;
  background: var(--login-btn-bg);
  color: var(--login-btn-fg);
  font-size: 13.5px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: background-color 0.15s ease, opacity 0.15s ease, transform 0.12s ease;
}

.login-pill-btn:hover:not(:disabled) {
  background: var(--login-btn-hover);
}

.login-pill-btn:active:not(:disabled) {
  transform: scale(0.985);
}

.login-pill-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.login-onboard-title {
  margin: 0;
  font-size: 34px;
  line-height: 40px;
  font-weight: 400;
  letter-spacing: -0.025em;
}

.login-onboard-title strong {
  font-weight: 500;
  color: var(--login-fg);
}

.login-onboard-title span {
  color: var(--login-muted);
}

.login-choice-grid {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  max-width: 440px;
}

.login-choice-pill {
  padding: 10px 20px;
  min-height: 40px;
  border-radius: 9999px;
  background: var(--login-pill-bg);
  border: 0.5px solid var(--login-pill-border);
  color: var(--login-fg);
  font-size: 13px;
  font-weight: 400;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, transform 0.12s ease;
}

.login-choice-pill:hover {
  background: var(--login-pill-hover);
  border-color: var(--login-border-focus);
}

.login-choice-pill.is-selected {
  background: var(--login-btn-bg);
  color: var(--login-btn-fg);
  border-color: var(--login-btn-bg);
  font-weight: 500;
}

/* Success Gate */
.login-success-badge {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 9999px;
  border: 0.5px solid var(--login-border);
  background: var(--login-pill-bg);
  color: var(--login-fg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-check-path {
  stroke-dasharray: 24;
  stroke-dashoffset: 24;
  animation: loginDrawCheck 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.15s;
}

@keyframes loginDrawCheck {
  to { stroke-dashoffset: 0; }
}

/* Footer */
.login-footer {
  width: 100%;
  height: 48px;
  padding: 8px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  z-index: 10;
}

.login-footer-brand {
  font-size: 11px;
  color: var(--login-subtle);
}

@media (max-width: 640px) {
  .login-title {
    font-size: 30px;
    line-height: 36px;
  }

  .login-onboard-title {
    font-size: 28px;
    line-height: 34px;
  }

  .login-big-input {
    font-size: 34px;
    padding: 8px 40px;
  }

  .login-progress-track {
    width: 130px;
  }

  .login-primary-btn,
  .login-floating-input,
  .login-pill-btn,
  .login-choice-pill,
  .login-eye-btn {
    min-height: 44px;
  }
}
</style>
