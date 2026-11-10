<template>
  <button 
    @click="handleClick"
    type="button"
    class="relative size-[24px] flex items-center justify-center apple-press cursor-pointer hover:opacity-75 transition-opacity border-0 border-none outline-none bg-transparent shadow-none p-0 shrink-0 group"
    :class="dark ? 'text-white' : 'text-black'"
    :title="hasUnread ? 'New notifications available' : 'Notifications'"
    data-node-id="210:6959"
    data-name="clarity:notification-outline-badged"
  >
    <!-- Minimalist Outline Bell (707 Minimal Outline Style) -->
    <svg 
      class="w-[19px] h-[19px] transition-transform duration-200 group-hover:scale-105" 
      :class="dark ? 'text-white' : 'text-black'"
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      stroke-width="1.35" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>

    <!-- New Notification State Dot Mode (Signature 707 Earthy Moss unread badge) -->
    <span 
      v-if="hasUnread"
      class="absolute top-[2px] right-[2.5px] size-[6.5px] rounded-full bg-moss-500 shrink-0 animate-pulse shadow-xs"
      :class="dark ? 'ring-[1.5px] ring-[#0a0a0a]' : 'ring-[1.5px] ring-white'"
      aria-hidden="true"
    />
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  hasUnread?: boolean;
  dark?: boolean;
}>(), {
  hasUnread: true,
  dark: false
});

const emit = defineEmits<{
  (e: 'click'): void;
}>();

function handleClick() {
  emit('click');
}
</script>
