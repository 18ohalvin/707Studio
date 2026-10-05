<template>
  <header class="absolute top-0 left-0 right-0 z-40 backdrop-blur-[4px] bg-white/20 content-stretch flex items-center justify-between px-[20px] h-[48px] w-full select-none transition-all">
    <!-- Left: 707 Logo, Dynamic-Width Title, and Save Status Pill -->
    <div class="content-stretch flex gap-[16px] md:gap-[20px] items-center flex-1 min-w-0 mr-4">
      <!-- 707 Official Logo from Figma (Click to return to Landing Page) -->
      <a 
        href="/"
        @click.prevent="navigateHome" 
        class="h-[15px] w-[48px] relative shrink-0 flex items-center cursor-pointer hover:opacity-80 transition-opacity" 
        title="Back to Design Studio"
      >
        <img 
          :src="FIGMA_ASSETS.logo707" 
          alt="707 Logo" 
          class="inset-0 object-contain pointer-events-none size-full"
          @error="handleLogoError"
        />
        <!-- Fallback if localhost asset server isn't running -->
        <span v-if="logoFailed" class="font-black text-black text-xs tracking-tighter">707</span>
      </a>

      <!-- Title Container & Save Status -->
      <div class="flex flex-row items-center gap-[8px] shrink-0 max-w-full">
        <!-- Dynamic-Width Title Input: Span dictates 100% of width, absolute input overlays it to eliminate all browser min-width/placeholder constraints -->
        <div class="relative inline-flex items-center font-707 text-bodytext text-black font-light p-0 m-0">
          <span 
            class="invisible whitespace-pre pointer-events-none select-none p-0 m-0 border-0 font-707 text-bodytext font-light leading-[20px]"
            aria-hidden="true"
          >{{ editorStore.projectTitle || 'atmos x ASICS Gel Kayano Pandan RSVP Form' }}</span>
          <input 
            v-model="editorStore.projectTitle"
            placeholder="atmos x ASICS Gel Kayano Pandan RSVP Form"
            class="absolute inset-0 w-full h-full bg-transparent p-0 m-0 font-707 text-bodytext text-black font-light leading-[20px] border-none outline-none focus:outline-none"
          />
        </div>

        <!-- Save Info Pill right beside dynamic title -->
        <div class="border-black/10 border-[0.5px] border-solid content-stretch flex h-[20px] items-center justify-center px-[7px] rounded-[10px] shrink-0 bg-[#ececec]/20 backdrop-blur-[4px] shadow-sm">
          <p class="font-707 text-legal-micro font-light text-black whitespace-nowrap">
            {{ saveStatusText }}
          </p>
        </div>
      </div>
    </div>

    <!-- Right: Test Your Form, Ask for Review & Avatar proportioned for 48px Header -->
    <div class="content-stretch flex gap-[10px] items-center shrink-0">
      <!-- Preview / Editor Mode Toggle Button -->
      <button 
        @click="editorStore.togglePreviewMode()"
        class="apple-glass-btn text-black content-stretch flex items-center justify-center gap-1.5 overflow-clip px-[14px] h-[32px] rounded-[8px] apple-press cursor-pointer transition-all"
        :title="editorStore.isPreviewMode ? 'Switch back to Editor Mode' : 'Live iPhone 17 Pro Preview'"
      >
        <Edit3 v-if="editorStore.isPreviewMode" class="w-3.5 h-3.5 text-black" />
        <Eye v-else class="w-3.5 h-3.5 text-black" />
        <span class="font-707 font-medium text-[13px] whitespace-nowrap text-black">
          {{ editorStore.isPreviewMode ? 'Editor Mode' : 'Preview' }}
        </span>
      </button>

      <!-- Submit for Review / Save Project CTA Button -->
      <button 
        @click="handlePrimaryCtaClick"
        class="apple-glass-btn-dark content-stretch flex items-center justify-center overflow-clip px-[14px] h-[32px] rounded-[8px] apple-press cursor-pointer"
        :title="authStore.isSuperAdmin ? 'Save Project & Changes' : 'Submit for UI/UX Team Review'"
      >
        <span class="font-707 font-medium text-white text-[13px] whitespace-nowrap">
          {{ primaryCtaLabel }}
        </span>
      </button>

      <!-- Profile Avatar Container with Anchored UserProfileModal -->
      <div class="relative">
        <button 
          @click="showUserProfileModal = !showUserProfileModal"
          class="size-[30px] rounded-full border border-black/10 hover:border-black/30 shrink-0 bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors duration-200 cursor-pointer shadow-xs apple-press"
          title="User Profile"
        >
          <User class="w-3.5 h-3.5 text-black" />
        </button>

        <!-- User Profile Modal (Figma Node 212:8894) anchored directly to avatar -->
        <UserProfileModal
          :is-open="showUserProfileModal"
          @close="showUserProfileModal = false"
          @open-analytics="handleAnalytics"
          @open-settings="handleSettings"
          @sign-out="handleSignOut"
        />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useEditorStore } from '../../stores/editorStore.ts';
import { useAuthStore } from '../../stores/authStore.ts';
import { FIGMA_ASSETS } from '../../constants/figmaAssets.ts';
import { Eye, Edit3, User } from 'lucide-vue-next';
import UserProfileModal from '../modals/UserProfileModal.vue';
import { logout } from '../../services/apiClient.ts';

const router = useRouter();
const editorStore = useEditorStore();
const authStore = useAuthStore();
const logoFailed = ref(false);
const showUserProfileModal = ref(false);
const nowTicker = ref(Date.now());

const primaryCtaLabel = computed(() => {
  if (authStore.isSuperAdmin) {
    if (editorStore.currentPage?.status === 'pending_review') {
      return 'Approve & Save';
    }
    return 'Save Project';
  }
  return 'Submit for Review';
});

function handlePrimaryCtaClick() {
  if (authStore.isSuperAdmin) {
    if (editorStore.currentPage?.status === 'pending_review') {
      editorStore.setPageStatus('approved', authStore.currentUser?.name || 'Alvin Decorous (Superadmin)');
      editorStore.saveCurrentProject();
      editorStore.showToast('Project approved & changes saved by Superadmin.');
    } else {
      editorStore.saveCurrentProject();
      editorStore.showToast('Project saved successfully.');
    }
  } else {
    editorStore.isReviewModalOpen = true;
  }
}

async function handleReturnHome() {
  await editorStore.flushPendingSave();
}

async function navigateHome() {
  await editorStore.flushPendingSave();
  router.push('/');
}

let tickerTimer: any = null;
onMounted(() => {
  tickerTimer = setInterval(() => {
    nowTicker.value = Date.now();
  }, 10000);
});

onUnmounted(() => {
  if (tickerTimer) clearInterval(tickerTimer);
  editorStore.flushPendingSave();
});

function handleLogoError() {
  logoFailed.value = true;
}

function handleAnalytics() {
  editorStore.showToast('707 Analytics: Campaign conversions, RSVP rate, and traffic analytics dashboard is up to date.');
}

function handleSettings() {
  editorStore.activeTab = 'settings';
  editorStore.isReviewModalOpen = true;
}

async function handleSignOut() {
  await logout();
  authStore.signOut();
  showUserProfileModal.value = false;
  router.push('/');
}

const saveStatusText = computed(() => {
  if (editorStore.isSaving) {
    return 'Saving...';
  }
  // Never claim the work is saved when it never reached the server — the link
  // to this host drops requests often enough that a silent failure would let
  // someone keep editing on top of changes that were already lost.
  if (editorStore.saveFailed) {
    return 'Not saved — reconnecting';
  }
  const lastSaved = editorStore.lastSavedAt ? editorStore.lastSavedAt.getTime() : nowTicker.value;
  const diffSec = Math.max(0, Math.floor((nowTicker.value - lastSaved) / 1000));
  if (diffSec < 15) {
    return 'Saved just now';
  }
  if (diffSec < 60) {
    return `Saved ${diffSec}s ago`;
  }
  const mins = Math.floor(diffSec / 60);
  return `Saved ${mins} min${mins === 1 ? '' : 's'} ago`;
});
</script>
