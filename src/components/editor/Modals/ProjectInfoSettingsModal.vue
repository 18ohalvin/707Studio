<template>
  <Transition name="apple-dock-fade">
    <div 
      v-if="isOpen" 
      class="fixed inset-0 z-50 apple-frost-backdrop flex items-center justify-center p-4 transition-all animate-apple-fade select-none"
      @click.self="emit('close')"
    >
      <div class="apple-frost rounded-[16px] border border-white/60 p-6 w-full max-w-[480px] shadow-[0px_20px_50px_rgba(0,0,0,0.15),0_1px_3px_rgba(0,0,0,0.06)] flex flex-col gap-4 animate-apple-pop">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="size-8 rounded-full bg-black text-white flex items-center justify-center shadow-sm">
              <Sliders class="w-4 h-4" />
            </div>
            <div>
              <h3 class="font-707 font-medium text-[15px] text-black">Project Settings</h3>
              <p class="font-707 text-[11px] text-neutral-500">Artwork & Publishing Details</p>
            </div>
          </div>
          <button 
            type="button"
            @click="emit('close')" 
            class="text-neutral-400 hover:text-black text-xl font-bold cursor-pointer"
          >
            ×
          </button>
        </div>

        <form @submit.prevent="handleSave" class="flex flex-col gap-4">
          <!-- 1. Project Title -->
          <div class="flex flex-col gap-1.5">
            <label class="font-707 text-[11px] font-semibold text-neutral-700 tracking-wider uppercase">
              Project Title
            </label>
            <input 
              v-model="title"
              type="text"
              required
              placeholder="e.g. atmos Exclusive RSVP Activation"
              class="w-full h-[40px] px-3.5 rounded-[8px] bg-black/[0.03] border border-black/15 text-[13px] font-707 text-black focus:border-black focus:bg-white outline-none transition-all placeholder:text-neutral-400"
            />
          </div>

          <!-- 2. Event Activation Mode Presets -->
          <div class="flex flex-col gap-1.5 w-full">
            <label class="font-707 text-[11px] font-semibold text-neutral-700 tracking-wider uppercase">
              Event Activation Mode
            </label>
            
            <div class="grid grid-cols-3 gap-1.5 w-full">
              <button
                type="button"
                @click="eventType = 'daily_rolling'"
                class="h-[44px] rounded-[8px] border text-[12px] font-707 flex flex-col items-center justify-center cursor-pointer transition-all px-1"
                :class="eventType === 'daily_rolling' 
                  ? 'bg-black text-white border-black font-medium shadow-2xs' 
                  : 'bg-white/70 hover:bg-white text-neutral-700 border-neutral-300 hover:border-black/50'"
              >
                <span class="flex items-center gap-1.5 leading-none">
                  <Repeat class="w-3.5 h-3.5 shrink-0" :class="eventType === 'daily_rolling' ? 'text-white' : 'text-neutral-500'" />
                  <span>Daily Rolling</span>
                </span>
                <span class="text-[9.5px] mt-0.5 opacity-75 font-normal">Stanley Style</span>
              </button>
              <button
                type="button"
                @click="eventType = 'single'"
                class="h-[44px] rounded-[8px] border text-[12px] font-707 flex flex-col items-center justify-center cursor-pointer transition-all px-1"
                :class="eventType === 'single' 
                  ? 'bg-black text-white border-black font-medium shadow-2xs' 
                  : 'bg-white/70 hover:bg-white text-neutral-700 border-neutral-300 hover:border-black/50'"
              >
                <span class="flex items-center gap-1.5 leading-none">
                  <Calendar class="w-3.5 h-3.5 shrink-0" :class="eventType === 'single' ? 'text-white' : 'text-neutral-500'" />
                  <span>Single Day</span>
                </span>
                <span class="text-[9.5px] mt-0.5 opacity-75 font-normal">1 Specific Date</span>
              </button>
              <button
                type="button"
                @click="eventType = 'multiday'"
                class="h-[44px] rounded-[8px] border text-[12px] font-707 flex flex-col items-center justify-center cursor-pointer transition-all px-1"
                :class="eventType === 'multiday' 
                  ? 'bg-black text-white border-black font-medium shadow-2xs' 
                  : 'bg-white/70 hover:bg-white text-neutral-700 border-neutral-300 hover:border-black/50'"
              >
                <span class="flex items-center gap-1.5 leading-none">
                  <CalendarRange class="w-3.5 h-3.5 shrink-0" :class="eventType === 'multiday' ? 'text-white' : 'text-neutral-500'" />
                  <span>Multi-Day</span>
                </span>
                <span class="text-[9.5px] mt-0.5 opacity-75 font-normal">Form Picker</span>
              </button>
            </div>

            <!-- Daily Rolling Date Range Inputs -->
            <div v-if="eventType === 'daily_rolling'" class="flex flex-col gap-1.5 w-full pt-1 animate-apple-pop">
              <div class="grid grid-cols-2 gap-2 w-full">
                <div class="border border-black/15 focus-within:border-black rounded-[8px] h-[40px] px-[12px] py-[6px] flex items-center gap-[6px] bg-black/[0.03] focus-within:bg-white transition-all">
                  <Calendar class="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <input 
                    v-model="startDate"
                    type="text"
                    placeholder="Start (16 Oct 2026)"
                    class="flex-1 min-w-0 bg-transparent font-707 text-[12px] text-black focus:outline-none placeholder:text-neutral-400 p-0 m-0 border-none"
                  />
                </div>
                <div class="border border-black/15 focus-within:border-black rounded-[8px] h-[40px] px-[12px] py-[6px] flex items-center gap-[6px] bg-black/[0.03] focus-within:bg-white transition-all">
                  <Calendar class="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <input 
                    v-model="endDate"
                    type="text"
                    placeholder="End (1 Nov 2026)"
                    class="flex-1 min-w-0 bg-transparent font-707 text-[12px] text-black focus:outline-none placeholder:text-neutral-400 p-0 m-0 border-none"
                  />
                </div>
              </div>
              <p class="font-707 text-[11px] text-neutral-500 leading-tight px-1">
                Campaign runs across the period. Passes automatically stamp <strong>today's date</strong> in real time with <strong>daily queue resets</strong> and a date-organized database.
              </p>
            </div>

            <!-- Single-Day Date Input -->
            <div v-else-if="eventType === 'single'" class="flex flex-col gap-1 w-full pt-1 animate-apple-pop">
              <div class="border border-black/15 focus-within:border-black rounded-[8px] h-[40px] px-[14px] py-[6px] flex items-center gap-[10px] bg-black/[0.03] focus-within:bg-white transition-all w-full">
                <Calendar class="w-4 h-4 text-neutral-400 shrink-0" />
                <input 
                  v-model="eventDate"
                  type="text"
                  placeholder="Event Date (e.g. 16 October 2026)"
                  class="flex-1 min-w-0 bg-transparent font-707 text-[13px] text-black focus:outline-none placeholder:text-neutral-400 p-0 m-0 border-none"
                />
              </div>
              <p class="font-707 text-[11px] text-neutral-500 leading-tight px-1">
                Auto-populates "ACCESS VALID FOR" on guest passes & PDF tickets without requiring arrival date form selection.
              </p>
            </div>

            <div v-else class="w-full pt-0.5 animate-apple-pop">
              <p class="font-707 text-[11px] text-neutral-500 leading-tight px-1">
                Guests will choose from session/arrival dates you configure in form widgets or modals.
              </p>
            </div>
          </div>

          <!-- 2b. Back Navigation Guard -->
          <div class="flex flex-col gap-1.5 w-full">
            <label class="font-707 text-[11px] font-semibold text-neutral-700 tracking-wider uppercase">
              Back Navigation Guard
            </label>
            <div class="grid grid-cols-3 gap-1.5 w-full">
              <button
                type="button"
                @click="backNavigationMode = 'allow'"
                class="h-[42px] rounded-[8px] border text-[12px] font-707 flex flex-col items-center justify-center cursor-pointer transition-all px-1"
                :class="backNavigationMode === 'allow'
                  ? 'bg-black text-white border-black font-medium shadow-2xs'
                  : 'bg-white/70 hover:bg-white text-neutral-700 border-neutral-300 hover:border-black/50'"
              >
                <span class="leading-none">Allow Back</span>
                <span class="text-[9.5px] mt-0.5 opacity-75 font-normal">Standard flow</span>
              </button>
              <button
                type="button"
                @click="backNavigationMode = 'block'"
                class="h-[42px] rounded-[8px] border text-[12px] font-707 flex flex-col items-center justify-center cursor-pointer transition-all px-1"
                :class="backNavigationMode === 'block'
                  ? 'bg-black text-white border-black font-medium shadow-2xs'
                  : 'bg-white/70 hover:bg-white text-neutral-700 border-neutral-300 hover:border-black/50'"
              >
                <span class="leading-none">Block Back</span>
                <span class="text-[9.5px] mt-0.5 opacity-75 font-normal">Forward-only</span>
              </button>
              <button
                type="button"
                @click="backNavigationMode = 'restart'"
                class="h-[42px] rounded-[8px] border text-[12px] font-707 flex flex-col items-center justify-center cursor-pointer transition-all px-1"
                :class="backNavigationMode === 'restart'
                  ? 'bg-black text-white border-black font-medium shadow-2xs'
                  : 'bg-white/70 hover:bg-white text-neutral-700 border-neutral-300 hover:border-black/50'"
              >
                <span class="leading-none">Restart Flow</span>
                <span class="text-[9.5px] mt-0.5 opacity-75 font-normal">Reset to Page 1</span>
              </button>
            </div>
            <p class="font-707 text-[11px] text-neutral-500 leading-tight px-1">
              <template v-if="backNavigationMode === 'block'">
                Prevents guests from swiping or tapping Back to previous steps. Back is always locked after submission.
              </template>
              <template v-else-if="backNavigationMode === 'restart'">
                Pressing Back clears entered answers and restarts the guest from Page 1. Back is always locked after submission.
              </template>
              <template v-else>
                Guests can step back before submitting. Back is automatically locked once registration is submitted.
              </template>
            </p>
          </div>

          <!-- 3. Brand & Project Slug -->
          <div class="flex flex-col gap-2">
            <!-- Brand Slug Transfer (shown when account has access to multiple brands) -->
            <div v-if="canChangeBrand" class="flex flex-col gap-1.5">
              <label class="font-707 text-[11px] font-semibold text-neutral-700 tracking-wider uppercase">
                Brand Workspace
              </label>
              <select
                v-model="selectedBrandSlug"
                class="w-full h-[40px] px-3 rounded-[8px] bg-black/[0.03] border border-black/15 text-[13px] font-707 text-black focus:border-black focus:bg-white outline-none transition-all cursor-pointer"
              >
                <option
                  v-for="b in availableBrandOptions"
                  :key="b.slug"
                  :value="b.slug"
                >
                  {{ b.name }} (/{{ b.slug }})
                </option>
              </select>
              <p
                v-if="projectIsLive && selectedBrandSlug !== initialBrandSlug"
                class="font-707 text-[11px] text-amber-800 bg-amber-50 border border-amber-200/80 rounded-[6px] px-2.5 py-1.5 leading-snug"
              >
                Moving a live campaign changes its public URL from <strong>/{{ initialBrandSlug }}/{{ slug }}</strong> to <strong>/{{ selectedBrandSlug }}/{{ slug }}</strong>. Existing guest submissions will move with it, but previously shared links will need to be updated.
              </p>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="font-707 text-[11px] font-semibold text-neutral-700 tracking-wider uppercase">
                Custom URL Slug
              </label>
              <div class="flex items-center w-full h-[40px] rounded-[8px] bg-black/[0.03] border border-black/15 px-3 focus-within:border-black focus-within:bg-white transition-all">
                <span class="text-neutral-400 font-mono text-[12px] shrink-0">/{{ brandSlug }}/</span>
                <input 
                  v-model="slug"
                  type="text"
                  required
                  placeholder="project-slug"
                  class="w-full h-full bg-transparent border-none outline-none text-[13px] font-707 text-black font-mono px-1 placeholder:text-neutral-400"
                  @input="handleSlugInput"
                />
              </div>
            </div>
            <!-- The real public link, copyable once the campaign is live -->
            <div class="flex items-center gap-2 w-full rounded-[8px] bg-black/[0.04] border border-black/5 px-3 py-2">
              <div class="flex flex-col min-w-0 flex-1">
                <span class="font-707 text-[10.5px] uppercase tracking-wider" :class="projectIsLive ? 'text-moss-700' : 'text-neutral-500'">
                  {{ projectIsLive ? 'Live link' : 'Link — works once published' }}
                </span>
                <span class="font-707 text-[12px] text-black truncate font-mono" :title="publicLink">{{ publicLink }}</span>
              </div>
              <button
                type="button"
                :disabled="!projectIsLive"
                @click="copy('settings', publicLink)"
                class="shrink-0 h-[30px] px-3 rounded-[7px] text-[12px] font-707 font-medium flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed transition-colors"
                :class="projectIsLive ? 'bg-black text-white hover:bg-neutral-800' : 'bg-black/5 text-neutral-400'"
                :title="projectIsLive ? 'Copy the public link' : 'Only published campaigns have a public link'"
              >
                <Check v-if="copiedKey === 'settings'" class="w-3.5 h-3.5" />
                <LinkIcon v-else class="w-3.5 h-3.5" />
                {{ copiedKey === 'settings' ? 'Copied' : 'Copy' }}
              </button>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-2.5 mt-2">
            <button 
              type="button"
              @click="emit('close')"
              class="px-4 h-[36px] rounded-[8px] border border-black/15 text-neutral-600 hover:text-black font-707 text-[13px] font-medium cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              class="apple-glass-btn-dark bg-black text-white px-5 h-[36px] rounded-[8px] font-707 text-[13px] font-medium apple-press cursor-pointer hover:bg-neutral-800 transition-all shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Sliders, Check, Link as LinkIcon, Repeat, Calendar, CalendarRange } from 'lucide-vue-next';
import { isProjectLive, liveLinkFor, absoluteLink, campaignPath, useCopiedFlag } from '../../../services/campaignLink.ts';
import { useEditorStore } from '../../../stores/editorStore.ts';
import { useBrandStore } from '../../../stores/brandStore.ts';
import { useAuthStore } from '../../../stores/authStore.ts';
import type { BackNavigationMode, EventConfig, EventType } from '../../../types/editor.ts';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const editorStore = useEditorStore();
const brandStore = useBrandStore();
const authStore = useAuthStore();
let router: ReturnType<typeof useRouter> | null = null;
let route: ReturnType<typeof useRoute> | null = null;
try {
  router = useRouter();
  route = useRoute();
} catch {
  // Mounted outside a router in unit tests
}

const title = ref('');
const slug = ref('');
const selectedBrandSlug = ref('');
const initialBrandSlug = ref('');
const eventType = ref<EventType>('daily_rolling');
const eventDate = ref('16 October 2026');
const startDate = ref('16 October 2026');
const endDate = ref('1 November 2026');
const backNavigationMode = ref<BackNavigationMode>('allow');

const currentProject = computed(() => editorStore.projects.find(p => p.id === editorStore.currentProjectId) || null);
const projectIsLive = computed(() => isProjectLive(currentProject.value));

const cleanSlugStr = (raw: string) => String(raw || '').toLowerCase().replace(/[^a-z0-9_-]/g, '');

const availableBrandOptions = computed(() => {
  const assigned = (authStore.currentUser?.assignedBrands || []).map(cleanSlugStr).filter(Boolean);
  const unrestricted = authStore.isSuperAdmin || assigned.includes('all');
  const map = new Map<string, { id?: string; name: string; slug: string }>();

  for (const b of brandStore.brands || []) {
    const s = cleanSlugStr(b.slug || b.name);
    if (!s) continue;
    if (!unrestricted && !assigned.includes(s)) continue;
    if (!map.has(s)) map.set(s, { id: b.id, name: b.name || s, slug: s });
  }

  for (const s of assigned) {
    if (s !== 'all' && !map.has(s)) {
      map.set(s, { name: s.toUpperCase(), slug: s });
    }
  }

  const currentSlug = cleanSlugStr(
    currentProject.value?.brand_slug || editorStore.pages[0]?.brand_slug || editorStore.currentPage?.brand_slug || ''
  );
  if (currentSlug && !map.has(currentSlug)) {
    map.set(currentSlug, { name: currentSlug === 'general' ? 'General' : currentSlug, slug: currentSlug });
  }

  return Array.from(map.values());
});

const canChangeBrand = computed(() => availableBrandOptions.value.length > 1);

const brandSlug = computed(() => {
  if (selectedBrandSlug.value) return cleanSlugStr(selectedBrandSlug.value) || 'events';
  const userBrand = authStore.currentUser?.assignedBrands?.[0];
  let raw = '';
  if (!authStore.isSuperAdmin && userBrand && userBrand !== 'all') {
    raw = userBrand;
  } else if (currentProject.value?.brand_slug) {
    raw = currentProject.value.brand_slug;
  } else if (editorStore.currentPage?.brand_slug) {
    raw = editorStore.currentPage.brand_slug;
  } else if (brandStore.activeBrand?.slug) {
    raw = brandStore.activeBrand.slug;
  } else {
    raw = userBrand || 'events';
  }
  return cleanSlugStr(raw) || 'events';
});

// Live: the address visitors use today (reflects pending brand/slug edits).
const publicLink = computed(() => {
  const activeBrandSlug = brandSlug.value;
  const activePageSlug = slug.value || currentProject.value?.slug || 'your-slug';
  if (projectIsLive.value && currentProject.value && activeBrandSlug === cleanSlugStr(currentProject.value.brand_slug) && activePageSlug === currentProject.value.slug) {
    return liveLinkFor(currentProject.value);
  }
  return absoluteLink(campaignPath(activeBrandSlug, activePageSlug));
});
const { copiedKey, copy } = useCopiedFlag();

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      title.value = editorStore.projectTitle;
      const proj = editorStore.projects.find(p => p.id === editorStore.currentProjectId);
      slug.value = proj?.slug || editorStore.pages[0]?.slug || editorStore.currentPage?.slug || '';
      const resolvedCurrentBrand = cleanSlugStr(
        proj?.brand_slug || editorStore.pages[0]?.brand_slug || editorStore.currentPage?.brand_slug || brandStore.activeBrand?.slug || 'general'
      ) || 'general';
      selectedBrandSlug.value = resolvedCurrentBrand;
      initialBrandSlug.value = resolvedCurrentBrand;

      const cfg: EventConfig = proj?.event_config || editorStore.currentPage?.page_settings?.eventConfig || {
        eventType: 'daily_rolling',
        eventDate: '16 October 2026',
        startDate: '16 October 2026',
        endDate: '1 November 2026'
      };

      eventType.value = cfg.eventType || 'daily_rolling';
      eventDate.value = cfg.eventDate || '16 October 2026';
      startDate.value = cfg.startDate || '16 October 2026';
      endDate.value = cfg.endDate || '1 November 2026';
      backNavigationMode.value =
        editorStore.pages[0]?.page_settings?.backNavigationMode ||
        editorStore.currentPage?.page_settings?.backNavigationMode ||
        proj?.page_settings?.backNavigationMode ||
        'allow';
    }
  },
  { immediate: true }
);

function handleSlugInput(e: Event) {
  const target = e.target as HTMLInputElement;
  slug.value = target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '');
}

function handleSave() {
  if (!title.value.trim()) return;

  const cleanSlug = slug.value.trim() || 'drop';
  const cleanBrand = cleanSlugStr(selectedBrandSlug.value || brandSlug.value) || 'atmos';
  const matchedBrand = availableBrandOptions.value.find(b => b.slug === cleanBrand);
  const brandChanged = Boolean(initialBrandSlug.value && cleanBrand !== initialBrandSlug.value);
  editorStore.projectTitle = title.value.trim();

  const eventConfig: EventConfig = {
    eventType: eventType.value,
    eventDate: eventType.value === 'single' ? eventDate.value.trim() : (eventType.value === 'daily_rolling' ? startDate.value.trim() : ''),
    startDate: startDate.value.trim(),
    endDate: endDate.value.trim(),
    dailyQueueReset: eventType.value === 'daily_rolling'
  };

  // Always keep master landing page slug aligned with project slug and sync brand + eventConfig + backNavigationMode
  if (editorStore.pages[0]) {
    editorStore.pages[0].slug = cleanSlug;
    editorStore.pages[0].brand_slug = cleanBrand;
    if (matchedBrand?.id) editorStore.pages[0].brand_id = matchedBrand.id;
    if (editorStore.pages[0].page_settings) {
      editorStore.pages[0].page_settings.seoTitle = title.value.trim();
      editorStore.pages[0].page_settings.eventConfig = eventConfig;
      editorStore.pages[0].page_settings.backNavigationMode = backNavigationMode.value;
    }
  }

  // Sync brand_slug, eventConfig & backNavigationMode across all pages in the project
  editorStore.pages.forEach(p => {
    p.brand_slug = cleanBrand;
    if (matchedBrand?.id) p.brand_id = matchedBrand.id;
    if (p.page_settings) {
      p.page_settings.eventConfig = eventConfig;
      p.page_settings.backNavigationMode = backNavigationMode.value;
    }
  });

  // Update projects list entry
  const proj = editorStore.projects.find(p => p.id === editorStore.currentProjectId);
  if (proj) {
    proj.title = title.value.trim();
    proj.slug = cleanSlug;
    proj.brand_slug = cleanBrand;
    if (matchedBrand?.id) proj.brand_id = matchedBrand.id;
    proj.event_config = eventConfig;
    if (proj.page_settings) {
      proj.page_settings.backNavigationMode = backNavigationMode.value;
    }
    proj.updated_at = new Date().toISOString();
  }

  editorStore.saveCurrentProject();
  if (brandChanged && router && route?.name === 'EditorProject' && editorStore.currentProjectId) {
    router.replace(`/editor/${encodeURIComponent(cleanBrand)}/${encodeURIComponent(editorStore.currentProjectId)}`);
  }
  editorStore.showToast(
    brandChanged
      ? `Campaign moved to /${cleanBrand}/${cleanSlug} and saved.`
      : 'Project settings & event activation mode saved.'
  );
  emit('close');
}
</script>
