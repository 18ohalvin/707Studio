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
            Button
          </p>
          <span 
            v-if="layoutMode === 'dual'"
            class="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded-full bg-black/5 text-neutral-600 border border-black/10"
          >
            Dual
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
      <!-- Layout Mode Selector: Single Button vs Dual Buttons (Yes / No) -->
      <div class="content-stretch flex flex-col gap-[12px] items-start p-[24px] pb-[18px] shrink-0 w-full border-b border-[#f0f0f0]">
        <div class="flex items-center justify-between w-full">
          <div class="flex items-center gap-1.5">
            <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
              Layout
            </p>
            <InfoHint text="Show one main CTA button or two independent buttons (e.g. Yes / No, Agree / Disagree)." />
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
              Dual
            </button>
          </div>
        </div>

        <!-- Grid Alignment (Left-Right vs Top-Bottom Stack) -->
        <div v-if="layoutMode === 'dual'" class="flex items-center justify-between w-full pt-2 border-t border-black/5">
          <p class="font-707 font-medium text-[12px] text-neutral-800">
            Direction
          </p>
          <div class="flex gap-[6px] items-center">
            <button
              type="button"
              @click="dualOrientation = 'horizontal'"
              :class="dualOrientation === 'horizontal' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
              class="px-2.5 h-[28px] rounded-[6px] flex items-center justify-center font-707 text-[11px] cursor-pointer transition-all"
            >
              Side by Side
            </button>
            <button
              type="button"
              @click="dualOrientation = 'vertical'"
              :class="dualOrientation === 'vertical' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
              class="px-2.5 h-[28px] rounded-[6px] flex items-center justify-center font-707 text-[11px] cursor-pointer transition-all"
            >
              Stacked
            </button>
          </div>
        </div>
      </div>

      <!-- PRIMARY BUTTON (Single Mode or Dual Mode Yes/Agree Button) -->
      <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] pb-[20px] shrink-0 w-full border-b border-[#f0f0f0]">
        <div class="flex flex-col gap-[6px] w-full">
          <div class="flex items-center justify-between">
            <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
              {{ layoutMode === 'dual' ? 'Button 1 Label' : 'Label' }}
            </p>
          </div>
          <div class="border border-[#aaa] focus-within:border-black border-solid flex h-[38px] items-center px-[14px] rounded-[8px] w-full bg-white transition-colors">
            <input 
              v-model="buttonLabel"
              :placeholder="layoutMode === 'dual' ? 'YES' : 'BUTTON CTA'"
              class="w-full text-[13px] font-707 text-black focus:outline-none placeholder:text-neutral-400 uppercase"
            />
          </div>
        </div>
      </div>

      <!-- SECONDARY BUTTON (Dual Mode Only: No/Disagree Button) -->
      <div 
        v-if="layoutMode === 'dual'"
        class="content-stretch flex flex-col gap-[14px] items-start p-[24px] pb-[20px] shrink-0 w-full animate-in fade-in duration-150"
      >
        <div class="flex flex-col gap-[6px] w-full">
          <div class="flex items-center justify-between">
            <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
              Button 2 Label
            </p>
          </div>
          <div class="border border-[#aaa] focus-within:border-black border-solid flex h-[38px] items-center px-[14px] rounded-[8px] w-full bg-white transition-colors">
            <input 
              v-model="secondaryButtonLabel"
              placeholder="NO"
              class="w-full text-[13px] font-707 text-black focus:outline-none placeholder:text-neutral-400 uppercase"
            />
          </div>
        </div>
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
          Style
        </p>
        <div class="flex gap-[8px] items-center w-full">
          <button 
            type="button"
            @click="setVariant('black')"
            :class="currentVariant === 'black' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
            class="flex-1 whitespace-nowrap content-stretch flex h-[36px] items-center justify-center px-[16px] py-[6px] rounded-[8px] text-[12px] font-707 cursor-pointer"
          >
            Black
          </button>
          <button 
            type="button"
            @click="setVariant('white')"
            :class="currentVariant === 'white' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
            class="flex-1 whitespace-nowrap content-stretch flex h-[36px] items-center justify-center px-[16px] py-[6px] rounded-[8px] text-[12px] font-707 cursor-pointer"
          >
            White
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
          <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
            Button 1 Style
          </p>
          <div class="flex gap-[8px] items-center w-full">
            <button 
              type="button"
              @click="setVariant('black')"
              :class="currentVariant === 'black' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
              class="flex-1 whitespace-nowrap content-stretch flex h-[34px] items-center justify-center px-[12px] py-[4px] rounded-[8px] text-[11.5px] font-707 cursor-pointer"
            >
              Black
            </button>
            <button 
              type="button"
              @click="setVariant('white')"
              :class="currentVariant === 'white' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
              class="flex-1 whitespace-nowrap content-stretch flex h-[34px] items-center justify-center px-[12px] py-[4px] rounded-[8px] text-[11.5px] font-707 cursor-pointer"
            >
              White
            </button>
          </div>
        </div>

        <!-- Secondary Variant -->
        <div class="flex flex-col gap-[8px] w-full pt-1">
          <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
            Button 2 Style
          </p>
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
          <div class="flex items-center gap-1.5">
            <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
              Position
            </p>
            <InfoHint text="Standard places buttons in page flow; Sticky Bottom pins them to the bottom edge." />
          </div>
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
              <div class="flex items-center gap-1.5">
                <p class="font-707 font-medium text-[12px] text-neutral-600">
                  Apply to Pages
                </p>
                <InfoHint text="Choose which funnel pages display the pinned sticky button." />
              </div>
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
      <!-- 1. PRIMARY BUTTON ACTION (Single or Dual Yes Button) -->
      <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full" :class="layoutMode === 'dual' ? 'border-b border-[#f0f0f0]' : ''">
        <div class="content-stretch flex items-center justify-between w-full relative">
          <div class="flex items-center gap-1.5">
            <p class="font-707 font-medium text-[13px] leading-[18px] text-black whitespace-nowrap">
              {{ layoutMode === 'dual' ? 'Button 1 Action' : 'On Click' }}
            </p>
            <InfoHint text="Choose what happens when a guest taps this button." />
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

        <!-- Conditional Target Page Picker if Submit & Go to Page is selected -->
        <div v-if="actionType === 'submit'" class="flex items-center justify-between w-full pt-1 relative animate-in fade-in duration-150">
          <div class="flex items-center gap-1.5">
            <p class="font-707 font-medium text-[13px] leading-[18px] text-black whitespace-nowrap">
              Target Page
            </p>
            <InfoHint text="Pick where to go after submitting. Defaults to the next page, or pick another page to skip steps." />
          </div>
          <div class="relative" ref="targetPageBtnRef">
            <button
              type="button"
              @click="isTargetPageDropdownOpen = !isTargetPageDropdownOpen"
              class="apple-glass-btn flex h-[38px] items-center justify-between px-[14px] py-[6px] rounded-[8px] w-[210px] cursor-pointer text-left"
            >
              <span class="font-707 text-[13px] text-black truncate">{{ selectedTargetPageLabel }}</span>
              <ChevronDown 
                class="size-[15px] text-black transition-transform duration-200 shrink-0 ml-1.5" 
                :class="isTargetPageDropdownOpen ? 'rotate-180' : ''"
              />
            </button>
            <Teleport to="body">
              <div 
                v-if="isTargetPageDropdownOpen" 
                ref="targetPageMenuRef"
                :style="targetPagePopoverStyle"
                class="bg-white/95 backdrop-blur-xl border border-black/10 rounded-[8px] shadow-[0px_8px_30px_rgba(0,0,0,0.15)] py-1 z-50 flex flex-col overflow-y-auto animate-in fade-in duration-150 select-none"
              >
                <button
                  type="button"
                  @click="selectTargetPage('')"
                  class="flex items-center justify-between px-[14px] py-[8px] text-left hover:bg-black/5 transition-colors cursor-pointer"
                  :class="!targetPageId ? 'font-medium text-black bg-black/5' : 'text-neutral-700'"
                >
                  <span class="font-707 text-[13px]">Next Page (Default)</span>
                  <Check v-if="!targetPageId" class="size-[15px] text-black" />
                </button>
                <button
                  v-for="p in funnelTargetPages"
                  :key="p.id"
                  type="button"
                  :disabled="p.isCurrent"
                  @click="selectTargetPage(p.id)"
                  class="flex items-center justify-between px-[14px] py-[8px] text-left transition-colors"
                  :class="[
                    p.isCurrent ? 'opacity-40 cursor-not-allowed text-neutral-400' : 'hover:bg-black/5 cursor-pointer',
                    targetPageId === p.id ? 'font-medium text-black bg-black/5' : 'text-neutral-700'
                  ]"
                >
                  <span class="font-707 text-[12.5px] truncate pr-2">{{ p.label }}<span v-if="p.isCurrent"> (Current)</span></span>
                  <Check v-if="targetPageId === p.id" class="size-[15px] text-black shrink-0" />
                </button>
              </div>
            </Teleport>
          </div>
        </div>

        <!-- Conditional URL Input if Link selected for Primary Button -->
        <div v-if="actionType === 'link'" class="w-full pt-1 flex flex-col gap-3 animate-in fade-in duration-150">
          <div class="flex flex-col gap-1.5 w-full">
            <span class="font-707 text-[12px] font-medium text-neutral-600">URL</span>
            <div class="border border-[#aaa] focus-within:border-black border-solid flex h-[38px] items-center px-[14px] rounded-[8px] w-full bg-white transition-colors">
              <input 
                v-model="actionUrl" 
                placeholder="https://example.com" 
                class="w-full text-[13px] font-707 text-black focus:outline-none placeholder:text-neutral-400 font-mono"
              />
            </div>
          </div>

          <!-- Open in New Tab Toggle -->
          <div class="flex items-center justify-between w-full pt-0.5">
            <span class="font-707 text-[12px] font-medium text-black">Open in New Tab</span>
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
            @click="openModalSetup('primary')"
            class="apple-glass-btn-dark w-full h-[38px] rounded-[8px] flex items-center justify-between px-3.5 font-707 font-medium text-[12px] cursor-pointer transition-all shadow-sm"
          >
            <span class="flex items-center gap-2">
              <SlidersHorizontal class="size-3.5" />
              <span>Edit Pop Up</span>
            </span>
            <ArrowRight class="size-3.5 opacity-80" />
          </button>
        </div>
      </div>

      <!-- 2. SECONDARY BUTTON ACTION (Dual Mode Only: No Button) -->
      <div 
        v-if="layoutMode === 'dual'"
        class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full animate-in fade-in duration-150"
      >
        <div class="content-stretch flex items-center justify-between w-full relative">
          <div class="flex items-center gap-1.5">
            <p class="font-707 font-medium text-[13px] leading-[18px] text-black whitespace-nowrap">
              Button 2 Action
            </p>
            <InfoHint text="Set an independent action for the second button (e.g. open a link, pop-up, or skip to a page)." />
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

        <!-- Conditional Target Page Picker for Secondary Button -->
        <div v-if="secondaryActionType === 'submit'" class="flex items-center justify-between w-full pt-1 relative animate-in fade-in duration-150">
          <div class="flex items-center gap-1.5">
            <p class="font-707 font-medium text-[13px] leading-[18px] text-black whitespace-nowrap">
              Target Page
            </p>
            <InfoHint text="Pick where Button 2 goes after submitting, or leave as next page." />
          </div>
          <div class="relative" ref="secondaryTargetPageBtnRef">
            <button
              type="button"
              @click="isSecondaryTargetPageDropdownOpen = !isSecondaryTargetPageDropdownOpen"
              class="apple-glass-btn flex h-[38px] items-center justify-between px-[14px] py-[6px] rounded-[8px] w-[210px] cursor-pointer text-left"
            >
              <span class="font-707 text-[13px] text-black truncate">{{ selectedSecondaryTargetPageLabel }}</span>
              <ChevronDown 
                class="size-[15px] text-black transition-transform duration-200 shrink-0 ml-1.5" 
                :class="isSecondaryTargetPageDropdownOpen ? 'rotate-180' : ''"
              />
            </button>
            <Teleport to="body">
              <div 
                v-if="isSecondaryTargetPageDropdownOpen" 
                ref="secondaryTargetPageMenuRef"
                :style="secondaryTargetPagePopoverStyle"
                class="bg-white/95 backdrop-blur-xl border border-black/10 rounded-[8px] shadow-[0px_8px_30px_rgba(0,0,0,0.15)] py-1 z-50 flex flex-col overflow-y-auto animate-in fade-in duration-150 select-none"
              >
                <button
                  type="button"
                  @click="selectSecondaryTargetPage('')"
                  class="flex items-center justify-between px-[14px] py-[8px] text-left hover:bg-black/5 transition-colors cursor-pointer"
                  :class="!secondaryTargetPageId ? 'font-medium text-black bg-black/5' : 'text-neutral-700'"
                >
                  <span class="font-707 text-[13px]">Next Page (Default)</span>
                  <Check v-if="!secondaryTargetPageId" class="size-[15px] text-black" />
                </button>
                <button
                  v-for="p in funnelTargetPages"
                  :key="p.id"
                  type="button"
                  :disabled="p.isCurrent"
                  @click="selectSecondaryTargetPage(p.id)"
                  class="flex items-center justify-between px-[14px] py-[8px] text-left transition-colors"
                  :class="[
                    p.isCurrent ? 'opacity-40 cursor-not-allowed text-neutral-400' : 'hover:bg-black/5 cursor-pointer',
                    secondaryTargetPageId === p.id ? 'font-medium text-black bg-black/5' : 'text-neutral-700'
                  ]"
                >
                  <span class="font-707 text-[12.5px] truncate pr-2">{{ p.label }}<span v-if="p.isCurrent"> (Current)</span></span>
                  <Check v-if="secondaryTargetPageId === p.id" class="size-[15px] text-black shrink-0" />
                </button>
              </div>
            </Teleport>
          </div>
        </div>

        <!-- Conditional URL Input if Link selected for Secondary Button -->
        <div v-if="secondaryActionType === 'link'" class="w-full pt-1 flex flex-col gap-3 animate-in fade-in duration-150">
          <div class="flex flex-col gap-1.5 w-full">
            <span class="font-707 text-[12px] font-medium text-neutral-600">URL</span>
            <div class="border border-[#aaa] focus-within:border-black border-solid flex h-[38px] items-center px-[14px] rounded-[8px] w-full bg-white transition-colors">
              <input 
                v-model="secondaryActionUrl" 
                placeholder="https://example.com" 
                class="w-full text-[13px] font-707 text-black focus:outline-none placeholder:text-neutral-400 font-mono"
              />
            </div>
          </div>

          <!-- Secondary Open in New Tab Toggle -->
          <div class="flex items-center justify-between w-full pt-0.5">
            <span class="font-707 text-[12px] font-medium text-black">Open in New Tab</span>
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
            @click="openModalSetup('secondary')"
            class="apple-glass-btn-dark w-full h-[38px] rounded-[8px] flex items-center justify-between px-3.5 font-707 font-medium text-[12px] cursor-pointer transition-all shadow-sm"
          >
            <span class="flex items-center gap-2">
              <SlidersHorizontal class="size-3.5" />
              <span>Edit Pop Up</span>
            </span>
            <ArrowRight class="size-3.5 opacity-80" />
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { CTA_ACTION_OPTIONS, normalizeCtaAction, getFunnelTargetPages } from './ctaActions.ts';
import { ref, computed } from 'vue';
import { useEditorStore } from '../../stores/editorStore.ts';
import { FIGMA_ASSETS } from '../../constants/figmaAssets.ts';
import { useModalPopover } from '../common/modalPopover.ts';
import InfoHint from '../common/InfoHint.vue';
import { 
  ChevronDown, 
  Check, 
  ArrowRight, 
  SlidersHorizontal,
  Bell,
  TextCursorInput,
  ListOrdered,
  ListFilter,
  LayoutGrid,
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
  { id: 'style' as const, label: 'Style', icon: Layout },
  { id: 'action' as const, label: 'Action', icon: Link2 }
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

function setModalVariant(v: ModalVariant, target: 'primary' | 'secondary' = 'primary') {
  if (!targetWidget.value) return;
  const modalKey = target === 'secondary' ? 'secondaryModalProps' : 'modalProps';
  const existing = targetWidget.value.props[modalKey] || {};
  let updated: Record<string, any> = { ...existing, variant: v };

  if (v === 'message-alert') {
    updated.title = updated.title || (target === 'secondary' ? 'Action Cancelled' : 'Your Pass Has Been Sent');
    updated.subtitle = updated.subtitle || (target === 'secondary' ? 'You have declined or cancelled.' : 'Please provide a valid email address.');
    updated.buttonText = updated.buttonText || 'Done';
    updated.buttonVariant = updated.buttonVariant || 'black';
  } else if (v === 'message-field') {
    updated.title = updated.title || 'Update Your Email';
    updated.subtitle = updated.subtitle || 'Please provide a valid email address.';
    updated.fieldPlaceholder = updated.fieldPlaceholder || 'Email*';
    updated.fieldType = updated.fieldType || 'email';
    updated.buttonText = updated.buttonText || 'Done';
    updated.buttonVariant = updated.buttonVariant || 'black';
  } else if (v === 'choice-detailed') {
    updated.title = updated.title || 'Select Arrival Date';
    updated.subtitle = updated.subtitle || 'Please provide a valid email address.';
    updated.buttonText = updated.buttonText || 'Done';
    updated.buttonVariant = updated.buttonVariant || 'black';
    updated.options = updated.options || [
      { id: 'opt_1', label: 'Day 1', sublabel: '2 September 2026', description: 'Your Event Descriptions Detail', selected: true },
      { id: 'opt_2', label: 'Day 2', sublabel: '3 September 2026', description: 'Your Event Descriptions Detail', selected: false }
    ];
  } else if (v === 'choice-simple') {
    updated.title = updated.title || 'Select Arrival Date';
    updated.subtitle = updated.subtitle || 'Please provide a valid email address.';
    updated.buttonText = updated.buttonText || 'Done';
    updated.buttonVariant = updated.buttonVariant || 'black';
    updated.options = updated.options || [
      { id: 'opt_1', label: '+62', sublabel: 'Indonesia', selected: true },
      { id: 'opt_2', label: '+65', sublabel: 'Singapore', selected: false }
    ];
  }

  editorStore.updateWidgetProps(targetWidget.value.id, { [modalKey]: updated });
}

function openModalSetup(target: 'primary' | 'secondary' = 'primary') {
  if (targetWidget.value) {
    const modalKey = target === 'secondary' ? 'secondaryModalProps' : 'modalProps';
    if (!targetWidget.value.props[modalKey]) {
      setModalVariant('message-alert', target);
    }
    editorStore.activeModalKey = modalKey;
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
        secondaryLabel: targetWidget.value.props.secondaryLabel || 'NO',
        secondaryVariant: targetWidget.value.props.secondaryVariant || 'white',
        secondaryActionType: targetWidget.value.props.secondaryActionType || 'modal',
        secondaryOpenInNewTab: targetWidget.value.props.secondaryOpenInNewTab ?? true,
        dualOrientation: targetWidget.value.props.dualOrientation || 'horizontal'
      });
    }
  }
});

// Dual Buttons Orientation: horizontal (left-right) vs vertical (top-bottom)
const dualOrientation = computed({
  get: () => targetWidget.value?.props?.dualOrientation || 'horizontal',
  set: (val: 'horizontal' | 'vertical') => {
    if (targetWidget.value) {
      editorStore.updateWidgetProps(targetWidget.value.id, { dualOrientation: val });
    }
  }
});

const buttonLabel = computed({
  get: () => targetWidget.value?.props?.label || targetWidget.value?.props?.buttonText || targetWidget.value?.props?.ctaLabel || (layoutMode.value === 'dual' ? 'YES' : 'BUTTON CTA'),
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
  get: () => targetWidget.value?.props?.secondaryLabel || 'NO',
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
    openModalSetup('primary');
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
    return 'modal';
  },
  set: (val: string) => {
    if (targetWidget.value) {
      editorStore.updateWidgetProps(targetWidget.value.id, { secondaryActionType: val });
    }
  }
});

const selectedSecondaryActionLabel = computed(() => {
  const opt = allLinkToOptions.find(o => o.value === secondaryActionType.value);
  return opt ? opt.label : 'Popup Modal';
});

function selectSecondaryLinkTo(val: string) {
  secondaryActionType.value = val;
  isSecondaryLinkToDropdownOpen.value = false;
  if (val === 'modal' && targetWidget.value) {
    openModalSetup('secondary');
  }
}

// Primary & Secondary Target Page Dropdowns
const isTargetPageDropdownOpen = ref(false);
const targetPageBtnRef = ref<HTMLElement | null>(null);
const { style: targetPagePopoverStyle, menuRef: targetPageMenuRef } = useModalPopover(targetPageBtnRef, isTargetPageDropdownOpen, { align: 'right', width: 220 });

const isSecondaryTargetPageDropdownOpen = ref(false);
const secondaryTargetPageBtnRef = ref<HTMLElement | null>(null);
const { style: secondaryTargetPagePopoverStyle, menuRef: secondaryTargetPageMenuRef } = useModalPopover(secondaryTargetPageBtnRef, isSecondaryTargetPageDropdownOpen, { align: 'right', width: 220 });

const funnelTargetPages = computed(() => {
  return getFunnelTargetPages(editorStore.pages, editorStore.currentPage?.id);
});

const targetPageId = computed({
  get: () => targetWidget.value?.props?.targetPageId || targetWidget.value?.props?.ctaTargetPageId || '',
  set: (val: string) => {
    if (targetWidget.value) {
      editorStore.updateWidgetProps(targetWidget.value.id, { targetPageId: val, ctaTargetPageId: val });
    }
  }
});

const selectedTargetPageLabel = computed(() => {
  if (!targetPageId.value) return 'Next Page (Default)';
  const match = funnelTargetPages.value.find(p => p.id === targetPageId.value);
  return match ? match.label : 'Next Page (Default)';
});

function selectTargetPage(id: string) {
  targetPageId.value = id;
  isTargetPageDropdownOpen.value = false;
}

const secondaryTargetPageId = computed({
  get: () => targetWidget.value?.props?.secondaryTargetPageId || '',
  set: (val: string) => {
    if (targetWidget.value) {
      editorStore.updateWidgetProps(targetWidget.value.id, { secondaryTargetPageId: val });
    }
  }
});

const selectedSecondaryTargetPageLabel = computed(() => {
  if (!secondaryTargetPageId.value) return 'Next Page (Default)';
  const match = funnelTargetPages.value.find(p => p.id === secondaryTargetPageId.value);
  return match ? match.label : 'Next Page (Default)';
});

function selectSecondaryTargetPage(id: string) {
  secondaryTargetPageId.value = id;
  isSecondaryTargetPageDropdownOpen.value = false;
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
