<template>
  <div class="h-screen w-screen overflow-hidden flex flex-col justify-between bg-[#f5f5f5] text-black font-sans relative select-none">
    <!-- 1. Main Header (Consistent 48px Header Height with Editor) -->
    <header 
      class="absolute top-0 left-0 right-0 w-full h-[48px] px-[20px] flex items-center justify-between z-40 bg-transparent shrink-0"
      data-node-id="198:6791"
      data-name="Header"
    >
      <!-- Left: 707 Logo & Sub-Brand Studio Identifier (Figma Node 198:6792) -->
      <div class="flex items-center gap-[16px]" data-node-id="198:6792" data-name="Logo">
        <router-link to="/" class="h-[15px] w-[48px] relative shrink-0 flex items-center cursor-pointer" title="707 Home">
          <img 
            :src="FIGMA_ASSETS.logo707" 
            alt="707 Logo" 
            class="inset-0 object-contain pointer-events-none size-full"
            @error="handleLogoError"
          />
          <span v-if="logoFailed" class="font-black text-black text-xs tracking-tighter">707</span>
        </router-link>
        <p class="font-707 text-[13px] md:text-[14px] text-black tracking-[4.03px] font-normal uppercase whitespace-nowrap leading-[18px]">
          DESIGN STUDIO {{ APP_VERSION }}
        </p>
      </div>

      <!-- Right: Notification, Settings, User ID, Contact Button (Figma Node 198:6798) -->
      <div class="flex items-center gap-[24px] md:gap-[28px]" data-node-id="198:6798" data-name="Icons Container">
        <!-- Notification Icon -->
        <button 
          @click="showNotificationToast = true"
          class="relative size-[24px] flex items-center justify-center apple-press cursor-pointer hover:opacity-75 transition-opacity border-0 border-none outline-none bg-transparent shadow-none p-0"
          title="Notifications"
          data-node-id="210:6959"
        >
          <img :src="FIGMA_ASSETS.landingNotification" alt="Notifications" class="size-full object-contain pointer-events-none" />
        </button>

        <!-- Settings Gear Icon -->
        <button 
          @click="showSettingsModal = true"
          class="relative size-[24px] flex items-center justify-center apple-press cursor-pointer hover:opacity-75 transition-opacity border-0 border-none outline-none bg-transparent shadow-none p-0"
          title="Settings"
          data-node-id="210:6965"
        >
          <img :src="FIGMA_ASSETS.landingSettings" alt="Settings" class="size-full object-contain pointer-events-none" />
        </button>

        <!-- User Info Container (Avatar + Brand ID Pill) with anchored UserProfileModal pop up -->
        <div class="relative">
          <div 
            @click="showUserProfileModal = !showUserProfileModal"
            class="flex items-center gap-[8px] cursor-pointer hover:opacity-80 transition-opacity apple-press" 
            data-name="User Info Container"
            title="User Profile"
          >
            <div class="size-[27px] rounded-full overflow-hidden shrink-0 border-[0.5px] border-black/10">
              <img :src="FIGMA_ASSETS.landingAvatar" alt="User Avatar" class="size-full object-cover" />
            </div>
            <div class="border-[#d9d9d9] border-[0.5px] border-solid flex h-[26px] items-center justify-center px-[8px] rounded-[10px] shrink-0 bg-white/40">
              <p class="font-707 text-[12px] text-black font-light whitespace-nowrap">
                {{ brandStore.activeBrand?.slug ? brandStore.activeBrand.slug + ' ID' : 'atmos ID' }}
              </p>
            </div>
          </div>

          <!-- User Profile Pop Up Modal (Figma Node 212:8894) anchored directly to profile button -->
          <UserProfileModal
            :is-open="showUserProfileModal"
            @close="showUserProfileModal = false"
            @open-analytics="handleAnalytics"
            @open-settings="showSettingsModal = true"
            @sign-out="handleSignOut"
          />
        </div>

        <!-- Contact UI/UX Team Button (Figma Node 198:6800) -->
        <button 
          @click="showContactModal = true"
          class="apple-glass-btn-dark bg-black text-white px-[14px] h-[32px] rounded-[4px] text-[14px] font-medium border-[0.5px] border-black apple-press cursor-pointer hover:bg-neutral-800 transition-colors shadow-sm flex items-center justify-center whitespace-nowrap"
          data-node-id="198:6800"
        >
          Contact UI/UX Team
        </button>
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
          <h1 class="font-707 text-[28px] md:text-[30px] font-normal text-black text-center tracking-[-0.56px] leading-[34px] whitespace-nowrap" data-node-id="198:6839">
            Hello Fellas! Let’s build something cool.
          </h1>

          <!-- 5 Action Hub Quick Buttons (Figma Node 198:6840) -->
          <div class="flex gap-[32px] md:gap-[40px] items-start justify-center px-[16px] py-[8px] w-full" data-node-id="198:6840" data-name="Buttons Container">
            <!-- 1. Create a new project -->
            <div class="flex flex-col gap-[10px] items-center justify-center w-[96px]" data-node-id="198:6926" data-name="Button Container">
              <button 
                @click="handleCreateNewProject"
                class="apple-glass-btn backdrop-blur-[4px] bg-[rgba(236,236,236,0.85)] hover:bg-[#ececec] active:bg-[#e0e0e0] border-[0.5px] border-black/10 hover:border-black/25 flex items-center justify-center p-[8px] rounded-[8px] size-[88px] shadow-[0_2px_8px_rgba(0,0,0,0.02)] apple-press cursor-pointer transition-all duration-200 group"
                data-node-id="198:6927"
                title="Create a fresh blank project"
              >
                <div class="size-[32px] relative shrink-0 flex items-center justify-center">
                  <img :src="FIGMA_ASSETS.landingCreateProject" alt="Create new project" class="size-full object-contain pointer-events-none" />
                </div>
              </button>
              <p class="font-707 text-[13px] md:text-[14px] text-black text-center leading-[18px] font-normal" data-node-id="198:6931">
                Create a new project
              </p>
            </div>

            <!-- 2. Browse Templates -->
            <div class="flex flex-col gap-[10px] items-center justify-center w-[96px]" data-node-id="198:6869" data-name="Button Container">
              <button 
                @click="handleBrowseTemplates"
                class="apple-glass-btn backdrop-blur-[4px] bg-[rgba(236,236,236,0.85)] hover:bg-[#ececec] active:bg-[#e0e0e0] border-[0.5px] border-black/10 hover:border-black/25 flex items-center justify-center p-[8px] rounded-[8px] size-[88px] shadow-[0_2px_8px_rgba(0,0,0,0.02)] apple-press cursor-pointer transition-all duration-200 group"
                data-node-id="198:6863"
                title="Browse pre-built activation templates"
              >
                <div class="size-[32px] relative shrink-0 flex items-center justify-center">
                  <img :src="FIGMA_ASSETS.landingBrowseTemplates" alt="Browse Templates" class="size-full object-contain pointer-events-none" />
                </div>
              </button>
              <p class="font-707 text-[13px] md:text-[14px] text-black text-center leading-[18px] font-normal" data-node-id="198:6868">
                Browse Templates
              </p>
            </div>

            <!-- 3. Create Event Registration -->
            <div class="flex flex-col gap-[10px] items-center justify-center w-[96px]" data-node-id="198:6933" data-name="Button Container">
              <button 
                @click="handleCreateEventRegistration"
                class="apple-glass-btn backdrop-blur-[4px] bg-[rgba(236,236,236,0.85)] hover:bg-[#ececec] active:bg-[#e0e0e0] border-[0.5px] border-black/10 hover:border-black/25 flex items-center justify-center p-[8px] rounded-[8px] size-[88px] shadow-[0_2px_8px_rgba(0,0,0,0.02)] apple-press cursor-pointer transition-all duration-200 group"
                data-node-id="198:6934"
                title="Start with Event RSVP form template"
              >
                <div class="h-[32px] w-[28.5px] relative shrink-0 flex items-center justify-center">
                  <img :src="FIGMA_ASSETS.landingEventRegistration" alt="Event Registration" class="size-full object-contain pointer-events-none" />
                </div>
              </button>
              <p class="font-707 text-[13px] md:text-[14px] text-black text-center leading-[18px] font-normal" data-node-id="198:6938">
                Create Event Registration
              </p>
            </div>

            <!-- 4. e-Pass QR Ticketing -->
            <div class="flex flex-col gap-[10px] items-center justify-center w-[96px]" data-node-id="212:7004" data-name="Button Container">
              <button 
                @click="handleCreateTicketing"
                class="apple-glass-btn backdrop-blur-[4px] bg-[rgba(236,236,236,0.85)] hover:bg-[#ececec] active:bg-[#e0e0e0] border-[0.5px] border-black/10 hover:border-black/25 flex items-center justify-center p-[8px] rounded-[8px] size-[88px] shadow-[0_2px_8px_rgba(0,0,0,0.02)] apple-press cursor-pointer transition-all duration-200 group"
                data-node-id="212:7005"
                title="Start with QR ticketing activation"
              >
                <div class="size-[32px] relative shrink-0 flex items-center justify-center">
                  <img :src="FIGMA_ASSETS.landingTicket" alt="e-Pass QR Ticketing" class="size-full object-contain pointer-events-none" />
                </div>
              </button>
              <p class="font-707 text-[13px] md:text-[14px] text-black text-center leading-[18px] font-normal" data-node-id="212:7009">
                e-Pass QR Ticketing
              </p>
            </div>

            <!-- 5. View all projects -->
            <div class="flex flex-col gap-[10px] items-center justify-center w-[96px]" data-node-id="212:7037" data-name="Button Container">
              <button 
                @click="handleViewAllProjects"
                class="apple-glass-btn backdrop-blur-[4px] bg-[rgba(236,236,236,0.85)] hover:bg-[#ececec] active:bg-[#e0e0e0] border-[0.5px] border-black/10 hover:border-black/25 flex items-center justify-center p-[8px] rounded-[8px] size-[88px] shadow-[0_2px_8px_rgba(0,0,0,0.02)] apple-press cursor-pointer transition-all duration-200 group"
                data-node-id="212:7038"
                title="View all saved projects"
              >
                <div class="size-[32px] relative shrink-0 flex items-center justify-center">
                  <img :src="FIGMA_ASSETS.landingAllProjects" alt="View all projects" class="size-full object-contain pointer-events-none" />
                </div>
              </button>
              <p class="font-707 text-[13px] md:text-[14px] text-black text-center leading-[18px] font-normal" data-node-id="212:7042">
                View all projects
              </p>
            </div>
          </div>
        </section>
      </div>

      <!-- Recent Projects List Section (Figma Node 212:7057) - Fixed position anchored below centered hero -->
      <div class="absolute left-1/2 top-[calc(50%+115px)] -translate-x-1/2 w-full max-w-[631px] px-4 pointer-events-auto">
        <section 
          ref="projectsSectionRef"
          class="flex flex-col items-start w-full shrink-0"
          data-node-id="212:7057"
          data-name="Project Info Container"
        >
          <!-- Fixed Scrollable Container for 2 Projects limit with Luxury Mask -->
          <div class="w-full h-[96px] overflow-y-auto pr-1 flex flex-col gap-[8px] luxury-scroll-mask overscroll-contain">
            <div 
              v-for="project in editorStore.projects"
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
                  class="border-[#d9d9d9] hover:border-black/30 border-[0.5px] border-solid flex h-[32px] items-center justify-center px-[14px] rounded-[8px] shrink-0 bg-white/90 hover:bg-black hover:text-white transition-all apple-cta-btn cursor-pointer shadow-sm"
                  data-name="Save Info Container"
                  @click.stop="openProject(project.id)"
                >
                  <span class="font-707 text-[12px] font-light whitespace-nowrap">
                    Continue
                  </span>
                </button>
              </div>
            </div>

            <!-- Empty state fallback if no projects -->
            <div v-if="!editorStore.projects.length" class="h-full flex items-center justify-center text-neutral-400 font-707 text-[13px]">
              No projects yet. Click "Create a new project" to begin.
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- Footer Space -->
    <footer class="h-[24px] shrink-0 pointer-events-none" />

    <!-- Contact UI/UX Modal -->
    <Transition name="apple-dock-fade">
      <div 
        v-if="showContactModal" 
        class="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 transition-all animate-apple-fade"
        @click.self="showContactModal = false"
      >
        <div class="bg-white rounded-[16px] border border-black/10 p-6 w-full max-w-[420px] shadow-2xl flex flex-col gap-4 animate-apple-pop">
          <div class="flex items-center justify-between">
            <h3 class="font-707 font-medium text-[16px] text-black">Contact UI/UX Team</h3>
            <button @click="showContactModal = false" class="text-neutral-400 hover:text-black text-xl font-bold">×</button>
          </div>
          <p class="font-707 text-[13px] text-neutral-600 leading-relaxed">
            Need custom widgets, tailored brand activations, or design review? Reach out directly to the 707 Design Systems team.
          </p>
          <div class="bg-[#f5f5f5] p-3 rounded-lg border border-black/5 text-[12px] font-707 text-neutral-700">
            <strong>Lead Designer:</strong> uiux@707designstudio.internal<br />
            <strong>Slack:</strong> #707-design-studio-help
          </div>
          <button 
            @click="showContactModal = false" 
            class="w-full bg-black text-white font-707 font-medium text-[13px] h-[36px] rounded-lg apple-press cursor-pointer"
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
        class="fixed top-[64px] right-[24px] z-50 bg-white border border-black/10 rounded-xl p-4 shadow-xl flex items-center gap-3 animate-apple-slide-up"
      >
        <div class="size-2 rounded-full bg-emerald-500 animate-ping" />
        <p class="font-707 text-[12px] text-black">All design systems and cloud sync are up to date.</p>
        <button @click="showNotificationToast = false" class="text-neutral-400 hover:text-black ml-2 font-bold">×</button>
      </div>
    </Transition>

    <!-- Setup Project Modal (Figma Node 212:7275) -->
    <SetupProjectModal 
      :is-open="showSetupModal"
      @close="showSetupModal = false"
    />

    <!-- Brand Sign In Modal (Figma Node 212:7461) -->
    <BrandSignInModal
      :is-open="showSignInModal"
      @close="showSignInModal = false"
      @signed-in="handleSignedIn"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useEditorStore } from '../stores/editorStore.ts';
import { useBrandStore } from '../stores/brandStore.ts';
import { FIGMA_ASSETS } from '../constants/figmaAssets.ts';
import SetupProjectModal from '../components/modals/SetupProjectModal.vue';
import BrandSignInModal from '../components/modals/BrandSignInModal.vue';
import UserProfileModal from '../components/modals/UserProfileModal.vue';

const router = useRouter();
const editorStore = useEditorStore();
const brandStore = useBrandStore();

// App Version constant (easily bumped for future releases)
const APP_VERSION = '1.0';

const logoFailed = ref(false);
const showSetupModal = ref(false);
const showUserProfileModal = ref(false);
const showSignInModal = ref(false);
const showContactModal = ref(false);
const showSettingsModal = ref(false);
const showNotificationToast = ref(false);
const projectsSectionRef = ref<HTMLElement | null>(null);

onMounted(() => {
  editorStore.loadProjects();
});

function handleSignedIn(brandName: string) {
  showNotificationToast.value = true;
}

function handleAnalytics() {
  alert('707 Analytics: Campaign conversions, RSVP rate, and traffic analytics dashboard is up to date.');
}

function handleSignOut() {
  showSignInModal.value = true;
}

function handleLogoError() {
  logoFailed.value = true;
}

function handleCreateNewProject() {
  showSetupModal.value = true;
}

function handleBrowseTemplates() {
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
}

function handleCreateEventRegistration() {
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
}

function handleCreateTicketing() {
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
}

function handleViewAllProjects() {
  if (projectsSectionRef.value) {
    projectsSectionRef.value.scrollIntoView({ behavior: 'smooth' });
  }
}

function openProject(projectId: string) {
  editorStore.openProjectById(projectId);
  editorStore.triggerProjectLoading(3000);
  router.push('/editor');
}
</script>
