<template>
  <div class="h-screen w-screen flex items-center justify-center bg-[#0c0d0e] px-6">
    <div class="w-full max-w-[360px]">
      <div class="mb-8">
        <p class="font-707 text-[13px] text-white tracking-[4.03px] uppercase mb-2">
          707 DESIGN STUDIO
        </p>
        <h1 class="text-2xl font-bold tracking-tight text-white mb-1">Sign in</h1>
        <p class="text-sm text-neutral-400">
          This workspace is for the 707 team. Enter the studio password to continue.
        </p>
      </div>

      <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
        <input
          ref="passwordInput"
          v-model="password"
          type="password"
          autocomplete="current-password"
          placeholder="Studio password"
          class="w-full h-[52px] px-4 rounded-xl bg-[#16181a] border border-[#2c2f35] text-white text-sm outline-none focus:border-neutral-500 transition-colors placeholder:text-neutral-600"
          :disabled="isLoading"
          @input="errorMessage = ''"
        />

        <p v-if="errorMessage" class="text-sm text-red-400">
          {{ errorMessage }}
        </p>

        <button
          type="submit"
          class="w-full h-[52px] rounded-xl bg-white text-black text-sm font-semibold tracking-wide disabled:opacity-50 transition-opacity"
          :disabled="isLoading || !password"
        >
          {{ isLoading ? 'SIGNING IN…' : 'SIGN IN' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { login } from '../services/apiClient.ts';

const router = useRouter();
const route = useRoute();

const password = ref('');
const isLoading = ref(false);
const errorMessage = ref('');
const passwordInput = ref<HTMLInputElement | null>(null);

onMounted(() => {
  passwordInput.value?.focus();
});

async function handleSubmit() {
  if (!password.value || isLoading.value) return;

  isLoading.value = true;
  errorMessage.value = '';

  const result = await login(password.value);

  isLoading.value = false;

  if (!result.success) {
    errorMessage.value = result.error || 'Incorrect studio password.';
    password.value = '';
    return;
  }

  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/';
  router.replace(redirect);
}
</script>
