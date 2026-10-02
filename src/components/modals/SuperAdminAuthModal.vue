<template>
  <Transition name="apple-dock-fade">
    <div 
      v-if="isOpen" 
      class="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 transition-all animate-apple-fade select-none"
      @click.self="emit('close')"
    >
      <div class="backdrop-blur-2xl bg-white/95 rounded-[16px] border border-white/60 p-6 w-full max-w-[420px] shadow-[0px_20px_50px_rgba(0,0,0,0.15),0_1px_3px_rgba(0,0,0,0.06)] flex flex-col gap-4 animate-apple-pop">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="size-8 rounded-full bg-black text-white flex items-center justify-center shadow-sm">
              <ShieldCheck class="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 class="font-707 font-medium text-[15px] text-black">Superadmin Verification</h3>
              <p class="font-707 text-[11px] text-neutral-500">707 System Management & Approvals</p>
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

        <p class="font-707 text-[13px] text-neutral-600 leading-relaxed">
          The settings dashboard is restricted to <strong>Superadmin</strong> accounts. Enter your passkey to manage multi-user access, approvals, and brand systems.
        </p>

        <form @submit.prevent="handleVerify" class="flex flex-col gap-3">
          <div class="flex flex-col gap-1.5">
            <label class="font-707 text-[11px] font-medium text-neutral-700 tracking-wider uppercase">
              Superadmin Passkey
            </label>
            <input 
              ref="passkeyInput"
              v-model="passkey"
              type="password"
              placeholder="Enter passkey (e.g. 707admin)"
              class="w-full h-[40px] px-3.5 rounded-[8px] bg-black/[0.04] border border-black/15 text-[13px] font-707 text-black focus:border-black focus:bg-white outline-none transition-all placeholder:text-neutral-400"
              autocomplete="current-password"
            />
          </div>

          <div v-if="errorMessage" class="flex items-center gap-1.5 text-red-500 text-[12px] font-707">
            <AlertCircle class="w-3.5 h-3.5 shrink-0" />
            <span>{{ errorMessage }}</span>
          </div>

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
              class="apple-glass-btn-dark bg-black text-white px-5 h-[36px] rounded-[8px] font-707 text-[13px] font-medium apple-press cursor-pointer hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Key class="w-3.5 h-3.5" />
              <span>Unlock Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { ShieldCheck, AlertCircle, Key } from 'lucide-vue-next';
import { useAuthStore } from '../../stores/authStore.ts';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'verified'): void;
}>();

const authStore = useAuthStore();
const passkey = ref('');
const errorMessage = ref('');
const passkeyInput = ref<HTMLInputElement | null>(null);

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      passkey.value = '';
      errorMessage.value = '';
      nextTick(() => {
        passkeyInput.value?.focus();
      });
    }
  }
);

function handleVerify() {
  if (!passkey.value) {
    errorMessage.value = 'Please enter the passkey.';
    return;
  }

  const success = authStore.verifySuperAdmin(passkey.value);
  if (success) {
    emit('verified');
    emit('close');
  } else {
    errorMessage.value = 'Invalid superadmin passkey. Try "707admin" or "707studio".';
    passkey.value = '';
  }
}
</script>
