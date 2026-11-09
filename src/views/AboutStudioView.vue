<template>
  <div 
    class="h-screen w-screen overflow-hidden flex flex-col justify-between font-sans font-light tracking-normal select-none transition-colors duration-200"
    :class="isDark ? 'bg-[#0a0a0a] text-white' : 'bg-[#f5f5f5] text-black'"
  >
    <!-- 1. 48px Header matching Figma Node 198:6791 -->
    <header 
      class="w-full h-[48px] px-[24px] py-[8px] flex items-center justify-between shrink-0 sticky top-0 z-40 bg-transparent"
      data-name="Header"
    >
      <!-- Left: 707 Logo & Version Identifier -->
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
          <span v-if="logoFailed" class="font-black text-xs tracking-tighter leading-none" :class="isDark ? 'text-white' : 'text-black'">
            707 DESIGN STUDIO
          </span>
        </router-link>
        <span 
          class="inline-flex items-center px-1.5 py-[2px] rounded-[5px] text-[10px] font-mono font-medium leading-none whitespace-nowrap select-none border"
          :class="isDark ? 'bg-white/10 border-white/15 text-white/90' : 'bg-black/[0.04] border-black/10 text-neutral-600'"
        >
          1.5
        </span>
      </div>

      <!-- Right: Exit to Studio / Home CTA -->
      <div class="flex items-center gap-4">
        <router-link 
          to="/" 
          class="inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors apple-press"
          :class="isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-black'"
        >
          <ArrowLeft class="w-3.5 h-3.5" />
          <span>Exit to Studio</span>
        </router-link>
      </div>
    </header>

    <!-- 2. Main Stage: Floating Adobe-Photoshop-style About Card -->
    <main class="flex-1 w-full flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div 
        class="w-full max-w-[540px] rounded-[22px] p-7 sm:p-9 flex flex-col relative transition-all duration-300 animate-apple-pop"
        :class="isDark 
          ? 'bg-[#141414] border border-white/15 text-white shadow-[0px_24px_70px_0px_rgba(0,0,0,0.85)]' 
          : 'bg-white border border-black/10 text-black shadow-[0px_24px_70px_0px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.05)]'"
      >
        <!-- Card Top: 707 Logo & Release Tag -->
        <div class="flex items-center gap-3.5 mb-2">
          <!-- Monogram Box -->
          <div 
            class="size-11 rounded-[12px] flex items-center justify-center font-bold text-[14px] tracking-tight shrink-0 shadow-xs"
            :class="isDark ? 'bg-white text-black' : 'bg-black text-white'"
          >
            707
          </div>
          <div class="flex flex-col">
            <h1 class="text-[20px] font-medium tracking-tight leading-tight">
              707 Design Studio
            </h1>
            <p class="text-[11.5px] font-mono mt-0.5" :class="isDark ? 'text-neutral-400' : 'text-neutral-500'">
              1.5.0 Release · Architecture Engine
            </p>
          </div>
        </div>

        <!-- Release Subtitle Bar -->
        <div 
          class="h-px w-full my-4"
          :class="isDark ? 'bg-white/10' : 'bg-black/10'"
        />

        <!-- Typographic Credits / Manifesto Block (Photoshop Credits Aesthetic) -->
        <div 
          class="font-sans font-light tracking-normal text-[12px] sm:text-[12.5px] leading-[19px] sm:leading-[20px] flex flex-col gap-3"
          :class="isDark ? 'text-neutral-300' : 'text-neutral-700'"
        >
          <p>
            707 Design Studio is the internal activation, campaign, and raffle drop engine engineered for premier brand houses. Built to bridge high-touch physical brand experiences with real-time digital architecture, it powers responsive event RSVP drops, dynamic encrypted QR entrance passes, instant runway sign-off gates, and low-latency venue door verification.
          </p>

          <p class="text-[11.5px] font-mono leading-[17px]" :class="isDark ? 'text-neutral-400' : 'text-neutral-500'">
            Design Architecture & Systems: Alvin Decorous, 707 Core Team, Tokyo & Jakarta Creative Ops.<br />
            Runway Engineering: Distributed Edge Gateway, Real-Time Synchronizer, Local-First Drop Engine.<br />
            Hardware Protocols: Dynamic AES-256 Check-In Scanner, Zero-Delay Offline Gatekeeper.<br />
            Brand Collaborators: atmos Indonesia, ASICS, Stanley, ZAXY, and global partner houses.
          </p>
        </div>

        <!-- Direct Support Action Box (WhatsApp Integration) -->
        <div class="mt-6 flex flex-col gap-2.5">
          <label class="text-[10.5px] font-mono uppercase tracking-wider" :class="isDark ? 'text-neutral-400' : 'text-neutral-500'">
            Direct Team & Runway Support
          </label>

          <!-- Primary Action Button: WhatsApp -->
          <a 
            :href="whatsappUrl" 
            target="_blank" 
            rel="noopener noreferrer"
            class="w-full h-[46px] rounded-[10px] flex items-center justify-between px-4 text-white font-medium text-[13px] apple-press transition-all cursor-pointer shadow-xs group"
            style="background: #25D366; color: #ffffff;"
            title="Chat directly on WhatsApp"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <!-- Official WhatsApp Icon SVG -->
              <svg viewBox="0 0 24 24" class="size-5 fill-current shrink-0" aria-hidden="true">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.04 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.25 7.15C9.07 7.15 8.78 7.22 8.53 7.49C8.28 7.76 7.57 8.42 7.57 9.77C7.57 11.12 8.55 12.42 8.69 12.61C8.83 12.79 10.6 15.53 13.33 16.71C14 17 14.52 17.17 14.92 17.3C15.6 17.51 16.21 17.48 16.7 17.41C17.25 17.33 18.39 16.72 18.63 16.05C18.87 15.37 18.87 14.8 18.8 14.67C18.73 14.55 18.55 14.48 18.28 14.34C18.01 14.21 16.69 13.56 16.44 13.47C16.2 13.38 16.02 13.33 15.84 13.6C15.66 13.88 15.15 14.48 15 14.65C14.84 14.83 14.69 14.85 14.42 14.72C14.15 14.58 13.28 14.3 12.25 13.38C11.44 12.66 10.9 11.77 10.74 11.5C10.59 11.23 10.72 11.08 10.86 10.95C10.98 10.82 11.13 10.63 11.27 10.47C11.41 10.31 11.45 10.19 11.54 10.01C11.63 9.83 11.59 9.68 11.52 9.54C11.45 9.41 10.9 8.07 10.68 7.52C10.45 6.99 10.23 7.06 10.05 7.06C9.9 7.05 9.72 7.05 9.54 7.05L9.25 7.15Z" />
              </svg>
              <div class="flex flex-col text-left">
                <span class="leading-none text-[13px] font-semibold text-white">Contact on WhatsApp</span>
                <span class="text-[11px] text-white/90 font-mono mt-0.5">+62 812-7720-8270</span>
              </div>
            </div>

            <div class="flex items-center gap-1.5">
              <span class="text-[11px] font-mono bg-black/20 px-2 py-0.5 rounded text-white/95">
                Direct
              </span>
              <ExternalLink class="w-3.5 h-3.5 text-white/90 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </a>

          <!-- Secondary Actions Bar: One-Click Copy Number & Slack Channel -->
          <div class="flex items-center gap-2">
            <!-- Copy Phone Number -->
            <button 
              type="button" 
              @click="copy('phone', '+6281277208270')"
              class="flex-1 h-[34px] px-3 rounded-[8px] border text-[11.5px] font-sans flex items-center justify-center gap-1.5 transition-all apple-press cursor-pointer"
              :class="copiedKey === 'phone'
                ? 'bg-emerald-500 text-white border-emerald-500 font-medium'
                : (isDark 
                  ? 'bg-white/[0.05] hover:bg-white/10 border-white/10 text-white' 
                  : 'bg-black/[0.02] hover:bg-black/[0.05] border-black/8 text-neutral-800')"
            >
              <Check v-if="copiedKey === 'phone'" class="w-3 h-3" />
              <Copy v-else class="w-3 h-3 text-neutral-400" />
              <span>{{ copiedKey === 'phone' ? 'Copied +6281277208270' : 'Copy Number' }}</span>
            </button>

            <!-- Slack Channel Reference -->
            <button 
              type="button" 
              @click="copy('slack', '#707-design-studio-help')"
              class="flex-1 h-[34px] px-3 rounded-[8px] border text-[11.5px] font-sans flex items-center justify-center gap-1.5 transition-all apple-press cursor-pointer"
              :class="copiedKey === 'slack'
                ? 'bg-emerald-500 text-white border-emerald-500 font-medium'
                : (isDark 
                  ? 'bg-white/[0.05] hover:bg-white/10 border-white/10 text-white' 
                  : 'bg-black/[0.02] hover:bg-black/[0.05] border-black/8 text-neutral-800')"
            >
              <Check v-if="copiedKey === 'slack'" class="w-3 h-3" />
              <MessageSquare v-else class="w-3 h-3 text-neutral-400" />
              <span>{{ copiedKey === 'slack' ? 'Copied #channel' : 'Slack #help' }}</span>
            </button>
          </div>
        </div>

        <!-- Card Bottom Hallmark: Legal Notices + Official Hallmark Logo -->
        <div 
          class="mt-7 pt-4 border-t flex items-end justify-between"
          :class="isDark ? 'border-white/10' : 'border-black/10'"
        >
          <div class="flex flex-col gap-0.5">
            <span class="text-[11px] font-mono" :class="isDark ? 'text-neutral-400' : 'text-neutral-500'">
              © 1990–2026 707 Design Studio. All rights reserved.
            </span>
            <span class="text-[10px] font-mono" :class="isDark ? 'text-neutral-500' : 'text-neutral-400'">
              Internal Marketing Drop Hub · Confidential & Proprietary
            </span>
          </div>

          <!-- Hallmark Studio Monogram (Adobe logo equivalent) -->
          <div class="flex items-center gap-1.5 shrink-0 pl-3">
            <div 
              class="size-6 rounded-[6px] flex items-center justify-center font-bold text-[9px] tracking-tight shrink-0"
              :class="isDark ? 'bg-white text-black' : 'bg-black text-white'"
            >
              707
            </div>
            <span class="font-bold text-[11px] tracking-tight" :class="isDark ? 'text-white' : 'text-black'">
              STUDIO
            </span>
          </div>
        </div>
      </div>
    </main>

    <!-- 3. Minimalist Footer Bar -->
    <footer 
      class="w-full h-[40px] px-[24px] flex items-center justify-between text-[11px] font-mono shrink-0 select-none"
      :class="isDark ? 'text-neutral-500 border-t border-white/[0.06]' : 'text-neutral-400 border-t border-black/[0.05]'"
    >
      <span>707 STUDIO ARCHITECTURAL SUITE</span>
      <span>EVENTS.707.CO.ID</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { FIGMA_ASSETS } from '../constants/figmaAssets.ts';
import { ArrowLeft, ExternalLink, Copy, Check, MessageSquare } from 'lucide-vue-next';
import { useCopiedFlag } from '../services/campaignLink.ts';
import { useAuthStore } from '../stores/authStore.ts';

const route = useRoute();
const authStore = useAuthStore();
const { copiedKey, copy } = useCopiedFlag();

const logoFailed = ref(false);

const isDark = computed(() => {
  return route.query.dark === '1' || (authStore.isSuperAdmin && route.path !== '/');
});

// Pre-filled WhatsApp message for zero-delay contact
const whatsappNumber = '6281277208270';
const whatsappDefaultText = encodeURIComponent('Hi 707 Design Studio Team, I need assistance with a campaign drop.');
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappDefaultText}`;
</script>
