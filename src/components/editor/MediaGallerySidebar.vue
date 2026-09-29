<template>
  <!-- Add Media Side Drawer / Media Gallery (Figma Node 171:5023) -->
  <aside 
    v-if="isOpen"
    @click.stop
    @wheel.stop
    class="absolute left-[24px] top-[16px] bottom-[84px] w-[464px] backdrop-blur-2xl bg-[rgba(255,255,255,0.92)] border border-black/8 content-stretch flex flex-col items-start overflow-y-auto pb-[32px] rounded-[12px] shadow-[0px_20px_50px_0px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.05)] z-40 select-none transition-all animate-apple-slide-left"
    data-node-id="171:5023"
    data-name="Media Gallery Sidebar"
  >
    <!-- Header Section (Figma Node 171:5024) -->
    <div class="content-stretch flex flex-col gap-[6px] items-start p-[24px] shrink-0 w-full border-b border-[#f0f0f0]">
      <div class="content-stretch flex items-center justify-between shrink-0 w-full" data-node-id="171:5025">
        <p class="font-707 font-medium text-[16px] leading-[22px] text-black whitespace-nowrap" data-node-id="171:5026">
          Media Gallery
        </p>
        <button 
          @click="$emit('close')"
          class="apple-glass-icon-btn size-7 flex items-center justify-center rounded-full cursor-pointer"
          title="Close Media Gallery"
        >
          <img :src="FIGMA_ASSETS.closeIcon" class="w-3.5 h-3.5" alt="Close" />
        </button>
      </div>
      <p class="font-707 font-normal text-[12px] leading-[16px] text-neutral-500" data-node-id="171:5029">
        Browse and manage your campaign assets
      </p>
    </div>

    <!-- Smart Category Filter Tabs (Figma Node 171:5056 & 171:5059) -->
    <div class="content-stretch flex flex-col gap-[16px] items-start py-[16px] shrink-0 w-full border-b border-[#f0f0f0]">
      <div class="flex gap-[8px] items-center px-[24px] overflow-x-auto w-full no-scrollbar pb-1">
        <button
          v-for="cat in categories"
          :key="cat"
          @click="activeCategory = cat"
          :class="activeCategory === cat ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
          class="shrink-0 whitespace-nowrap flex h-[34px] items-center justify-center px-[14px] py-[6px] rounded-[8px] text-[12px] font-707 cursor-pointer"
        >
          {{ cat }}
        </button>
      </div>
    </div>

    <!-- Asymmetrical Bento Grid Image Thumbnails (Figma Node 171:5072 & 171:5074) -->
    <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full flex-1">
      <div class="flex items-center justify-between w-full">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
          {{ activeCategory === 'All' ? 'All Campaign Assets' : activeCategory }}
        </p>
        <span class="font-707 text-[11px] text-neutral-400">
          {{ filteredMedia.length }} items (drag or click to use)
        </span>
      </div>

      <!-- Bento Asymmetrical Layout Structure -->
      <div class="w-full flex flex-col gap-[14px]">
        <!-- Top Bento Tier (Hero Tall + 2x2 Stack + Dual Slim) -->
        <div class="w-full flex gap-[10px] items-start justify-between min-h-[206px]">
          <!-- Bento 1: Large Tall Portrait Card (154px) -->
          <div 
            v-if="filteredMedia[0]"
            draggable="true"
            @dragstart="handleMediaDragStart($event, filteredMedia[0])"
            @click="applyMediaToArtboard(filteredMedia[0])"
            class="group relative h-[206px] w-[154px] rounded-[8px] overflow-hidden bg-[#d9d9d9] cursor-grab active:cursor-grabbing border border-transparent hover:border-black/30 hover:shadow-md transition-all shrink-0"
            :title="`Click or drag ${filteredMedia[0].title}`"
          >
            <img 
              :src="filteredMedia[0].url" 
              :alt="filteredMedia[0].title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <!-- Hover Delete Button -->
            <button 
              type="button"
              @click.stop="handleRemoveMedia(filteredMedia[0].id)" 
              class="absolute top-2 right-2 size-6 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-150 backdrop-blur-sm shadow-md cursor-pointer z-30"
              title="Remove asset"
            >
              <Trash2 class="size-3 text-white" />
            </button>
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 pointer-events-none">
              <span class="text-white font-707 text-[11px] font-medium leading-tight truncate">{{ filteredMedia[0].title }}</span>
              <span class="text-white/80 font-707 text-[9px] uppercase tracking-wider">{{ filteredMedia[0].category }}</span>
            </div>
          </div>

          <!-- Bento Center: 2 Compact Top Cards + 1 Wide Bottom Card (160px) -->
          <div class="flex flex-col gap-[10px] h-[206px] w-[160px] shrink-0">
            <!-- 2 Compact Top Cards -->
            <div class="flex gap-[8px] w-full h-[98px]">
              <!-- Bento 2 -->
              <div 
                v-if="filteredMedia[1]"
                draggable="true"
                @dragstart="handleMediaDragStart($event, filteredMedia[1])"
                @click="applyMediaToArtboard(filteredMedia[1])"
                class="group relative flex-1 h-full rounded-[8px] overflow-hidden bg-[#d9d9d9] cursor-grab active:cursor-grabbing border border-transparent hover:border-black/30 hover:shadow-md transition-all"
                :title="`Click or drag ${filteredMedia[1].title}`"
              >
                <img 
                  :src="filteredMedia[1].url" 
                  :alt="filteredMedia[1].title"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <!-- Hover Delete Button -->
                <button 
                  type="button"
                  @click.stop="handleRemoveMedia(filteredMedia[1].id)" 
                  class="absolute top-1.5 right-1.5 size-5 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-150 backdrop-blur-sm shadow-md cursor-pointer z-30"
                  title="Remove asset"
                >
                  <Trash2 class="size-2.5 text-white" />
                </button>
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1 text-center pointer-events-none">
                  <span class="text-white font-707 text-[10px] font-medium leading-tight truncate">{{ filteredMedia[1].title }}</span>
                </div>
              </div>

              <!-- Bento 3 -->
              <div 
                v-if="filteredMedia[2]"
                draggable="true"
                @dragstart="handleMediaDragStart($event, filteredMedia[2])"
                @click="applyMediaToArtboard(filteredMedia[2])"
                class="group relative flex-1 h-full rounded-[8px] overflow-hidden bg-[#d9d9d9] cursor-grab active:cursor-grabbing border border-transparent hover:border-black/30 hover:shadow-md transition-all"
                :title="`Click or drag ${filteredMedia[2].title}`"
              >
                <img 
                  :src="filteredMedia[2].url" 
                  :alt="filteredMedia[2].title"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <!-- Hover Delete Button -->
                <button 
                  type="button"
                  @click.stop="handleRemoveMedia(filteredMedia[2].id)" 
                  class="absolute top-1.5 right-1.5 size-5 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-150 backdrop-blur-sm shadow-md cursor-pointer z-30"
                  title="Remove asset"
                >
                  <Trash2 class="size-2.5 text-white" />
                </button>
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1 text-center pointer-events-none">
                  <span class="text-white font-707 text-[10px] font-medium leading-tight truncate">{{ filteredMedia[2].title }}</span>
                </div>
              </div>
            </div>

            <!-- Bento 4: 1 Wide Bottom Landscape Card -->
            <div 
              v-if="filteredMedia[3]"
              draggable="true"
              @dragstart="handleMediaDragStart($event, filteredMedia[3])"
              @click="applyMediaToArtboard(filteredMedia[3])"
              class="group relative w-full h-[98px] rounded-[8px] overflow-hidden bg-[#d9d9d9] cursor-grab active:cursor-grabbing border border-transparent hover:border-black/30 hover:shadow-md transition-all shrink-0"
              :title="`Click or drag ${filteredMedia[3].title}`"
            >
              <img 
                :src="filteredMedia[3].url" 
                :alt="filteredMedia[3].title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <!-- Hover Delete Button -->
              <button 
                type="button"
                @click.stop="handleRemoveMedia(filteredMedia[3].id)" 
                class="absolute top-2 right-2 size-6 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-150 backdrop-blur-sm shadow-md cursor-pointer z-30"
                title="Remove asset"
              >
                <Trash2 class="size-3 text-white" />
              </button>
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 pointer-events-none">
                <span class="text-white font-707 text-[11px] font-medium leading-tight truncate">{{ filteredMedia[3].title }}</span>
              </div>
            </div>
          </div>

          <!-- Bento Right: Dual Stacked Slim Cards (84px) -->
          <div class="flex flex-col gap-[10px] h-[206px] w-[84px] shrink-0">
            <!-- Bento 5 -->
            <div 
              v-if="filteredMedia[4]"
              draggable="true"
              @dragstart="handleMediaDragStart($event, filteredMedia[4])"
              @click="applyMediaToArtboard(filteredMedia[4])"
              class="group relative w-full h-[98px] rounded-[8px] overflow-hidden bg-[#d9d9d9] cursor-grab active:cursor-grabbing border border-transparent hover:border-black/30 hover:shadow-md transition-all"
              :title="`Click or drag ${filteredMedia[4].title}`"
            >
              <img 
                :src="filteredMedia[4].url" 
                :alt="filteredMedia[4].title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <!-- Hover Delete Button -->
              <button 
                type="button"
                @click.stop="handleRemoveMedia(filteredMedia[4].id)" 
                class="absolute top-1.5 right-1.5 size-5 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-150 backdrop-blur-sm shadow-md cursor-pointer z-30"
                title="Remove asset"
              >
                <Trash2 class="size-2.5 text-white" />
              </button>
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1 text-center pointer-events-none">
                <span class="text-white font-707 text-[9px] font-medium leading-tight truncate">{{ filteredMedia[4].title }}</span>
              </div>
            </div>

            <!-- Bento 6 -->
            <div 
              v-if="filteredMedia[5]"
              draggable="true"
              @dragstart="handleMediaDragStart($event, filteredMedia[5])"
              @click="applyMediaToArtboard(filteredMedia[5])"
              class="group relative w-full h-[98px] rounded-[8px] overflow-hidden bg-[#d9d9d9] cursor-grab active:cursor-grabbing border border-transparent hover:border-black/30 hover:shadow-md transition-all"
              :title="`Click or drag ${filteredMedia[5].title}`"
            >
              <img 
                :src="filteredMedia[5].url" 
                :alt="filteredMedia[5].title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <!-- Hover Delete Button -->
              <button 
                type="button"
                @click.stop="handleRemoveMedia(filteredMedia[5].id)" 
                class="absolute top-1.5 right-1.5 size-5 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-150 backdrop-blur-sm shadow-md cursor-pointer z-30"
                title="Remove asset"
              >
                <Trash2 class="size-2.5 text-white" />
              </button>
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1 text-center pointer-events-none">
                <span class="text-white font-707 text-[9px] font-medium leading-tight truncate">{{ filteredMedia[5].title }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Secondary Bento Grid for Remaining Filtered Assets -->
        <div v-if="filteredMedia.length > 6" class="grid grid-cols-3 gap-[10px] w-full pt-2">
          <div 
            v-for="item in filteredMedia.slice(6)"
            :key="item.id"
            draggable="true"
            @dragstart="handleMediaDragStart($event, item)"
            @click="applyMediaToArtboard(item)"
            class="group relative aspect-square rounded-[8px] overflow-hidden bg-[#d9d9d9] cursor-grab active:cursor-grabbing border border-transparent hover:border-black/30 hover:shadow-md transition-all"
            :title="`Click or drag ${item.title}`"
          >
            <img 
              :src="item.url" 
              :alt="item.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <!-- Hover Delete Button -->
            <button 
              type="button"
              @click.stop="handleRemoveMedia(item.id)" 
              class="absolute top-2 right-2 size-6 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-150 backdrop-blur-sm shadow-md cursor-pointer z-30"
              title="Remove asset"
            >
              <Trash2 class="size-3 text-white" />
            </button>
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 text-left pointer-events-none">
              <span class="text-white font-707 text-[10px] font-medium leading-tight truncate">{{ item.title }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Custom Media Action Bar (Sticky Bottom inside Drawer) -->
    <div class="mt-auto px-[24px] pt-4 shrink-0 w-full">
      <input 
        ref="fileUploadInput"
        type="file" 
        accept="image/*" 
        class="hidden" 
        @change="handleCustomUpload"
      />
      <button 
        type="button"
        @click="triggerCustomUpload"
        class="apple-glass-btn-dark w-full h-[42px] font-707 font-medium text-btn rounded-[8px] flex items-center justify-center gap-2 cursor-pointer"
      >
        <Plus class="w-4 h-4" />
        <span>Upload Custom Media</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useEditorStore } from '../../stores/editorStore.ts';
import { FIGMA_ASSETS } from '../../constants/figmaAssets.ts';
import { Plus, Trash2 } from 'lucide-vue-next';
import { 
  type MediaItem, 
  INITIAL_CAMPAIGN_MEDIA, 
  fetchServerMedia, 
  uploadMediaDirectly, 
  deleteServerMedia 
} from '../../services/mediaService.ts';

defineProps<{
  isOpen: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
}>();

const editorStore = useEditorStore();
const fileUploadInput = ref<HTMLInputElement | null>(null);

const categories = ['All', 'Photos', 'Logo', 'Product Catalog', 'Editorial Photos'] as const;
type MediaCategory = typeof categories[number];
const activeCategory = ref<MediaCategory>('All');

// When Media Gallery is opened specifically for selecting a logo, auto-filter to 'Logo'
watch(() => editorStore.mediaGalleryTarget, (target) => {
  if (target === 'brandLogo') {
    activeCategory.value = 'Logo';
  } else {
    activeCategory.value = 'All';
  }
}, { immediate: true });

// Curated Media Gallery Library synchronized with server
const mediaLibrary = ref<MediaItem[]>(INITIAL_CAMPAIGN_MEDIA);

onMounted(async () => {
  const items = await fetchServerMedia();
  if (items && items.length > 0) {
    mediaLibrary.value = items;
  }
});

const filteredMedia = computed(() => {
  if (activeCategory.value === 'All') {
    return mediaLibrary.value;
  }
  return mediaLibrary.value.filter(item => item.category === activeCategory.value);
});

function handleMediaDragStart(event: DragEvent, media: MediaItem) {
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'copy';
    const payload = {
      type: 'HeroDrop',
      label: media.title,
      customProps: {
        imageUrl: media.url,
        isSolidSpace: false,
        ratio: 'Full screen landing page',
        mediaFit: 'Fill the screen',
        title: '',
        headline: '',
        subtitle: '',
        subheadline: '',
        showBannerText: false,
        buttonText: '',
        isCtaEnabled: false,
        isOverlayEnabled: false,
        overlayOpacity: 50,
        isBrandLogoEnabled: false,
        brandLogoUrl: ''
      }
    };
    event.dataTransfer.setData('application/json', JSON.stringify(payload));
    event.dataTransfer.setData('text/plain', 'HeroDrop');
  }
  editorStore.setDraggedWidget('HeroDrop', {
    imageUrl: media.url,
    isSolidSpace: false,
    ratio: 'Full screen landing page',
    mediaFit: 'Fill the screen',
    title: '',
    headline: '',
    subtitle: '',
    subheadline: '',
    showBannerText: false,
    buttonText: '',
    isCtaEnabled: false,
    isOverlayEnabled: false,
    overlayOpacity: 50,
    isBrandLogoEnabled: false,
    brandLogoUrl: ''
  });
}

function applyMediaToArtboard(media: MediaItem) {
  const isBrandLogoTarget = editorStore.mediaGalleryTarget === 'brandLogo';
  const isReplaceTarget = editorStore.mediaGalleryTarget === 'replaceBannerImage';

  // Only target selected hero if user explicitly clicked "Change/Replace"
  const isHeroSelected = editorStore.selectedWidget && editorStore.selectedWidget.type === 'HeroDrop';
  const targetHero = (isReplaceTarget && isHeroSelected) ? editorStore.selectedWidget : null;

  if (isBrandLogoTarget) {
    // 1. BRAND LOGO SELECTION: Strictly update brandLogoUrl and activate brand logo
    const heroToUse = targetHero || editorStore.currentPage.widget_tree.find(w => w.type === 'HeroDrop');
    if (heroToUse) {
      editorStore.updateWidgetProps(heroToUse.id, {
        brandLogoUrl: media.url,
        isBrandLogoEnabled: true
      });
      editorStore.selectWidget(heroToUse.id);
    } else {
      // Create top hero widget with this brand logo
      const newWidget = editorStore.addWidget('HeroDrop', 0, {
        imageUrl: '',
        brandLogoUrl: media.url,
        isBrandLogoEnabled: true,
        isSolidSpace: true,
        ratio: 'Full screen landing page',
        mediaFit: 'Fill the screen'
      });
      editorStore.selectWidget(newWidget.id);
    }
  } else {
    // 2. HERO BANNER IMAGE SELECTION:
    if (targetHero) {
      // Explicitly replace the selected hero banner's image
      editorStore.updateWidgetProps(targetHero.id, {
        imageUrl: media.url,
        isSolidSpace: false
      });
      editorStore.selectWidget(targetHero.id);
    } else {
      // Add a NEW hero banner image block to the canvas!
      const newWidget = editorStore.addWidget('HeroDrop', undefined, {
        imageUrl: media.category === 'Logo' ? '' : media.url,
        brandLogoUrl: media.category === 'Logo' ? media.url : '',
        isBrandLogoEnabled: media.category === 'Logo',
        isSolidSpace: media.category === 'Logo',
        ratio: 'Full screen landing page',
        mediaFit: 'Fill the screen',
        title: '',
        headline: '',
        subtitle: '',
        subheadline: '',
        showBannerText: false,
        buttonText: '',
        isCtaEnabled: false,
        isOverlayEnabled: false,
        overlayOpacity: 50
      });
      editorStore.selectWidget(newWidget.id);
    }
  }

  // Seamlessly transition back to Media/Banner setup sidebar
  editorStore.openMediaSidebar();
  // Reset media target back to bannerImage
  editorStore.mediaGalleryTarget = 'bannerImage';
}

async function handleRemoveMedia(id: string) {
  mediaLibrary.value = mediaLibrary.value.filter(item => item.id !== id);
  await deleteServerMedia(id);
}

function triggerCustomUpload() {
  fileUploadInput.value?.click();
}

async function handleCustomUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        const category = (activeCategory.value === 'Logo' || editorStore.mediaGalleryTarget === 'brandLogo') ? 'Logo' : 'Photos';
        const savedMedia = await uploadMediaDirectly({
          dataUrl,
          title: file.name.replace(/\.[^/.]+$/, ""),
          category,
          filename: file.name
        });
        mediaLibrary.value.unshift(savedMedia);
        applyMediaToArtboard(savedMedia);
      }
    };
    reader.readAsDataURL(file);
  }
}
</script>
