<template>
  <div 
    v-if="editorStore.isTestFormModalOpen" 
    class="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 transition-all animate-apple-fade"
    @click.self="editorStore.isTestFormModalOpen = false"
  >
    <div class="apple-glass-modal rounded-2xl w-full max-w-md overflow-hidden animate-apple-pop select-none">
      <div class="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between bg-white/50">
        <div class="flex items-center gap-2.5">
          <div class="size-8 rounded-lg bg-black text-white flex items-center justify-center shadow-sm">
            <Play class="w-4 h-4 text-white fill-white ml-0.5" />
          </div>
          <div>
            <h2 class="text-[14px] font-bold text-black font-707">
              Simulate Form Entry
            </h2>
            <p class="text-[11px] text-neutral-500 font-707">Test live submission flow and payload</p>
          </div>
        </div>
        <button 
          @click="editorStore.isTestFormModalOpen = false"
          class="apple-glass-icon-btn size-7 flex items-center justify-center rounded-full cursor-pointer"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </div>

      <form @submit.prevent="submitTestEntry" class="p-6 space-y-4 text-xs">
        <div>
          <label class="block font-707 font-medium text-black mb-1.5 text-[12px]">Full Name (KTP)</label>
          <input 
            v-model="formData.fullName" 
            required 
            placeholder="Alvin Decorous"
            class="w-full bg-neutral-50 hover:bg-neutral-100/80 focus:bg-white border border-[#e5e5e5] focus:border-black rounded-xl p-3 text-black text-[13px] font-707 focus:outline-none transition-all placeholder:text-neutral-400 shadow-sm"
          />
        </div>
        <div>
          <label class="block font-707 font-medium text-black mb-1.5 text-[12px]">Email Address</label>
          <input 
            v-model="formData.email" 
            type="email" 
            required 
            placeholder="alvin@707.co.id"
            class="w-full bg-neutral-50 hover:bg-neutral-100/80 focus:bg-white border border-[#e5e5e5] focus:border-black rounded-xl p-3 text-black text-[13px] font-707 focus:outline-none transition-all placeholder:text-neutral-400 shadow-sm"
          />
        </div>
        <div>
          <label class="block font-707 font-medium text-black mb-1.5 text-[12px]">WhatsApp Phone Number</label>
          <input 
            v-model="formData.phone" 
            placeholder="+62 812 8888 7707"
            class="w-full bg-neutral-50 hover:bg-neutral-100/80 focus:bg-white border border-[#e5e5e5] focus:border-black rounded-xl p-3 text-black text-[13px] font-707 focus:outline-none transition-all placeholder:text-neutral-400 shadow-sm font-mono"
          />
        </div>
        <div>
          <label class="block font-707 font-medium text-black mb-1.5 text-[12px]">Selected Shoe Size</label>
          <select 
            v-model="formData.size"
            class="w-full bg-neutral-50 hover:bg-neutral-100/80 focus:bg-white border border-[#e5e5e5] focus:border-black rounded-xl p-3 text-black text-[13px] font-707 focus:outline-none transition-all shadow-sm cursor-pointer"
          >
            <option value="US 8">US 8</option>
            <option value="US 8.5">US 8.5</option>
            <option value="US 9">US 9</option>
            <option value="US 9.5">US 9.5</option>
            <option value="US 10">US 10</option>
            <option value="US 10.5">US 10.5</option>
            <option value="US 11">US 11</option>
          </select>
        </div>

        <div v-if="submissionResult" class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[12px] font-707 animate-apple-pop flex items-center gap-2">
          <span>✓</span> Entry saved to PostgreSQL database schema!
        </div>

        <button 
          type="submit"
          class="apple-glass-btn-dark w-full py-3 rounded-xl font-bold uppercase tracking-wider text-[12px] font-707 cursor-pointer mt-2"
        >
          Send Test Entry
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useEditorStore } from '../../../stores/editorStore.ts';
import { useBrandStore } from '../../../stores/brandStore.ts';
import { Play, X } from 'lucide-vue-next';

const editorStore = useEditorStore();
const brandStore = useBrandStore();

const formData = ref({
  fullName: 'Alvin Decorous',
  email: 'alvin@707.co.id',
  phone: '+6281288887707',
  size: 'US 9.5'
});

const submissionResult = ref(false);

function submitTestEntry() {
  submissionResult.value = true;
  setTimeout(() => {
    alert(`Success: Test entry for ${formData.value.fullName} recorded for ${brandStore.activeBrand.name}!`);
    editorStore.isTestFormModalOpen = false;
    submissionResult.value = false;
  }, 500);
}
</script>
