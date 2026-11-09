<template>
  <div 
    class="h-full min-h-screen w-full overflow-x-hidden overflow-y-auto flex flex-col justify-between font-sans font-light tracking-normal select-none transition-colors duration-200"
    :class="isDark ? 'bg-[#0a0a0a] text-white' : 'bg-white text-black'"
  >
    <!-- 1. Header matching Figma Node 198:6791 -->
    <header 
      class="w-full h-[48px] px-6 py-2 flex items-center justify-between shrink-0 sticky top-0 z-40 border-b backdrop-blur-md"
      :class="isDark ? 'border-white/[0.06] bg-[#0a0a0a]/80' : 'border-black/[0.05] bg-white/80'"
      data-name="Header"
    >
      <!-- Left: Real 707 Logo & Version Identifier -->
      <div class="flex items-center gap-[10px] h-[20px]">
        <router-link 
          to="/" 
          class="h-[18px] relative shrink-0 flex items-center cursor-pointer hover:opacity-85 transition-opacity" 
          title="707 Design Studio"
        >
          <img 
            :src="FIGMA_ASSETS.logoDesignStudio" 
            alt="707 Design Studio" 
            class="h-[18px] w-auto object-contain pointer-events-none"
            :class="isDark ? 'brightness-0 invert' : ''"
            @error="logoFailed = true"
          />
          <span v-if="logoFailed" class="font-semibold text-xs tracking-tight leading-none" :class="isDark ? 'text-white' : 'text-black'">
            707 DESIGN STUDIO
          </span>
        </router-link>
        <span 
          class="inline-flex items-center px-1.5 py-[2px] rounded-[5px] text-[10px] font-sans font-medium leading-none whitespace-nowrap select-none border"
          :class="isDark ? 'bg-white/10 border-white/15 text-white/90' : 'bg-black/[0.04] border-black/10 text-neutral-600'"
        >
          1.5
        </span>
      </div>

      <!-- Right: Exit to Studio / Home CTA -->
      <div class="flex items-center gap-4">
        <router-link 
          to="/" 
          class="inline-flex items-center gap-1.5 text-[13px] font-sans font-medium transition-colors apple-press"
          :class="isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-black'"
        >
          <ArrowLeft class="w-3.5 h-3.5" />
          <span>Exit to Studio</span>
        </router-link>
      </div>
    </header>

    <!-- 2. Main Editorial Stage: Direct Canvas (No pop-up window/card wrapper) -->
    <main class="flex-1 w-full flex flex-col justify-center px-6 sm:px-12 py-12 sm:py-20">
      <div class="w-full max-w-[620px] mx-auto flex flex-col gap-6 sm:gap-7 animate-apple-pop">
        <!-- Hero: Real 707 Design Studio Vector Logo -->
        <div class="flex flex-col items-start gap-3">
          <img 
            :src="FIGMA_ASSETS.logoDesignStudio" 
            alt="707 Design Studio" 
            class="h-[36px] sm:h-[44px] w-auto object-contain pointer-events-none select-none"
            :class="isDark ? 'brightness-0 invert' : ''"
          />
          <p 
            class="text-[13px] sm:text-[14px] font-sans font-normal tracking-tight"
            :class="isDark ? 'text-neutral-400' : 'text-neutral-500'"
          >
            1.5.0 Release · Architecture Engine
          </p>
        </div>

        <!-- Subtle Rule Divider -->
        <div 
          class="h-px w-full"
          :class="isDark ? 'bg-white/10' : 'bg-black/10'"
        />

        <!-- Studio Manifesto & Description (SF Pro only) -->
        <div 
          class="font-sans font-light tracking-normal text-[14px] sm:text-[15px] leading-[24px] sm:leading-[26px] flex flex-col gap-4"
          :class="isDark ? 'text-neutral-300' : 'text-neutral-700'"
        >
          <p>
            707 Design Studio is the internal activation, campaign, and raffle drop engine engineered for premier brand houses. Built to bridge high-touch physical brand experiences with real-time digital architecture, it powers responsive event RSVP drops, dynamic encrypted QR entrance passes, instant runway sign-off gates, and low-latency venue door verification.
          </p>

          <div 
            class="font-sans font-light text-[12.5px] sm:text-[13px] leading-[22px] flex flex-col gap-1.5 pt-1"
            :class="isDark ? 'text-neutral-400' : 'text-neutral-500'"
          >
            <p>
              <strong class="font-medium" :class="isDark ? 'text-neutral-200' : 'text-neutral-800'">Design Architecture & Systems:</strong> Alvin Decorous, 707 Core Team, Tokyo & Jakarta Creative Ops.
            </p>
            <p>
              <strong class="font-medium" :class="isDark ? 'text-neutral-200' : 'text-neutral-800'">Runway Engineering:</strong> Distributed Edge Gateway, Real-Time Synchronizer, Local-First Drop Engine.
            </p>
            <p>
              <strong class="font-medium" :class="isDark ? 'text-neutral-200' : 'text-neutral-800'">Hardware Protocols:</strong> Dynamic AES-256 Check-In Scanner, Zero-Delay Offline Gatekeeper.
            </p>
            <p>
              <strong class="font-medium" :class="isDark ? 'text-neutral-200' : 'text-neutral-800'">Brand Collaborators:</strong> atmos Indonesia, ASICS, Stanley, ZAXY, and global partner houses.
            </p>
          </div>
        </div>

        <!-- Contact Support: Clean Professional Button & Hyperlink Text -->
        <div class="pt-2 flex flex-wrap items-center gap-4">
          <a 
            :href="whatsappUrl" 
            target="_blank" 
            rel="noopener noreferrer"
            class="inline-flex items-center justify-center gap-2 px-6 h-[42px] rounded-full text-[13px] font-sans font-medium transition-all apple-press cursor-pointer shadow-xs"
            :class="isDark 
              ? 'bg-white text-black hover:bg-neutral-200' 
              : 'bg-black text-white hover:bg-neutral-800'"
            title="Contact Support on WhatsApp"
          >
            <span>Contact Support</span>
            <ArrowUpRight class="w-3.5 h-3.5 stroke-[2]" />
          </a>

          <a 
            :href="whatsappUrl" 
            target="_blank" 
            rel="noopener noreferrer"
            class="text-[13px] font-sans font-normal underline underline-offset-4 hover:opacity-75 transition-opacity"
            :class="isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-black'"
          >
            WhatsApp: +62 812-7720-8270
          </a>
        </div>
      </div>
    </main>

    <!-- 3. Minimalist Footer Bar -->
    <footer 
      class="w-full h-[52px] px-6 flex items-center justify-between text-[12px] font-sans font-light shrink-0 select-none border-t"
      :class="isDark ? 'text-neutral-500 border-white/[0.08]' : 'text-neutral-400 border-black/[0.06]'"
    >
      <span>2026. THE7 707 COMPANY. All rights reserved.</span>
      <span class="text-[11px] opacity-75 font-sans">EVENTS.707.CO.ID</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { FIGMA_ASSETS } from '../constants/figmaAssets.ts';
import { ArrowLeft, ArrowUpRight } from 'lucide-vue-next';
import { useAuthStore } from '../stores/authStore.ts';

const route = useRoute();
const authStore = useAuthStore();

const logoFailed = ref(false);

const isDark = computed(() => {
  return route.query.dark === '1' || (authStore.isSuperAdmin && route.path !== '/');
});

// Pre-filled WhatsApp message for zero-delay contact
const whatsappNumber = '6281277208270';
const whatsappDefaultText = encodeURIComponent('Hi 707 Design Studio Team, I need assistance with a campaign drop.');
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappDefaultText}`;
</script>
