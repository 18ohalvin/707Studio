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

        <!-- Publish state: what visitors see vs what is being edited -->
        <div
          class="flex h-[20px] items-center gap-1.5 px-[7px] rounded-[10px] shrink-0 border-[0.5px] border-solid"
          :class="publishBadge.class"
          :title="publishBadge.title"
        >
          <span class="size-1.5 rounded-full" :class="publishBadge.dot" />
          <p class="font-707 text-legal-micro whitespace-nowrap">{{ publishBadge.label }}</p>
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

      <!-- Review requests / publish notices -->
      <NotificationsMenu />

      <!-- Build history -->
      <div class="relative" ref="historyRef">
        <button
          type="button"
          @click="showHistory = !showHistory"
          class="apple-glass-btn text-black flex items-center justify-center gap-1.5 px-[12px] h-[32px] rounded-[8px] apple-press cursor-pointer"
          title="Project history — every submission and published version"
        >
          <History class="w-3.5 h-3.5" />
          <span class="font-707 font-medium text-[13px] whitespace-nowrap hidden lg:inline">History</span>
        </button>
        <ProjectHistoryPanel v-if="showHistory" @close="showHistory = false" />
      </div>

      <!-- Superadmin: send a pending submission back -->
      <button
        v-if="authStore.isSuperAdmin && isPending"
        type="button"
        :disabled="isTransitioning"
        @click="handleDecline"
        class="apple-glass-btn text-black flex items-center justify-center px-[12px] h-[32px] rounded-[8px] apple-press cursor-pointer disabled:opacity-50"
        title="Send back to the brand with a note"
      >
        <span class="font-707 font-medium text-[13px] whitespace-nowrap">Request Changes</span>
      </button>

      <!-- Primary CTA: depends on whether the project is live and what changed -->
      <button 
        @click="handlePrimaryCtaClick"
        :disabled="primaryCta.disabled || isTransitioning"
        class="content-stretch flex items-center justify-center gap-1.5 overflow-clip px-[14px] h-[32px] rounded-[8px] apple-press"
        :class="primaryCta.disabled ? 'apple-glass-btn cursor-default' : 'apple-glass-btn-dark cursor-pointer'"
        :title="primaryCta.title"
      >
        <Check v-if="primaryCta.state === 'live'" class="w-3.5 h-3.5 text-emerald-600" />
        <span class="font-707 font-medium text-[13px] whitespace-nowrap" :class="primaryCta.disabled ? 'text-neutral-600' : 'text-white'">
          {{ isTransitioning ? 'Working…' : primaryCta.label }}
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
import { Eye, Edit3, User, History, Check } from 'lucide-vue-next';
import ProjectHistoryPanel from './ProjectHistoryPanel.vue';
import NotificationsMenu from '../common/NotificationsMenu.vue';
import UserProfileModal from '../modals/UserProfileModal.vue';
import { logout } from '../../services/apiClient.ts';

const router = useRouter();
const editorStore = useEditorStore();
const authStore = useAuthStore();
const logoFailed = ref(false);
const showUserProfileModal = ref(false);
const nowTicker = ref(Date.now());

/* ---------- Publish state ---------- */
const project = computed(() => editorStore.userProjects.find(p => p.id === editorStore.currentProjectId) || null);
const isLive = computed(() => Number(project.value?.live_version || 0) > 0 || ['approved', 'published'].includes(String(project.value?.status)));
const hasChanges = computed(() => Boolean(project.value?.has_unpublished_changes));
const isPending = computed(() => Boolean(project.value?.pending_update_at) || project.value?.status === 'pending_review');
const liveVersion = computed(() => Number(project.value?.live_version || 0));

const publishBadge = computed(() => {
  if (!isLive.value) {
    return isPending.value
      ? { label: 'In review', dot: 'bg-amber-500', class: 'border-amber-300 bg-amber-50 text-amber-900', title: 'Waiting for the superadmin to publish' }
      : { label: 'Draft', dot: 'bg-neutral-400', class: 'border-black/10 bg-white/60 text-neutral-700', title: 'Not published — only you and the superadmin can open the link' };
  }
  const version = liveVersion.value ? ` v${liveVersion.value}` : '';
  if (isPending.value) {
    return { label: `Live${version} · update in review`, dot: 'bg-amber-500', class: 'border-amber-300 bg-amber-50 text-amber-900', title: 'Visitors see the live version until the update is published' };
  }
  if (hasChanges.value) {
    return { label: `Live${version} · unpublished changes`, dot: 'bg-amber-500', class: 'border-emerald-300 bg-emerald-50 text-emerald-900', title: 'Visitors still see the live version. Submit your update to publish these edits.' };
  }
  return { label: `Live${version}`, dot: 'bg-emerald-500', class: 'border-emerald-300 bg-emerald-50 text-emerald-900', title: 'Visitors see exactly what is in the editor' };
});

const primaryCta = computed(() => {
  if (authStore.isSuperAdmin) {
    if (!isLive.value) return { state: 'publish', label: 'Approve & Publish', disabled: false, title: 'Publish this campaign — visitors will see it right away' };
    if (hasChanges.value) return { state: 'publish', label: `Publish Update${liveVersion.value ? ` (v${liveVersion.value + 1})` : ''}`, disabled: false, title: 'Replace the live version with what is in the editor' };
    return { state: 'live', label: 'Live', disabled: true, title: 'Nothing to publish — the editor matches the live version' };
  }
  if (!isLive.value) {
    return isPending.value
      ? { state: 'pending', label: 'In Review', disabled: true, title: 'The superadmin has been notified. Edits you keep making are included in the review.' }
      : { state: 'submit', label: 'Submit for Review', disabled: false, title: 'Send to the UI/UX team to publish' };
  }
  if (isPending.value) return { state: 'pending', label: 'Update in Review', disabled: true, title: 'The superadmin has been notified. Edits you keep making are included in the review.' };
  if (hasChanges.value) return { state: 'submit', label: 'Submit Update', disabled: false, title: 'Ask the UI/UX team to publish your changes' };
  return { state: 'live', label: 'Live', disabled: true, title: 'Nothing to submit — the editor matches the live version' };
});

const isTransitioning = ref(false);
const showHistory = ref(false);
const historyRef = ref<HTMLElement | null>(null);

async function handlePrimaryCtaClick() {
  if (primaryCta.value.disabled || !editorStore.currentProjectId) return;
  if (primaryCta.value.state === 'submit') {
    editorStore.isReviewModalOpen = true;
    return;
  }
  if (primaryCta.value.state === 'publish') {
    const question = isLive.value
      ? 'Publish these changes? Visitors will see them immediately.'
      : 'Approve and publish this campaign? It becomes public immediately.';
    if (!confirm(question)) return;
    isTransitioning.value = true;
    const res = await editorStore.transitionProject(editorStore.currentProjectId, 'publish');
    isTransitioning.value = false;
    editorStore.showToast(res.ok ? `Published — live v${liveVersion.value}.` : `Could not publish: ${res.error}`);
  }
}

async function handleDecline() {
  const note = prompt('What should the brand change? (sent with the request)', '');
  if (note === null) return;
  isTransitioning.value = true;
  const res = await editorStore.transitionProject(editorStore.currentProjectId, 'decline', note.trim());
  isTransitioning.value = false;
  editorStore.showToast(res.ok ? 'Sent back to the brand.' : `Could not send back: ${res.error}`);
}

function handleOutsideHistoryClick(e: MouseEvent) {
  if (showHistory.value && historyRef.value && !historyRef.value.contains(e.target as Node)) showHistory.value = false;
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
  document.addEventListener('mousedown', handleOutsideHistoryClick);
  tickerTimer = setInterval(() => {
    nowTicker.value = Date.now();
  }, 10000);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleOutsideHistoryClick);
  if (tickerTimer) clearInterval(tickerTimer);
  editorStore.flushPendingSave();
});

function handleLogoError() {
  logoFailed.value = true;
}

async function handleAnalytics() {
  // Open the hub on the project being edited.
  await editorStore.flushPendingSave();
  router.push({ path: '/hub', query: editorStore.currentProjectId ? { project: editorStore.currentProjectId } : {} });
}

function handleSettings() {
  if (authStore.isSuperAdmin) {
    router.push('/settings');
  } else {
    editorStore.isProjectSettingsOpen = true;
  }
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
