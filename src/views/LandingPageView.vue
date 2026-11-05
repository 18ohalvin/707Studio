<template>
  <div class="h-screen w-screen overflow-hidden flex flex-col justify-between bg-[#f5f5f5] text-black font-sans relative select-none">
    <!-- 1. Main Header strictly adapted from Figma Node 198:6791 -->
    <header 
      class="absolute top-0 left-0 right-0 w-full h-[48px] px-[24px] py-[8px] flex items-center justify-between z-40 bg-transparent shrink-0"
      data-node-id="198:6791"
      data-name="Header"
    >
      <!-- Left: 707 Logo & Sub-Brand Studio Identifier -->
      <div class="flex items-center gap-[10px] h-[20px]" data-node-id="198:6792" data-name="Logo">
        <router-link to="/" class="h-[18px] relative shrink-0 flex items-center cursor-pointer hover:opacity-85 transition-opacity" title="707 Design Studio" data-node-id="198:6793" data-name="Logo 707">
          <img 
            :src="FIGMA_ASSETS.logoDesignStudio" 
            alt="707 Design Studio" 
            class="h-[18px] w-auto object-contain pointer-events-none"
            @error="handleLogoError"
          />
          <span v-if="logoFailed" class="font-black text-black text-xs tracking-tighter leading-none">707 DESIGN STUDIO</span>
        </router-link>
        <span 
          v-if="authStore.isSuperAdmin"
          class="inline-flex items-center px-1.5 py-[2px] rounded-[5px] bg-black/[0.04] border border-black/10 text-[10px] font-mono font-medium text-neutral-600 leading-none whitespace-nowrap select-none"
        >
          Dev
        </span>
        <button 
          v-else
          type="button"
          @click="showWhatsNewModal = true"
          class="inline-flex items-center px-1.5 py-[2px] rounded-[5px] bg-white hover:bg-neutral-50 border-[0.5px] border-black/10 hover:border-black/30 shadow-[0_1px_2px_rgba(0,0,0,0.04)] text-[10.5px] font-707 font-medium text-black leading-none whitespace-nowrap cursor-pointer transition-all apple-press"
          title="What's New in Design Studio 1.5"
        >
          1.5
        </button>
      </div>

      <!-- Right: Contact Link CTA, Bell Notification, Profile Icon Container -->
      <div class="flex items-center gap-[24px]" data-node-id="198:6798" data-name="Icons Container">
        <!-- 1. Contact Team Hyperlink CTA (Not a button anymore) -->
        <button 
          v-if="!authStore.isSuperAdmin"
          type="button"
          @click="showContactModal = true"
          class="font-707 text-[13px] text-neutral-600 hover:text-black transition-colors cursor-pointer bg-transparent border-0 p-0 whitespace-nowrap hover:underline underline-offset-4"
          title="Contact 707 Team"
        >
          Contact Team
        </button>

        <!-- 2. Bell Notification Icon -->
        <NotificationsMenu v-if="authStore.isAuthenticated" />

        <!-- 3. Minimal Profile / User Icon (18px, matching logo height) -->
        <div class="relative flex items-center">
          <button 
            @click="authStore.isAuthenticated ? (showUserProfileModal = !showUserProfileModal) : router.push('/login')"
            class="relative size-[24px] flex items-center justify-center apple-press cursor-pointer hover:opacity-80 transition-opacity border-0 border-none outline-none bg-transparent shadow-none p-0 shrink-0 text-black group"
            :title="authStore.isAuthenticated ? 'User Profile' : 'Sign In'"
          >
            <!-- Monogram badge when authenticated, 18px User icon when guest -->
            <div 
              v-if="authStore.isAuthenticated" 
              class="relative size-[22px] rounded-full bg-black text-white flex items-center justify-center font-707 text-[10px] font-semibold tracking-tight shadow-xs select-none transition-transform duration-200 group-hover:scale-105"
            >
              {{ userInitials }}
              <span class="absolute -bottom-0.5 -right-0.5 size-[6px] rounded-full bg-emerald-500 border border-white" />
            </div>
            <User 
              v-else 
              class="w-[18px] h-[18px] text-black stroke-[1.35] transition-transform duration-200 group-hover:scale-105" 
            />
          </button>

          <!-- User Profile Pop Up Modal anchored directly to profile button -->
          <UserProfileModal
            v-if="authStore.isAuthenticated"
            :is-open="showUserProfileModal"
            @close="showUserProfileModal = false"
            @open-analytics="handleAnalytics"
            @open-settings="handleOpenSettings"
            @open-projects="handleViewAllProjects"
            @open-whats-new="handleOpenWhatsNew"
            @sign-out="handleSignOut"
          />
        </div>
      </div>
    </header>

    <!-- 2. Centered Main Content Hub (Figma Node 212:7066) -->
    <main 
      class="relative flex-1 w-full h-full overflow-hidden flex flex-col items-center select-none"
      data-node-id="212:7066"
      data-name="Main Content Container"
    >
      <!-- Grouped Headline + Categories Shortcut Section: Centered at 50vh (Vertical Center) -->
      <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center w-full max-w-[664px] px-4 pointer-events-auto">
        <!-- Intro Greeting & 5 Action Cards (Figma Node 212:7033) -->
        <section class="flex flex-col items-center gap-[28px] md:gap-[32px] w-full shrink-0" data-node-id="212:7033" data-name="Intro Container">
          <h1 class="font-707 text-[28px] md:text-[30px] font-normal text-black text-center tracking-[-0.56px] leading-[36px] max-w-[760px] [text-wrap:balance] transition-all duration-300" data-node-id="198:6839">
            {{ adaptiveGreeting }}
          </h1>

          <!-- Superadmin Shortcut Buttons (Strictly 3 items when Superadmin) -->
          <div v-if="authStore.isSuperAdmin" class="flex gap-[32px] md:gap-[48px] items-start justify-center px-[16px] py-[8px] w-full" data-name="Superadmin Buttons Container">
            <!-- 1. Create a new template -->
            <div class="flex flex-col gap-[10px] items-center justify-center w-[100px]">
              <button 
                @click="handleCreateNewTemplate"
                class="category-menu-btn apple-glass-btn backdrop-blur-[4px] bg-[rgba(236,236,236,0.85)] hover:bg-[#ececec] active:bg-[#e0e0e0] flex items-center justify-center p-[8px] rounded-[8px] size-[88px] apple-press cursor-pointer transition-all duration-200 group"
                title="Create a new template preset"
              >
                <div class="size-[32px] relative shrink-0 flex items-center justify-center">
                  <img :src="FIGMA_ASSETS.landingCreateProject" alt="Create a new template" class="size-full object-contain pointer-events-none" />
                </div>
              </button>
              <p class="font-707 text-[13px] md:text-[14px] text-black text-center leading-[18px] font-normal">
                New Template
              </p>
            </div>

            <!-- 2. Browse templates -->
            <div class="flex flex-col gap-[10px] items-center justify-center w-[100px]">
              <button 
                @click="handleBrowseTemplates"
                class="category-menu-btn apple-glass-btn backdrop-blur-[4px] bg-[rgba(236,236,236,0.85)] hover:bg-[#ececec] active:bg-[#e0e0e0] flex items-center justify-center p-[8px] rounded-[8px] size-[88px] apple-press cursor-pointer transition-all duration-200 group"
                title="Browse all template presets"
              >
                <div class="size-[32px] relative shrink-0 flex items-center justify-center">
                  <img :src="FIGMA_ASSETS.landingBrowseTemplates" alt="Browse templates" class="size-full object-contain pointer-events-none" />
                </div>
              </button>
              <p class="font-707 text-[13px] md:text-[14px] text-black text-center leading-[18px] font-normal">
                Templates
              </p>
            </div>

            <!-- 3. View all projects -->
            <div class="flex flex-col gap-[10px] items-center justify-center w-[100px]">
              <button 
                @click="handleViewAllProjects"
                class="category-menu-btn apple-glass-btn backdrop-blur-[4px] bg-[rgba(236,236,236,0.85)] hover:bg-[#ececec] active:bg-[#e0e0e0] flex items-center justify-center p-[8px] rounded-[8px] size-[88px] apple-press cursor-pointer transition-all duration-200 group"
                title="View all projects"
              >
                <div class="size-[32px] relative shrink-0 flex items-center justify-center">
                  <img :src="FIGMA_ASSETS.landingAllProjects" alt="View all projects" class="size-full object-contain pointer-events-none" />
                </div>
              </button>
              <p class="font-707 text-[13px] md:text-[14px] text-black text-center leading-[18px] font-normal">
                All Projects
              </p>
            </div>
          </div>

          <!-- Standard 5 Action Hub Quick Buttons (When not Superadmin) -->
          <div v-else class="flex gap-[32px] md:gap-[40px] items-start justify-center px-[16px] py-[8px] w-full" data-node-id="198:6840" data-name="Buttons Container">
            <!-- 1. Create a new project (ACTIVE) -->
            <div class="flex flex-col gap-[10px] items-center justify-center w-[96px]" data-node-id="198:6926" data-name="Button Container">
              <button 
                @click="handleCreateNewProject"
                class="category-menu-btn apple-glass-btn backdrop-blur-[4px] bg-[rgba(236,236,236,0.85)] hover:bg-[#ececec] active:bg-[#e0e0e0] flex items-center justify-center p-[8px] rounded-[8px] size-[88px] apple-press cursor-pointer transition-all duration-200 group"
                data-node-id="198:6927"
                title="Create a fresh blank project"
              >
                <div class="size-[32px] relative shrink-0 flex items-center justify-center">
                  <img :src="FIGMA_ASSETS.landingCreateProject" alt="New project" class="size-full object-contain pointer-events-none" />
                </div>
              </button>
              <p class="font-707 text-[13px] md:text-[14px] text-black text-center leading-[18px] font-normal" data-node-id="198:6931">
                New Project
              </p>
            </div>

            <!-- 2. Browse Templates (COMING SOON) -->
            <div class="flex flex-col gap-[10px] items-center justify-center w-[96px]" data-node-id="198:6869" data-name="Button Container">
              <div class="relative size-[88px]">
                <button 
                  @click="triggerToast('Templates feature is coming soon in the next update.')"
                  class="category-menu-btn category-menu-btn-disabled apple-glass-btn backdrop-blur-[4px] bg-[rgba(236,236,236,0.45)] flex items-center justify-center p-[8px] rounded-[8px] size-full cursor-not-allowed opacity-60 hover:opacity-75 transition-all group"
                  data-node-id="198:6863"
                  title="Templates (Coming Soon)"
                >
                  <div class="size-[32px] relative shrink-0 flex items-center justify-center grayscale opacity-50">
                    <img :src="FIGMA_ASSETS.landingBrowseTemplates" alt="Templates" class="size-full object-contain pointer-events-none" />
                  </div>
                </button>
                <span class="absolute -top-1.5 -right-1.5 bg-black/80 text-white font-707 text-[8.5px] tracking-wider uppercase px-1.5 py-0.5 rounded-[4px] pointer-events-none shadow-xs font-medium">
                  Soon
                </span>
              </div>
              <p class="font-707 text-[13px] md:text-[14px] text-neutral-400 text-center leading-[18px] font-normal" data-node-id="198:6868">
                Templates
              </p>
            </div>

            <!-- 3. Create Event Registration (COMING SOON) -->
            <div class="flex flex-col gap-[10px] items-center justify-center w-[96px]" data-node-id="198:6933" data-name="Button Container">
              <div class="relative size-[88px]">
                <button 
                  @click="triggerToast('Event RSVP presets are coming soon in the next update.')"
                  class="category-menu-btn category-menu-btn-disabled apple-glass-btn backdrop-blur-[4px] bg-[rgba(236,236,236,0.45)] flex items-center justify-center p-[8px] rounded-[8px] size-full cursor-not-allowed opacity-60 hover:opacity-75 transition-all group"
                  data-node-id="198:6934"
                  title="Event RSVP (Coming Soon)"
                >
                  <div class="h-[32px] w-[28.5px] relative shrink-0 flex items-center justify-center grayscale opacity-50">
                    <img :src="FIGMA_ASSETS.landingEventRegistration" alt="Event RSVP" class="size-full object-contain pointer-events-none" />
                  </div>
                </button>
                <span class="absolute -top-1.5 -right-1.5 bg-black/80 text-white font-707 text-[8.5px] tracking-wider uppercase px-1.5 py-0.5 rounded-[4px] pointer-events-none shadow-xs font-medium">
                  Soon
                </span>
              </div>
              <p class="font-707 text-[13px] md:text-[14px] text-neutral-400 text-center leading-[18px] font-normal" data-node-id="198:6938">
                Event RSVP
              </p>
            </div>

            <!-- 4. e-Pass QR Ticketing (COMING SOON) -->
            <div class="flex flex-col gap-[10px] items-center justify-center w-[96px]" data-node-id="212:7004" data-name="Button Container">
              <div class="relative size-[88px]">
                <button 
                  @click="triggerToast('e-Pass Ticketing module is coming soon in the next update.')"
                  class="category-menu-btn category-menu-btn-disabled apple-glass-btn backdrop-blur-[4px] bg-[rgba(236,236,236,0.45)] flex items-center justify-center p-[8px] rounded-[8px] size-full cursor-not-allowed opacity-60 hover:opacity-75 transition-all group"
                  data-node-id="212:7005"
                  title="e-Pass Ticketing (Coming Soon)"
                >
                  <div class="size-[32px] relative shrink-0 flex items-center justify-center grayscale opacity-50">
                    <img :src="FIGMA_ASSETS.landingTicket" alt="e-Pass Ticketing" class="size-full object-contain pointer-events-none" />
                  </div>
                </button>
                <span class="absolute -top-1.5 -right-1.5 bg-black/80 text-white font-707 text-[8.5px] tracking-wider uppercase px-1.5 py-0.5 rounded-[4px] pointer-events-none shadow-xs font-medium">
                  Soon
                </span>
              </div>
              <p class="font-707 text-[13px] md:text-[14px] text-neutral-400 text-center leading-[18px] font-normal" data-node-id="212:7009">
                e-Pass Ticketing
              </p>
            </div>

            <!-- 5. View all projects (ACTIVE) -->
            <div class="flex flex-col gap-[10px] items-center justify-center w-[96px]" data-node-id="212:7037" data-name="Button Container">
              <button 
                @click="handleViewAllProjects"
                class="category-menu-btn apple-glass-btn backdrop-blur-[4px] bg-[rgba(236,236,236,0.85)] hover:bg-[#ececec] active:bg-[#e0e0e0] flex items-center justify-center p-[8px] rounded-[8px] size-[88px] apple-press cursor-pointer transition-all duration-200 group"
                data-node-id="212:7038"
                title="View all projects"
              >
                <div class="size-[32px] relative shrink-0 flex items-center justify-center">
                  <img :src="FIGMA_ASSETS.landingAllProjects" alt="All projects" class="size-full object-contain pointer-events-none" />
                </div>
              </button>
              <p class="font-707 text-[13px] md:text-[14px] text-black text-center leading-[18px] font-normal" data-node-id="212:7042">
                All Projects
              </p>
            </div>
          </div>
        </section>
      </div>

      <!-- Recent Projects List Section (Figma Node 212:7057) - Placed at bottom with 48px bottom padding -->
      <div class="absolute left-1/2 bottom-[48px] -translate-x-1/2 w-full max-w-[631px] px-4 pointer-events-auto">
        <section 
          ref="projectsSectionRef"
          class="flex flex-col items-start w-full shrink-0"
          data-node-id="212:7057"
          data-name="Project Info Container"
        >
          <!-- Fixed Scrollable Container for 2 Projects limit with Luxury Mask -->
          <div class="w-full h-[96px] overflow-y-auto pr-1 flex flex-col gap-[8px] luxury-scroll-mask overscroll-contain">
            <div 
              v-for="project in editorStore.userProjects"
              :key="project.id"
              class="flex items-center justify-between w-full py-1.5 hover:bg-black/[0.03] px-3 rounded-[10px] transition-all group cursor-pointer border border-transparent hover:border-black/5"
              data-name="Project Details Container"
              @click="openProject(project.id)"
            >
              <p class="font-707 text-[14px] text-black font-normal leading-[20px] whitespace-nowrap truncate max-w-[380px]">
                {{ project.title }}
              </p>
              <div class="flex gap-[12px] items-center justify-end shrink-0" data-name="Project Time Container">
                <p class="font-707 text-[11px] text-neutral-500 font-normal leading-[14px] whitespace-nowrap">
                  {{ editorStore.formatRelativeTime(project.updated_at) }}
                </p>
                <button 
                  class="border-black/10 hover:border-black/30 border-[0.5px] border-solid flex h-[32px] items-center justify-center px-[14px] rounded-[8px] shrink-0 bg-white/90 hover:bg-black hover:text-white transition-all apple-cta-btn cursor-pointer shadow-sm"
                  data-name="Save Info Container"
                  @click.stop="openProject(project.id)"
                >
                  <span class="font-707 text-[12px] font-light whitespace-nowrap">
                    Continue
                  </span>
                </button>
              </div>
            </div>

            <!-- Empty state fallback if no projects or signed out -->
            <div v-if="!editorStore.userProjects.length" class="h-full flex items-center justify-center text-neutral-400 font-707 text-[13px]">
              {{ authStore.isAuthenticated ? 'No brand projects found yet. Start with a new project above.' : 'Sign in to access your brand activations and projects.' }}
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- Footer Space -->
    <footer class="h-[24px] shrink-0 pointer-events-none" />

    <!-- Contact Team Modal -->
    <Transition name="apple-dock-fade">
      <div 
        v-if="showContactModal" 
        class="fixed inset-0 z-50 apple-frost-backdrop flex items-center justify-center p-4 transition-all animate-apple-fade select-none"
        @click.self="showContactModal = false"
      >
        <div class="apple-frost rounded-[12px] border border-black/10 p-6 w-full max-w-[420px] shadow-[0px_20px_50px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.05)] flex flex-col gap-4 animate-apple-pop">
          <div class="flex items-center justify-between">
            <h3 class="font-707 font-medium text-[16px] text-black">Contact Team</h3>
            <button 
              type="button"
              @click="showContactModal = false" 
              class="size-[24px] bg-black/5 hover:bg-black/10 active:bg-black/15 rounded-full flex items-center justify-center cursor-pointer transition-colors"
              title="Close"
            >
              <X class="w-3.5 h-3.5 text-black" />
            </button>
          </div>
          <p class="font-707 text-[13px] text-neutral-600 leading-relaxed">
            Need custom widgets, tailored brand activations, or design review? Reach out directly to the 707 Design Systems team.
          </p>
          <div class="bg-black/[0.03] p-3 rounded-lg border border-black/5 text-[12px] font-707 text-neutral-700">
            <strong>Lead Designer:</strong> uiux@707designstudio.internal<br />
            <strong>Slack:</strong> #707-design-studio-help
          </div>
          <button 
            @click="showContactModal = false" 
            class="w-full bg-black text-white font-707 font-medium text-[13px] h-[36px] rounded-[8px] apple-press cursor-pointer hover:bg-neutral-800 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </Transition>

    <!-- Notification Toast -->
    <Transition name="apple-dock-fade">
      <div 
        v-if="showNotificationToast" 
        class="fixed top-[64px] right-[24px] z-50 apple-frost border border-white/60 rounded-2xl p-4 shadow-[0px_12px_40px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.06)] flex items-center gap-3 animate-apple-slide-up select-none"
      >
        <div class="size-2 rounded-full bg-emerald-500 animate-ping" />
        <p class="font-707 text-[12px] text-black font-medium">{{ toastMessage }}</p>
        <button @click="showNotificationToast = false" class="text-neutral-400 hover:text-black ml-2 font-bold cursor-pointer">×</button>
      </div>
    </Transition>

    <!-- Setup Project Modal (Figma Node 212:7275) -->
    <SetupProjectModal 
      :is-open="showSetupModal"
      @close="showSetupModal = false"
    />

    <!-- All Projects Hub Modal (Option A) -->
    <AllProjectsModal
      :is-open="showAllProjectsModal"
      @close="showAllProjectsModal = false"
      @open-setup-modal="showSetupModal = true"
    />

    <!-- What's New in Design Studio 1.5 Introduction Modal -->
    <WhatsNewModal
      :is-open="showWhatsNewModal"
      @close="showWhatsNewModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useEditorStore } from '../stores/editorStore.ts';
import { useBrandStore } from '../stores/brandStore.ts';
import { useAuthStore } from '../stores/authStore.ts';
import { FIGMA_ASSETS } from '../constants/figmaAssets.ts';
import { User, X } from 'lucide-vue-next';
import NotificationsMenu from '../components/common/NotificationsMenu.vue';
import SetupProjectModal from '../components/modals/SetupProjectModal.vue';
import UserProfileModal from '../components/modals/UserProfileModal.vue';
import AllProjectsModal from '../components/modals/AllProjectsModal.vue';
import WhatsNewModal from '../components/modals/WhatsNewModal.vue';

const router = useRouter();
const route = useRoute();
const editorStore = useEditorStore();
const brandStore = useBrandStore();
const authStore = useAuthStore();

// App Version constant (easily bumped for future releases)
const APP_VERSION = '1.5';

const logoFailed = ref(false);
const showSetupModal = ref(false);
const showUserProfileModal = ref(false);
const showWhatsNewModal = ref(false);
const showContactModal = ref(false);
const showSettingsModal = ref(false);
const showAllProjectsModal = ref(false);
const showNotificationToast = ref(false);
const toastMessage = ref('All design systems and cloud sync are up to date.');
let toastTimer: any = null;
const projectsSectionRef = ref<HTMLElement | null>(null);


const userInitials = computed(() => {
  if (authStore.isSuperAdmin) return 'SA';
  const name = authStore.currentUser?.name || brandStore.activeBrand?.name || '';
  if (!name) return '707';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
});

// ----------------------------------------------------
// Adaptive Editorial Greeting Engine
// ----------------------------------------------------
const adaptiveGreeting = computed(() => {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay(); // 0 = Sun, 1 = Mon, ... 5 = Fri, 6 = Sat
  const isWeekend = day === 0 || day === 6;
  const isFriday = day === 5;
  const isMonday = day === 1;

  // Contextual user & brand parameters
  const user = authStore.currentUser;
  const isSuperAdmin = authStore.isSuperAdmin;
  const activeBrand = brandStore.activeBrand?.name || '';
  const firstName = user?.name ? user.name.trim().split(/\s+/)[0] : '';

  // Project health & state
  const userProjects = editorStore.projects;
  const liveCount = userProjects.filter(p => p.status === 'published' || p.status === 'approved' || (Number(p.live_version || 0) > 0)).length;
  const draftProject = userProjects.find(p => p.status === 'draft' || !p.status);

  // Rotation seed based on hour and day
  const seed = (hour + now.getDate() + (userProjects.length % 3)) % 4;

  // 1. Superadmin Suite Oversight
  if (isSuperAdmin) {
    const adminPhrases = [
      'All brand houses accounted for.',
      'From blueprint to live showcase.',
      'Studio oversight active.',
      'Command center ready.'
    ];
    return adminPhrases[seed % adminPhrases.length];
  }

  // 2. Active Draft awaiting continuation
  if (draftProject && seed === 3) {
    return `Pick up the thread on "${draftProject.title}".`;
  }

  // 3. Live Campaigns in the wild
  if (liveCount > 0 && seed === 2) {
    if (activeBrand) {
      return `${activeBrand} is live in the wild.`;
    }
    return `${liveCount} ${liveCount === 1 ? 'drop' : 'drops'} live in the wild.`;
  }

  // 4. Day-of-Week Drop Window Rhythms
  if (isFriday && (hour >= 11 && hour <= 21)) {
    const fridayPhrases = [
      'Friday drop window is open.',
      'It’s release day.',
      'The weekend crowd is waiting.'
    ];
    return fridayPhrases[seed % fridayPhrases.length];
  }

  if (isWeekend) {
    const weekendPhrases = [
      'Weekend showcase in motion.',
      'Doors are open.',
      'High footfall hours in the studio.'
    ];
    return weekendPhrases[seed % weekendPhrases.length];
  }

  if (isMonday && hour < 14) {
    const mondayPhrases = [
      'New week, blank canvas.',
      'Monday briefing on the runway.',
      'Fresh roadmap ahead.'
    ];
    return mondayPhrases[seed % mondayPhrases.length];
  }

  // 5. Time-of-Day Atmospheric Pools
  // Morning: 05:00 - 11:59
  if (hour >= 5 && hour < 12) {
    const morningPhrases = firstName ? [
      `Good morning, ${firstName}.`,
      'First light in the studio.',
      'Quiet morning, sharp ideas.',
      'The runway is clear.'
    ] : [
      'First light in the studio.',
      'The runway is clear.',
      'Quiet morning, sharp ideas.',
      'Coffee poured, studio open.'
    ];
    return morningPhrases[seed % morningPhrases.length];
  }

  // Afternoon: 12:00 - 17:59
  if (hour >= 12 && hour < 18) {
    const afternoonPhrases = firstName ? [
      `Good afternoon, ${firstName}.`,
      'Crafting culture in real time.',
      'Peak studio hours.',
      'From raw concept to the showroom floor.'
    ] : [
      'Build your next brand activation.',
      'Peak studio hours.',
      'Crafting culture in real time.',
      'From raw concept to the showroom floor.'
    ];
    return afternoonPhrases[seed % afternoonPhrases.length];
  }

  // Evening: 18:00 - 22:59
  if (hour >= 18 && hour < 23) {
    const eveningPhrases = firstName ? [
      `Good evening, ${firstName}.`,
      'Golden hour in the studio.',
      'Doors open soon.',
      'Nightfall on the runway.'
    ] : [
      'Golden hour in the studio.',
      'Nightfall on the runway.',
      'Doors open soon.',
      'The evening edit is in session.'
    ];
    return eveningPhrases[seed % eveningPhrases.length];
  }

  // Late Night: 23:00 - 04:59
  const nightPhrases = firstName ? [
    `Midnight in the studio, ${firstName}.`,
    'The studio is alive.',
    'After-hours curation.',
    'Burning the midnight oil.'
  ] : [
    'Midnight in the studio.',
    'The studio is alive.',
    'After-hours curation.',
    'Burning the midnight oil on the next release.'
  ];
  return nightPhrases[seed % nightPhrases.length];
});

function handleOpenWhatsNew() {
  showUserProfileModal.value = false;
  showWhatsNewModal.value = true;
}

function handleOpenSettings() {
  if (authStore.isSuperAdmin) {
    router.push('/dev');
  } else {
    router.push('/dev');
  }
}

function triggerToast(msg: string) {
  if (toastTimer) clearTimeout(toastTimer);
  toastMessage.value = msg;
  showNotificationToast.value = true;
  toastTimer = setTimeout(() => {
    showNotificationToast.value = false;
  }, 3500);
}

onMounted(() => {
  editorStore.loadProjects();
  if (route.query.signin === '1') {
    router.replace({ path: '/login', query: route.query.redirect ? { redirect: route.query.redirect } : {} });
  }

  // First-time visit: automatically show Design Studio 1.5 What's New modal
  try {
    const hasSeenWhatsNew = localStorage.getItem('707_seen_whats_new_1_5');
    if (!hasSeenWhatsNew || route.query.whatsnew === '1') {
      showWhatsNewModal.value = true;
      if (route.query.whatsnew === '1') {
        router.replace({ query: { ...route.query, whatsnew: undefined } });
      }
    }
  } catch {
    showWhatsNewModal.value = true;
  }
});

// A session can expire while this page is already open; the query then
// changes without a remount.
watch(() => route.query.signin, (v) => {
  if (v === '1') {
    router.replace({ path: '/login', query: route.query.redirect ? { redirect: route.query.redirect } : {} });
  }
});

watch(() => route.query.whatsnew, (v) => {
  if (v === '1') {
    showWhatsNewModal.value = true;
    router.replace({ query: { ...route.query, whatsnew: undefined } });
  }
});

watch(() => route.query.projects, (v) => {
  if (v === '1') {
    requireAuth(() => {
      showAllProjectsModal.value = true;
    });
    router.replace({ query: { ...route.query, projects: undefined } });
  }
});

async function handleSignedIn(brandName: string) {
  triggerToast(`Welcome! Signed in as ${brandName}.`);
  await editorStore.loadProjects();
  // Back to where the expired session left off (e.g. the open project).
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '';
  if (redirect.startsWith('/') && !redirect.startsWith('//')) {
    router.push(redirect);
  } else if (route.query.signin) {
    router.replace({ query: {} });
  }
}

function handleAnalytics() {
  showUserProfileModal.value = false;
  router.push('/hub');
}

function handleSignOut() {
  showUserProfileModal.value = false;
  authStore.signOut();
  brandStore.setActiveBrand(null);
  triggerToast('Signed out of 707 Design Studio.');
}

function requireAuth(action: () => void) {
  if (!authStore.isAuthenticated) {
    router.push({ path: '/login', query: { redirect: route.fullPath } });
    return;
  }
  action();
}

function handleLogoError() {
  logoFailed.value = true;
}

function handleCreateNewProject() {
  requireAuth(() => {
    showSetupModal.value = true;
  });
}

function handleCreateNewTemplate() {
  requireAuth(() => {
    router.push('/superadmin?tab=templates&action=new-template');
  });
}

function handleBrowseTemplates() {
  requireAuth(() => {
    if (authStore.isSuperAdmin) {
      router.push('/superadmin?tab=templates');
      return;
    }
    // Navigate to editor with standard multi-block template
    editorStore.createNewProject('Featured Brand Activation', 'featured-brand-activation', [
      {
        id: 'hero_template_1',
        type: 'HeroDrop',
        props: {
          ratio: '4:5',
          title: '707 EXCLUSIVE DROP',
          headline: 'SUMMER RUN 2026',
          subtitle: 'LIMITED ALLOCATION'
        }
      },
      {
        id: 'text_template_1',
        type: 'TextBanner',
        props: {
          text: 'SECURE YOUR EXCLUSIVE PAIR',
          placeholder: 'WRITE YOUR TEXT HERE',
          typographyStyle: 'headline-1'
        }
      },
      {
        id: 'raffle_template_1',
        type: 'RaffleForm',
        props: {
          heading: 'ENTER RAFFLE DETAILS'
        }
      }
    ]);
    editorStore.triggerProjectLoading(3000);
    router.push('/editor');
  });
}

function handleCreateEventRegistration() {
  requireAuth(() => {
    // Start with Event RSVP form template
    editorStore.createNewProject('VIP Event RSVP Registration', 'vip-event-rsvp', [
      {
        id: 'hero_event_1',
        type: 'HeroDrop',
        props: {
          ratio: '16:9',
          title: '707 VIP GALA',
          headline: 'ACTIVATION LAUNCH',
          subtitle: 'INVITATION ONLY'
        }
      },
      {
        id: 'text_event_1',
        type: 'TextBanner',
        props: {
          text: 'RESERVE YOUR SEAT',
          placeholder: 'WRITE YOUR TEXT HERE',
          typographyStyle: 'headline-1'
        }
      },
      {
        id: 'raffle_event_1',
        type: 'RaffleForm',
        props: {
          heading: 'GUEST REGISTRATION'
        }
      },
      {
        id: 'loc_event_1',
        type: 'LocationCard',
        props: {
          venueName: '707 Space Jakarta',
          address: 'Jl. Kemang Raya No. 707, Jakarta Selatan'
        }
      }
    ]);
    editorStore.triggerProjectLoading(3000);
    router.push('/editor');
  });
}

function handleCreateTicketing() {
  requireAuth(() => {
    // Start with e-Pass QR Ticketing template
    editorStore.createNewProject('e-Pass QR Access Pass', 'epass-qr-ticketing', [
      {
        id: 'hero_ticket_1',
        type: 'HeroDrop',
        props: {
          ratio: '3:4',
          title: 'ACCESS PASS',
          headline: 'GATE 01 ENTRY',
          subtitle: 'SCAN AT VENUE'
        }
      },
      {
        id: 'ticket_action_1',
        type: 'PassCTA',
        props: {
          ctaLabel: 'CLAIM DIGITAL PASS',
          quotaRemaining: 150
        }
      },
      {
        id: 'rules_ticket_1',
        type: 'RulesAccordion',
        props: {
          title: 'ENTRY CONDITIONS',
          items: [
            { title: 'VALID ID REQUIRED', content: 'Present matching government-issued identification at gate.' },
            { title: 'NON-TRANSFERABLE', content: 'Pass is strictly tied to verified RSVP account.' }
          ]
        }
      }
    ]);
    editorStore.triggerProjectLoading(3000);
    router.push('/editor');
  });
}

function handleViewAllProjects() {
  requireAuth(() => {
    showAllProjectsModal.value = true;
  });
}

function openProject(projectId: string) {
  requireAuth(() => {
    editorStore.openProjectById(projectId);
    editorStore.triggerProjectLoading(3000);
    router.push('/editor');
  });
}
</script>

<style scoped>
/* Hidden container in default state for icon category menu (ultra-clean, minimal aesthetic) */
.category-menu-btn {
  background-color: transparent !important;
  border: 0.5px solid transparent !important;
  box-shadow: none !important;
}

.category-menu-btn:hover:not(.category-menu-btn-disabled) {
  background-color: rgba(236, 236, 236, 0.85) !important;
  border-color: rgba(0, 0, 0, 0.1) !important;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.04) !important;
}

.category-menu-btn:active:not(.category-menu-btn-disabled) {
  background-color: #e0e0e0 !important;
}

.category-menu-btn-disabled {
  background-color: transparent !important;
  border: 0.5px solid transparent !important;
  box-shadow: none !important;
}

.category-menu-btn-disabled:hover {
  background-color: rgba(236, 236, 236, 0.5) !important;
  border-color: rgba(0, 0, 0, 0.06) !important;
}
</style>
