<template>
  <Transition name="apple-modal-fade">
    <div 
      v-if="isOpen"
      class="fixed inset-0 z-50 bg-white/50 backdrop-blur-md flex items-center justify-center p-4 select-none"
      @click.self="emit('close')"
    >
      <!-- Modal Box (Figma Node 212:7461) -->
      <div 
        class="backdrop-blur-2xl bg-white/70 border border-white/60 flex flex-col items-start p-[24px] rounded-[14px] shadow-[0px_20px_50px_0px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.05)] w-full max-w-[420px] apple-modal-box animate-apple-pop"
        data-node-id="212:7461"
        data-name="Access your Brand Account Modal"
      >
        <!-- Modal Header -->
        <div class="flex flex-col gap-[8px] items-start w-full mb-[20px]">
          <div class="flex items-center justify-between w-full">
            <h2 class="font-707 text-[22px] font-normal leading-[28px] text-black whitespace-nowrap">
              {{ activeRoleTab === 'brand' ? 'Access Brand Account' : 'Superadmin Access' }}
            </h2>
            <!-- Close Button -->
            <button 
              type="button"
              @click="emit('close')"
              class="size-[24px] bg-[#ededed] hover:bg-[#d9d9d9] active:bg-[#ccc] rounded-full flex items-center justify-center apple-press cursor-pointer transition-colors shrink-0"
              title="Close"
            >
              <X class="w-3.5 h-3.5 text-black" />
            </button>
          </div>
          <p class="font-707 text-[13px] font-normal leading-[18px] text-neutral-500 w-full">
            {{ activeRoleTab === 'brand' ? 'Sign in to build and manage your brand activations.' : 'Enter master passkey for system management.' }}
          </p>
        </div>

        <!-- Role Segmented Switcher -->
        <div class="w-full bg-black/[0.04] p-1 rounded-[10px] flex items-center gap-1 mb-5">
          <button
            type="button"
            @click="activeRoleTab = 'brand'"
            :class="[
              'flex-1 py-1.5 px-3 rounded-[7px] text-[13px] font-707 font-medium transition-all text-center cursor-pointer border-none',
              activeRoleTab === 'brand' 
                ? 'bg-white text-black shadow-xs font-semibold' 
                : 'bg-transparent text-neutral-500 hover:text-black'
            ]"
          >
            Brand / Team Account
          </button>
          <button
            type="button"
            @click="activeRoleTab = 'superadmin'"
            :class="[
              'flex-1 py-1.5 px-3 rounded-[7px] text-[13px] font-707 font-medium transition-all text-center cursor-pointer border-none',
              activeRoleTab === 'superadmin' 
                ? 'bg-white text-black shadow-xs font-semibold' 
                : 'bg-transparent text-neutral-500 hover:text-black'
            ]"
          >
            Superadmin PIN
          </button>
        </div>

        <!-- Mode 1: Brand / Team Account Form -->
        <form v-if="activeRoleTab === 'brand'" @submit.prevent="handleBrandSignIn" class="flex flex-col w-full">
          <div class="flex flex-col gap-[14px] w-full">
            <!-- Field 1: Brand Email or Username -->
            <div class="w-full">
              <label class="font-707 text-[11px] font-medium text-neutral-600 uppercase tracking-wider mb-1 block">
                Brand Account / Email
              </label>
              <input 
                v-model="brandId"
                ref="brandInputRef"
                type="text"
                autocomplete="username"
                placeholder="e.g. sarah.chen@atmos.co.id or atmos"
                required
                :class="[
                  'focus:outline-none rounded-[8px] h-[48px] px-[16px] py-[8px] font-707 text-[14px] transition-all placeholder:text-[#aaa] w-full focus:bg-white',
                  errorMessage 
                    ? 'border border-red-400 bg-red-50/20 text-red-900 focus:border-red-500' 
                    : 'border border-[#aaa]/60 focus:border-black text-black bg-white/70'
                ]"
                @input="errorMessage = ''"
              />
            </div>

            <!-- Field 2: Password / PIN with show/hide and forgot -->
            <div class="w-full">
              <div class="flex items-center justify-between mb-1">
                <label class="font-707 text-[11px] font-medium text-neutral-600 uppercase tracking-wider block">
                  Password / PIN
                </label>
                <button 
                  type="button"
                  @click="handleForgotPin"
                  class="font-707 text-[12px] text-neutral-400 hover:text-black transition-colors select-none cursor-pointer border-none bg-transparent"
                >
                  Forgot?
                </button>
              </div>
              <div 
                :class="[
                  'rounded-[8px] h-[48px] px-[16px] py-[8px] flex items-center justify-between transition-all w-full focus-within:bg-white',
                  errorMessage 
                    ? 'border border-red-400 bg-red-50/20 focus-within:border-red-500' 
                    : 'border border-[#aaa]/60 focus-within:border-black bg-white/70'
                ]"
              >
                <input 
                  v-model="brandPin"
                  :type="showPin ? 'text' : 'password'"
                  autocomplete="current-password"
                  placeholder="Enter your password / PIN"
                  required
                  class="flex-1 min-w-0 bg-transparent font-707 text-[14px] text-black focus:outline-none placeholder:text-[#aaa] p-0 m-0 border-none"
                  @input="errorMessage = ''"
                />
                <button 
                  type="button"
                  @click="showPin = !showPin"
                  class="text-neutral-400 hover:text-black cursor-pointer bg-transparent border-none p-1 shrink-0 ml-1.5"
                  tabindex="-1"
                >
                  <EyeOff v-if="showPin" class="w-4 h-4" />
                  <Eye v-else class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- Error Alert -->
          <div v-if="errorMessage" class="mt-3 p-2.5 rounded-[8px] bg-red-50 border border-red-200 text-red-600 text-[12px] font-707 flex items-center gap-1.5 animate-apple-pop">
            <AlertCircle class="w-3.5 h-3.5 shrink-0" />
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Sign In Button -->
          <div class="mt-[24px] w-full">
            <button 
              type="submit"
              :disabled="!brandId.trim() || !brandPin.trim()"
              class="bg-black hover:bg-neutral-800 active:bg-neutral-900 text-white font-707 font-medium text-[14px] leading-[18px] h-[48px] flex items-center justify-center rounded-[8px] cursor-pointer apple-press w-full transition-all shadow-sm disabled:bg-[#e0e0e0] disabled:text-[#888] disabled:cursor-not-allowed disabled:pointer-events-none"
            >
              Sign In as Brand PIC
            </button>
          </div>
        </form>

        <!-- Mode 2: Superadmin Passkey PIN Form -->
        <form v-else @submit.prevent="handleSuperadminSignIn" class="flex flex-col w-full">
          <div class="flex flex-col gap-[14px] w-full">
            <div class="w-full">
              <label class="font-707 text-[11px] font-medium text-neutral-600 uppercase tracking-wider mb-1 block">
                Superadmin Passkey / Master PIN
              </label>
              <div 
                :class="[
                  'rounded-[8px] h-[48px] px-[16px] py-[8px] flex items-center justify-between transition-all w-full focus-within:bg-white',
                  errorMessage 
                    ? 'border border-red-400 bg-red-50/20 focus-within:border-red-500' 
                    : 'border border-[#aaa]/60 focus-within:border-black bg-white/70'
                ]"
              >
                <input 
                  v-model="superadminPin"
                  ref="superadminInputRef"
                  :type="showSuperadminPin ? 'text' : 'password'"
                  autocomplete="current-password"
                  placeholder="Enter passkey PIN (e.g. 707admin)"
                  required
                  class="flex-1 min-w-0 bg-transparent font-707 text-[14px] text-black focus:outline-none placeholder:text-[#aaa] p-0 m-0 border-none"
                  @input="errorMessage = ''"
                />
                <button 
                  type="button"
                  @click="showSuperadminPin = !showSuperadminPin"
                  class="text-neutral-400 hover:text-black cursor-pointer bg-transparent border-none p-1 shrink-0 ml-1.5"
                  tabindex="-1"
                >
                  <EyeOff v-if="showSuperadminPin" class="w-4 h-4" />
                  <Eye v-else class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- Error Alert -->
          <div v-if="errorMessage" class="mt-3 p-2.5 rounded-[8px] bg-red-50 border border-red-200 text-red-600 text-[12px] font-707 flex items-center gap-1.5 animate-apple-pop">
            <AlertCircle class="w-3.5 h-3.5 shrink-0" />
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Superadmin Submit Button -->
          <div class="mt-[24px] w-full">
            <button 
              type="submit"
              :disabled="!superadminPin.trim()"
              class="bg-black hover:bg-neutral-800 active:bg-neutral-900 text-white font-707 font-medium text-[14px] leading-[18px] h-[48px] flex items-center justify-center rounded-[8px] cursor-pointer apple-press w-full transition-all shadow-sm disabled:bg-[#e0e0e0] disabled:text-[#888] disabled:cursor-not-allowed disabled:pointer-events-none"
            >
              Verify & Enter Superadmin
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { X, Eye, EyeOff, AlertCircle } from 'lucide-vue-next';
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

const activeRoleTab = ref<'brand' | 'superadmin'>('brand');
const brandId = ref('');
const brandPin = ref('');
const superadminPin = ref('');
const showPin = ref(false);
const showSuperadminPin = ref(false);
const errorMessage = ref('');
const brandInputRef = ref<HTMLInputElement | null>(null);
const superadminInputRef = ref<HTMLInputElement | null>(null);

watch(() => props.isOpen, async (open) => {
  if (open) {
    brandId.value = '';
    brandPin.value = '';
    superadminPin.value = '';
    errorMessage.value = '';
    await nextTick();
    if (activeRoleTab.value === 'brand') {
      brandInputRef.value?.focus();
    } else {
      superadminInputRef.value?.focus();
    }
  }
});

watch(activeRoleTab, async (newTab) => {
  errorMessage.value = '';
  await nextTick();
  if (newTab === 'brand') {
    brandInputRef.value?.focus();
  } else {
    superadminInputRef.value?.focus();
  }
});

function handleForgotPin() {
  editorStore.showToast('Please contact your Superadmin or #707-design-studio-help to reset PIN.');
}

async function handleBrandSignIn() {
  errorMessage.value = '';
  const inputId = brandId.value.trim();
  
  if (authStore.users.length === 0) {
    await authStore.loadUsers();
  }
  if (brandStore.brands.length === 0) {
    await brandStore.loadBrands();
  }

  let res = await authStore.signIn(inputId, brandPin.value);
  if (!res.success) {
    // Retry fresh load from cloud server in case a new account was just created on another device
    await authStore.loadUsers();
    res = await authStore.signIn(inputId, brandPin.value);
  }

  if (!res.success) {
    errorMessage.value = res.error || 'Invalid account identifier or password.';
    return;
  }

  // Match or activate brand
  const found = brandStore.brands.find(b => 
    b.slug.toLowerCase() === inputId.toLowerCase() || 
    b.name.toLowerCase().includes(inputId.toLowerCase()) ||
    (authStore.currentUser?.assignedBrands && authStore.currentUser.assignedBrands.some(ub => ub.toLowerCase() === b.slug.toLowerCase() || ub.toLowerCase() === b.name.toLowerCase()))
  );
  if (found) {
    brandStore.setActiveBrand(found);
  }

  await editorStore.loadProjects();
  emit('signed-in', authStore.currentUser?.name || found?.name || inputId);
  emit('close');
}

async function handleSuperadminSignIn() {
  errorMessage.value = '';
  const success = authStore.verifySuperAdmin(superadminPin.value);
  if (!success) {
    errorMessage.value = 'Invalid superadmin passkey PIN. Try "707admin".';
    return;
  }
  await editorStore.loadProjects();
  emit('signed-in', 'Superadmin Lead');
  emit('close');
}
</script>
