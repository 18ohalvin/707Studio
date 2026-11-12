<template>
  <!-- Button Setup Sidebar Menu (Matching TextSetupSidebar.vue vertical centering) -->
  <aside 
    v-if="isOpen && targetWidget"
    ref="sidebarRef"
    @click.stop
    @wheel.stop
    class="max-sm:fixed max-sm:inset-x-0 max-sm:bottom-0 max-sm:top-auto max-sm:translate-y-0 max-sm:w-full max-sm:max-w-none max-sm:min-h-0 max-sm:max-h-[82vh] max-sm:rounded-b-none max-sm:rounded-t-[20px] max-sm:border-x-0 max-sm:border-b-0 max-sm:shadow-[0_-16px_40px_rgba(0,0,0,0.18)] sm:absolute sm:right-[24px] sm:top-1/2 sm:-translate-y-1/2 sm:w-[464px] sm:min-h-[460px] h-auto max-h-[calc(100vh-140px)] backdrop-blur-2xl bg-[rgba(255,255,255,0.95)] border border-black/8 content-stretch flex flex-col items-start overflow-y-auto pb-[20px] sm:rounded-[12px] shadow-[0px_20px_50px_0px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.05)] z-40 select-none transition-all sm:animate-apple-slide-right-center max-sm:animate-apple-slide-up no-scrollbar"
    data-node-id="244:11560"
    data-name="Button Setup Sidebar"
  >
    <!-- Mobile Sheet Drag Handle Pill -->
    <div class="sm:hidden w-10 h-1 bg-black/20 rounded-full mx-auto my-2.5 shrink-0 self-center" />
    <!-- Header -->
    <div class="content-stretch flex flex-col items-start p-[24px] pb-[16px] shrink-0 w-full border-b border-[#f0f0f0]">
      <div class="content-stretch flex items-center justify-between shrink-0 w-full">
        <div class="flex items-center gap-2">
          <p class="font-707 font-medium text-[16px] leading-[22px] text-black whitespace-nowrap">
            Button Setup
          </p>
          <span 
            v-if="layoutMode === 'dual'"
            class="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded-full bg-black/5 text-neutral-600 border border-black/10"
          >
            Dual Mode
          </span>
        </div>
        <button 
          @click="$emit('close')"
          class="apple-glass-icon-btn size-7 flex items-center justify-center rounded-full cursor-pointer hover:bg-neutral-200/60 transition-colors"
          title="Close"
        >
          <img :src="FIGMA_ASSETS.closeIcon" class="w-3.5 h-3.5" alt="Close" />
        </button>
      </div>
    </div>

    <!-- Segmented 3-Tab Control Bar (Sticky) -->
    <div class="px-[20px] pt-[12px] pb-[12px] w-full border-b border-[#f0f0f0] bg-white/70 backdrop-blur-md shrink-0 sticky top-0 z-20">
      <div class="flex items-center p-1 bg-[#ececec]/60 rounded-[10px] w-full gap-1 border-[0.5px] border-black/10">
        <button
          v-for="t in tabs"
          :key="t.id"
          type="button"
          @click="activeTab = t.id"
          :class="activeTab === t.id 
            ? 'bg-white text-black shadow-xs font-medium' 
            : 'text-neutral-500 hover:text-black font-normal'"
          class="flex-1 h-[30px] rounded-[7px] text-[12px] font-707 flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none"
        >
          <component :is="t.icon" class="size-3.5" />
          <span>{{ t.label }}</span>
        </button>
      </div>
    </div>

    <!-- TAB 1: CONTENT -->
    <div v-show="activeTab === 'content'" class="w-full flex flex-col">
      <!-- Layout Mode Selector: Single Button vs Dual Buttons (Agree / Disagree) -->
      <div class="content-stretch flex flex-col gap-[12px] items-start p-[24px] pb-[18px] shrink-0 w-full border-b border-[#f0f0f0]">
        <div class="flex items-center justify-between w-full">
          <div class="flex flex-col">
            <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
              Button Layout
            </p>
            <span class="font-707 text-[11px] text-neutral-400">
              Single action or paired choices
            </span>
          </div>
          <div class="flex gap-[6px] items-center">
            <button
              type="button"
              @click="layoutMode = 'single'"
              :class="layoutMode === 'single' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
              class="px-3 h-[30px] rounded-[6px] flex items-center justify-center font-707 text-[12px] cursor-pointer transition-all"
            >
              Single
            </button>
            <button
              type="button"
              @click="layoutMode = 'dual'"
              :class="layoutMode === 'dual' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
              class="px-3 h-[30px] rounded-[6px] flex items-center justify-center font-707 text-[12px] cursor-pointer transition-all"
            >
              Dual (Agree / Disagree)
            </button>
          </div>
        </div>

        <!-- Presets for Dual Mode (Agree / Disagree, Yes / No, etc.) -->
        <div v-if="layoutMode === 'dual'" class="w-full pt-1">
          <p class="font-707 text-[11px] font-medium text-neutral-500 mb-2">Dual Action Presets</p>
          <div class="grid grid-cols-2 gap-2 w-full">
            <button
              v-for="p in DUAL_BUTTON_PRESETS"
              :key="p.id"
              type="button"
              @click="applyDualPreset(p)"
              :class="(buttonLabel.toUpperCase() === p.primaryLabel && secondaryButtonLabel.toUpperCase() === p.secondaryLabel) ? 'border-black bg-black/5 font-medium' : 'border-black/10 hover:border-black/30 bg-white'"
              class="px-2.5 py-1.5 rounded-[8px] border text-left flex flex-col gap-0.5 transition-all cursor-pointer text-black"
            >
              <span class="font-707 text-[11px] font-medium">{{ p.label }}</span>
              <span class="font-mono text-[9.5px] text-neutral-500 uppercase">{{ p.primaryLabel }} · {{ p.secondaryLabel }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- PRIMARY BUTTON (Single Mode or Dual Mode Primary) -->
      <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] pb-[20px] shrink-0 w-full border-b border-[#f0f0f0]">
        <div class="flex flex-col gap-[6px] w-full">
          <div class="flex items-center justify-between">
            <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
              {{ layoutMode === 'dual' ? 'Primary Button Text (Agree / Yes)' : 'Button Text' }}
            </p>
            <span v-if="layoutMode === 'dual'" class="text-[10px] font-mono uppercase text-neutral-400">Button 1</span>
          </div>
          <div class="border border-[#aaa] focus-within:border-black border-solid flex h-[38px] items-center px-[14px] rounded-[8px] w-full bg-white transition-colors">
            <input 
              v-model="buttonLabel"
              :placeholder="layoutMode === 'dual' ? 'I AGREE' : 'Button Text (e.g. Enter Raffle)'"
              class="w-full text-[13px] font-707 text-black focus:outline-none placeholder:text-neutral-400 uppercase"
            />
          </div>
        </div>

        <!-- Add Icon Section for Primary Button -->
        <div class="flex items-center justify-between w-full pt-1">
          <p class="font-707 font-medium text-[12px] leading-[18px] text-neutral-700">
            {{ layoutMode === 'dual' ? 'Primary Button Icon' : 'Button Icon' }}
          </p>

          <button
            type="button"
            role="switch"
            :aria-checked="showIcon"
            @click="toggleIcon"
            class="relative inline-flex h-[20px] w-[36px] shrink-0 cursor-pointer rounded-full p-[2px] transition-colors duration-200 ease-in-out focus:outline-none"
            :class="showIcon ? 'bg-black' : 'bg-[#e5e5ea]'"
            title="Toggle Icon"
          >
            <span
              aria-hidden="true"
              class="pointer-events-none inline-block h-[16px] w-[16px] transform rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] ring-0 transition duration-200 ease-in-out"
              :class="showIcon ? 'translate-x-[16px]' : 'translate-x-0'"
            />
          </button>
        </div>

        <!-- Primary Icon Presets -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="transform opacity-0 -translate-y-2"
          enter-to-class="transform opacity-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="transform opacity-100 translate-y-0"
          leave-to-class="transform opacity-0 -translate-y-2"
        >
          <div v-if="showIcon" class="flex flex-nowrap overflow-x-auto gap-[8px] items-center -mx-[24px] px-[24px] w-[calc(100%+48px)] pt-1 no-scrollbar">
            <button 
              type="button"
              @click="setIconName('arrow-right')"
              :class="iconName === 'arrow-right' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
              class="shrink-0 whitespace-nowrap content-stretch flex h-[32px] items-center justify-center gap-1.5 px-[12px] py-[4px] rounded-[8px] text-[11.5px] font-707 cursor-pointer"
            >
              <ArrowRight class="size-3.5" /> Arrow
            </button>
            <button 
              type="button"
              @click="setIconName('grid')"
              :class="iconName === 'grid' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
              class="shrink-0 whitespace-nowrap content-stretch flex h-[32px] items-center justify-center gap-1.5 px-[12px] py-[4px] rounded-[8px] text-[11.5px] font-707 cursor-pointer"
            >
              <LayoutGrid class="size-3.5" /> Grid
            </button>
            <button 
              type="button"
              @click="setIconName('ticket')"
              :class="iconName === 'ticket' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
              class="shrink-0 whitespace-nowrap content-stretch flex h-[32px] items-center justify-center gap-1.5 px-[12px] py-[4px] rounded-[8px] text-[11.5px] font-707 cursor-pointer"
            >
              <Ticket class="size-3.5" /> Pass
            </button>
            <button 
              type="button"
              @click="setIconName('whatsapp')"
              :class="iconName === 'whatsapp' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
              class="shrink-0 whitespace-nowrap content-stretch flex h-[32px] items-center justify-center gap-1.5 px-[12px] py-[4px] rounded-[8px] text-[11.5px] font-707 cursor-pointer"
            >
              <Phone class="size-3.5" /> WhatsApp
            </button>
            <button 
              type="button"
              @click="setIconName('instagram')"
              :class="iconName === 'instagram' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
              class="shrink-0 whitespace-nowrap content-stretch flex h-[32px] items-center justify-center gap-1.5 px-[12px] py-[4px] rounded-[8px] text-[11.5px] font-707 cursor-pointer"
            >
              <Instagram class="size-3.5" /> Instagram
            </button>
          </div>
        </Transition>
      </div>

      <!-- SECONDARY BUTTON (Dual Mode Only: Disagree / No) -->
      <div 
        v-if="layoutMode === 'dual'"
        class="content-stretch flex flex-col gap-[14px] items-start p-[24px] pb-[20px] shrink-0 w-full animate-in fade-in duration-150"
      >
        <div class="flex flex-col gap-[6px] w-full">
          <div class="flex items-center justify-between">
            <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
              Secondary Button Text (Disagree / No)
            </p>
            <span class="text-[10px] font-mono uppercase text-neutral-400">Button 2</span>
          </div>
          <div class="border border-[#aaa] focus-within:border-black border-solid flex h-[38px] items-center px-[14px] rounded-[8px] w-full bg-white transition-colors">
            <input 
              v-model="secondaryButtonLabel"
              placeholder="I DISAGREE"
              class="w-full text-[13px] font-707 text-black focus:outline-none placeholder:text-neutral-400 uppercase"
            />
          </div>
        </div>

        <!-- Add Icon Section for Secondary Button -->
        <div class="flex items-center justify-between w-full pt-1">
          <p class="font-707 font-medium text-[12px] leading-[18px] text-neutral-700">
            Secondary Button Icon
          </p>

          <button
            type="button"
            role="switch"
            :aria-checked="secondaryShowIcon"
            @click="toggleSecondaryIcon"
            class="relative inline-flex h-[20px] w-[36px] shrink-0 cursor-pointer rounded-full p-[2px] transition-colors duration-200 ease-in-out focus:outline-none"
            :class="secondaryShowIcon ? 'bg-black' : 'bg-[#e5e5ea]'"
            title="Toggle Secondary Icon"
          >
            <span
              aria-hidden="true"
              class="pointer-events-none inline-block h-[16px] w-[16px] transform rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] ring-0 transition duration-200 ease-in-out"
              :class="secondaryShowIcon ? 'translate-x-[16px]' : 'translate-x-0'"
            />
          </button>
        </div>

        <!-- Secondary Icon Presets -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="transform opacity-0 -translate-y-2"
          enter-to-class="transform opacity-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="transform opacity-100 translate-y-0"
          leave-to-class="transform opacity-0 -translate-y-2"
        >
          <div v-if="secondaryShowIcon" class="flex flex-nowrap overflow-x-auto gap-[8px] items-center -mx-[24px] px-[24px] w-[calc(100%+48px)] pt-1 no-scrollbar">
            <button 
              type="button"
              @click="setSecondaryIconName('arrow-right')"
              :class="secondaryIconName === 'arrow-right' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
              class="shrink-0 whitespace-nowrap content-stretch flex h-[32px] items-center justify-center gap-1.5 px-[12px] py-[4px] rounded-[8px] text-[11.5px] font-707 cursor-pointer"
            >
              <ArrowRight class="size-3.5" /> Arrow
            </button>
            <button 
              type="button"
              @click="setSecondaryIconName('grid')"
              :class="secondaryIconName === 'grid' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
              class="shrink-0 whitespace-nowrap content-stretch flex h-[32px] items-center justify-center gap-1.5 px-[12px] py-[4px] rounded-[8px] text-[11.5px] font-707 cursor-pointer"
            >
              <LayoutGrid class="size-3.5" /> Grid
            </button>
            <button 
              type="button"
              @click="setSecondaryIconName('ticket')"
              :class="secondaryIconName === 'ticket' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
              class="shrink-0 whitespace-nowrap content-stretch flex h-[32px] items-center justify-center gap-1.5 px-[12px] py-[4px] rounded-[8px] text-[11.5px] font-707 cursor-pointer"
            >
              <Ticket class="size-3.5" /> Pass
            </button>
            <button 
              type="button"
              @click="setSecondaryIconName('whatsapp')"
              :class="secondaryIconName === 'whatsapp' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
              class="shrink-0 whitespace-nowrap content-stretch flex h-[32px] items-center justify-center gap-1.5 px-[12px] py-[4px] rounded-[8px] text-[11.5px] font-707 cursor-pointer"
            >
              <Phone class="size-3.5" /> WhatsApp
            </button>
            <button 
              type="button"
              @click="setSecondaryIconName('instagram')"
              :class="secondaryIconName === 'instagram' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
              class="shrink-0 whitespace-nowrap content-stretch flex h-[32px] items-center justify-center gap-1.5 px-[12px] py-[4px] rounded-[8px] text-[11.5px] font-707 cursor-pointer"
            >
              <Instagram class="size-3.5" /> Instagram
            </button>
          </div>
        </Transition>
      </div>
    </div>

    <!-- TAB 2: STYLE & LAYOUT -->
    <div v-show="activeTab === 'style'" class="w-full flex flex-col">
      <!-- Style Presets (Single Mode) -->
      <div 
        v-if="shouldShowStylePresets && layoutMode === 'single'"
        class="content-stretch flex flex-col gap-[14px] items-start p-[24px] pb-[20px] shrink-0 w-full border-b border-[#f0f0f0]"
      >
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
          Button Style Preset
        </p>
        <div class="flex gap-[8px] items-center w-full">
          <button 
            type="button"
            @click="setVariant('black')"
            :class="currentVariant === 'black' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
            class="flex-1 whitespace-nowrap content-stretch flex h-[36px] items-center justify-center px-[16px] py-[6px] rounded-[8px] text-[12px] font-707 cursor-pointer"
          >
            Primary Black
          </button>
          <button 
            type="button"
            @click="setVariant('white')"
            :class="currentVariant === 'white' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
            class="flex-1 whitespace-nowrap content-stretch flex h-[36px] items-center justify-center px-[16px] py-[6px] rounded-[8px] text-[12px] font-707 cursor-pointer"
          >
            Primary White
          </button>
        </div>
      </div>

      <!-- Style Presets (Dual Mode) -->
      <div 
        v-if="shouldShowStylePresets && layoutMode === 'dual'"
        class="content-stretch flex flex-col gap-[16px] items-start p-[24px] pb-[20px] shrink-0 w-full border-b border-[#f0f0f0]"
      >
        <!-- Primary Variant -->
        <div class="flex flex-col gap-[8px] w-full">
          <div class="flex items-center justify-between w-full">
            <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
              Primary Button Style (Agree / Yes)
            </p>
            <span class="text-[10px] font-mono text-neutral-400">Button 1</span>
          </div>
          <div class="flex gap-[8px] items-center w-full">
            <button 
              type="button"
              @click="setVariant('black')"
              :class="currentVariant === 'black' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
              class="flex-1 whitespace-nowrap content-stretch flex h-[34px] items-center justify-center px-[12px] py-[4px] rounded-[8px] text-[11.5px] font-707 cursor-pointer"
            >
              Solid Black
            </button>
            <button 
              type="button"
              @click="setVariant('white')"
              :class="currentVariant === 'white' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
              class="flex-1 whitespace-nowrap content-stretch flex h-[34px] items-center justify-center px-[12px] py-[4px] rounded-[8px] text-[11.5px] font-707 cursor-pointer"
            >
              Solid White
            </button>
          </div>
        </div>

        <!-- Secondary Variant -->
        <div class="flex flex-col gap-[8px] w-full pt-1">
          <div class="flex items-center justify-between w-full">
            <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
              Secondary Button Style (Disagree / No)
            </p>
            <span class="text-[10px] font-mono text-neutral-400">Button 2</span>
          </div>
          <div class="grid grid-cols-3 gap-[6px] items-center w-full">
            <button 
              type="button"
              @click="setSecondaryVariant('white')"
              :class="currentSecondaryVariant === 'white' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
              class="whitespace-nowrap content-stretch flex h-[34px] items-center justify-center px-[8px] py-[4px] rounded-[8px] text-[11.5px] font-707 cursor-pointer"
            >
              White
            </button>
            <button 
              type="button"
              @click="setSecondaryVariant('ghost')"
              :class="currentSecondaryVariant === 'ghost' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
              class="whitespace-nowrap content-stretch flex h-[34px] items-center justify-center px-[8px] py-[4px] rounded-[8px] text-[11.5px] font-707 cursor-pointer"
            >
              Outline
            </button>
            <button 
              type="button"
              @click="setSecondaryVariant('black')"
              :class="currentSecondaryVariant === 'black' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
              class="whitespace-nowrap content-stretch flex h-[34px] items-center justify-center px-[8px] py-[4px] rounded-[8px] text-[11.5px] font-707 cursor-pointer"
            >
              Black
            </button>
          </div>
        </div>
      </div>

      <!-- Position Layout Mode -->
      <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full">
        <div class="flex items-center justify-between w-full">
          <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
            Position
          </p>
          <div class="flex gap-[6px] items-center">
            <button 
              v-for="pos in positionModes" 
              :key="pos.value"
              @click="setPositionMode(pos.value)"
              :class="currentPositionMode === pos.value ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
              class="w-[96px] h-[32px] rounded-[6px] flex items-center justify-center font-707 text-[12px] cursor-pointer"
            >
              {{ pos.label }}
            </button>
          </div>
        </div>

        <!-- Sticky Page Targeting -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="transform opacity-0 -translate-y-2"
          enter-to-class="transform opacity-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="transform opacity-100 translate-y-0"
          leave-to-class="transform opacity-0 -translate-y-2"
        >
          <div v-if="currentPositionMode === 'sticky-bottom'" class="flex flex-col gap-[10px] w-full pt-1">
            <div class="flex items-center justify-between w-full">
              <p class="font-707 font-medium text-[12px] text-neutral-600">
                Apply to Pages
              </p>
              <div class="flex gap-[6px] items-center">
                <button 
                  type="button"
                  @click="setStickyScope('current')"
                  :class="currentStickyScope === 'current' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
                  class="w-[84px] h-[28px] rounded-[6px] flex items-center justify-center font-707 text-[11px] cursor-pointer"
                >
                  Current Page
                </button>
                <button 
                  type="button"
                  @click="setStickyScope('all')"
                  :class="currentStickyScope === 'all' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
                  class="w-[84px] h-[28px] rounded-[6px] flex items-center justify-center font-707 text-[11px] cursor-pointer"
                >
                  All Pages
                </button>
                <button 
                  type="button"
                  @click="setStickyScope('custom')"
                  :class="currentStickyScope === 'custom' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
                  class="w-[84px] h-[28px] rounded-[6px] flex items-center justify-center font-707 text-[11px] cursor-pointer"
                >
                  Select
                </button>
              </div>
            </div>

            <!-- Page checklist when 'Select' is active -->
            <div v-if="currentStickyScope === 'custom'" class="flex flex-col gap-1.5 pt-1">
              <div 
                v-for="(page, idx) in editorStore.pages" 
                :key="page.id"
                @click="togglePageSticky(page.id)"
                class="flex items-center justify-between p-2 rounded-[6px] bg-white/80 border border-neutral-200 hover:border-black/40 cursor-pointer transition-colors"
              >
                <div class="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    :checked="isPageStickySelected(page.id)" 
                    @click.stop="togglePageSticky(page.id)"
                    class="rounded accent-black cursor-pointer"
                  />
                  <span class="font-707 text-[12px] text-black">
                    Page {{ idx + 1 }}: {{ page.page_name || page.title || 'Untitled' }}
                  </span>
                </div>
                <span v-if="editorStore.currentPage.id === page.id" class="text-[9px] font-mono uppercase bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded">
                  Active
                </span>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- TAB 3: ACTION & LINK -->
    <div v-show="activeTab === 'action'" class="w-full flex flex-col">
      <!-- 1. PRIMARY BUTTON ACTION (Single or Dual) -->
      <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full" :class="layoutMode === 'dual' ? 'border-b border-[#f0f0f0]' : ''">
        <div class="content-stretch flex items-center justify-between w-full relative">
          <div class="flex flex-col">
            <p class="font-707 font-medium text-[13px] leading-[18px] text-black whitespace-nowrap">
              {{ layoutMode === 'dual' ? 'Primary Action (Agree / Yes)' : 'Action Trigger' }}
            </p>
            <span class="font-707 text-[11px] text-neutral-400">
              When clicked by guest
            </span>
          </div>
          <div class="relative" ref="linkToBtnRef">
            <button
              type="button"
              @click="isLinkToDropdownOpen = !isLinkToDropdownOpen"
              class="apple-glass-btn flex h-[38px] items-center justify-between px-[14px] py-[6px] rounded-[8px] w-[210px] cursor-pointer text-left"
            >
              <span class="font-707 text-[13px] text-black truncate">{{ selectedActionLabel }}</span>
              <ChevronDown 
                class="size-[15px] text-black transition-transform duration-200 shrink-0 ml-1.5" 
                :class="isLinkToDropdownOpen ? 'rotate-180' : ''"
              />
            </button>

            <!-- Dropdown Menu -->
            <Teleport to="body">
              <div 
                v-if="isLinkToDropdownOpen" 
                ref="linkToMenuRef"
                :style="linkToPopoverStyle"
                class="bg-white/95 backdrop-blur-xl border border-black/10 rounded-[8px] shadow-[0px_8px_30px_rgba(0,0,0,0.15)] py-1 z-50 flex flex-col overflow-y-auto animate-in fade-in duration-150 select-none"
              >
                <button
                  v-for="opt in linkToOptions"
                  :key="opt.value"
                  type="button"
                  @click="selectLinkTo(opt.value)"
                  class="flex items-center justify-between px-[14px] py-[8px] text-left hover:bg-black/5 transition-colors cursor-pointer"
                  :class="actionType === opt.value ? 'font-medium text-black bg-black/5' : 'text-neutral-700'"
                >
                  <span class="font-707 text-[13px]">{{ opt.label }}</span>
                  <Check v-if="actionType === opt.value" class="size-[15px] text-black" />
                </button>
              </div>
            </Teleport>
          </div>
        </div>

        <!-- Conditional URL Input if Link selected for Primary Button -->
        <div v-if="actionType === 'link'" class="w-full pt-1 flex flex-col gap-3 animate-in fade-in duration-150">
          <div class="flex flex-col gap-1.5 w-full">
            <div class="flex items-center justify-between">
              <span class="font-707 text-[12px] font-medium text-neutral-600">Destination External URL</span>
              <span class="text-[10px] font-mono text-neutral-400">e.g. https://...</span>
            </div>
            <div class="border border-[#aaa] focus-within:border-black border-solid flex h-[38px] items-center px-[14px] rounded-[8px] w-full bg-white transition-colors">
              <input 
                v-model="actionUrl" 
                placeholder="https://example.com/terms" 
                class="w-full text-[13px] font-707 text-black focus:outline-none placeholder:text-neutral-400 font-mono"
              />
            </div>
          </div>

          <!-- Open in New Tab Toggle -->
          <div class="flex items-center justify-between w-full pt-0.5">
            <div class="flex flex-col">
              <span class="font-707 text-[12px] font-medium text-black">Open in New Tab</span>
              <span class="font-707 text-[10.5px] text-neutral-400">Open external link in a new browser tab</span>
            </div>
            <button
              type="button"
              role="switch"
              :aria-checked="openInNewTab"
              @click="openInNewTab = !openInNewTab"
              class="relative inline-flex h-[20px] w-[36px] shrink-0 cursor-pointer rounded-full p-[2px] transition-colors duration-200 ease-in-out focus:outline-none"
              :class="openInNewTab ? 'bg-black' : 'bg-[#e5e5ea]'"
              title="Open in new tab"
            >
              <span
                aria-hidden="true"
                class="pointer-events-none inline-block h-[16px] w-[16px] transform rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] ring-0 transition duration-200 ease-in-out"
                :class="openInNewTab ? 'translate-x-[16px]' : 'translate-x-0'"
              />
            </button>
          </div>
        </div>

        <!-- Conditional Modal Setup Button if Popup Modal is selected for Primary Button -->
        <div v-if="actionType === 'modal'" class="w-full pt-1 animate-in fade-in duration-150">
          <button 
            type="button"
            @click="openModalSetup"
            class="apple-glass-btn-dark w-full h-[38px] rounded-[8px] flex items-center justify-between px-3.5 font-707 font-medium text-[12px] cursor-pointer transition-all shadow-sm"
          >
            <span class="flex items-center gap-2">
              <SlidersHorizontal class="size-3.5" />
              <span>Configure Pop Up Modal</span>
            </span>
            <ArrowRight class="size-3.5 opacity-80" />
          </button>
        </div>
      </div>

      <!-- 2. SECONDARY BUTTON ACTION (Dual Mode Only) -->
      <div 
        v-if="layoutMode === 'dual'"
        class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full animate-in fade-in duration-150"
      >
        <div class="content-stretch flex items-center justify-between w-full relative">
          <div class="flex flex-col">
            <p class="font-707 font-medium text-[13px] leading-[18px] text-black whitespace-nowrap">
              Secondary Action (Disagree / No)
            </p>
            <span class="font-707 text-[11px] text-neutral-400">
              When clicked by guest
            </span>
          </div>
          <div class="relative" ref="secondaryLinkToBtnRef">
            <button
              type="button"
              @click="isSecondaryLinkToDropdownOpen = !isSecondaryLinkToDropdownOpen"
              class="apple-glass-btn flex h-[38px] items-center justify-between px-[14px] py-[6px] rounded-[8px] w-[210px] cursor-pointer text-left"
            >
              <span class="font-707 text-[13px] text-black truncate">{{ selectedSecondaryActionLabel }}</span>
              <ChevronDown 
                class="size-[15px] text-black transition-transform duration-200 shrink-0 ml-1.5" 
                :class="isSecondaryLinkToDropdownOpen ? 'rotate-180' : ''"
              />
            </button>

            <!-- Secondary Dropdown Menu -->
            <Teleport to="body">
              <div 
                v-if="isSecondaryLinkToDropdownOpen" 
                ref="secondaryLinkToMenuRef"
                :style="secondaryLinkToPopoverStyle"
                class="bg-white/95 backdrop-blur-xl border border-black/10 rounded-[8px] shadow-[0px_8px_30px_rgba(0,0,0,0.15)] py-1 z-50 flex flex-col overflow-y-auto animate-in fade-in duration-150 select-none"
              >
                <button
                  v-for="opt in linkToOptions"
                  :key="opt.value"
                  type="button"
                  @click="selectSecondaryLinkTo(opt.value)"
                  class="flex items-center justify-between px-[14px] py-[8px] text-left hover:bg-black/5 transition-colors cursor-pointer"
                  :class="secondaryActionType === opt.value ? 'font-medium text-black bg-black/5' : 'text-neutral-700'"
                >
                  <span class="font-707 text-[13px]">{{ opt.label }}</span>
                  <Check v-if="secondaryActionType === opt.value" class="size-[15px] text-black" />
                </button>
              </div>
            </Teleport>
          </div>
        </div>

        <!-- Conditional URL Input if Link selected for Secondary Button -->
        <div v-if="secondaryActionType === 'link'" class="w-full pt-1 flex flex-col gap-3 animate-in fade-in duration-150">
          <div class="flex flex-col gap-1.5 w-full">
            <div class="flex items-center justify-between">
              <span class="font-707 text-[12px] font-medium text-neutral-600">Secondary External URL</span>
              <span class="text-[10px] font-mono text-neutral-400">e.g. https://...</span>
            </div>
            <div class="border border-[#aaa] focus-within:border-black border-solid flex h-[38px] items-center px-[14px] rounded-[8px] w-full bg-white transition-colors">
              <input 
                v-model="secondaryActionUrl" 
                placeholder="https://example.com/decline" 
                class="w-full text-[13px] font-707 text-black focus:outline-none placeholder:text-neutral-400 font-mono"
              />
            </div>
          </div>

          <!-- Secondary Open in New Tab Toggle -->
          <div class="flex items-center justify-between w-full pt-0.5">
            <div class="flex flex-col">
              <span class="font-707 text-[12px] font-medium text-black">Open in New Tab</span>
              <span class="font-707 text-[10.5px] text-neutral-400">Open external link in a new browser tab</span>
            </div>
            <button
              type="button"
              role="switch"
              :aria-checked="secondaryOpenInNewTab"
              @click="secondaryOpenInNewTab = !secondaryOpenInNewTab"
              class="relative inline-flex h-[20px] w-[36px] shrink-0 cursor-pointer rounded-full p-[2px] transition-colors duration-200 ease-in-out focus:outline-none"
              :class="secondaryOpenInNewTab ? 'bg-black' : 'bg-[#e5e5ea]'"
              title="Open in new tab"
            >
              <span
                aria-hidden="true"
                class="pointer-events-none inline-block h-[16px] w-[16px] transform rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] ring-0 transition duration-200 ease-in-out"
                :class="secondaryOpenInNewTab ? 'translate-x-[16px]' : 'translate-x-0'"
              />
            </button>
          </div>
        </div>

        <!-- Conditional Modal Setup Button if Popup Modal is selected for Secondary Button -->
        <div v-if="secondaryActionType === 'modal'" class="w-full pt-1 animate-in fade-in duration-150">
          <button 
            type="button"
            @click="openModalSetup"
            class="apple-glass-btn-dark w-full h-[38px] rounded-[8px] flex items-center justify-between px-3.5 font-707 font-medium text-[12px] cursor-pointer transition-all shadow-sm"
          >
            <span class="flex items-center gap-2">
              <SlidersHorizontal class="size-3.5" />
              <span>Configure Pop Up Modal</span>
            </span>
            <ArrowRight class="size-3.5 opacity-80" />
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { CTA_ACTION_OPTIONS, normalizeCtaAction, DUAL_BUTTON_PRESETS, type DualButtonPreset } from './ctaActions.ts';
import { ref, computed } from 'vue';
import { useEditorStore } from '../../stores/editorStore.ts';
import { FIGMA_ASSETS } from '../../constants/figmaAssets.ts';
import { useModalPopover } from '../common/modalPopover.ts';
import { 
  ChevronDown, 
  Check, 
  ArrowRight, 
  SlidersHorizontal,
  LayoutGrid, 
  Ticket, 
  Phone,
  Instagram,
  Bell,
  TextCursorInput,
  ListOrdered,
  ListFilter,
  Type,
  Layout,
  Link2
} from 'lucide-vue-next';
import type { ModalVariant } from '../../types/editor.ts';

defineProps<{
  isOpen: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
}>();

// 3-Tab Segment Navigation
type TabType = 'content' | 'style' | 'action';
const activeTab = ref<TabType>('content');
const tabs = [
  { id: 'content' as const, label: 'Content', icon: Type },
  { id: 'style' as const, label: 'Style & Layout', icon: Layout },
  { id: 'action' as const, label: 'Action & Link', icon: Link2 }
];

const editorStore = useEditorStore();
const sidebarRef = ref<HTMLElement | null>(null);

const modalVariants = [
  { id: 'message-alert' as ModalVariant, label: 'Message / Alert', icon: Bell },
  { id: 'message-field' as ModalVariant, label: 'Message + Field', icon: TextCursorInput },
  { id: 'choice-detailed' as ModalVariant, label: 'Detailed Choice', icon: ListOrdered },
  { id: 'choice-simple' as ModalVariant, label: 'Simple Choice', icon: ListFilter },
  { id: 'image-matrix' as ModalVariant, label: 'Image Matrix', icon: LayoutGrid }
];

const currentModalVariant = computed<ModalVariant>(() => {
  return targetWidget.value?.props?.modalProps?.variant || 'message-alert';
});

function setModalVariant(v: ModalVariant) {
  if (!targetWidget.value) return;
  const existing = targetWidget.value.props.modalProps || {};
  let updated: Record<string, any> = { ...existing, variant: v };

  if (v === 'message-alert') {
    updated.title = updated.title || 'Your Pass Has Been Sent';
    updated.subtitle = updated.subtitle || 'Please provide a valid email address. We will resend your E-Pass immediately.';
    updated.buttonText = updated.buttonText || 'Done';
    updated.buttonVariant = updated.buttonVariant || 'black';
  } else if (v === 'message-field') {
    updated.title = updated.title || 'Update Your Email';
    updated.subtitle = updated.subtitle || 'Please provide a valid email address. We will resend your E-Pass immediately.';
    updated.fieldPlaceholder = updated.fieldPlaceholder || 'Email*';
    updated.fieldType = updated.fieldType || 'email';
    updated.buttonText = updated.buttonText || 'Done';
    updated.buttonVariant = updated.buttonVariant || 'black';
  } else if (v === 'choice-detailed') {
    updated.title = updated.title || 'Select Arrival Date';
    updated.subtitle = updated.subtitle || 'Please provide a valid email address. We will resend your E-Pass immediately.';
    updated.buttonText = updated.buttonText || 'Done';
    updated.buttonVariant = updated.buttonVariant || 'black';
    updated.options = updated.options || [
      { id: 'opt_1', label: 'Day 1', sublabel: '2 September 2026', description: 'Your Event Descriptions Detail', selected: true },
      { id: 'opt_2', label: 'Day 2', sublabel: '3 September 2026', description: 'Your Event Descriptions Detail', selected: false }
    ];
  } else if (v === 'choice-simple') {
    updated.title = updated.title || 'Select Arrival Date';
    updated.subtitle = updated.subtitle || 'Please provide a valid email address. We will resend your E-Pass immediately.';
    updated.buttonText = updated.buttonText || 'Done';
    updated.buttonVariant = updated.buttonVariant || 'black';
    updated.options = updated.options || [
      { id: 'opt_1', label: '+62', sublabel: 'Indonesia', selected: true },
      { id: 'opt_2', label: '+65', sublabel: 'Singapore', selected: false }
    ];
  } else if (v === 'image-matrix') {
    updated.title = updated.title || 'Select Arrival Date';
    updated.subtitle = updated.subtitle || 'Please provide a valid email address. We will resend your E-Pass immediately.';
    updated.buttonText = updated.buttonText || 'Done';
    updated.buttonVariant = updated.buttonVariant || 'black';
    updated.imageSlots = updated.imageSlots || [
      { id: 'slot_1', url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=400&q=80', label: 'Model 01', selected: true },
      { id: 'slot_2', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80', label: 'Model 02', selected: false },
      { id: 'slot_3', url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&q=80', label: 'Model 03', selected: false },
      { id: 'slot_4', url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=400&q=80', label: 'Model 04', selected: false }
    ];
  }

  editorStore.updateWidgetProps(targetWidget.value.id, { modalProps: updated });
}

function openModalSetup() {
  if (targetWidget.value) {
    if (!targetWidget.value.props.modalProps) {
      setModalVariant('message-alert');
    }
    editorStore.selectWidget(targetWidget.value.id);
    editorStore.openModalSidebar();
  }
}

const targetWidget = computed(() => {
  if (editorStore.selectedWidget && (editorStore.selectedWidget.type === 'ActionButton' || editorStore.selectedWidget.type === 'HeroDrop')) {
    return editorStore.selectedWidget;
  }
  const local = editorStore.currentPage.widget_tree.find(w => w.type === 'ActionButton') || null;
  if (local) return local;

  // If on secondary page, resolve the inherited sticky button from origin page
  for (const p of editorStore.pages) {
    const btn = p.widget_tree.find(w => w.type === 'ActionButton' && w.props?.positionMode === 'sticky-bottom');
    if (btn) {
      const scope = btn.props?.stickyScope || 'current';
      if (scope === 'all' || (scope === 'custom' && (btn.props?.stickyPageIds || []).includes(editorStore.currentPage.id))) {
        return btn;
      }
    }
  }
  return null;
});

const originPageIndex = computed(() => {
  if (!targetWidget.value) return -1;
  return editorStore.pages.findIndex(p => p.widget_tree.some(w => w.id === targetWidget.value?.id));
});

const isMultiPageButton = computed(() => {
  if (currentPositionMode.value !== 'sticky-bottom') return false;
  if (currentStickyScope.value === 'all') return true;
  if (currentStickyScope.value === 'custom') {
    const ids = targetWidget.value?.props?.stickyPageIds || [];
    return ids.length > 1;
  }
  return false;
});

const isOtherPage = computed(() => {
  if (originPageIndex.value === -1) return false;
  return editorStore.activePageIndex !== originPageIndex.value;
});

const shouldShowStylePresets = computed(() => {
  // If user selected button for several pages or all pages, hide preset section on other pages
  if (isMultiPageButton.value && isOtherPage.value) {
    return false;
  }
  return true;
});

// Layout Mode: Single vs Dual Buttons
const layoutMode = computed({
  get: () => (targetWidget.value?.props?.layoutMode === 'dual' ? 'dual' : 'single'),
  set: (val: 'single' | 'dual') => {
    if (targetWidget.value) {
      editorStore.updateWidgetProps(targetWidget.value.id, { 
        layoutMode: val,
        secondaryLabel: targetWidget.value.props.secondaryLabel || 'DISAGREE',
        secondaryVariant: targetWidget.value.props.secondaryVariant || 'white',
        secondaryActionType: targetWidget.value.props.secondaryActionType || 'link',
        secondaryOpenInNewTab: targetWidget.value.props.secondaryOpenInNewTab ?? true
      });
    }
  }
});

function applyDualPreset(preset: DualButtonPreset) {
  if (targetWidget.value) {
    editorStore.updateWidgetProps(targetWidget.value.id, {
      layoutMode: 'dual',
      label: preset.primaryLabel,
      secondaryLabel: preset.secondaryLabel
    });
  }
}

const buttonLabel = computed({
  get: () => targetWidget.value?.props?.label || targetWidget.value?.props?.buttonText || targetWidget.value?.props?.ctaLabel || (layoutMode.value === 'dual' ? 'AGREE' : 'BUTTON CTA'),
  set: (val: string) => {
    if (targetWidget.value) {
      if (targetWidget.value.type === 'HeroDrop') {
        editorStore.updateWidgetProps(targetWidget.value.id, { buttonText: val, ctaLabel: val, isCtaEnabled: true, showButton: true });
      } else {
        editorStore.updateWidgetProps(targetWidget.value.id, { label: val });
      }
    }
  }
});

const secondaryButtonLabel = computed({
  get: () => targetWidget.value?.props?.secondaryLabel || 'DISAGREE',
  set: (val: string) => {
    if (targetWidget.value) {
      editorStore.updateWidgetProps(targetWidget.value.id, { secondaryLabel: val });
    }
  }
});

const currentVariant = computed(() => {
  return targetWidget.value?.props?.variant || targetWidget.value?.props?.buttonVariant || 'black';
});

const currentSecondaryVariant = computed(() => {
  return targetWidget.value?.props?.secondaryVariant || 'white';
});

function setSecondaryVariant(v: 'white' | 'black' | 'ghost') {
  if (targetWidget.value) {
    editorStore.updateWidgetProps(targetWidget.value.id, { secondaryVariant: v });
  }
}

const positionModes = computed(() => {
  if (targetWidget.value?.type === 'HeroDrop') {
    return [
      { label: 'In Banner', value: 'in-flow' },
      { label: 'Sticky Bottom', value: 'sticky-bottom' }
    ] as const;
  }
  return [
    { label: 'Standard', value: 'in-flow' },
    { label: 'Sticky Bottom', value: 'sticky-bottom' }
  ] as const;
});

const currentPositionMode = computed(() => {
  return targetWidget.value?.props?.positionMode || 'in-flow';
});

const currentStickyScope = computed(() => {
  return targetWidget.value?.props?.stickyScope || 'current';
});

// Primary Action Dropdown
const isLinkToDropdownOpen = ref(false);
const linkToBtnRef = ref<HTMLElement | null>(null);
const { style: linkToPopoverStyle, menuRef: linkToMenuRef } = useModalPopover(linkToBtnRef, isLinkToDropdownOpen, { align: 'right', width: 220 });

// Secondary Action Dropdown
const isSecondaryLinkToDropdownOpen = ref(false);
const secondaryLinkToBtnRef = ref<HTMLElement | null>(null);
const { style: secondaryLinkToPopoverStyle, menuRef: secondaryLinkToMenuRef } = useModalPopover(secondaryLinkToBtnRef, isSecondaryLinkToDropdownOpen, { align: 'right', width: 220 });

const allLinkToOptions = CTA_ACTION_OPTIONS;

const isModalDisallowed = computed(() => {
  return currentPositionMode.value === 'sticky-bottom' && currentStickyScope.value === 'all';
});

const hasEPassInProject = computed(() => {
  return editorStore.pages.flatMap(p => p.widget_tree).some(w => w.type === 'GuestEPass' || w.type === 'LiveQueuePass');
});

const linkToOptions = computed(() => {
  return allLinkToOptions.filter(opt => {
    if (opt.value === 'download-pass') return hasEPassInProject.value;
    if (opt.value === 'modal') return !isModalDisallowed.value;
    return true;
  });
});

// Primary Action Trigger
const actionType = computed({
  get: () => {
    const current = normalizeCtaAction(targetWidget.value?.props?.actionType);
    const availableValues = linkToOptions.value.map(o => o.value as string);
    if (current && availableValues.includes(current)) return current;
    return 'submit';
  },
  set: (val: string) => {
    if (targetWidget.value) {
      editorStore.updateWidgetProps(targetWidget.value.id, { actionType: val });
    }
  }
});

const selectedActionLabel = computed(() => {
  const opt = allLinkToOptions.find(o => o.value === actionType.value);
  return opt ? opt.label : (linkToOptions.value[0]?.label || 'External URL');
});

function selectLinkTo(val: string) {
  actionType.value = val;
  isLinkToDropdownOpen.value = false;
  if (val === 'modal' && targetWidget.value) {
    if (!targetWidget.value.props.modalProps) {
      setModalVariant('message-alert');
    }
    editorStore.selectWidget(targetWidget.value.id);
    editorStore.openModalSidebar();
  }
}

const actionUrl = computed({
  get: () => targetWidget.value?.props?.url || '',
  set: (val: string) => {
    if (targetWidget.value) {
      editorStore.updateWidgetProps(targetWidget.value.id, { url: val });
    }
  }
});

const openInNewTab = computed({
  get: () => targetWidget.value?.props?.openInNewTab ?? false,
  set: (val: boolean) => {
    if (targetWidget.value) {
      editorStore.updateWidgetProps(targetWidget.value.id, { openInNewTab: val });
    }
  }
});

// Secondary Action Trigger
const secondaryActionType = computed({
  get: () => {
    const current = normalizeCtaAction(targetWidget.value?.props?.secondaryActionType);
    const availableValues = linkToOptions.value.map(o => o.value as string);
    if (current && availableValues.includes(current)) return current;
    return 'link';
  },
  set: (val: string) => {
    if (targetWidget.value) {
      editorStore.updateWidgetProps(targetWidget.value.id, { secondaryActionType: val });
    }
  }
});

const selectedSecondaryActionLabel = computed(() => {
  const opt = allLinkToOptions.find(o => o.value === secondaryActionType.value);
  return opt ? opt.label : 'External URL';
});

function selectSecondaryLinkTo(val: string) {
  secondaryActionType.value = val;
  isSecondaryLinkToDropdownOpen.value = false;
  if (val === 'modal' && targetWidget.value) {
    if (!targetWidget.value.props.modalProps) {
      setModalVariant('message-alert');
    }
    editorStore.selectWidget(targetWidget.value.id);
    editorStore.openModalSidebar();
  }
}

const secondaryActionUrl = computed({
  get: () => targetWidget.value?.props?.secondaryUrl || '',
  set: (val: string) => {
    if (targetWidget.value) {
      editorStore.updateWidgetProps(targetWidget.value.id, { secondaryUrl: val });
    }
  }
});

const secondaryOpenInNewTab = computed({
  get: () => targetWidget.value?.props?.secondaryOpenInNewTab ?? true,
  set: (val: boolean) => {
    if (targetWidget.value) {
      editorStore.updateWidgetProps(targetWidget.value.id, { secondaryOpenInNewTab: val });
    }
  }
});

// Primary Button Icon
const showIcon = computed({
  get: () => targetWidget.value?.props?.showIcon ?? false,
  set: (val: boolean) => {
    if (targetWidget.value) {
      editorStore.updateWidgetProps(targetWidget.value.id, { showIcon: val });
    }
  }
});

function toggleIcon() {
  showIcon.value = !showIcon.value;
}

const iconName = computed(() => {
  return targetWidget.value?.props?.iconName || 'arrow-right';
});

function setIconName(name: string) {
  if (targetWidget.value) {
    editorStore.updateWidgetProps(targetWidget.value.id, { iconName: name, showIcon: true });
  }
}

// Secondary Button Icon
const secondaryShowIcon = computed({
  get: () => targetWidget.value?.props?.secondaryShowIcon ?? false,
  set: (val: boolean) => {
    if (targetWidget.value) {
      editorStore.updateWidgetProps(targetWidget.value.id, { secondaryShowIcon: val });
    }
  }
});

function toggleSecondaryIcon() {
  secondaryShowIcon.value = !secondaryShowIcon.value;
}

const secondaryIconName = computed(() => {
  return targetWidget.value?.props?.secondaryIconName || 'arrow-right';
});

function setSecondaryIconName(name: string) {
  if (targetWidget.value) {
    editorStore.updateWidgetProps(targetWidget.value.id, { secondaryIconName: name, secondaryShowIcon: true });
  }
}

function setVariant(variant: 'black' | 'white') {
  if (targetWidget.value) {
    editorStore.updateWidgetProps(targetWidget.value.id, { variant, buttonVariant: variant });
  }
}

function setPositionMode(mode: 'in-flow' | 'sticky-bottom') {
  if (targetWidget.value) {
    const isStickyAll = mode === 'sticky-bottom' && currentStickyScope.value === 'all';
    const updates: Record<string, any> = { 
      positionMode: mode,
      stickyPageIds: targetWidget.value.props.stickyPageIds || [editorStore.currentPage.id]
    };
    if (isStickyAll && targetWidget.value.props.actionType === 'modal') {
      updates.actionType = 'submit';
    }
    editorStore.updateWidgetProps(targetWidget.value.id, updates);
  }
}

function setStickyScope(scope: 'current' | 'all' | 'custom') {
  if (targetWidget.value) {
    const defaultPageIds = scope === 'all' 
      ? editorStore.pages.map(p => p.id) 
      : [editorStore.currentPage.id];
    const updates: Record<string, any> = { 
      stickyScope: scope,
      stickyPageIds: targetWidget.value.props.stickyPageIds || defaultPageIds
    };
    if (scope === 'all' && currentPositionMode.value === 'sticky-bottom' && targetWidget.value.props.actionType === 'modal') {
      updates.actionType = 'submit';
    }
    editorStore.updateWidgetProps(targetWidget.value.id, updates);
  }
}

function isPageStickySelected(pageId: string): boolean {
  if (!targetWidget.value) return false;
  const pageIds: string[] = targetWidget.value.props.stickyPageIds || [];
  return pageIds.includes(pageId);
}

function togglePageSticky(pageId: string) {
  if (!targetWidget.value) return;
  const currentList: string[] = [...(targetWidget.value.props.stickyPageIds || [])];
  const idx = currentList.indexOf(pageId);
  if (idx >= 0) {
    currentList.splice(idx, 1);
  } else {
    currentList.push(pageId);
  }
  editorStore.updateWidgetProps(targetWidget.value.id, { stickyPageIds: currentList });
}
</script>
