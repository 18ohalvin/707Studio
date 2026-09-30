<template>
  <aside 
    v-if="isOpen"
    @click.stop
    @wheel.stop
    class="absolute right-[24px] top-1/2 -translate-y-1/2 w-[464px] h-auto max-h-[calc(100vh-140px)] backdrop-blur-2xl bg-[rgba(255,255,255,0.92)] border border-black/8 content-stretch flex flex-col items-start overflow-y-auto pb-[32px] rounded-[12px] shadow-[0px_20px_50px_0px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.05)] z-40 select-none transition-all animate-apple-slide-right-center no-scrollbar"
    data-node-id="113:3887"
  >
    <!-- Widget Container & Header -->
    <div class="content-stretch flex flex-col items-start p-[24px] shrink-0 w-full border-b border-[#f0f0f0]">
      <div class="content-stretch flex items-center justify-between shrink-0 w-full">
        <p class="font-707 font-medium text-[16px] leading-[22px] text-black whitespace-nowrap">
          Media/Banners Setup
        </p>
        <button 
          @click="$emit('close')"
          class="apple-glass-icon-btn size-7 flex items-center justify-center rounded-full cursor-pointer"
        >
          <img :src="FIGMA_ASSETS.closeIcon" class="w-3.5 h-3.5" alt="Close" />
        </button>
      </div>
    </div>

    <!-- Upload or Drag Media Section -->
    <div class="content-stretch flex flex-col items-start p-[24px] shrink-0 w-full">
      <input 
        type="file" 
        ref="fileInputRef" 
        accept="image/*" 
        @change="handleFileChange" 
        class="hidden" 
      />
      <div 
        @click="triggerUpload"
        @dragover.prevent="isDragOverMedia = true"
        @dragleave="isDragOverMedia = false"
        @drop.prevent="handleMediaDrop"
        :class="[
          isDragOverMedia ? 'border-black bg-neutral-100 scale-[0.99]' : 'bg-[#f5f5f5] hover:bg-[#efefef] border-[#d9d9d9]',
          'border border-dashed content-stretch flex flex-col gap-[10px] h-[150px] items-center justify-center rounded-[8px] shrink-0 w-full cursor-pointer transition-all relative overflow-hidden group'
        ]"
      >
        <!-- If media already uploaded, show thumbnail preview with replace overlay -->
        <template v-if="currentImageUrl && !isCurrentSolidSpace">
          <img 
            :src="currentImageUrl" 
            class="size-full object-cover absolute inset-0" 
            alt="Uploaded Media" 
            @error="handleUploadThumbError"
          />
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white gap-1.5 p-2 text-center">
            <span class="font-707 font-medium text-[12px]">Click or drop to replace</span>
            <button 
              @click.stop="removeUploadedMedia"
              class="apple-glass-btn px-2.5 py-1 rounded-full text-[11px] font-707 text-black shadow-sm"
            >
              Reset to space block
            </button>
          </div>
        </template>

        <!-- Default upload placeholder -->
        <template v-else>
          <div class="size-[64px] flex items-center justify-center pointer-events-none">
            <img :src="FIGMA_ASSETS.mediaPicker" class="size-full object-contain" alt="Media Picker" />
          </div>
          <p class="font-707 font-normal text-[12px] text-black text-center">
            <button 
              type="button" 
              @click.stop="openMediaGallery"
              class="font-medium underline hover:text-neutral-700 cursor-pointer"
            >
              Select From Media Gallery
            </button>
            <span> or Drag</span>
          </p>
        </template>
      </div>
    </div>

    <!-- Ratio Presets -->
    <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full border-t border-[#f0f0f0]">
      <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
        Ratio Presets
      </p>
      <div class="flex flex-nowrap overflow-x-auto gap-[8px] items-center w-full pb-1 no-scrollbar">
        <button 
          v-for="ratio in ratios" 
          :key="ratio"
          @click="selectedRatio = ratio"
          :class="selectedRatio === ratio ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
          class="shrink-0 whitespace-nowrap content-stretch flex h-[36px] items-center justify-center px-[13px] py-[6px] rounded-[8px] text-[12px] font-707 cursor-pointer"
        >
          {{ ratio }}
        </button>
      </div>
    </div>

    <!-- Set Media Fits -->
    <div class="content-stretch flex items-center justify-between p-[24px] shrink-0 w-full border-t border-[#f0f0f0] relative">
      <p class="font-707 font-medium text-[13px] leading-[18px] text-black whitespace-nowrap">
        Set Media Fits
      </p>
      <div class="relative">
        <button
          type="button"
          @click="isMediaFitDropdownOpen = !isMediaFitDropdownOpen"
          class="apple-glass-btn flex h-[38px] items-center justify-between px-[14px] py-[6px] rounded-[8px] w-[240px] cursor-pointer text-left"
        >
          <span class="font-707 text-[13px] text-black">{{ selectedMediaFit }}</span>
          <ChevronDown 
            class="size-[15px] text-black transition-transform duration-200" 
            :class="isMediaFitDropdownOpen ? 'rotate-180' : ''"
          />
        </button>

        <!-- Dropdown Menu -->
        <div 
          v-if="isMediaFitDropdownOpen" 
          class="absolute right-0 top-[44px] w-[240px] bg-white/95 backdrop-blur-xl border border-black/10 rounded-[8px] shadow-lg py-1 z-30 flex flex-col"
        >
          <button
            v-for="fit in mediaFitOptions"
            :key="fit"
            type="button"
            @click="selectMediaFit(fit)"
            class="flex items-center justify-between px-[14px] py-[8px] text-left hover:bg-black/5 transition-colors cursor-pointer"
            :class="selectedMediaFit === fit ? 'font-medium text-black bg-black/5' : 'text-neutral-700'"
          >
            <span class="font-707 text-[13px]">{{ fit }}</span>
            <Check v-if="selectedMediaFit === fit" class="size-[15px] text-black" />
          </button>
        </div>
      </div>
    </div>

    <!-- Add Brand Logo Section (Maximum height 32px, Select from media gallery / drag) -->
    <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full border-t border-[#f0f0f0]">
      <!-- Title row with Apple Style Toggle Switch -->
      <div class="flex items-center justify-between w-full">
        <div class="flex flex-col gap-0.5">
          <p 
            class="font-707 font-medium text-[13px] leading-[18px]"
            :class="isTopPosition ? 'text-black' : 'text-neutral-400'"
          >
            Add Brand Logo
          </p>
          <p v-if="!isTopPosition" class="text-[10px] font-707 text-neutral-400">
            Available only for top banner
          </p>
        </div>

        <!-- Modern Elegant Apple Style Toggle Switch -->
        <button
          type="button"
          role="switch"
          :disabled="!isTopPosition"
          :aria-checked="isTopPosition && isBrandLogoEnabled"
          @click="toggleBrandLogo"
          class="relative inline-flex h-[22px] w-[40px] shrink-0 rounded-full p-[2px] transition-colors duration-200 ease-in-out focus:outline-none"
          :class="[
            !isTopPosition 
              ? 'opacity-40 cursor-not-allowed bg-[#e5e5ea]' 
              : ((isBrandLogoEnabled) ? 'bg-black cursor-pointer' : 'bg-[#e5e5ea] cursor-pointer')
          ]"
          :title="isTopPosition ? 'Toggle Brand Logo' : 'Brand logo is only available when banner is positioned at the top of the canvas'"
        >
          <span
            aria-hidden="true"
            class="pointer-events-none inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] ring-0 transition duration-200 ease-in-out"
            :class="(isTopPosition && isBrandLogoEnabled) ? 'translate-x-[18px]' : 'translate-x-0'"
          />
        </button>
      </div>

      <!-- Brand Logo Presets (appear only if banner is top AND toggle is on) -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform opacity-0 -translate-y-2"
        enter-to-class="transform opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="transform opacity-100 translate-y-0"
        leave-to-class="transform opacity-0 -translate-y-2"
      >
        <div v-if="isTopPosition && isBrandLogoEnabled" class="flex flex-col gap-[12px] w-full pt-1">
          <!-- Logo Preview or Drop/Select Area -->
          <div 
            v-if="brandLogoUrl" 
            class="relative border border-[#d9d9d9] rounded-[8px] p-3 flex items-center justify-between bg-white hover:border-black transition-colors"
          >
            <div class="flex items-center gap-3">
              <div class="h-[52px] min-w-[52px] max-w-[150px] flex items-center justify-center bg-neutral-50 px-2 rounded border border-neutral-200">
                <img :src="brandLogoUrl" alt="Brand Logo" class="max-h-[48px] h-[48px] w-auto object-contain" />
              </div>
              <div class="flex flex-col">
                <span class="text-[12px] font-707 font-medium text-black truncate max-w-[130px]">Brand Logo</span>
                <span class="text-[10px] font-707 text-neutral-400">Height: 48px</span>
              </div>
            </div>
            <div class="flex items-center gap-1.5">
              <button 
                type="button"
                @click="openMediaGalleryForLogo"
                class="apple-glass-btn text-[11px] font-707 px-2.5 py-1 rounded-[6px] cursor-pointer"
                title="Change Logo"
              >
                Change
              </button>
              <button 
                type="button"
                @click="removeBrandLogo" 
                class="apple-glass-icon-btn size-7 rounded-[6px] flex items-center justify-center text-neutral-500 hover:text-red-600 cursor-pointer"
                title="Remove Logo"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div 
            v-else
            @click="triggerLogoUpload"
            @dragover.prevent="isDragOverLogo = true"
            @dragleave="isDragOverLogo = false"
            @drop.prevent="handleLogoDrop"
            :class="[
              isDragOverLogo ? 'border-black bg-neutral-100' : 'bg-[#f5f5f5] hover:bg-[#efefef] border-[#d9d9d9]',
              'border border-dashed content-stretch flex flex-col gap-[4px] py-[14px] px-[14px] items-center justify-center rounded-[8px] shrink-0 w-full cursor-pointer transition-all relative group'
            ]"
          >
            <input 
              type="file" 
              ref="logoInputRef" 
              accept="image/*" 
              @change="handleLogoFileChange" 
              class="hidden" 
            />
            <p class="font-707 text-[12px] text-neutral-700 text-center">
              <button 
                type="button" 
                @click.stop="openMediaGalleryForLogo"
                class="font-medium text-black underline hover:text-neutral-700 cursor-pointer"
              >
                Select From Media Gallery
              </button>
              <span> or Drag</span>
            </p>
            <span class="text-[10px] font-707 text-neutral-400">Fixed height 48px</span>
          </div>

          <!-- Logo Alignment (Left, Center, Right) -->
          <div class="flex items-center justify-between w-full pt-1">
            <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
              Logo Alignment
            </p>
            <div class="flex gap-[6px] items-center">
              <button 
                v-for="align in (['left', 'center', 'right'] as const)" 
                :key="align"
                @click="brandLogoAlign = align"
                :class="brandLogoAlign === align ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
                class="px-3 h-[32px] rounded-[6px] flex items-center justify-center font-707 text-[12px] capitalize cursor-pointer"
              >
                {{ align }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Add Banner Text Section with Apple Style Toggle Switch -->
    <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full border-t border-[#f0f0f0]">
      <!-- Title row with Apple Style Toggle Switch -->
      <div class="flex items-center justify-between w-full">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
          Add Banner Text
        </p>

        <!-- Modern Elegant Apple Style Toggle Switch -->
        <button
          type="button"
          role="switch"
          :aria-checked="isBannerTextEnabled"
          @click="toggleBannerText"
          class="relative inline-flex h-[22px] w-[40px] shrink-0 cursor-pointer rounded-full p-[2px] transition-colors duration-200 ease-in-out focus:outline-none"
          :class="isBannerTextEnabled ? 'bg-black' : 'bg-[#e5e5ea]'"
          title="Toggle Banner Text Presets"
        >
          <span
            aria-hidden="true"
            class="pointer-events-none inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] ring-0 transition duration-200 ease-in-out"
            :class="isBannerTextEnabled ? 'translate-x-[18px]' : 'translate-x-0'"
          />
        </button>
      </div>

      <!-- Presets (Headline, Subheadline, Text Position, Text Alignment) - appear only if toggle is on -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform opacity-0 -translate-y-2"
        enter-to-class="transform opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="transform opacity-100 translate-y-0"
        leave-to-class="transform opacity-0 -translate-y-2"
      >
        <div v-if="isBannerTextEnabled" class="flex flex-col gap-[12px] w-full pt-1">
          <!-- Headline (Single line default, auto-expands if multiline) -->
          <div class="border border-[#aaa] focus-within:border-black border-solid flex min-h-[38px] h-auto items-center px-[14px] py-[6px] rounded-[8px] w-full bg-white transition-all">
            <textarea 
              ref="headlineRef"
              v-model="headline"
              rows="1"
              @input="handleHeadlineInput"
              placeholder="Headline"
              class="w-full text-[13px] font-707 text-black focus:outline-none placeholder:text-neutral-400 resize-none bg-transparent leading-[20px] overflow-hidden p-0 m-0"
            />
          </div>

          <!-- Subheadline (Single line default, auto-expands if multiline) -->
          <div class="border border-[#aaa] focus-within:border-black border-solid flex min-h-[38px] h-auto items-center px-[14px] py-[6px] rounded-[8px] w-full bg-white transition-all">
            <textarea 
              ref="subheadlineRef"
              v-model="subheadline"
              rows="1"
              @input="handleSubheadlineInput"
              placeholder="Sub Headline"
              class="w-full text-[13px] font-707 text-black focus:outline-none placeholder:text-neutral-400 resize-none bg-transparent leading-[20px] overflow-hidden p-0 m-0"
            />
          </div>

          <!-- Tag / Badge (Optional, placed under Sub Headline) -->
          <div v-if="!isBadgeOptionOpen && !badge" class="flex items-center w-full pt-0.5">
            <button 
              type="button" 
              @click="showBadgeInput"
              class="apple-glass-btn font-707 text-[12px] flex items-center gap-1.5 py-1.5 px-3 rounded-lg cursor-pointer"
            >
              <Plus class="w-3.5 h-3.5 text-neutral-500" />
              <span>Add Tag / Badge (Optional)</span>
            </button>
          </div>
          <div v-else class="flex flex-col gap-1.5 w-full">
            <div class="flex items-center justify-between">
              <span class="font-707 text-[11px] font-medium text-neutral-600">Tag / Badge (Top of Headline)</span>
              <button 
                type="button" 
                @click="removeBadge" 
                class="apple-glass-btn font-707 text-[11px] px-2 py-0.5 rounded-[4px] text-neutral-500 hover:text-red-500 cursor-pointer"
              >
                Remove
              </button>
            </div>
            <div class="border border-[#aaa] focus-within:border-black border-solid flex h-[38px] items-center px-[14px] rounded-[8px] w-full bg-white transition-colors">
              <input 
                ref="badgeInputRef"
                v-model="badge"
                placeholder="e.g. ONLINE EXCLUSIVE, SPECIAL RELEASE"
                class="w-full text-[13px] font-707 text-black focus:outline-none placeholder:text-neutral-400"
              />
            </div>
          </div>

          <!-- Text Position -->
          <div class="flex items-center justify-between w-full pt-1">
            <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
              Text Position
            </p>
            <div class="flex gap-[6px] items-center">
              <button 
                v-for="pos in textPositions" 
                :key="pos.value"
                @click="textPosition = pos.value"
                :class="textPosition === pos.value ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
                class="px-3.5 h-[32px] rounded-[6px] flex items-center justify-center font-707 text-[12px] cursor-pointer"
              >
                {{ pos.label }}
              </button>
            </div>
          </div>

          <!-- Text Alignment -->
          <div class="flex items-center justify-between w-full pt-1">
            <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
              Text Alignment
            </p>
            <div class="flex gap-[6px] items-center">
              <button 
                @click="textAlign = 'left'"
                :class="textAlign === 'left' ? 'apple-glass-btn-dark' : 'apple-glass-btn'"
                class="rounded-[6px] size-[32px] flex items-center justify-center cursor-pointer"
                title="Align Left"
              >
                <AlignLeft class="size-3.5" />
              </button>
              <button 
                @click="textAlign = 'center'"
                :class="textAlign === 'center' ? 'apple-glass-btn-dark' : 'apple-glass-btn'"
                class="rounded-[6px] size-[32px] flex items-center justify-center cursor-pointer"
                title="Align Center"
              >
                <AlignCenter class="size-3.5" />
              </button>
              <button 
                @click="textAlign = 'right'"
                :class="textAlign === 'right' ? 'apple-glass-btn-dark' : 'apple-glass-btn'"
                class="rounded-[6px] size-[32px] flex items-center justify-center cursor-pointer"
                title="Align Right"
              >
                <AlignRight class="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Image Overlay / Scrim Section with Apple Style Toggle Switch & Slider -->
    <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full border-t border-[#f0f0f0]">
      <!-- Title row with Apple Style Toggle Switch -->
      <div class="flex items-center justify-between w-full">
        <div>
          <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
            Image Overlay / Scrim
          </p>
          <p v-if="textPosition === 'center'" class="font-707 text-[10px] text-neutral-400 mt-0.5">
            Auto-disabled for center text position
          </p>
        </div>

        <!-- Modern Elegant Apple Style Toggle Switch (auto-disabled if Center) -->
        <button
          type="button"
          role="switch"
          :aria-checked="isOverlayEnabled && textPosition !== 'center'"
          :disabled="textPosition === 'center'"
          @click="toggleOverlay"
          class="relative inline-flex h-[22px] w-[40px] shrink-0 rounded-full p-[2px] transition-all duration-200 ease-in-out focus:outline-none"
          :class="[
            textPosition === 'center' ? 'opacity-40 cursor-not-allowed bg-[#e5e5ea]' : 
            (isOverlayEnabled ? 'bg-black cursor-pointer' : 'bg-[#e5e5ea] cursor-pointer')
          ]"
          :title="textPosition === 'center' ? 'Image Overlay is disabled when Center text position is active' : 'Toggle Image Overlay / Scrim'"
        >
          <span
            aria-hidden="true"
            class="pointer-events-none inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] ring-0 transition duration-200 ease-in-out"
            :class="(isOverlayEnabled && textPosition !== 'center') ? 'translate-x-[18px]' : 'translate-x-0'"
          />
        </button>
      </div>

      <!-- Scrim Intensity / Opacity Slider (appears when toggle is ON) -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform opacity-0 -translate-y-2"
        enter-to-class="transform opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="transform opacity-100 translate-y-0"
        leave-to-class="transform opacity-0 -translate-y-2"
      >
        <div v-if="isOverlayEnabled" class="flex flex-col gap-[10px] w-full pt-1">
          <div class="flex items-center justify-between w-full">
            <span class="font-707 text-[12px] text-neutral-500">Scrim Opacity</span>
            <span class="font-707 text-[12px] font-medium text-black bg-neutral-100 px-2 py-0.5 rounded-[4px]">{{ overlayOpacity }}%</span>
          </div>
          <div class="flex items-center w-full">
            <input 
              type="range"
              min="0"
              max="100"
              step="1"
              v-model.number="overlayOpacity"
              class="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-black"
            />
          </div>
        </div>
      </Transition>
    </div>

    <!-- Add CTA Button with Apple Style Toggle Switch -->
    <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full border-t border-[#f0f0f0]">
      <!-- Title row with Apple Style Toggle Switch -->
      <div class="flex items-center justify-between w-full">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
          Add CTA Button
        </p>

        <!-- Modern Elegant Apple Style Toggle Switch -->
        <button
          type="button"
          role="switch"
          :aria-checked="isCtaEnabled"
          @click="toggleCta"
          class="relative inline-flex h-[22px] w-[40px] shrink-0 cursor-pointer rounded-full p-[2px] transition-colors duration-200 ease-in-out focus:outline-none"
          :class="isCtaEnabled ? 'bg-black' : 'bg-[#e5e5ea]'"
          title="Toggle CTA Button"
        >
          <span
            aria-hidden="true"
            class="pointer-events-none inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] ring-0 transition duration-200 ease-in-out"
            :class="isCtaEnabled ? 'translate-x-[18px]' : 'translate-x-0'"
          />
        </button>
      </div>

      <!-- CTA Button Settings (Appears only when toggle is on) -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform opacity-0 -translate-y-2"
        enter-to-class="transform opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="transform opacity-100 translate-y-0"
        leave-to-class="transform opacity-0 -translate-y-2"
      >
        <div v-if="isCtaEnabled" class="flex flex-col gap-[12px] w-full pt-1">
          <!-- Button Text Input -->
          <div class="border border-[#aaa] focus-within:border-black border-solid flex h-[38px] items-center px-[14px] rounded-[8px] w-full bg-white transition-colors">
            <input 
              v-model="buttonText"
              placeholder="Button Text (e.g. Enter Raffle)"
              class="w-full text-[13px] font-707 text-black focus:outline-none placeholder:text-neutral-400 uppercase"
            />
          </div>

          <!-- Position Selector (Standard vs Sticky Bottom) -->
          <div class="flex items-center justify-between w-full pt-1">
            <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
              Position
            </p>
            <div class="flex gap-[6px] items-center">
              <button 
                v-for="pos in ctaPositionModes" 
                :key="pos.value"
                type="button"
                @click="setCtaPositionMode(pos.value)"
                :class="ctaPositionMode === pos.value ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
                class="px-3.5 h-[32px] rounded-[6px] flex items-center justify-center font-707 text-[12px] cursor-pointer"
              >
                {{ pos.label }}
              </button>
            </div>
          </div>

          <!-- Sticky Notice (Appears when Sticky Bottom is active - strictly applied to this page only) -->
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="transform opacity-0 -translate-y-2"
            enter-to-class="transform opacity-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="transform opacity-100 translate-y-0"
            leave-to-class="transform opacity-0 -translate-y-2"
          >
            <div v-if="ctaPositionMode === 'sticky-bottom'" class="flex items-center justify-between w-full pt-1">
              <span class="font-707 text-[12px] text-neutral-500">
                Applied to this page only
              </span>
              <span class="font-707 text-[10px] text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-[4px] border border-neutral-200">
                Current Page Only
              </span>
            </div>
          </Transition>

          <!-- Link to Dropdown (Matching Set Media Fits style) -->
          <div class="content-stretch flex items-center justify-between w-full pt-1 relative">
            <p class="font-707 font-medium text-[13px] leading-[18px] text-black whitespace-nowrap">
              Link to
            </p>
            <div class="relative">
              <button
                type="button"
                @click="isLinkToDropdownOpen = !isLinkToDropdownOpen"
                class="apple-glass-btn flex h-[38px] items-center justify-between px-[14px] py-[6px] rounded-[8px] w-[240px] cursor-pointer text-left"
              >
                <span class="font-707 text-[13px] text-black">{{ selectedActionLabel }}</span>
                <ChevronDown 
                  class="size-[15px] text-black transition-transform duration-200" 
                  :class="isLinkToDropdownOpen ? 'rotate-180' : ''"
                />
              </button>

              <!-- Dropdown Menu -->
              <div 
                v-if="isLinkToDropdownOpen" 
                class="absolute right-0 top-[44px] w-[240px] bg-white/95 backdrop-blur-xl border border-black/10 rounded-[8px] shadow-lg py-1 z-30 flex flex-col"
              >
                <button
                  v-for="opt in linkToOptions"
                  :key="opt.value"
                  type="button"
                  @click="selectLinkTo(opt.value)"
                  class="flex items-center justify-between px-[14px] py-[8px] text-left hover:bg-black/5 transition-colors cursor-pointer"
                  :class="ctaActionType === opt.value ? 'font-medium text-black bg-black/5' : 'text-neutral-700'"
                >
                  <span class="font-707 text-[13px]">{{ opt.label }}</span>
                  <Check v-if="ctaActionType === opt.value" class="size-[15px] text-black" />
                </button>
              </div>
            </div>
          </div>

          <!-- Conditional URL Input if External URL is selected -->
          <div v-if="ctaActionType === 'link'" class="w-full pt-1 animate-in fade-in duration-150">
            <div class="border border-[#aaa] focus-within:border-black border-solid flex h-[38px] items-center px-[14px] rounded-[8px] w-full bg-white transition-colors">
              <input 
                v-model="ctaUrl" 
                placeholder="https://..." 
                class="w-full text-[13px] font-707 text-black focus:outline-none placeholder:text-neutral-400 font-mono"
              />
            </div>
          </div>

          <!-- Conditional Modal Setup Button if Popup Modal is selected -->
          <div v-if="ctaActionType === 'modal'" class="w-full pt-1 animate-in fade-in duration-150">
            <button 
              type="button"
              @click="openModalSetup"
              class="apple-glass-btn-dark w-full h-[36px] rounded-[8px] flex items-center justify-center gap-1.5 font-707 text-[12px] cursor-pointer"
            >
              <span>Configure Pop Up Modal</span>
              <span class="text-xs">➔</span>
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { useEditorStore } from '../../stores/editorStore.ts';
import { FIGMA_ASSETS } from '../../constants/figmaAssets.ts';
import { AlignLeft, AlignCenter, AlignRight, ChevronDown, Check, Trash2, Plus } from 'lucide-vue-next';
import { uploadMediaDirectly } from '../../services/mediaService.ts';

defineProps<{
  isOpen: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
}>();

const editorStore = useEditorStore();

const fileInputRef = ref<HTMLInputElement | null>(null);
const logoInputRef = ref<HTMLInputElement | null>(null);
const headlineRef = ref<HTMLTextAreaElement | null>(null);
const subheadlineRef = ref<HTMLTextAreaElement | null>(null);
const badgeInputRef = ref<HTMLInputElement | null>(null);
const isBadgeOptionOpen = ref(false);

function showBadgeInput() {
  isBadgeOptionOpen.value = true;
  nextTick(() => {
    badgeInputRef.value?.focus();
  });
}

function removeBadge() {
  badge.value = '';
  isBadgeOptionOpen.value = false;
  if (editorStore.selectedWidgetId) {
    editorStore.updateWidgetProps(editorStore.selectedWidgetId, { badge: '' });
  }
}

function autoResize(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
}

function handleHeadlineInput(e: Event) {
  autoResize(e.target as HTMLTextAreaElement);
}

function handleSubheadlineInput(e: Event) {
  autoResize(e.target as HTMLTextAreaElement);
}

const isDragOverMedia = ref(false);
const currentImageUrl = ref('');
const isCurrentSolidSpace = ref(true);

const ratios = ['Full screen landing page', '3:4', '4:5', '4:3', '16:9', '9:16', '1:1'];
const selectedRatio = ref(editorStore.selectedMediaRatio || 'Full screen landing page');

const mediaFitOptions = ['Fill the screen', 'Fit to screen', 'Center'] as const;
const selectedMediaFit = ref<'Fill the screen' | 'Fit to screen' | 'Center'>('Fill the screen');
const isMediaFitDropdownOpen = ref(false);

function selectMediaFit(fit: 'Fill the screen' | 'Fit to screen' | 'Center') {
  selectedMediaFit.value = fit;
  isMediaFitDropdownOpen.value = false;
  if (editorStore.selectedWidgetId) {
    editorStore.updateWidgetProps(editorStore.selectedWidgetId, { mediaFit: fit });
  }
}

function openMediaGallery() {
  editorStore.openMediaGallery('bannerImage');
}

function openMediaGalleryForLogo() {
  editorStore.openMediaGallery('brandLogo');
}

const textPositions = [
  { label: 'Bottom', value: 'bottom' },
  { label: 'Center', value: 'center' },
  { label: 'Top', value: 'top' },
] as const;

// Brand Logo state (Only active when banner is at the top of the canvas, index 0)
const isTopPosition = computed(() => {
  const tree = editorStore.currentPage.widget_tree;
  const selectedId = editorStore.selectedWidgetId;
  if (!selectedId || tree.length === 0) return false;
  return tree[0]?.id === selectedId;
});

const isBrandLogoEnabled = ref(false);
const brandLogoUrl = ref('');
const brandLogoAlign = ref<'left' | 'center' | 'right'>('left');
const isDragOverLogo = ref(false);

const badge = ref('');
const headline = ref('');
const subheadline = ref('');
const buttonText = ref('');
const textAlign = ref<'left' | 'center' | 'right'>('left');
const textPosition = ref<'bottom' | 'center' | 'top'>('bottom');
const isBannerTextEnabled = ref(false);

const isOverlayEnabled = ref(false);
const overlayOpacity = ref(50);
const isCtaEnabled = ref(false);

const ctaPositionModes = [
  { label: 'Standard', value: 'in-flow' },
  { label: 'Sticky Bottom', value: 'sticky-bottom' }
] as const;

const ctaPositionMode = ref<'in-flow' | 'sticky-bottom'>('in-flow');
const ctaStickyScope = ref<'current' | 'all' | 'custom'>('current');
const ctaStickyPageIds = ref<string[]>([]);
const isLinkToDropdownOpen = ref(false);

const linkToOptions = [
  { label: 'Next Page', value: 'next_page' },
  { label: 'Submit Form', value: 'submit' },
  { label: 'External URL', value: 'link' },
  { label: 'Popup Modal', value: 'modal' },
  { label: 'Scroll to Section', value: 'scroll' }
] as const;

const ctaActionType = ref('next_page');
const ctaUrl = ref('');

const selectedActionLabel = computed(() => {
  const opt = linkToOptions.find(o => o.value === ctaActionType.value);
  return opt ? opt.label : 'Next Page';
});

function selectLinkTo(val: string) {
  ctaActionType.value = val;
  isLinkToDropdownOpen.value = false;
  if (editorStore.selectedWidgetId) {
    const currentProps = editorStore.selectedWidget?.props || {};
    const defaultModalProps = currentProps.modalProps || {
      variant: 'message-alert',
      title: 'YOUR PASS HAS BEEN SENT.',
      subtitle: 'Please provide a valid email address. We will resend your E-Pass immediately.',
      buttonText: 'DONE'
    };
    editorStore.updateWidgetProps(editorStore.selectedWidgetId, { 
      actionType: val,
      ctaActionType: val,
      modalProps: defaultModalProps
    });
    if (val === 'modal') {
      editorStore.openModalSidebar();
    }
  }
}

function openModalSetup() {
  if (editorStore.selectedWidgetId) {
    const currentProps = editorStore.selectedWidget?.props || {};
    if (!currentProps.modalProps) {
      editorStore.updateWidgetProps(editorStore.selectedWidgetId, {
        modalProps: {
          variant: 'message-alert',
          title: 'YOUR PASS HAS BEEN SENT.',
          subtitle: 'Please provide a valid email address. We will resend your E-Pass immediately.',
          buttonText: 'DONE'
        }
      });
    }
    editorStore.openModalSidebar();
  }
}

function setCtaPositionMode(mode: 'in-flow' | 'sticky-bottom') {
  ctaPositionMode.value = mode;
  ctaStickyScope.value = 'current';
  ctaStickyPageIds.value = [editorStore.currentPage.id];
  if (editorStore.selectedWidgetId) {
    editorStore.updateWidgetProps(editorStore.selectedWidgetId, { 
      positionMode: mode,
      ctaPositionMode: mode,
      stickyScope: 'current',
      ctaStickyScope: 'current',
      stickyPageIds: [editorStore.currentPage.id],
      ctaStickyPageIds: [editorStore.currentPage.id]
    });
  }
}

function setCtaStickyScope(scope: 'current' | 'all' | 'custom') {
  ctaStickyScope.value = scope;
  const defaultPageIds = scope === 'all' 
    ? editorStore.pages.map(p => p.id) 
    : [editorStore.currentPage.id];
  ctaStickyPageIds.value = defaultPageIds;
  if (editorStore.selectedWidgetId) {
    editorStore.updateWidgetProps(editorStore.selectedWidgetId, { 
      stickyScope: scope,
      ctaStickyScope: scope,
      stickyPageIds: defaultPageIds,
      ctaStickyPageIds: defaultPageIds
    });
  }
}

function isPageStickySelected(pageId: string): boolean {
  return ctaStickyPageIds.value.includes(pageId);
}

function togglePageSticky(pageId: string) {
  const currentList = [...ctaStickyPageIds.value];
  const idx = currentList.indexOf(pageId);
  if (idx >= 0) {
    currentList.splice(idx, 1);
  } else {
    currentList.push(pageId);
  }
  ctaStickyPageIds.value = currentList;
  if (editorStore.selectedWidgetId) {
    editorStore.updateWidgetProps(editorStore.selectedWidgetId, { 
      stickyPageIds: currentList,
      ctaStickyPageIds: currentList
    });
  }
}

function toggleBrandLogo() {
  if (!isTopPosition.value) return;
  isBrandLogoEnabled.value = !isBrandLogoEnabled.value;
  if (editorStore.selectedWidgetId) {
    editorStore.updateWidgetProps(editorStore.selectedWidgetId, {
      isBrandLogoEnabled: isBrandLogoEnabled.value
    });
  }
}

function triggerLogoUpload() {
  logoInputRef.value?.click();
}

function handleLogoFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    processLogoFile(file);
  }
}

function handleLogoDrop(event: DragEvent) {
  isDragOverLogo.value = false;
  const jsonStr = event.dataTransfer?.getData('application/json');
  if (jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      if (data?.customProps?.imageUrl) {
        brandLogoUrl.value = data.customProps.imageUrl;
        isBrandLogoEnabled.value = true;
        if (editorStore.selectedWidgetId) {
          editorStore.updateWidgetProps(editorStore.selectedWidgetId, {
            brandLogoUrl: data.customProps.imageUrl,
            isBrandLogoEnabled: true
          });
        }
        return;
      }
    } catch (_) {}
  }
  const file = event.dataTransfer?.files?.[0];
  if (file) {
    processLogoFile(file);
  }
}

function processLogoFile(file: File) {
  const reader = new FileReader();
  reader.onload = async (e) => {
    const result = e.target?.result as string;
    if (result && editorStore.selectedWidgetId) {
      brandLogoUrl.value = result;
      isBrandLogoEnabled.value = true;
      
      // Upload to server directly
      const savedMedia = await uploadMediaDirectly({
        dataUrl: result,
        title: file.name.replace(/\.[^/.]+$/, ""),
        category: 'Logo',
        filename: file.name
      });

      brandLogoUrl.value = savedMedia.url;
      editorStore.updateWidgetProps(editorStore.selectedWidgetId, {
        brandLogoUrl: savedMedia.url,
        isBrandLogoEnabled: true
      });
    }
  };
  reader.readAsDataURL(file);
}

function removeBrandLogo() {
  brandLogoUrl.value = '';
  if (editorStore.selectedWidgetId) {
    editorStore.updateWidgetProps(editorStore.selectedWidgetId, {
      brandLogoUrl: ''
    });
  }
}

function toggleBannerText() {
  isBannerTextEnabled.value = !isBannerTextEnabled.value;
  if (editorStore.selectedWidgetId) {
    editorStore.updateWidgetProps(editorStore.selectedWidgetId, {
      showBannerText: isBannerTextEnabled.value
    });
  }
}

function toggleOverlay() {
  if (textPosition.value === 'center') return;
  isOverlayEnabled.value = !isOverlayEnabled.value;
  if (editorStore.selectedWidgetId) {
    editorStore.updateWidgetProps(editorStore.selectedWidgetId, {
      isOverlayEnabled: isOverlayEnabled.value,
      overlayOpacity: overlayOpacity.value
    });
  }
}

function toggleCta() {
  isCtaEnabled.value = !isCtaEnabled.value;
  if (editorStore.selectedWidgetId) {
    editorStore.updateWidgetProps(editorStore.selectedWidgetId, {
      isCtaEnabled: isCtaEnabled.value,
      showButton: isCtaEnabled.value,
      buttonText: isCtaEnabled.value ? (buttonText.value || 'Action') : ''
    });
    if (isCtaEnabled.value && !buttonText.value) {
      buttonText.value = 'Action';
    }
  }
}

function triggerUpload() {
  fileInputRef.value?.click();
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    processFile(file);
  }
  target.value = '';
}

function handleMediaDrop(event: DragEvent) {
  isDragOverMedia.value = false;
  const file = event.dataTransfer?.files?.[0];
  if (file) {
    processFile(file);
  }
}

function processFile(file: File) {
  const reader = new FileReader();
  reader.onload = async (e) => {
    const result = e.target?.result as string;
    if (result) {
      // Find target HeroDrop widget (either currently selected, or first in tree, or create)
      let targetWidgetId = editorStore.selectedWidgetId;
      if (!targetWidgetId || editorStore.selectedWidget?.type !== 'HeroDrop') {
        const existingHero = editorStore.currentPage.widget_tree.find(w => w.type === 'HeroDrop');
        if (existingHero) {
          targetWidgetId = existingHero.id;
          editorStore.selectWidget(existingHero.id);
        } else {
          const newWidget = editorStore.addWidget('HeroDrop', 0, {
            imageUrl: result,
            isSolidSpace: false,
            ratio: selectedRatio.value || 'Full screen landing page'
          });
          targetWidgetId = newWidget.id;
          editorStore.selectWidget(newWidget.id);
        }
      }

      // Update immediate local preview on both sidebar and canvas artboard
      currentImageUrl.value = result;
      isCurrentSolidSpace.value = false;
      if (targetWidgetId) {
        editorStore.updateWidgetProps(targetWidgetId, {
          imageUrl: result,
          isSolidSpace: false
        });
      }

      // Upload to server directly in background and replace with persistent URL
      try {
        const savedMedia = await uploadMediaDirectly({
          dataUrl: result,
          title: file.name.replace(/\.[^/.]+$/, ""),
          category: 'Photos',
          filename: file.name
        });

        if (savedMedia?.url) {
          currentImageUrl.value = savedMedia.url;
          if (targetWidgetId) {
            editorStore.updateWidgetProps(targetWidgetId, {
              imageUrl: savedMedia.url,
              isSolidSpace: false
            });
          }
        }
      } catch (uploadErr) {
        console.warn('Server upload background failed, using local preview:', uploadErr);
      }
    }
  };
  reader.readAsDataURL(file);
}

function handleUploadThumbError() {
  currentImageUrl.value = '';
  isCurrentSolidSpace.value = true;
  if (editorStore.selectedWidgetId) {
    editorStore.updateWidgetProps(editorStore.selectedWidgetId, {
      imageUrl: '',
      isSolidSpace: true
    });
  }
}

function removeUploadedMedia() {
  if (editorStore.selectedWidgetId) {
    currentImageUrl.value = '';
    isCurrentSolidSpace.value = true;
    editorStore.updateWidgetProps(editorStore.selectedWidgetId, {
      imageUrl: '',
      isSolidSpace: true
    });
  }
}

// Sync from selected widget
watch(() => editorStore.selectedWidget, (widget) => {
  if (widget && widget.type === 'HeroDrop') {
    selectedRatio.value = widget.props.ratio || 'Full screen landing page';
    
    // Brand Logo Sync
    if (typeof widget.props.isBrandLogoEnabled === 'boolean') {
      isBrandLogoEnabled.value = widget.props.isBrandLogoEnabled;
    } else {
      isBrandLogoEnabled.value = !!widget.props.brandLogoUrl;
    }
    brandLogoUrl.value = widget.props.brandLogoUrl || '';
    brandLogoAlign.value = widget.props.brandLogoAlign || 'left';

    badge.value = widget.props.badge || '';
    isBadgeOptionOpen.value = !!widget.props.badge;
    headline.value = widget.props.headline || widget.props.title || '';
    subheadline.value = widget.props.subheadline || widget.props.subtitle || '';
    buttonText.value = widget.props.buttonText || widget.props.ctaLabel || '';
    textAlign.value = widget.props.textAlign || 'left';
    textPosition.value = widget.props.textPosition || 'bottom';
    currentImageUrl.value = widget.props.imageUrl || '';
    isCurrentSolidSpace.value = widget.props.isSolidSpace ?? (!widget.props.imageUrl);
    selectedMediaFit.value = widget.props.mediaFit || 'Fill the screen';
    
    if (typeof widget.props.isOverlayEnabled === 'boolean') {
      isOverlayEnabled.value = widget.props.isOverlayEnabled;
    } else {
      isOverlayEnabled.value = false;
    }
    overlayOpacity.value = typeof widget.props.overlayOpacity === 'number' ? widget.props.overlayOpacity : 50;

    if (typeof widget.props.isCtaEnabled === 'boolean') {
      isCtaEnabled.value = widget.props.isCtaEnabled;
    } else {
      isCtaEnabled.value = !!(widget.props.buttonText || widget.props.ctaLabel || widget.props.showButton);
    }

    ctaPositionMode.value = widget.props.ctaPositionMode || widget.props.positionMode || 'in-flow';
    ctaStickyScope.value = widget.props.ctaStickyScope || widget.props.stickyScope || 'current';
    ctaStickyPageIds.value = widget.props.ctaStickyPageIds || widget.props.stickyPageIds || [editorStore.currentPage.id];
    ctaActionType.value = widget.props.ctaActionType || widget.props.actionType || 'next_page';
    ctaUrl.value = widget.props.ctaUrl || widget.props.url || '';

    if (typeof widget.props.showBannerText === 'boolean') {
      isBannerTextEnabled.value = widget.props.showBannerText;
    } else {
      isBannerTextEnabled.value = !!(widget.props.headline || widget.props.title || widget.props.subheadline || widget.props.subtitle);
    }

    nextTick(() => {
      autoResize(headlineRef.value);
      autoResize(subheadlineRef.value);
    });
  }
}, { immediate: true });

watch(isBrandLogoEnabled, (newVal) => {
  if (editorStore.selectedWidgetId) {
    editorStore.updateWidgetProps(editorStore.selectedWidgetId, { isBrandLogoEnabled: newVal });
  }
});

watch(brandLogoUrl, (newUrl) => {
  if (editorStore.selectedWidgetId && editorStore.selectedWidget?.props?.brandLogoUrl !== newUrl) {
    editorStore.updateWidgetProps(editorStore.selectedWidgetId, { brandLogoUrl: newUrl });
  }
});

watch(() => editorStore.selectedWidget?.props?.brandLogoUrl, (storeUrl) => {
  if (storeUrl !== undefined && storeUrl !== brandLogoUrl.value) {
    brandLogoUrl.value = storeUrl || '';
  }
});

watch(brandLogoAlign, (newAlign) => {
  if (editorStore.selectedWidgetId) {
    editorStore.updateWidgetProps(editorStore.selectedWidgetId, { brandLogoAlign: newAlign });
  }
});

watch(isBannerTextEnabled, (newVal) => {
  if (editorStore.selectedWidgetId) {
    editorStore.updateWidgetProps(editorStore.selectedWidgetId, { showBannerText: newVal });
  }
});

watch(isOverlayEnabled, (newVal) => {
  if (editorStore.selectedWidgetId) {
    editorStore.updateWidgetProps(editorStore.selectedWidgetId, { isOverlayEnabled: newVal });
  }
});

watch(overlayOpacity, (newVal) => {
  if (editorStore.selectedWidgetId) {
    editorStore.updateWidgetProps(editorStore.selectedWidgetId, { overlayOpacity: newVal });
  }
});

watch(isCtaEnabled, (newVal) => {
  if (editorStore.selectedWidgetId) {
    editorStore.updateWidgetProps(editorStore.selectedWidgetId, { isCtaEnabled: newVal, showButton: newVal });
  }
});

watch(ctaUrl, (newUrl) => {
  if (editorStore.selectedWidgetId) {
    editorStore.updateWidgetProps(editorStore.selectedWidgetId, { 
      url: newUrl, 
      ctaUrl: newUrl 
    });
  }
});

watch(() => editorStore.selectedMediaRatio, (newRatio) => {
  if (newRatio) {
    selectedRatio.value = newRatio;
  }
});

watch(selectedRatio, (newRatio) => {
  if (editorStore.selectedWidgetId) {
    editorStore.updateWidgetProps(editorStore.selectedWidgetId, { ratio: newRatio });
  }
});

watch(badge, (newBadge) => {
  if (editorStore.selectedWidgetId) {
    editorStore.updateWidgetProps(editorStore.selectedWidgetId, { badge: newBadge });
  }
});

watch(headline, (newHeadline) => {
  if (editorStore.selectedWidgetId) {
    editorStore.updateWidgetProps(editorStore.selectedWidgetId, { headline: newHeadline, title: newHeadline });
  }
  nextTick(() => autoResize(headlineRef.value));
});

watch(subheadline, (newSub) => {
  if (editorStore.selectedWidgetId) {
    editorStore.updateWidgetProps(editorStore.selectedWidgetId, { subheadline: newSub, subtitle: newSub });
  }
  nextTick(() => autoResize(subheadlineRef.value));
});

watch(buttonText, (newBtn) => {
  if (editorStore.selectedWidgetId) {
    editorStore.updateWidgetProps(editorStore.selectedWidgetId, { 
      buttonText: newBtn, 
      showButton: !!newBtn, 
      ctaLabel: newBtn 
    });
  }
});

watch(textAlign, (newAlign) => {
  if (editorStore.selectedWidgetId) {
    editorStore.updateWidgetProps(editorStore.selectedWidgetId, { textAlign: newAlign });
  }
});

watch(textPosition, (newPos) => {
  if (newPos === 'center') {
    isOverlayEnabled.value = false;
  }
  if (editorStore.selectedWidgetId) {
    editorStore.updateWidgetProps(editorStore.selectedWidgetId, { 
      textPosition: newPos,
      ...(newPos === 'center' ? { isOverlayEnabled: false } : {})
    });
  }
});
</script>
