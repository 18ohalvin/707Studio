<template>
  <Transition name="apple-modal-fade">
    <div 
      v-if="isOpen"
      class="fixed inset-0 z-50 apple-frost-backdrop flex items-center justify-center p-4 select-none"
      @click.self="emit('close')"
    >
      <!-- Modal Box (Figma Node 224:9590) -->
      <div 
        class="apple-frost border border-white/60 flex flex-col items-start p-[24px] rounded-[12px] shadow-[0px_20px_50px_0px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.05)] w-full max-w-[408px] apple-modal-box"
        data-node-id="224:9590"
        data-name="Setup your Project Modal"
      >
        <!-- Modal Header (Figma Node 224:9592) -->
        <div class="flex flex-col gap-[8px] items-start w-full mb-[24px]" data-node-id="224:9592" data-name="Widget Container">
          <div class="flex items-center justify-between w-full" data-node-id="224:9593" data-name="Widget Header">
            <h2 class="font-707 text-[22px] font-normal leading-[28px] text-black whitespace-nowrap" data-node-id="224:9594">
              Setup your Project
            </h2>
            <!-- Close Button (Figma Node 224:9595) -->
            <button 
              type="button"
              @click="emit('close')"
              class="size-[24px] bg-[#ededed] hover:bg-[#d9d9d9] active:bg-[#ccc] rounded-full flex items-center justify-center apple-press cursor-pointer transition-colors shrink-0 border-0 outline-none"
              title="Close"
              data-node-id="224:9595"
            >
              <X class="w-3.5 h-3.5 text-black" />
            </button>
          </div>
          <!-- Subtitle copy -->
          <p class="font-707 text-[14px] font-normal leading-[18px] text-black w-full" data-node-id="224:9597">
            Name and create a custom slug for your project
          </p>
        </div>

        <!-- Form Body (Figma Node 224:9598) -->
        <form @submit.prevent="handleCreate" class="flex flex-col w-full" data-node-id="224:9598">
          <!-- Fields Container (Figma Node 224:9599) -->
          <div class="flex flex-col gap-[16px] w-full" data-node-id="224:9599">
            <!-- Field 1: Project Name (Figma Node 224:9600) -->
            <div class="w-full">
              <input 
                v-model="campaignName"
                ref="nameInputRef"
                type="text"
                placeholder="Your Project Name"
                required
                class="border border-[#aaa] focus:border-black focus:outline-none rounded-[8px] h-[52px] px-[24px] py-[8px] font-707 text-[14px] text-black bg-white/60 transition-all placeholder:text-[#aaa] w-full"
                data-node-id="224:9600"
              />
            </div>

            <!-- Field 2: Event Format (Daily Rolling vs Single-Day vs Multi-Day) -->
            <div class="flex flex-col gap-[8px] w-full">
              <label class="font-707 font-medium text-[12px] text-neutral-600 uppercase tracking-tight flex items-center justify-between">
                <span>Event Format</span>
                <span class="text-[11px] font-normal lowercase text-neutral-400">sets access validity</span>
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
                  <div class="border border-[#aaa] focus-within:border-black rounded-[8px] h-[46px] px-[12px] py-[6px] flex items-center gap-[6px] bg-white/60 transition-all">
                    <Calendar class="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <input 
                      v-model="startDate"
                      type="text"
                      placeholder="Start (16 Oct 2026)"
                      class="flex-1 min-w-0 bg-transparent font-707 text-[12px] text-black focus:outline-none placeholder:text-[#aaa] p-0 m-0 border-none"
                    />
                  </div>
                  <div class="border border-[#aaa] focus-within:border-black rounded-[8px] h-[46px] px-[12px] py-[6px] flex items-center gap-[6px] bg-white/60 transition-all">
                    <Calendar class="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <input 
                      v-model="endDate"
                      type="text"
                      placeholder="End (1 Nov 2026)"
                      class="flex-1 min-w-0 bg-transparent font-707 text-[12px] text-black focus:outline-none placeholder:text-[#aaa] p-0 m-0 border-none"
                    />
                  </div>
                </div>
                <p class="font-707 text-[11px] text-neutral-500 leading-tight px-1">
                  Campaign runs across the period. Passes automatically stamp <strong>today's date</strong> in real time with <strong>daily queue resets</strong> and a date-organized database.
                </p>
              </div>

              <!-- Single-Day Date Input -->
              <div v-else-if="eventType === 'single'" class="flex flex-col gap-1 w-full pt-1 animate-apple-pop">
                <div class="border border-[#aaa] focus-within:border-black rounded-[8px] h-[46px] px-[16px] py-[6px] flex items-center gap-[10px] bg-white/60 transition-all w-full">
                  <Calendar class="w-4 h-4 text-neutral-400 shrink-0" />
                  <input 
                    v-model="eventDate"
                    type="text"
                    placeholder="Event Date (e.g. 16 October 2026)"
                    class="flex-1 min-w-0 bg-transparent font-707 text-[13px] text-black focus:outline-none placeholder:text-[#aaa] p-0 m-0 border-none"
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

            <!-- Field 3: Campaign URL (Figma Node 224:9602) -->
            <div 
              class="border border-[#aaa] focus-within:border-black rounded-[8px] h-[52px] px-[24px] py-[8px] flex items-center gap-[4px] bg-white/60 transition-all w-full overflow-hidden"
              data-node-id="224:9602"
            >
              <span class="font-707 text-[14px] text-[#aaa] shrink-0 select-none" data-node-id="224:9607">
                events.707.co.id/{{ targetBrandSlug }}/
              </span>
              <input 
                v-model="campaignSlug"
                @input="handleSlugInput"
                type="text"
                placeholder="Enter your campaign url"
                class="flex-1 min-w-0 bg-transparent font-707 text-[14px] text-black focus:outline-none placeholder:text-[#aaa] p-0 m-0 border-none"
                data-node-id="224:9608"
              />
            </div>
          </div>

          <!-- Submit Button (Figma Node 224:9605) -->
          <div class="mt-[32px] w-full" data-node-id="224:9605">
            <button 
              type="submit"
              :disabled="!campaignName.trim()"
              class="bg-black hover:bg-neutral-800 active:bg-neutral-900 text-white font-707 font-medium text-[14px] leading-[18px] h-[52px] flex items-center justify-center rounded-[8px] cursor-pointer apple-press w-full transition-all shadow-sm disabled:bg-[#e0e0e0] disabled:text-[#888] disabled:cursor-not-allowed disabled:pointer-events-none disabled:shadow-none disabled:border-transparent"
              data-node-id="I224:9605;176:5764"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { X, Calendar, CalendarRange, Repeat } from 'lucide-vue-next';
import { useEditorStore } from '../../stores/editorStore.ts';
import { useAuthStore } from '../../stores/authStore.ts';
import { useBrandStore } from '../../stores/brandStore.ts';
import type { EventConfig } from '../../types/editor.ts';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const router = useRouter();
const editorStore = useEditorStore();
const authStore = useAuthStore();
const brandStore = useBrandStore();

const targetBrandSlug = computed(() => {
  const userBrand = authStore.currentUser?.assignedBrands?.[0];
  let raw = '';
  if (!authStore.isSuperAdmin && userBrand && userBrand !== 'all') {
    raw = userBrand;
  } else if (brandStore.activeBrand?.slug) {
    raw = brandStore.activeBrand.slug;
  } else {
    raw = userBrand || 'brand';
  }
  return raw.toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'brand';
});

const campaignName = ref('');
const campaignSlug = ref('');
const isSlugManuallyEdited = ref(false);
const eventType = ref<'daily_rolling' | 'single' | 'multiday'>('daily_rolling');
const eventDate = ref('16 October 2026');
const startDate = ref('16 October 2026');
const endDate = ref('1 November 2026');
const nameInputRef = ref<HTMLInputElement | null>(null);

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Auto-generate slug from name unless user has manually customized the slug
watch(campaignName, (newName) => {
  if (!isSlugManuallyEdited.value) {
    campaignSlug.value = slugify(newName);
  }
});

function handleSlugInput() {
  if (!campaignSlug.value) {
    isSlugManuallyEdited.value = false;
    campaignSlug.value = slugify(campaignName.value);
  } else {
    isSlugManuallyEdited.value = campaignSlug.value !== slugify(campaignName.value);
  }
}

watch(() => props.isOpen, async (open) => {
  if (open) {
    campaignName.value = '';
    campaignSlug.value = '';
    eventType.value = 'daily_rolling';
    eventDate.value = '16 October 2026';
    startDate.value = '16 October 2026';
    endDate.value = '1 November 2026';
    isSlugManuallyEdited.value = false;
    await nextTick();
    nameInputRef.value?.focus();
  }
});

function handleCreate() {
  const title = campaignName.value.trim() || 'Untitled Activation Project';
  const slug = campaignSlug.value.trim() || slugify(title) || undefined;
  const brandSlug = (!authStore.isSuperAdmin && authStore.currentUser?.assignedBrands?.[0]) 
    ? authStore.currentUser.assignedBrands[0] 
    : (brandStore.activeBrand?.slug || undefined);

  const eventConfig: EventConfig = {
    eventType: eventType.value,
    eventDate: eventType.value === 'single' ? eventDate.value.trim() : (eventType.value === 'daily_rolling' ? startDate.value.trim() : ''),
    startDate: startDate.value.trim(),
    endDate: endDate.value.trim(),
    dailyQueueReset: eventType.value === 'daily_rolling'
  };

  editorStore.createNewProject(title, slug, undefined, brandSlug, eventConfig);
  emit('close');
  editorStore.triggerProjectLoading(3000);
  router.push('/editor');
}
</script>
