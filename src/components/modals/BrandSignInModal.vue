<template>
  <Transition name="apple-modal-fade">
    <div 
      v-if="isOpen"
      class="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 select-none"
      @click.self="emit('close')"
    >
      <!-- Modal Box (Figma Node 212:7461) -->
      <div 
        class="backdrop-blur-2xl bg-white/90 border border-white/60 flex flex-col items-start p-[24px] rounded-[12px] shadow-[0px_20px_50px_0px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.05)] w-full max-w-[408px] apple-modal-box"
        data-node-id="212:7461"
        data-name="Access your Brand Account Modal"
      >
        <!-- Modal Header (Figma Node 212:7480) -->
        <div class="flex flex-col gap-[8px] items-start w-full mb-[24px]" data-node-id="212:7479" data-name="Widget Container">
          <div class="flex items-center justify-between w-full" data-node-id="212:7480" data-name="Widget Header">
            <h2 class="font-707 text-[22px] font-normal leading-[28px] text-black whitespace-nowrap" data-node-id="212:7481">
              Access your Brand Account
            </h2>
            <!-- Close Button (Figma Node 212:7482) -->
            <button 
              type="button"
              @click="emit('close')"
              class="size-[24px] bg-[#ededed] hover:bg-[#d9d9d9] active:bg-[#ccc] rounded-full flex items-center justify-center apple-press cursor-pointer transition-colors shrink-0"
              title="Close"
              data-node-id="212:7482"
            >
              <X class="w-3.5 h-3.5 text-black" />
            </button>
          </div>
          <p class="font-707 text-[14px] font-normal leading-[18px] text-black w-full" data-node-id="212:7484">
            Sign in to build or manage your project
          </p>
        </div>

        <!-- Form Body (Figma Node 212:7468) -->
        <form @submit.prevent="handleSignIn" class="flex flex-col w-full">
          <!-- Fields Container (Figma Node 212:7497) -->
          <div class="flex flex-col gap-[16px] w-full" data-node-id="212:7497">
            <!-- Field 1: Brand Username or ID (Figma Node 212:7471) -->
            <div class="w-full">
              <input 
                v-model="brandId"
                ref="brandInputRef"
                type="text"
                placeholder="Brand Username or ID"
                required
                class="border border-[#aaa] focus:border-black focus:outline-none rounded-[8px] h-[52px] px-[24px] py-[8px] font-707 text-[14px] text-black bg-white/60 transition-all placeholder:text-[#aaa] w-full"
                data-node-id="212:7471"
              />
            </div>

            <!-- Field 2: Enter your PIN with Forget? action (Figma Node 212:7486) -->
            <div 
              class="border border-[#aaa] focus-within:border-black rounded-[8px] h-[52px] px-[24px] py-[8px] flex items-center justify-between bg-white/60 transition-all w-full"
              data-node-id="212:7486"
            >
              <input 
                v-model="brandPin"
                :type="showPin ? 'text' : 'password'"
                placeholder="Enter your PIN"
                required
                class="flex-1 min-w-0 bg-transparent font-707 text-[14px] text-black focus:outline-none placeholder:text-[#aaa] p-0 m-0 border-none"
                data-node-id="212:7487"
              />
              <button 
                type="button"
                @click="handleForgotPin"
                class="font-707 text-[14px] text-[#aaa] hover:text-black transition-colors shrink-0 ml-2 select-none cursor-pointer"
                data-node-id="212:7489"
              >
                Forget?
              </button>
            </div>
          </div>

          <!-- Sign In Button (Figma Node 212:7494) -->
          <div class="mt-[32px] w-full" data-node-id="212:7494">
            <button 
              type="submit"
              :disabled="!brandId.trim() || !brandPin.trim()"
              class="bg-black hover:bg-neutral-800 active:bg-neutral-900 text-white font-707 font-medium text-[14px] leading-[18px] h-[52px] flex items-center justify-center rounded-[8px] cursor-pointer apple-press w-full transition-all shadow-sm disabled:bg-[#e0e0e0] disabled:text-[#888] disabled:cursor-not-allowed disabled:pointer-events-none disabled:shadow-none disabled:border-transparent"
              data-node-id="I212:7494;176:5764"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { X } from 'lucide-vue-next';
import { useBrandStore } from '../../stores/brandStore.ts';
import { useEditorStore } from '../../stores/editorStore.ts';
import { useAuthStore } from '../../stores/authStore.ts';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'signed-in', brandName: string): void;
}>();

const brandStore = useBrandStore();
const editorStore = useEditorStore();
const authStore = useAuthStore();

const brandId = ref('');
const brandPin = ref('');
const showPin = ref(false);
const brandInputRef = ref<HTMLInputElement | null>(null);

watch(() => props.isOpen, async (open) => {
  if (open) {
    brandId.value = '';
    brandPin.value = '';
    await nextTick();
    brandInputRef.value?.focus();
  }
});

function handleForgotPin() {
  editorStore.showToast('Please contact your 707 Brand Admin or Slack (#707-design-studio-help) to reset PIN.');
}

function handleSignIn() {
  const inputId = brandId.value.trim() || 'atmos';
  const res = authStore.signIn(inputId, brandPin.value);
  if (!res.success && res.error) {
    editorStore.showToast(res.error);
    return;
  }
  // Match or activate brand
  const found = brandStore.brands.find(b => 
    b.slug.toLowerCase() === inputId.toLowerCase() || 
    b.name.toLowerCase().includes(inputId.toLowerCase())
  );
  if (found) {
    brandStore.setActiveBrand(found);
  }
  emit('signed-in', authStore.currentUser?.name || found?.name || inputId);
  emit('close');
}
</script>
