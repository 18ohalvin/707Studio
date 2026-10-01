<template>
  <Transition name="apple-modal-fade">
    <div 
      v-if="editorStore.isReviewModalOpen" 
      class="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 select-none"
      @click.self="editorStore.isReviewModalOpen = false"
    >
      <!-- Modal Box (Figma Node 212:8954) -->
      <div 
        class="backdrop-blur-2xl bg-white/90 border border-white/60 flex flex-col items-start p-[24px] pb-[32px] rounded-[12px] shadow-[0px_20px_50px_0px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.05)] w-full max-w-[432px] apple-modal-box"
        data-node-id="212:8954"
        data-name="Leave Edit / Submit for Review Modal"
      >
        <!-- Modal Header & Description Container (Figma Node 212:8956) -->
        <div class="flex flex-col gap-[16px] items-start w-full mb-[24px]" data-node-id="212:8956" data-name="Widget Container">
          <!-- Header (Figma Node 212:8957) -->
          <div class="flex items-center justify-between w-full" data-node-id="212:8957" data-name="Widget Header">
            <h2 class="font-707 text-[22px] font-normal leading-[28px] text-black whitespace-nowrap" data-node-id="212:8958">
              Submit for Review?
            </h2>
            <!-- Close Button (Figma Node 212:8959) -->
            <button 
              type="button"
              @click="editorStore.isReviewModalOpen = false"
              class="size-[24px] bg-[#ededed] hover:bg-[#d9d9d9] active:bg-[#ccc] rounded-full flex items-center justify-center apple-press cursor-pointer transition-colors shrink-0"
              title="Close"
              data-node-id="212:8959"
            >
              <X class="w-3.5 h-3.5 text-black" />
            </button>
          </div>

          <!-- Description Text (Figma Node 212:8961) -->
          <p class="font-707 text-[14px] font-normal leading-[24px] text-black w-full" data-node-id="212:8961">
            Your campaign will be sent to the UI/UX Division for final approval. Once approved, it will be published automatically to the public at this URL:
          </p>

          <!-- Campaign URL Bar with Copy Button (Figma Node 224:8977) -->
          <div class="bg-[#f5f5f5] flex items-center justify-between p-[8px] px-[12px] rounded-[4px] w-full border border-black/5" data-node-id="224:8977">
            <p class="font-707 text-[14px] font-normal leading-[24px] text-black truncate select-all" data-node-id="224:8975">
              {{ campaignUrl }}
            </p>
            <button 
              type="button"
              @click="copyUrl"
              class="relative shrink-0 size-[20px] flex items-center justify-center text-neutral-500 hover:text-black transition-colors cursor-pointer ml-2"
              :title="copied ? 'Copied to clipboard' : 'Copy URL'"
              data-node-id="224:8980"
              data-name="codicon:copy"
            >
              <Check v-if="copied" class="w-3.5 h-3.5 text-emerald-600" />
              <Copy v-else class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <!-- Action Buttons Container (Figma Node 212:8974) -->
        <div class="flex gap-[8px] items-center w-full" data-node-id="212:8974" data-name="Button Container">
          <!-- Keep Editing Button (Figma Node 212:8969) -->
          <button 
            type="button"
            @click="editorStore.isReviewModalOpen = false"
            class="border border-black border-solid bg-transparent hover:bg-black/5 active:bg-black/10 flex-1 h-[42px] flex items-center justify-center rounded-[8px] apple-press cursor-pointer transition-colors"
            data-node-id="212:8969"
          >
            <span class="font-707 font-medium text-[14px] leading-[18px] text-black whitespace-nowrap">
              Keep Editing
            </span>
          </button>

          <!-- Submit Button (Figma Node 212:8971) -->
          <button 
            type="button"
            @click="handleSubmit"
            class="bg-black hover:bg-neutral-800 active:bg-neutral-900 flex-1 h-[42px] flex items-center justify-center rounded-[8px] apple-press cursor-pointer transition-colors shadow-sm"
            data-node-id="212:8971"
          >
            <span class="font-707 font-medium text-[14px] leading-[18px] text-white whitespace-nowrap">
              Submit
            </span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useEditorStore } from '../../../stores/editorStore.ts';
import { useBrandStore } from '../../../stores/brandStore.ts';
import { X, Copy, Check } from 'lucide-vue-next';

const editorStore = useEditorStore();
const brandStore = useBrandStore();

const copied = ref(false);

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const campaignUrl = computed(() => {
  const brandSlug = brandStore.activeBrand?.slug || 'atmos';
  const projectSlug = slugify(editorStore.projectTitle) || editorStore.currentPage?.slug || 'campaign-activation';
  return `events.707.co.id/${brandSlug}/${projectSlug}`;
});

async function copyUrl() {
  try {
    await navigator.clipboard.writeText(campaignUrl.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy', err);
  }
}

function handleSubmit() {
  editorStore.setPageStatus('pending_review', 'Brand Team', 'Submitted for UI/UX Division final approval');
  editorStore.isReviewModalOpen = false;
  editorStore.showToast('Design successfully submitted to the UI/UX Division for final approval!');
}
</script>

