<template>
  <Transition name="apple-modal-fade">
    <div 
      v-if="isOpen"
      class="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 select-none"
      @click.self="emit('close')"
    >
      <!-- Modal Box (Figma Node 224:9590) -->
      <div 
        class="backdrop-blur-2xl bg-white/90 border border-white/60 flex flex-col items-start p-[24px] rounded-[12px] shadow-[0px_20px_50px_0px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.05)] w-full max-w-[408px] apple-modal-box"
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
          <!-- Subtitle copy fixed from typo to 'custom slug' -->
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

            <!-- Field 2: Campaign URL (Figma Node 224:9602) -->
            <div 
              class="border border-[#aaa] focus-within:border-black rounded-[8px] h-[52px] px-[24px] py-[8px] flex items-center gap-[4px] bg-white/60 transition-all w-full overflow-hidden"
              data-node-id="224:9602"
            >
              <span class="font-707 text-[14px] text-[#aaa] shrink-0 select-none" data-node-id="224:9607">
                events.707.co.id/
              </span>
              <input 
                v-model="campaignSlug"
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
import { ref, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { X } from 'lucide-vue-next';
import { useEditorStore } from '../../stores/editorStore.ts';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const router = useRouter();
const editorStore = useEditorStore();

const campaignName = ref('');
const campaignSlug = ref('');
const nameInputRef = ref<HTMLInputElement | null>(null);

// Auto-generate slug from name if user hasn't typed a custom slug
watch(campaignName, (newName) => {
  if (!campaignSlug.value || campaignSlug.value === slugify(campaignName.value.slice(0, -1))) {
    campaignSlug.value = slugify(newName);
  }
});

watch(() => props.isOpen, async (open) => {
  if (open) {
    campaignName.value = '';
    campaignSlug.value = '';
    await nextTick();
    nameInputRef.value?.focus();
  }
});

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function handleCreate() {
  const title = campaignName.value.trim() || 'Untitled Activation Project';
  const slug = campaignSlug.value.trim() || undefined;
  editorStore.createNewProject(title, slug);
  emit('close');
  editorStore.triggerProjectLoading(3000);
  router.push('/editor');
}
</script>
