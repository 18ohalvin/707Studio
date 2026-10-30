<template>
  <header class="absolute top-0 left-0 right-0 z-40 isolate content-stretch flex items-center justify-between px-[20px] h-[48px] w-full select-none transition-all">
    <!-- The header's frost lives on this layer, not on <header>: a blur on the
         header itself would trap every menu inside it (profile, notifications,
         history), leaving them nothing to blur — they showed fully transparent. -->
    <div class="absolute inset-0 -z-10 pointer-events-none bg-white/20 [backdrop-filter:blur(4px)] [-webkit-backdrop-filter:blur(4px)]" aria-hidden="true" />
    <!-- Left: Normal Mode (707 Logo, Title Input, Save Status) -->
    <div v-if="!editorStore.isPreviewMode" class="content-stretch flex gap-[16px] md:gap-[20px] items-center flex-1 min-w-0 mr-4">
      <!-- 707 Official Logo from Figma (Click to return to Landing Page or Superadmin Templates) -->
      <a 
        href="/"
        @click.prevent="navigateHome" 
        class="h-[18px] relative shrink-0 flex items-center cursor-pointer hover:opacity-85 transition-opacity" 
        :title="editorStore.isTemplateMode ? 'Back to Superadmin Templates' : 'Back to Design Studio'"
      >
        <img 
          :src="FIGMA_ASSETS.logoDesignStudio" 
          alt="707 Design Studio" 
          class="h-[18px] w-auto object-contain pointer-events-none"
          @error="handleLogoError"
        />
        <!-- Fallback if localhost asset server isn't running -->
        <span v-if="logoFailed" class="font-black text-black text-xs tracking-tighter">707 DESIGN STUDIO</span>
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

        <!-- Unified Apple Glass Status Indicator Pill -->
        <div 
          class="flex h-[22px] items-center gap-1.5 px-[8px] rounded-full shrink-0 border-[0.5px] border-black/10 bg-[#ececec]/25 backdrop-blur-[4px] shadow-xs cursor-default transition-all"
          :title="`${publishBadge.title} • ${saveStatusText}`"
        >
          <!-- Dynamic Status Dot -->
          <span 
            v-if="!editorStore.isTemplateMode"
            class="size-1.5 rounded-full" 
            :class="publishBadge.dot" 
          />
          <span 
            v-else 
            class="size-1.5 rounded-full bg-purple-600 animate-pulse" 
          />

          <!-- Status Label -->
          <p class="font-707 text-legal-micro font-medium text-black whitespace-nowrap">
            {{ editorStore.isTemplateMode ? 'Template Studio' : publishBadge.label }}
          </p>

          <span class="text-neutral-300 font-light text-[10px]">·</span>

          <!-- Compact Save Status -->
          <p class="font-707 text-legal-micro font-normal text-neutral-500 whitespace-nowrap">
            {{ saveStatusText }}
          </p>
        </div>
      </div>
    </div>

    <!-- Left in Preview Mode: Replace 707 and Title with "Guest Preview" -->
    <div v-else class="flex items-center gap-2 flex-1 min-w-0 mr-4">
      <p class="font-707 font-medium text-[16px] leading-[22px] text-black tracking-tight">
        Guest Preview
      </p>
    </div>

    <!-- Right: Test Your Form, Ask for Review & Avatar proportioned for 48px Header -->
    <div class="content-stretch flex gap-[10px] items-center shrink-0">
      <!-- Review requests / publish notices (Hidden in preview mode) -->
      <NotificationsMenu v-if="!editorStore.isTemplateMode && !editorStore.isPreviewMode" />

      <!-- Build history: a plain icon, like the bell beside it (Hidden in preview mode) -->
      <div v-if="!editorStore.isTemplateMode && !editorStore.isPreviewMode" class="relative flex items-center" ref="historyRef">
        <button
          type="button"
          @click="showHistory = !showHistory"
          class="relative size-[24px] flex items-center justify-center apple-press cursor-pointer hover:opacity-75 transition-opacity border-0 outline-none bg-transparent p-0 shrink-0 text-black group"
          :class="showHistory ? 'opacity-100' : ''"
          title="Project history — every submission and published version"
          aria-label="Project history"
        >
          <History class="w-[18px] h-[18px] stroke-[1.35] transition-transform duration-200 group-hover:scale-105" />
        </button>
        <ProjectHistoryPanel v-if="showHistory" :anchor="historyRef" @close="showHistory = false" />
      </div>

      <!-- Preview / Editor Mode Toggle Button -->
      <button 
        @click="editorStore.togglePreviewMode()"
        :class="editorStore.isPreviewMode ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn text-black'"
        class="content-stretch flex items-center justify-center gap-1.5 overflow-clip px-[14px] h-[32px] rounded-[8px] apple-press cursor-pointer transition-all ml-[6px]"
        :title="editorStore.isPreviewMode ? 'Exit preview mode and return to canvas editor' : 'Test the campaign as a guest: fill in forms and pick options'"
      >
        <Edit3 v-if="editorStore.isPreviewMode" class="w-3.5 h-3.5 text-white" />
        <Eye v-else class="w-3.5 h-3.5 text-black" />
        <span class="font-707 font-medium text-[13px] whitespace-nowrap" :class="editorStore.isPreviewMode ? 'text-white' : 'text-black'">
          {{ editorStore.isPreviewMode ? 'Exit Preview' : 'Preview' }}
        </span>
      </button>

      <!-- Superadmin: send a pending submission back (Hidden in preview mode) -->
      <button
        v-if="authStore.isSuperAdmin && isPending && !editorStore.isPreviewMode"
        type="button"
        :disabled="isTransitioning"
        @click="handleDecline"
        class="apple-glass-btn text-black flex items-center justify-center px-[12px] h-[32px] rounded-[8px] apple-press cursor-pointer disabled:opacity-50"
        title="Send back to the brand with a note"
      >
        <span class="font-707 font-medium text-[13px] whitespace-nowrap">Request Changes</span>
      </button>

      <!-- Primary CTA: depends on whether the project is live and what changed (Hidden in preview mode) -->
      <button 
        v-if="!editorStore.isPreviewMode"
        @click="handlePrimaryCtaClick"
        :disabled="primaryCta.disabled || isTransitioning"
        class="content-stretch flex items-center justify-center gap-1.5 overflow-clip px-[14px] h-[32px] rounded-[8px] apple-press"
        :class="primaryCta.disabled ? 'apple-glass-btn cursor-default' : (primaryCta.state === 'live' ? 'apple-glass-btn hover:border-black/30 cursor-pointer shadow-xs' : 'apple-glass-btn-dark cursor-pointer')"
        :title="primaryCta.title"
      >
        <Check v-if="primaryCta.state === 'live'" class="w-3.5 h-3.5 text-emerald-600" />
        <span class="font-707 font-medium text-[13px] whitespace-nowrap" :class="primaryCta.disabled ? 'text-neutral-600' : (primaryCta.state === 'live' ? 'text-black font-semibold' : 'text-white')">
          {{ isTransitioning ? 'Working…' : primaryCta.label }}
        </span>
        <Copy v-if="primaryCta.state === 'live'" class="w-3 h-3 text-neutral-400 ml-0.5" />
      </button>

      <!-- Profile Avatar Container with Anchored UserProfileModal (Hidden in preview mode) -->
      <div v-if="!editorStore.isPreviewMode" class="relative">
        <button 
          @click="showUserProfileModal = !showUserProfileModal"
          class="relative size-[28px] rounded-full border-[0.5px] border-black/10 hover:border-black/30 shrink-0 bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors duration-200 cursor-pointer shadow-xs apple-press"
          title="User Profile"
        >
          <!-- Monogram avatar when authenticated, 14px User icon when guest -->
          <div 
            v-if="authStore.isAuthenticated" 
            class="relative size-full rounded-full bg-black text-white flex items-center justify-center font-707 text-[10.5px] font-semibold tracking-tight select-none"
          >
            {{ userInitials }}
            <span class="absolute -bottom-0.5 -right-0.5 size-[6px] rounded-full bg-emerald-500 border border-white" />
          </div>
          <User v-else class="w-3.5 h-3.5 text-black stroke-[1.5]" />
        </button>

        <!-- User Profile Modal (Figma Node 212:8894) anchored directly to avatar -->
        <UserProfileModal
          :is-open="showUserProfileModal"
          @close="showUserProfileModal = false"
          @open-analytics="handleAnalytics"
          @open-settings="handleSettings"
          @open-projects="handleOpenProjects"
          @open-whats-new="handleOpenWhatsNew"
          @sign-out="handleSignOut"
        />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { glassConfirm, glassPrompt } from '../../services/glassDialog.ts';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useEditorStore } from '../../stores/editorStore.ts';
import { useAuthStore } from '../../stores/authStore.ts';
import { useBrandStore } from '../../stores/brandStore.ts';
import { FIGMA_ASSETS } from '../../constants/figmaAssets.ts';
import { Eye, Edit3, User, History, Check, Copy } from 'lucide-vue-next';
import ProjectHistoryPanel from './ProjectHistoryPanel.vue';
import NotificationsMenu from '../common/NotificationsMenu.vue';
import UserProfileModal from '../modals/UserProfileModal.vue';
import { logout } from '../../services/apiClient.ts';

const router = useRouter();
const editorStore = useEditorStore();
const authStore = useAuthStore();
const brandStore = useBrandStore();
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
  if (editorStore.isTemplateMode) {
    return {
      state: 'save_template',
      label: 'Save Template',
      disabled: false,
      title: 'Save all edits to this master template preset'
    };
  }
  if (authStore.isSuperAdmin) {
    if (!isLive.value) return { state: 'publish', label: 'Approve & Publish', disabled: false, title: 'Publish this campaign — visitors will see it right away' };
    if (hasChanges.value) return { state: 'publish', label: `Publish Update${liveVersion.value ? ` (v${liveVersion.value + 1})` : ''}`, disabled: false, title: 'Replace the live version with what is in the editor' };
    return { state: 'live', label: 'Live', disabled: false, title: 'Click to copy live campaign link' };
  }
  if (!isLive.value) {
    return isPending.value
      ? { state: 'pending', label: 'In Review', disabled: true, title: 'The superadmin has been notified. Edits you keep making are included in the review.' }
      : { state: 'submit', label: 'Submit for Review', disabled: false, title: 'Send to the UI/UX team to publish' };
  }
  if (isPending.value) return { state: 'pending', label: 'Update in Review', disabled: true, title: 'The superadmin has been notified. Edits you keep making are included in the review.' };
  if (hasChanges.value) return { state: 'submit', label: 'Submit Update', disabled: false, title: 'Ask the UI/UX team to publish your changes' };
  return { state: 'live', label: 'Live', disabled: false, title: 'Click to copy live campaign link' };
});

const isTransitioning = ref(false);
const showHistory = ref(false);
const historyRef = ref<HTMLElement | null>(null);

async function handlePrimaryCtaClick() {
  if (primaryCta.value.state === 'live') {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const brand = (project.value?.brand_slug || 'brand').toLowerCase();
    const slug = project.value?.slug || '';
    const fullUrl = `${origin}/${brand}/${slug}`;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(fullUrl);
      }
      editorStore.showToast('Live link copied to clipboard!');
    } catch {
      editorStore.showToast(`Live link: ${fullUrl}`);
    }
    return;
  }
  if (editorStore.isTemplateMode) {
    isTransitioning.value = true;
    try {
      await editorStore.flushPendingSave();
      editorStore.showToast('Master template saved successfully.');
    } catch (err: any) {
      editorStore.showToast(`Failed to save template: ${err?.message || 'network error'}`);
    } finally {
      isTransitioning.value = false;
    }
    return;
  }
  if (primaryCta.value.disabled || !editorStore.currentProjectId) return;
  if (primaryCta.value.state === 'submit') {
    editorStore.isReviewModalOpen = true;
    return;
  }
  if (primaryCta.value.state === 'publish') {
    const question = isLive.value
      ? 'Visitors will see these changes immediately.'
      : 'The campaign becomes public immediately.';
    if (!(await glassConfirm({ title: isLive.value ? 'Publish update?' : 'Approve & publish?', message: question, confirmLabel: 'Publish' }))) return;
    isTransitioning.value = true;
    const res = await editorStore.transitionProject(editorStore.currentProjectId, 'publish');
    isTransitioning.value = false;
    editorStore.showToast(res.ok ? `Published — live v${liveVersion.value}.` : `Could not publish: ${res.error}`);
  }
}

async function handleDecline() {
  const note = await glassPrompt({ title: 'Request changes', message: 'Tell the brand what to change. They get this note with the request.', placeholder: 'e.g. Use the high-res logo and fix the venue time', confirmLabel: 'Send back' });
  if (note === null) return;
  isTransitioning.value = true;
  const res = await editorStore.transitionProject(editorStore.currentProjectId, 'decline', note);
  isTransitioning.value = false;
  editorStore.showToast(res.ok ? 'Sent back to the brand.' : `Could not send back: ${res.error}`);
}


async function handleReturnHome() {
  await editorStore.flushPendingSave();
}

async function navigateHome() {
  await editorStore.flushPendingSave();
  if (editorStore.isTemplateMode) {
    editorStore.exitTemplateMode();
    router.push('/settings?tab=templates');
  } else {
    router.push('/');
  }
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

const userInitials = computed(() => {
  if (authStore.isSuperAdmin) return 'SA';
  const name = authStore.currentUser?.name || brandStore.activeBrand?.name || '';
  if (!name) return '707';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
});

async function handleOpenProjects() {
  showUserProfileModal.value = false;
  await editorStore.flushPendingSave();
  router.push('/?projects=1');
}

async function handleOpenWhatsNew() {
  showUserProfileModal.value = false;
  router.push('/?whatsnew=1');
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
