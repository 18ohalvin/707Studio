<template>
  <div 
    v-if="editorStore.isRequestWidgetModalOpen" 
    class="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 transition-all animate-apple-fade"
    @click.self="editorStore.isRequestWidgetModalOpen = false"
  >
    <div class="apple-glass-modal rounded-2xl w-full max-w-md overflow-hidden animate-apple-pop select-none">
      <div class="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between bg-white/50">
        <div class="flex items-center gap-2.5">
          <div class="size-8 rounded-lg bg-black text-white flex items-center justify-center shadow-sm">
            <Wrench class="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 class="text-[14px] font-bold text-black font-707">
              Request Custom Widget
            </h2>
            <p class="text-[11px] text-neutral-500 font-707">Submit feature specification to UI/UX team</p>
          </div>
        </div>
        <button 
          @click="editorStore.isRequestWidgetModalOpen = false"
          class="apple-glass-icon-btn size-7 flex items-center justify-center rounded-full cursor-pointer"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </div>

      <form @submit.prevent="submitWidgetRequest" class="p-6 space-y-4 text-xs">
        <div>
          <label class="block font-707 font-medium text-black mb-1.5 text-[12px]">Widget Title / Feature Name</label>
          <input 
            v-model="widgetName" 
            required 
            placeholder="e.g. 3D Sneaker AR Spin Viewer / Secret Passcode Gate"
            class="w-full bg-neutral-50 hover:bg-neutral-100/80 focus:bg-white border border-[#e5e5e5] focus:border-black rounded-xl p-3 text-black text-[13px] font-707 focus:outline-none transition-all placeholder:text-neutral-400 shadow-sm"
          />
        </div>
        <div>
          <label class="block font-707 font-medium text-black mb-1.5 text-[12px]">Target Brand & Event</label>
          <input 
            :value="brandStore.activeBrand?.name || '707 Network'" 
            disabled 
            class="w-full bg-neutral-100 border border-[#e5e5e5] rounded-xl p-3 text-neutral-600 text-[13px] font-707 cursor-not-allowed"
          />
        </div>
        <div>
          <label class="block font-707 font-medium text-black mb-1.5 text-[12px]">Mechanism Requirements</label>
          <textarea 
            v-model="requirements" 
            required
            rows="3" 
            placeholder="Describe the widget behavior, data fields, and drop mechanics required..."
            class="w-full bg-neutral-50 hover:bg-neutral-100/80 focus:bg-white border border-[#e5e5e5] focus:border-black rounded-xl p-3 text-black text-[13px] font-707 focus:outline-none transition-all placeholder:text-neutral-400 shadow-sm resize-none"
          ></textarea>
        </div>

        <button 
          type="submit"
          class="apple-glass-btn-dark w-full py-3 rounded-xl font-bold uppercase tracking-wider text-[12px] font-707 cursor-pointer mt-2"
        >
          Submit Request to UI/UX Team
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useEditorStore } from '../../../stores/editorStore.ts';
import { useBrandStore } from '../../../stores/brandStore.ts';
import { Wrench, X } from 'lucide-vue-next';

const editorStore = useEditorStore();
const brandStore = useBrandStore();

const widgetName = ref('');
const requirements = ref('');

function submitWidgetRequest() {
  editorStore.showToast(`Widget request "${widgetName.value}" sent to the 707 UI/UX team.`);
  editorStore.isRequestWidgetModalOpen = false;
  widgetName.value = '';
  requirements.value = '';
}
</script>
