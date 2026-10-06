<template>
  <div 
    class="relative select-none"
    :class="[
      isTicketPage
        ? 'w-[340px] h-[604px] shrink-0'
        : isLivePage 
        ? 'w-full h-full min-h-[100dvh] flex flex-col flex-1' 
        : (isPreviewModal
            ? 'w-full h-full min-h-0 flex flex-col flex-1 overflow-hidden'
            : 'w-[340px] h-[680px] shrink-0')
    ]"
    @click="handleSelectThisPage"
    @dblclick="handleDoubleClickThisPage"
  >
    <!-- Artboard Tab Label (Positioned absolutely above artboard so it never pushes or shifts canvas vertical centering) -->
    <template v-if="!isMiniPreview && !isPreviewModal && !isLivePage">
      <div 
        v-if="isSelected"
        class="animate-apple-pop absolute bottom-full left-0 mb-[12px] group bg-[#ececec]/50 hover:bg-[#ececec] border-black/15 hover:border-black/50 border-[0.5px] border-solid content-stretch flex h-[24px] items-center justify-center px-[8px] rounded-[10px] shadow-sm transition-all cursor-pointer will-change-transform backdrop-blur-md z-30"
        :style="{
          transform: `scale(${100 / editorStore.zoomLevel})`,
          transformOrigin: 'bottom left'
        }"
        @click.stop="!isTicketPage && startEditingPageName()"
        :title="isTicketPage ? 'Design the downloadable ticket. Guest data blocks are filled in per guest.' : (isEditingPageName ? '' : 'Click to rename page')"
      >
        <!-- View mode -->
        <div v-if="!isEditingPageName" class="flex items-center gap-[6px]">
          <p class="font-707 font-light text-caption text-black whitespace-nowrap">
            <template v-if="isTicketPage">Ticket · PDF (9:16) — not shown as a page to guests</template>
            <template v-else>Page {{ pageNumber }}: {{ currentPageName }}</template>
          </p>
          <Pencil class="w-2.5 h-2.5 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <!-- Edit mode -->
        <div v-else class="flex items-center gap-1" @click.stop>
          <span class="font-707 font-light text-caption text-neutral-500 whitespace-nowrap select-none">
            Page {{ pageNumber }}:
          </span>
          <input 
            ref="pageNameInputRef"
            v-model="pageNameInput"
            @keydown.enter.prevent="savePageName"
            @keydown.esc.prevent="cancelPageName"
            @blur="savePageName"
            class="font-707 font-normal text-caption text-black bg-transparent border-b border-black outline-none px-0.5 py-0 w-auto min-w-[70px] max-w-[140px]"
          />
          <button 
            type="button"
            @click.stop="savePageName" 
            class="size-3.5 flex items-center justify-center text-emerald-600 hover:text-emerald-700 cursor-pointer"
            title="Save Name"
          >
            <Check class="w-3 h-3" />
          </button>
        </div>
      </div>
    </template>

    <!-- Main Artboard (Figma Node 63:3386 / 134:4207) -->
    <div 
      data-artboard-frame="true"
      @wheel="handleArtboardWheel"
      class="relative flex flex-col overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
      :class="[
        (isPreviewModal || isLivePage || isTicketPage) ? 'bg-white' : 'bg-[#f5f5f5]',
        isTicketPage
          ? ((isPreviewModal || isLivePage) ? 'w-[340px] h-[604px] border-none shadow-none' : 'border-[0.5px] w-[340px] h-[604px]')
          : isLivePage
          ? 'w-full h-full min-h-[100dvh] flex-1 border-none shadow-none'
          : (isPreviewModal
              ? 'w-full h-full min-h-0 flex-1 border-none shadow-none'
              : (isMiniPreview 
                  ? 'w-[340px] h-[680px] border-none shadow-none' 
                  : 'border-[0.5px] w-[340px] h-[680px]')),
        !isMiniPreview && !isPreviewModal && !isLivePage && isSelected 
          ? 'border-black shadow-[0px_16px_48px_rgba(0,0,0,0.12)]' 
          : (!isMiniPreview && !isPreviewModal && !isLivePage ? 'border-neutral-300 opacity-80 shadow-[0px_0px_30px_rgba(0,0,0,0.04)] cursor-pointer' : '')
      ]"
    >
      <!-- Persistent Thin 0.5px Black Selected Page Outline Overlay (Only on selected artboard) -->
      <div v-if="!isMiniPreview && !isPreviewModal && !isLivePage && isSelected" class="pointer-events-none absolute inset-0 z-50 border-[0.5px] border-black border-solid" />

      <!-- Fixed 48px Header with Right 707 Logo (Figma Node 107:3820). Not on the Ticket: it is printed as designed. -->
      <div 
        v-if="!isTicketPage"
        @click="handleArtboardClick"
        class="sticky top-0 left-0 right-0 h-[48px] w-full z-30 flex items-center justify-end px-[16px] shrink-0 cursor-default"
        :class="(isPreviewModal || isLivePage) ? 'bg-white' : 'bg-[#f5f5f5]'"
      >
        <div class="h-[15px] w-[48px] relative flex items-center justify-end">
          <img 
            :src="FIGMA_ASSETS.logo707" 
            alt="707 Logo" 
            class="size-full object-contain pointer-events-none" 
            @error="handleLogoError"
          />
          <span v-if="logoFailed" class="font-black text-[12px] tracking-tighter text-black">707</span>
        </div>
      </div>

      <!-- Blank Canvas / Active Widgets Container (0px Top, Side & Bottom Padding) -->
      <div 
        ref="scrollContainerRef"
        @click.self="handleArtboardClick"
        @scroll="handleScroll"
        @wheel.stop="handleArtboardWheel"
        @mousedown="handleArtboardMouseDown"
        class="artboard-scroll-container flex-1 flex flex-col no-scrollbar px-0 pt-0 pb-0 relative overscroll-contain will-change-scroll select-none w-full"
        :class="[
          (isPreviewModal || isLivePage || isTicketPage) ? 'bg-white' : 'bg-[#f5f5f5]',
          isDragOver ? 'bg-neutral-200/60' : '',
          isTicketPage ? '!overflow-hidden pt-[20px]' : '',
          isSingleFullScreenHero ? 'overflow-hidden cursor-default' : (isArtboardDragging ? 'cursor-grabbing' : (isContentScrollable ? 'cursor-grab' : 'cursor-default')),
          isSingleFullScreenHero ? 'overflow-hidden' : 'overflow-y-auto'
        ]"
        style="scrollbar-width: none; -ms-overflow-style: none; -webkit-overflow-scrolling: touch;"
        @dragenter.prevent="handleDragEnter"
        @dragover.prevent="handleDragOver($event)"
        @dragleave="handleDragLeave"
        @drop.prevent="handleDrop($event)"
      >
        <!-- Drag Active Overlay Indicator on Artboard Frame -->
        <div 
          v-if="isDragOver" 
          class="absolute inset-0 pointer-events-none border-[1px] border-black/70 border-dashed m-1.5 rounded-lg z-40 bg-black/[0.02] flex items-center justify-center"
        >
          <div class="bg-black text-white px-3 py-1.5 rounded-full shadow-lg font-707 text-caption flex items-center gap-1.5 animate-bounce">
            <Plus class="w-3.5 h-3.5" />
            <span>Drop to add {{ editorStore.draggedWidget?.label || 'block' }}</span>
          </div>
        </div>

        <!-- Blank Canvas State Dropzone -->
        <div 
          v-if="inFlowWidgets.length === 0" 
          @click="handleArtboardClick"
          class="flex-1 flex flex-col items-center justify-center p-6 w-full min-h-[300px] cursor-default"
        >
          <div 
            v-if="isDragOver"
            class="flex flex-col items-center justify-center text-center p-8 w-full rounded-xl border border-neutral-300 bg-white/90 shadow-sm"
          >
            <div class="size-10 rounded-full bg-black text-white flex items-center justify-center mb-2">
              <Plus class="w-5 h-5" />
            </div>
            <p class="font-707 font-medium text-bodytext text-black">
              Drop block here
            </p>
            <p class="font-707 text-caption text-neutral-500 mt-0.5">
              To assemble your activation page
            </p>
          </div>
        </div>

        <!-- Widgets Stack (0px top for first widget, 8px between text-text, 16px between other widgets, dynamic 1-screen fit for Hero + Button) -->
        <div 
          v-else 
          @click.self="handleArtboardClick"
          class="flex-1 flex flex-col w-full min-h-full cursor-default"
          :class="[
            (isPreviewModal || isLivePage) ? '' : 'shrink-0',
            containerBottomPaddingClass,
            isHeroWithButtonOnly ? 'h-full justify-between' : ''
          ]"
        >
          <!-- If widgets are added, render them sequentially -->
          <div 
            v-for="(widget, index) in inFlowWidgets" 
            :key="widget.id"
            :data-widget-id="widget.id"
            @click.stop="handleWidgetClick(widget)"
            @mouseenter="hoveredWidgetId = widget.id"
            @mouseleave="hoveredWidgetId = null"
            @dragover.prevent.stop="handleDragOver($event, index)"
            @drop.prevent.stop="handleDrop($event, index)"
            :class="[
              (widget.type === 'TextBanner' || widget.type === 'MultipleChoice' || widget.type === 'FieldInput' || widget.type === 'RegistrationForm' || widget.type === 'ActionButton') ? 'overflow-visible' : 'overflow-hidden',
              getWidgetMarginTopClass(index),
              (isHeroWithButtonOnly && widget.type === 'HeroDrop') ? (isLivePage ? 'h-full min-h-[calc(100dvh-48px)] flex-1' : 'h-full min-h-0 flex-1') : '',
              (isHeroWithButtonOnly && (widget.type === 'ActionButton' || widget.type === 'TextBanner')) ? 'shrink-0' : '',
              'group relative cursor-pointer shrink-0 w-full'
            ]"
          >
            <!-- Selected / Hovered Dashed Outline Border for non-TextBanner widgets (matching Text widget outline) -->
            <div 
              v-if="!isMiniPreview && !isPreviewModal && widget.type !== 'TextBanner' && (editorStore.selectedWidgetId === widget.id || hoveredWidgetId === widget.id)" 
              class="absolute inset-0 border-[0.5px] border-black border-dashed pointer-events-none z-20 transition-opacity"
              :class="editorStore.selectedWidgetId === widget.id ? 'opacity-100' : 'opacity-60'"
            />

            <!-- Insertion Line Indicator Above Widget -->
            <div 
              v-if="isDragOver && dropTargetIndex === index" 
              class="absolute top-0 left-0 right-0 h-1 bg-black z-30 shadow-md animate-pulse"
            />



            <!-- 1. HeroDrop / Media Banner Widget (Solid space preview blocking #EDEDED or populated media) -->
            <div 
              v-if="widget.type === 'HeroDrop'" 
              class="relative overflow-hidden w-full flex flex-col justify-between transition-all"
              :class="[
                widget.props.isSolidSpace || !widget.props.imageUrl ? 'bg-[#ededed] text-black' : 'bg-black text-white',
                getRatioClass(widget.props.ratio)
              ]"
            >
              <!-- If image is provided and not in solid placeholder mode, display image background -->
              <template v-if="widget.props.imageUrl && !widget.props.isSolidSpace">
                <!-- Ticket page: a background image, which the PDF capture reproduces faithfully (it ignores object-fit on <img>) -->
                <div
                  v-if="isTicketPage"
                  class="w-full h-full absolute inset-0 bg-no-repeat bg-center"
                  :style="{ backgroundImage: `url('${widget.props.imageUrl}')`, backgroundSize: ticketBannerSize(widget.props.mediaFit) }"
                />
                <img 
                  v-else
                  :src="widget.props.imageUrl" 
                  alt="Drop Banner" 
                  class="w-full h-full absolute inset-0"
                  :class="getMediaFitClass(widget.props.mediaFit)"
                  @error="handleHeroImageError(widget)"
                />
                <!-- Dynamic Image Overlay / Scrim automatically following text position (auto disabled on Center) -->
                <div 
                  v-if="widget.props.isOverlayEnabled && widget.props.textPosition !== 'center'" 
                  class="absolute inset-0 z-10 pointer-events-none transition-all duration-300"
                  :style="getOverlayStyle(widget.props)"
                />
              </template>

              <!-- Solid space blocking placeholder (#EDEDED for layout preview per Figma Node 134:4207) -->
              <div v-else class="size-full flex flex-col items-center justify-center p-6 text-center select-none bg-[#ededed] min-h-[160px]">
                <div class="size-[48px] rounded-full bg-black/5 border border-black/5 flex items-center justify-center pointer-events-none shadow-sm">
                  <svg class="size-6 text-black/50" viewBox="0 0 94 94" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M70.0242 83.1312H20.0926C18.868 83.1338 17.655 82.8946 16.5232 82.4273C15.3913 81.96 14.3628 81.2738 13.4968 80.4081C12.6307 79.5424 11.9441 78.5143 11.4763 77.3826C11.0086 76.2509 10.7688 75.038 10.7709 73.8135V23.9602" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M77.1348 10.8668H32.947C29.5812 10.8668 26.8527 13.5953 26.8527 16.9611V61.149C26.8527 64.5148 29.5812 67.2433 32.947 67.2433H77.1348C80.5006 67.2433 83.2292 64.5148 83.2292 61.149V16.9611C83.2292 13.5953 80.5006 10.8668 77.1348 10.8668Z" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M34.6312 55.2544H74.8554L61.0061 37.7802L51.939 49.4029L45.594 42.0669L34.6312 55.2544Z" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>

              <!-- Brand Logo Area under header (Only available and rendered on the top-most banner) -->
              <div 
                v-if="index === 0 && (widget.props.isBrandLogoEnabled || widget.props.brandLogoUrl)"
                class="relative z-20 w-full px-[16px] pt-[16px] flex items-center transition-all"
                :class="[
                  widget.props.brandLogoAlign === 'center' ? 'justify-center' : 
                  widget.props.brandLogoAlign === 'right' ? 'justify-end' : 
                  'justify-start'
                ]"
                @dragover.prevent.stop="isDragOverLogoSlot = widget.id"
                @dragleave.prevent.stop="isDragOverLogoSlot = null"
                @drop.prevent.stop="handleLogoDropOnBanner($event, widget.id)"
              >
                <!-- Render brand logo if url exists (Fixed height 48px, width auto to maintain aspect ratio) -->
                <div v-if="widget.props.brandLogoUrl" class="max-h-[48px] h-[48px] flex items-center shrink-0">
                  <img 
                    :src="widget.props.brandLogoUrl" 
                    alt="Brand Logo" 
                    class="max-h-[48px] h-[48px] w-auto object-contain transition-transform"
                  />
                </div>
                <!-- Placeholder if enabled but no logo uploaded yet -->
                <div 
                  v-else
                  @click.stop="handleOpenLogoPicker(widget.id)"
                  class="h-[48px] px-3 border border-dashed rounded-[8px] flex items-center gap-1.5 text-[11px] font-707 cursor-pointer transition-colors"
                  :class="[
                    widget.props.isSolidSpace ? 'bg-black/5 border-black/30 text-black/70' : 'bg-white/20 border-white/40 text-white backdrop-blur-sm',
                    isDragOverLogoSlot === widget.id ? 'border-black ring-2 ring-black' : ''
                  ]"
                  title="Click or drop brand logo (Height 48px)"
                >
                  <span>Select / Drop Brand Logo (48px)</span>
                </div>
              </div>

              <!-- Banner Text Content Overlay if present (Presets: Top, Center, Bottom) -->
              <div 
                v-if="((widget.props.showBannerText ?? true) && (widget.props.title || widget.props.headline || widget.props.subtitle || widget.props.subheadline)) || ((widget.props.isCtaEnabled ?? (!!widget.props.buttonText || !!widget.props.ctaLabel || !!widget.props.showButton)) && (widget.props.buttonText || widget.props.ctaLabel || widget.props.showButton))" 
                class="absolute left-0 right-0 px-[16px] z-20 flex flex-col transition-all duration-200"
                :class="[
                  widget.props.textPosition === 'top' ? ((index === 0 && (widget.props.isBrandLogoEnabled || widget.props.brandLogoUrl)) ? 'top-0 pt-[68px] pb-[24px]' : 'top-0 pt-[36px] pb-[24px]') : 
                  widget.props.textPosition === 'center' ? 'top-1/2 -translate-y-1/2 py-[24px]' : 
                  (stickyButtonForThisPage ? 'bottom-0 pt-[24px] pb-[112px]' : 'bottom-0 pt-[24px] pb-[64px]'),
                  widget.props.textAlign === 'center' ? 'text-center items-center' : 
                  widget.props.textAlign === 'right' ? 'text-right' : 
                  'text-left items-start'
                ]"
              >
                <!-- 1. Optional Tag / Badge (Placed on Top of H1 Headline) -->
                <div 
                  v-if="(widget.props.showBannerText ?? true) && widget.props.badge"
                  class="mb-2"
                >
                  <span 
                    class="inline-block font-bold text-[9px] tracking-widest px-2 py-0.5 uppercase rounded-sm font-707 shadow-sm transition-colors"
                    :class="widget.props.isSolidSpace ? 'bg-black text-white' : 'bg-white text-black'"
                  >
                    {{ widget.props.badge }}
                  </span>
                </div>

                <!-- 2. Headline (H1) -->
                <h1 
                  v-if="(widget.props.showBannerText ?? true) && (widget.props.title || widget.props.headline)" 
                  class="font-707 font-medium text-display-h1 tracking-tight leading-[34px] whitespace-pre-line" 
                  :class="widget.props.isSolidSpace ? 'text-black' : 'text-white'"
                >
                  {{ widget.props.title || widget.props.headline }}
                </h1>

                <!-- 3. Sub Headline -->
                <p 
                  v-if="(widget.props.showBannerText ?? true) && (widget.props.subtitle || widget.props.subheadline)" 
                  class="font-707 font-medium text-subtext-lead tracking-normal leading-[22px] mt-1.5 whitespace-pre-line" 
                  :class="widget.props.isSolidSpace ? 'text-neutral-700' : 'text-[#ffffff]'"
                >
                  {{ widget.props.subtitle || widget.props.subheadline }}
                </p>

                <!-- CTA Button automatically under subheadline with auto light/dark color adaptation (only rendered in-flow if not sticky bottom) -->
                <div 
                  v-if="(widget.props.isCtaEnabled ?? (!!widget.props.buttonText || !!widget.props.ctaLabel || !!widget.props.showButton)) && (widget.props.buttonText || widget.props.ctaLabel || widget.props.showButton) && widget.props.ctaPositionMode !== 'sticky-bottom' && widget.props.positionMode !== 'sticky-bottom'" 
                  class="mt-4 flex"
                  :class="[
                    widget.props.textAlign === 'center' ? 'justify-center w-full' : 
                    widget.props.textAlign === 'right' ? 'justify-end w-full' : 
                    'justify-start'
                  ]"
                >
                  <button 
                    type="button"
                    @click.stop="handleHeroCtaClick(widget)"
                    :disabled="isButtonInactive(widget)"
                    :class="[
                      (widget.props.variant === 'white' || widget.props.buttonVariant === 'white')
                        ? 'bg-white text-black shadow-none apple-cta-btn-white'
                        : (widget.props.variant === 'black' || widget.props.buttonVariant === 'black')
                          ? 'bg-black text-white apple-cta-btn-dark'
                          : (widget.props.isSolidSpace 
                              ? 'bg-black text-white apple-cta-btn-dark' 
                              : 'bg-white text-black shadow-none apple-cta-btn-white'),
                      isButtonInactive(widget) ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'apple-cta-btn',
                      'font-707 font-medium text-btn h-[48px] px-[16px] py-[12px] cursor-pointer whitespace-nowrap flex items-center justify-center uppercase border-0 border-none outline-none transition-opacity'
                    ]"
                  >
                    {{ widget.props.buttonText || widget.props.ctaLabel || 'Action' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- 2. CountdownTimer Widget (24px top-bottom, 16px side padding) -->
            <div 
              v-else-if="widget.type === 'CountdownTimer'" 
              @click.stop="handleWidgetClick(widget)"
              class="bg-black text-white py-[24px] px-[16px] border-y border-neutral-800 text-center cursor-pointer relative"
              :class="[
                !isMiniPreview && (editorStore.selectedWidgetId === widget.id || hoveredWidgetId === widget.id)
                  ? 'ring-1 ring-white/60' 
                  : ''
              ]"
            >
              <div class="text-[9px] font-mono tracking-widest uppercase text-neutral-400 mb-2">
                {{ widget.props.label || 'RAFFLE CLOSES IN' }}
              </div>
              <div class="grid grid-cols-4 gap-1.5 max-w-[240px] mx-auto">
                <div class="bg-neutral-900 border border-neutral-800 rounded p-1.5 text-center">
                  <div class="text-base font-black font-mono">02</div>
                  <div class="text-[8px] text-neutral-500 font-mono">DAYS</div>
                </div>
                <div class="bg-neutral-900 border border-neutral-800 rounded p-1.5 text-center">
                  <div class="text-base font-black font-mono">14</div>
                  <div class="text-[8px] text-neutral-500 font-mono">HOURS</div>
                </div>
                <div class="bg-neutral-900 border border-neutral-800 rounded p-1.5 text-center">
                  <div class="text-base font-black font-mono">38</div>
                  <div class="text-[8px] text-neutral-500 font-mono">MINS</div>
                </div>
                <div class="bg-neutral-900 border border-neutral-800 rounded p-1.5 text-center">
                  <div class="text-base font-black font-mono text-emerald-400">42</div>
                  <div class="text-[8px] text-neutral-500 font-mono">SECS</div>
                </div>
              </div>
            </div>

            <!-- 3. RaffleForm Widget (24px top-bottom, 16px side padding) -->
            <div 
              v-else-if="widget.type === 'RaffleForm'" 
              @click.stop="handleWidgetClick(widget)"
              class="py-[24px] px-[16px] bg-white text-black space-y-3.5 cursor-pointer relative"
              :class="[
                !isMiniPreview && (editorStore.selectedWidgetId === widget.id || hoveredWidgetId === widget.id)
                  ? 'ring-1 ring-black/40' 
                  : ''
              ]"
            >
              <div>
                <div class="text-[9px] font-mono uppercase tracking-wider text-neutral-500 font-bold">
                  OFFICIAL ENTRY FORM
                </div>
                <h2 class="text-base font-black tracking-tight uppercase font-707">
                  {{ widget.props.heading || 'ENTER RAFFLE' }}
                </h2>
                <p class="text-[11px] text-neutral-600 mt-0.5 font-707">
                  {{ widget.props.subheading || 'One entry per verified ID/KTP' }}
                </p>
              </div>

              <!-- Shoe Sizing Selector -->
              <div>
                <div class="flex items-center justify-between text-[11px] font-bold mb-1.5">
                  <span>SELECT SIZE ({{ widget.props.sizeSystem || 'US Mens' }})</span>
                  <span class="text-[10px] text-neutral-500 font-mono underline">Size Chart</span>
                </div>
                <div class="grid grid-cols-4 gap-1.5">
                  <div 
                    v-for="(sz, i) in (widget.props.sizes || ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11'])"
                    :key="sz"
                    :class="i === 3 ? 'bg-black text-white border-black' : 'bg-neutral-100 text-black border-neutral-200'"
                    class="h-8 rounded border font-bold text-[11px] flex items-center justify-center font-mono"
                  >
                    {{ sz }}
                  </div>
                </div>
              </div>

              <button class="w-full h-[48px] bg-black text-white font-707 font-medium text-[14px] leading-[18px] tracking-normal uppercase rounded-none apple-cta-btn apple-cta-btn-dark border-0 border-none outline-none cursor-pointer">
                {{ widget.props.ctaLabel || 'SUBMIT ENTRY' }}
              </button>
            </div>

            <!-- 4. RsvpForm Widget (24px top-bottom, 16px side padding) -->
            <div 
              v-else-if="widget.type === 'RsvpForm'" 
              @click.stop="handleWidgetClick(widget)"
              class="py-[24px] px-[16px] bg-white text-black space-y-3.5 cursor-pointer relative"
              :class="[
                !isMiniPreview && (editorStore.selectedWidgetId === widget.id || hoveredWidgetId === widget.id)
                  ? 'ring-1 ring-black/40' 
                  : ''
              ]"
            >
              <div>
                <div class="text-[9px] font-mono uppercase tracking-wider text-neutral-500 font-bold">
                  PASS RESERVATION
                </div>
                <h2 class="text-base font-black tracking-tight uppercase font-707">
                  {{ widget.props.heading || 'CONFIRM ATTENDANCE' }}
                </h2>
                <p class="text-[11px] text-neutral-600 mt-0.5 font-707">
                  {{ widget.props.subheading }}
                </p>
              </div>

              <!-- Sessions -->
              <div class="space-y-1.5">
                <div 
                  v-for="(session, sIdx) in (widget.props.sessions || [])"
                  :key="session.label"
                  :class="sIdx === 0 ? 'border-black bg-neutral-50 ring-1 ring-black' : 'border-neutral-200'"
                  class="p-2.5 rounded-lg border flex items-center justify-between text-[11px]"
                >
                  <div>
                    <div class="font-bold font-707">{{ session.label }}</div>
                    <div class="text-[9px] text-emerald-600 font-medium">● {{ session.remaining }} spots remaining</div>
                  </div>
                  <div class="w-3.5 h-3.5 rounded-full border-2 border-black flex items-center justify-center">
                    <div v-if="sIdx === 0" class="w-1.5 h-1.5 rounded-full bg-black"></div>
                  </div>
                </div>
              </div>

              <button class="w-full h-[48px] bg-black text-white font-707 font-medium text-[14px] leading-[18px] tracking-normal uppercase rounded-none apple-cta-btn apple-cta-btn-dark border-0 border-none outline-none cursor-pointer">
                {{ widget.props.ctaLabel || 'CLAIM PASS' }}
              </button>
            </div>

            <!-- 5. RulesAccordion Widget (24px top-bottom, 16px side padding) -->
            <div 
              v-else-if="widget.type === 'RulesAccordion'" 
              @click.stop="handleWidgetClick(widget)"
              class="py-[24px] px-[16px] bg-neutral-50 text-black border-t border-neutral-200 cursor-pointer relative"
              :class="[
                !isMiniPreview && (editorStore.selectedWidgetId === widget.id || hoveredWidgetId === widget.id)
                  ? 'ring-1 ring-black/40' 
                  : ''
              ]"
            >
              <div class="text-[11px] font-black uppercase tracking-tight mb-2 font-707">
                {{ widget.props.title || 'TERMS & CONDITIONS' }}
              </div>
              <div class="space-y-1.5">
                <div 
                  v-for="(item, rIdx) in (widget.props.items || [])"
                  :key="rIdx"
                  class="bg-white p-2.5 rounded border border-neutral-200 text-[11px]"
                >
                  <div class="font-bold mb-0.5 font-707">{{ item.title }}</div>
                  <div class="text-neutral-600 text-[11px] leading-relaxed">{{ item.content }}</div>
                </div>
              </div>
            </div>



            <!-- 6. TextBanner Widget (Free Text Tool, Figma Nodes 180:5836 & 181:6087 - Zero vertical padding for precise 4px text-to-text spacing) -->
            <div 
              v-else-if="widget.type === 'TextBanner'" 
              class="relative w-full px-[16px] py-0 select-text overflow-visible"
              @click.stop="handleWidgetClick(widget)"
            >
              <!-- Container with dynamic dashed border (Zero padding so text starts directly on 16px global line) -->
              <div 
                class="w-full relative flex flex-col justify-center rounded-[8px] transition-all p-0"
                :class="[
                  !isMiniPreview && !isPreviewModal && (editorStore.selectedWidgetId === widget.id || hoveredWidgetId === widget.id)
                    ? 'border-[0.5px] border-black border-dashed bg-transparent' 
                    : 'border-[0.5px] border-transparent'
                ]"
                data-node-id="181:5864"
                data-name="Container"
              >
                <!-- Floating Action Toolbar for Text Widget (Figma Node 180:5844 / 181:6098) -->
                <div 
                  v-if="!isMiniPreview && !isPreviewModal && (hoveredWidgetId === widget.id || editorStore.selectedWidgetId === widget.id)"
                  class="absolute z-30 apple-glass-modal flex gap-[5px] items-center p-[4px] rounded-[10px] shadow-[0px_8px_24px_rgba(0,0,0,0.12)] border border-white/80 transition-all animate-in fade-in duration-150 select-none"
                  :class="index === 0 ? 'top-[6px] right-[6px]' : '-top-[26px] right-0'"
                  data-node-id="180:5844"
                  data-name="Buttons Container"
                >
                  <!-- Button 1: Adjust / Open Text Sidebar Setup (Hidden when setup modal is open) -->
                  <button 
                    v-if="!isWidgetSetupModalOpen(widget)"
                    @click.stop="handleAdjustWidget(widget)"
                    class="apple-glass-icon-btn size-[24px] flex items-center justify-center rounded-[6px] text-black cursor-pointer hover:bg-black/10"
                    title="Text Setup"
                  >
                    <SlidersHorizontal class="w-3.5 h-3.5" />
                  </button>

                  <!-- Button 2: Duplicate -->
                  <button 
                    @click.stop="editorStore.duplicateWidget(widget.id)"
                    class="apple-glass-icon-btn size-[24px] flex items-center justify-center rounded-[6px] text-black cursor-pointer hover:bg-black/10"
                    title="Duplicate"
                  >
                    <Copy class="w-3.5 h-3.5" />
                  </button>

                  <!-- Button 3: Remove -->
                  <button 
                    @click.stop="editorStore.removeWidget(widget.id)"
                    class="apple-glass-icon-btn size-[24px] hover:text-red-600 flex items-center justify-center rounded-[6px] text-black cursor-pointer hover:bg-red-50"
                    title="Remove"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>

                <!-- Live Preview in Mini Preview Mode & Preview Mode (Pure Semantic Paragraph, Zero JS race conditions, true UI testing) -->
                <p 
                  v-if="isMiniPreview || isPreviewModal"
                  class="w-full min-w-0 max-w-full bg-transparent font-707 p-0 m-0 whitespace-pre-wrap break-words [overflow-wrap:anywhere] select-none pointer-events-none"
                  :class="[
                    getTextTypographyClass(widget),
                    widget.props.textAlign === 'center' ? 'text-center' : (widget.props.textAlign === 'right' ? 'text-right' : 'text-left'),
                    !widget.props.text ? 'text-neutral-400 opacity-60' : 'text-black'
                  ]"
                >
                  {{ widget.props.text || widget.props.placeholder || 'WRITE YOUR TEXT HERE' }}
                </p>

                <!-- Full Editable Mode on Canvas with Auto-Sizing CSS Grid -->
                <div 
                  v-else
                  class="grid w-full min-w-0 max-w-full relative"
                >
                  <!-- Invisible sizing twin: expands the grid row to the exact wrapped text height -->
                  <div 
                    class="col-start-1 row-start-1 invisible w-full min-w-0 max-w-full min-h-0 font-707 p-0 m-0 whitespace-pre-wrap break-words [overflow-wrap:anywhere] pointer-events-none select-none"
                    :class="[
                      getTextTypographyClass(widget),
                      widget.props.textAlign === 'center' ? 'text-center' : (widget.props.textAlign === 'right' ? 'text-right' : 'text-left')
                    ]"
                    aria-hidden="true"
                  >
                    {{ widget.props.text || widget.props.placeholder || 'WRITE YOUR TEXT HERE' }}
                  </div>

                  <!-- Real Textarea overlaid in same grid cell: 100% width and height -->
                  <textarea
                    :ref="el => registerTextarea(widget.id, el)"
                    :value="widget.props.text || ''"
                    :placeholder="widget.props.placeholder || 'WRITE YOUR TEXT HERE'"
                    @input="handleTextInput($event, widget.id)"
                    @focus="handleWidgetClick(widget)"
                    @blur="handleTextBlur(widget)"
                    @mousedown.stop
                    rows="1"
                    wrap="soft"
                    class="col-start-1 row-start-1 w-full max-w-full min-w-0 h-full min-h-0 bg-transparent resize-none border-none outline-none font-707 overflow-hidden p-0 m-0 select-text cursor-text relative z-10 block whitespace-pre-wrap break-words [overflow-wrap:anywhere]"
                    :class="[
                      getTextTypographyClass(widget),
                      widget.props.textAlign === 'center' ? 'text-center' : (widget.props.textAlign === 'right' ? 'text-right' : 'text-left')
                    ]"
                  />
                </div>
              </div>
            </div>

            <!-- 7. FieldInput Widget (Gucci & 707 Luxury Animated Form Input - Figma Node 236:11400) -->
            <div 
              v-else-if="widget.type === 'FieldInput'" 
              class="relative w-full px-[16px] py-[4px] select-text overflow-visible cursor-text"
              @click.stop="handleFieldContainerClick(widget)"
              data-node-id="236:11400"
              data-name="Input field base"
            >
              <!-- Field Content Structure with Luxury Floating Label & Animated Sweeping Underline -->
              <div class="w-full flex flex-col items-start relative pt-[16px]">
                <!-- Floating Label (Translates upward smoothly when focused or active) -->
                <label 
                  class="luxury-floating-label font-707 left-0"
                  :class="[
                    isFieldLabelFloating(widget)
                      ? 'top-[0px] text-[11px] leading-[14px] text-black font-normal'
                      : 'top-[26px] text-[14px] leading-[20px] text-[#737373] font-normal'
                  ]"
                >
                  {{ isFieldLabelFloating(widget) ? (widget.props.label || 'Email') : (widget.props.placeholder || `${widget.props.label || 'Email'}*`) }}<span v-if="isFieldLabelFloating(widget) && (widget.props.required ?? true)">*</span>
                </label>

                <!-- Input Row with Underline Stack & Jitter Shake on Error -->
                <div 
                  class="w-full flex items-center gap-[8px] pt-[8px] pb-[10px] relative"
                  :class="[
                    shakingFieldIds.has(widget.id) ? 'animate-luxury-jitter' : ''
                  ]"
                >
                  <!-- WhatsApp / Phone Country Calling Code Selector with Small Chevron (Visible when active/focused or filled) -->
                  <div 
                    v-if="isPhoneField(widget) && isFieldLabelFloating(widget)"
                    class="flex items-center gap-[4px] shrink-0 select-none cursor-pointer pr-[2px] group/code relative z-10 animate-in fade-in duration-200"
                    @click.stop="toggleCountryCode(widget)"
                    title="Click to switch Country Calling Code"
                  >
                    <span class="font-707 text-[14px] leading-[20px] text-black font-normal tracking-tight">
                      {{ widget.props.countryCode || '+62' }}
                    </span>
                    <ChevronDown class="w-[12px] h-[12px] text-neutral-400 group-hover/code:text-black transition-colors stroke-[2]" />
                  </div>

                  <input 
                    :ref="el => registerInputField(widget.id, el)"
                    :value="widget.props.value || ''"
                    :type="widget.props.inputType || 'text'"
                    :inputmode="isPhoneField(widget) ? 'numeric' : (widget.props.inputType === 'email' || (widget.props.label && widget.props.label.toLowerCase().includes('email')) ? 'email' : 'text')"
                    @input="handleFieldInputChange($event, widget)"
                    @focus="handleFieldFocus(widget)"
                    @blur="handleFieldBlur(widget)"
                    :readonly="isMiniPreview || isDesignCanvas"
                    :tabindex="isDesignCanvas ? -1 : undefined"
                    :style="isDesignCanvas ? { pointerEvents: 'none' } : undefined"
                    class="font-707 font-normal text-[14px] leading-[20px] w-full bg-transparent outline-none border-none p-0 m-0 transition-colors duration-300 relative z-10"
                    :class="[
                      widget.props.stateVariant === 'Wrong alert' ? 'text-[#9b0707]' : 'text-black'
                    ]"
                  />

                  <!-- Error Alert Icon (Kept visible on error state even when dismissed) -->
                  <div 
                    class="size-[16px] shrink-0 flex items-center justify-center text-[#9b0707] transition-all duration-300 transform relative z-10"
                    :class="[
                      isFieldError(widget)
                        ? 'opacity-100 scale-100 pointer-events-auto'
                        : 'opacity-0 scale-75 pointer-events-none'
                    ]"
                  >
                    <AlertCircle class="size-[16px] stroke-[1.75]" />
                  </div>

                  <!-- 1. Luxury Underline - Resting Base Line (Default Lighter Grey at the beginning) -->
                  <div class="luxury-input-line-base" />

                  <!-- 2. Luxury Underline - Animated Active Line (Expands on focus, shrinks back to center when dismissed/blurred) -->
                  <div 
                    class="luxury-input-line-active"
                    :class="[
                      isFieldUnderlineActive(widget)
                        ? (isFieldError(widget) ? 'scale-x-100 bg-[#9b0707]' : 'scale-x-100 bg-black')
                        : 'scale-x-0 bg-black'
                    ]"
                  />
                </div>

                <!-- Error Message Alert Helper Text with Smooth Expand/Slide Transition (Active only on-going input / focused error state) -->
                <div 
                  class="w-full overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  :class="[
                    isFieldErrorMessageVisible(widget)
                      ? 'max-h-[36px] opacity-100 pt-[6px] translate-y-0'
                      : 'max-h-0 opacity-0 pt-0 -translate-y-1'
                  ]"
                >
                  <p class="font-707 font-normal text-[11px] leading-[14px] text-[#9b0707]">
                    {{ widget.props.errorMessage || 'Please enter a valid email address with @domain (e.g. name@domain.com).' }}
                  </p>
                </div>
              </div>
            </div>

            <!-- 7b. RegistrationForm Widget (Unified Form Section with Title, Subtitle, & Configurable Fields Stack) -->
            <div 
              v-else-if="widget.type === 'RegistrationForm'"
              class="relative w-full px-[16px] py-[4px] select-text overflow-visible cursor-pointer"
              @click.stop="handleRegistrationFormContainerClick(widget)"
              data-name="Registration Form Section"
            >
              <!-- Floating Action Toolbar for RegistrationForm -->
              <div 
                v-if="!isMiniPreview && !isPreviewModal && (hoveredWidgetId === widget.id || editorStore.selectedWidgetId === widget.id)"
                class="absolute top-[4px] right-[12px] z-30 apple-glass-modal flex gap-[4px] items-center p-[4px] rounded-[8px] shadow-[0px_4px_16px_rgba(0,0,0,0.18)] border border-black/10 transition-all animate-in fade-in duration-150 select-none"
                data-name="Buttons Container"
              >
                <!-- Icon 1: Form Setup Sidebar -->
                <button 
                  v-if="!isWidgetSetupModalOpen(widget)"
                  @click.stop="handleAdjustWidget(widget)"
                  class="apple-glass-icon-btn size-[24px] flex items-center justify-center rounded-[6px] text-black cursor-pointer hover:bg-black/10"
                  title="Form Setup"
                >
                  <SlidersHorizontal class="w-3.5 h-3.5" />
                </button>

                <!-- Icon 2: Duplicate -->
                <button 
                  @click.stop="editorStore.duplicateWidget(widget.id)"
                  class="apple-glass-icon-btn size-[24px] flex items-center justify-center rounded-[6px] text-black cursor-pointer hover:bg-black/10"
                  title="Duplicate"
                >
                  <Copy class="w-3.5 h-3.5" />
                </button>

                <!-- Icon 3: Remove -->
                <button 
                  @click.stop="editorStore.removeWidget(widget.id)"
                  class="apple-glass-icon-btn size-[24px] hover:text-red-600 flex items-center justify-center rounded-[6px] text-black cursor-pointer hover:bg-red-50"
                  title="Remove"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>

              <!-- Form Header Stack: Title + Subtitle -->
              <div class="flex flex-col items-start w-full">
                <h3 
                  v-if="widget.props.title" 
                  :class="getTitleTypographyClass(widget.props.titleTypographyStyle || widget.props.typographyStyle || 'heading-3')"
                  class="font-707 font-medium text-black uppercase tracking-tight"
                >
                  {{ widget.props.title }}
                </h3>

                <p 
                  v-if="widget.props.subtitle" 
                  class="font-707 font-normal text-[12px] leading-[18px] text-[#737373] mt-[8px]"
                >
                  {{ widget.props.subtitle }}
                </p>
              </div>

              <!-- Fields List Stack -->
              <div class="w-full flex flex-col gap-[12px] mt-[12px]">
                <div 
                  v-for="(field, fIdx) in (widget.props.fields || [])"
                  :key="field.id || fIdx"
                  class="w-full flex flex-col items-start relative pt-[16px] cursor-text"
                  @click.stop="focusRegistrationFormField(widget.id, field.id)"
                >
                  <!-- Floating Label -->
                  <label 
                    class="luxury-floating-label font-707 left-0"
                    :class="[
                      isFormItemFloating(widget.id, field)
                        ? 'top-[0px] text-[11px] leading-[14px] text-black font-normal'
                        : 'top-[26px] text-[14px] leading-[20px] text-[#737373] font-normal'
                    ]"
                  >
                    {{ isFormItemFloating(widget.id, field) ? (field.name || 'Field') : (field.placeholder || `${field.name || 'Field'}*`) }}<span v-if="isFormItemFloating(widget.id, field) && (field.required !== false)">*</span>
                  </label>

                  <!-- Input Row with Underline Stack -->
                  <div 
                    class="w-full flex items-center gap-[8px] pt-[8px] pb-[10px] relative"
                    :class="[
                      shakingFieldIds.has(`${widget.id}_${field.id}`) ? 'animate-luxury-jitter' : ''
                    ]"
                  >
                    <!-- WhatsApp / Phone Country Calling Code Selector -->
                    <div 
                      v-if="isPhoneItem(field) && isFormItemFloating(widget.id, field)"
                      class="flex items-center gap-[4px] shrink-0 select-none cursor-pointer pr-[2px] group/code relative z-10 animate-in fade-in duration-200"
                      @click.stop="toggleFormItemCountryCode(widget, field)"
                      title="Click to switch Country Calling Code"
                    >
                      <span class="font-707 text-[14px] leading-[20px] text-black font-normal tracking-tight">
                        {{ field.countryCode || '+62' }}
                      </span>
                      <ChevronDown class="w-[12px] h-[12px] text-neutral-400 group-hover/code:text-black transition-colors stroke-[2]" />
                    </div>

                    <input 
                      :ref="el => registerInputField(`${widget.id}_${field.id}`, el)"
                      :value="field.value || ''"
                      :type="field.type || 'text'"
                      :inputmode="isPhoneItem(field) ? 'numeric' : (field.type === 'email' || (field.name && field.name.toLowerCase().includes('email')) ? 'email' : 'text')"
                      @input="handleRegistrationFormItemInput($event, widget, field)"
                      @focus="handleRegistrationFormFieldFocus(widget.id, field.id)"
                      @blur="handleRegistrationFormFieldBlur(widget.id, field.id)"
                      :readonly="isMiniPreview || isDesignCanvas"
                    :tabindex="isDesignCanvas ? -1 : undefined"
                    :style="isDesignCanvas ? { pointerEvents: 'none' } : undefined"
                      class="font-707 font-normal text-[14px] leading-[20px] w-full bg-transparent outline-none border-none p-0 m-0 transition-colors duration-300 relative z-10"
                      :class="[
                        field.errorMessage ? 'text-[#9b0707]' : 'text-black'
                      ]"
                    />

                    <!-- Error Alert Icon -->
                    <div 
                      class="size-[16px] shrink-0 flex items-center justify-center text-[#9b0707] transition-all duration-300 transform relative z-10"
                      :class="[
                        field.errorMessage
                          ? 'opacity-100 scale-100 pointer-events-auto'
                          : 'opacity-0 scale-75 pointer-events-none'
                      ]"
                    >
                      <AlertCircle class="size-[16px] stroke-[1.75]" />
                    </div>

                    <!-- 1. Luxury Underline - Resting Base Line -->
                    <div class="luxury-input-line-base" />

                    <!-- 2. Luxury Underline - Animated Active Line -->
                    <div 
                      class="luxury-input-line-active"
                      :class="[
                        isFormItemUnderlineActive(widget.id, field)
                          ? (field.errorMessage ? 'scale-x-100 bg-[#9b0707]' : 'scale-x-100 bg-black')
                          : 'scale-x-0 bg-black'
                      ]"
                    />
                  </div>

                  <!-- Error Message Alert Helper Text -->
                  <div 
                    class="w-full overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    :class="[
                      field.errorMessage
                        ? 'max-h-[36px] opacity-100 pt-[6px] translate-y-0'
                        : 'max-h-0 opacity-0 pt-0 -translate-y-1'
                    ]"
                  >
                    <p class="font-707 font-normal text-[11px] leading-[14px] text-[#9b0707]">
                      {{ field.errorMessage }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 8. ActionButton Widget (707 Standard Action Button - Figma Node 244:11560) -->
            <div 
              v-else-if="widget.type === 'ActionButton' && widget.props.positionMode !== 'sticky-bottom'" 
              class="relative w-full px-[16px] py-[4px] select-none group/btn"
              @click.stop="handleActionButtonClick(widget)"
              data-node-id="244:11560"
              data-name="Action Button Container"
            >
              <!-- Container with sharp edges -->
              <div 
                class="w-full relative flex items-center justify-center rounded-none transition-all p-0"
              >
                <!-- Floating Action Toolbar for ActionButton (Figma Node 180:5844) -->
                <div 
                  v-if="!isMiniPreview && !isPreviewModal && (hoveredWidgetId === widget.id || editorStore.selectedWidgetId === widget.id)"
                  class="absolute z-40 apple-glass-modal flex gap-[4px] items-center p-[4px] rounded-[8px] shadow-[0px_4px_16px_rgba(0,0,0,0.18)] transition-all animate-in fade-in duration-150 select-none top-1/2 -translate-y-1/2 right-[8px]"
                  data-name="Buttons Container"
                >
                  <!-- Button 1: Adjust / Open Button Setup Sidebar (Hidden when setup modal is open) -->
                  <button 
                    v-if="!isWidgetSetupModalOpen(widget)"
                    @click.stop="handleAdjustWidget(widget)"
                    class="apple-glass-icon-btn size-[24px] flex items-center justify-center rounded-[6px] text-black hover:bg-black/10 cursor-pointer"
                    title="Button Setup"
                  >
                    <SlidersHorizontal class="w-3.5 h-3.5" />
                  </button>

                  <!-- Button 2: Duplicate -->
                  <button 
                    @click.stop="editorStore.duplicateWidget(widget.id)"
                    class="apple-glass-icon-btn size-[24px] flex items-center justify-center rounded-[6px] text-black hover:bg-black/10 cursor-pointer"
                    title="Duplicate"
                  >
                    <Copy class="w-3.5 h-3.5" />
                  </button>

                  <!-- Button 3: Remove -->
                  <button 
                    @click.stop="editorStore.removeWidget(widget.id)"
                    class="apple-glass-icon-btn size-[24px] hover:text-red-600 flex items-center justify-center rounded-[6px] text-black hover:bg-red-50 cursor-pointer"
                    title="Remove"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>

                <button 
                  type="button"
                  @click.stop="handleActionButtonClick(widget)"
                  :disabled="isButtonInactive(widget)"
                  :class="[
                    (widget.props.variant === 'white' || widget.props.buttonVariant === 'white')
                      ? 'bg-white text-black apple-cta-btn-white'
                      : 'bg-black text-white apple-cta-btn-dark',
                    isButtonInactive(widget) ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'apple-cta-btn'
                  ]"
                  :style="{ height: `${widget.props.height || 48}px` }"
                  class="w-full px-[16px] py-[12px] rounded-[0px] flex items-center justify-center gap-[10px] font-707 font-medium text-[14px] leading-[18px] tracking-normal cursor-pointer border-0 border-none outline-none shadow-none transition-opacity"
                >
                  <!-- Action Icon -->
                  <component :is="getButtonIcon(widget)" v-if="widget.props.showIcon" class="size-[16px] shrink-0" />
                  <span class="whitespace-nowrap uppercase">{{ widget.props.label || 'BUTTON CTA' }}</span>
                </button>
              </div>
            </div>

            <!-- 9. MultipleChoice Widget (Figma Node 276:4224 - Exact Dimensions, Typography, Checkbox Inset & Add-Filled Icon) -->
            <div 
              v-else-if="widget.type === 'MultipleChoice'" 
              class="relative w-full px-[16px] py-0 select-none group/choice text-black"
              @click.stop="handleMultipleChoiceContainerClick(widget)"
              data-node-id="276:4224"
              data-name="Multiple Choice Container"
            >
              <!-- Floating Action Toolbar for MultipleChoice (Figma Node 180:5844) -->
              <div 
                v-if="!isMiniPreview && !isPreviewModal && (hoveredWidgetId === widget.id || editorStore.selectedWidgetId === widget.id)"
                class="absolute z-40 apple-glass-modal flex gap-[4px] items-center p-[4px] rounded-[8px] shadow-[0px_4px_16px_rgba(0,0,0,0.18)] transition-all animate-in fade-in duration-150 select-none top-[8px] right-[12px]"
                data-name="Choice Toolbar"
              >
                <!-- Button 1: Adjust / Open Choice Setup Sidebar (Hidden when setup modal is open) -->
                <button 
                  v-if="!isWidgetSetupModalOpen(widget)"
                  @click.stop="handleAdjustWidget(widget)"
                  class="apple-glass-icon-btn size-[24px] flex items-center justify-center rounded-[6px] text-black hover:bg-black/10 cursor-pointer"
                  title="Choice Setup"
                >
                  <SlidersHorizontal class="w-3.5 h-3.5" />
                </button>

                <!-- Button 2: Duplicate -->
                <button 
                  @click.stop="editorStore.duplicateWidget(widget.id)"
                  class="apple-glass-icon-btn size-[24px] flex items-center justify-center rounded-[6px] text-black hover:bg-black/10 cursor-pointer"
                  title="Duplicate"
                >
                  <Copy class="w-3.5 h-3.5" />
                </button>

                <!-- Button 3: Remove -->
                <button 
                  @click.stop="editorStore.removeWidget(widget.id)"
                  class="apple-glass-icon-btn size-[24px] hover:text-red-600 flex items-center justify-center rounded-[6px] text-black hover:bg-red-50 cursor-pointer"
                  title="Remove"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>

              <!-- Title & Subtitle Header (Figma: Title with preset, Subtitle with Body Text style: 12px, 8px gap, 24px bottom spacing) -->
              <div v-if="widget.props.title || widget.props.subtitle" class="w-full flex flex-col gap-[8px] items-start mb-[24px]">
                <h3 v-if="widget.props.title" class="font-707" :class="getChoiceTitleTypographyClass(widget)">
                  {{ widget.props.title }}<span v-if="widget.props.required" class="text-neutral-400 text-[18px] ml-0.5">*</span>
                </h3>
                <p v-if="widget.props.subtitle" class="font-707 font-normal text-bodytext text-[12px] leading-[18px] text-neutral-700 whitespace-pre-line">
                  {{ widget.props.subtitle }}
                </p>
              </div>

              <!-- Variant 1: Detailed Cards (8px gap between button tiles, 16px padding, 24px gap between checkbox and text) -->
              <div v-if="(widget.props.variant || 'detailed-card') === 'detailed-card'" class="flex flex-col gap-[8px] w-full">
                <div 
                  v-for="opt in (widget.props.options || [])" 
                  :key="opt.id"
                  @click.stop="toggleChoiceOption(widget, opt.id)"
                  class="luxury-choice-tile border-[0.5px] border-solid border-[#d4d4d4] flex gap-[24px] w-full select-none transition-all duration-150 rounded-none"
                  :class="[
                    isChoiceSelected(widget, opt.id) ? 'is-selected' : '',
                    isChoiceOptionDisabled(widget, opt)
                      ? 'opacity-40 cursor-not-allowed pointer-events-none bg-neutral-100/50'
                      : 'cursor-pointer bg-transparent',
                    opt.description && opt.description.trim()
                      ? 'items-start p-[16px]'
                      : 'items-center min-h-[48px] h-[48px] px-[16px] py-[12px]'
                  ]"
                >
                  <!-- Checkbox Container (18px outer square with 12px inner square when active) -->
                  <div 
                    class="relative shrink-0 size-[18px] border-[0.5px] border-black border-solid flex items-center justify-center bg-transparent"
                    :class="opt.description && opt.description.trim() ? 'mt-[1px]' : ''"
                  >
                    <div 
                      class="luxury-choice-checkbox-inner size-[12px] bg-black border-[0.5px] border-black border-solid transform"
                      :class="isChoiceSelected(widget, opt.id) ? 'scale-100 opacity-100' : 'scale-0 opacity-0'"
                    />
                  </div>

                  <!-- Option Content (Zero text bleeding, crisp line-height, vertically centered when no description) -->
                  <div 
                    class="flex-1 flex min-w-0"
                    :class="opt.description && opt.description.trim() ? 'flex-col gap-[8px] items-start' : 'items-center'"
                  >
                    <!-- Layout A: With Event Description -->
                    <div v-if="opt.description && opt.description.trim()" class="w-full flex flex-col gap-[8px]">
                      <div class="flex items-baseline justify-between w-full font-707 gap-3">
                        <span class="font-707 truncate" :class="getChoiceOptionTypographyClass(widget, opt)">{{ opt.label }}</span>
                        <span v-if="opt.sublabel" class="shrink-0 font-707 font-normal text-[12px] leading-[18px] text-neutral-500">{{ opt.sublabel }}</span>
                      </div>
                      <div class="font-707 font-normal text-bodytext text-[12px] leading-[18px] text-neutral-600 whitespace-pre-line">
                        {{ opt.description }}
                      </div>
                      <!-- Badge Label "XX Slots Available" Under Event Description -->
                      <div v-if="getOptionSlotsBadge(widget, opt)" class="inline-flex items-center pt-[2px]">
                        <span 
                          class="inline-flex items-center px-[8px] py-[2px] border-[0.5px] rounded-[4px] font-707 text-[10px] font-medium leading-[14px]"
                          :class="isChoiceOptionDisabled(widget, opt) ? 'bg-neutral-200 text-neutral-500 border-neutral-300' : 'bg-neutral-100 border-[#e0e0e0] text-neutral-700'"
                        >
                          {{ getOptionSlotsBadge(widget, opt) }}
                        </span>
                      </div>
                    </div>

                    <!-- Layout B: Without Event Description (Badge Label Under the Date) -->
                    <div v-else class="flex items-center justify-between w-full font-707 gap-3">
                      <span class="font-707 truncate" :class="getChoiceOptionTypographyClass(widget, opt)">{{ opt.label }}</span>
                      <div class="flex flex-col items-end shrink-0 gap-[3px]">
                        <span v-if="opt.sublabel" class="font-707 font-normal text-[12px] leading-[16px] text-neutral-500">{{ opt.sublabel }}</span>
                        <span 
                          v-if="getOptionSlotsBadge(widget, opt)" 
                          class="inline-flex items-center px-[6px] py-[1.5px] border-[0.5px] rounded-[4px] font-707 text-[10px] font-medium leading-[13px]"
                          :class="isChoiceOptionDisabled(widget, opt) ? 'bg-neutral-200 text-neutral-500 border-neutral-300' : 'bg-neutral-100 border-[#e0e0e0] text-neutral-700'"
                        >
                          {{ getOptionSlotsBadge(widget, opt) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Add More Slot -->
                <button 
                  v-if="!isPreviewModal"
                  type="button"
                  @click.stop="handleChoiceAddMore(widget)"
                  class="border-[0.5px] border-[#d4d4d4] hover:border-black border-solid min-h-[48px] h-[48px] flex gap-[24px] items-center px-[16px] py-[12px] w-full cursor-pointer transition-colors bg-transparent select-none text-left rounded-none"
                >
                  <div class="relative shrink-0 size-[18px] flex items-center justify-center">
                    <img :src="FIGMA_ASSETS.addFilled" class="size-[18px] shrink-0 pointer-events-none object-contain" alt="Add" />
                  </div>
                  <span class="font-707 truncate" :class="getChoiceOptionTypographyClass(widget)">
                    Add more
                  </span>
                </button>
              </div>

              <!-- Variant 2: Simple Rows (Global 48px/flexible height, 8px pile gap, 16px padding, 24px gap with checkbox) -->
              <div v-else-if="widget.props.variant === 'simple-row'" class="flex flex-col gap-[8px] w-full">
                <div 
                  v-for="opt in (widget.props.options || [])" 
                  :key="opt.id"
                  @click.stop="toggleChoiceOption(widget, opt.id)"
                  class="luxury-choice-tile border-[0.5px] border-solid border-[#d4d4d4] flex gap-[24px] px-[16px] w-full select-none rounded-none"
                  :class="[
                    isChoiceSelected(widget, opt.id) ? 'is-selected' : '',
                    isChoiceOptionDisabled(widget, opt)
                      ? 'opacity-40 cursor-not-allowed pointer-events-none bg-neutral-100/50'
                      : 'cursor-pointer bg-transparent',
                    getOptionSlotsBadge(widget, opt)
                      ? 'items-start py-[12px]'
                      : 'items-center min-h-[48px] h-[48px] py-[12px]'
                  ]"
                >
                  <!-- Checkbox Container (18px outer square with 12px inner square when active) -->
                  <div 
                    class="relative shrink-0 size-[18px] border-[0.5px] border-black border-solid flex items-center justify-center bg-transparent"
                    :class="getOptionSlotsBadge(widget, opt) ? 'mt-[1px]' : ''"
                  >
                    <div 
                      class="luxury-choice-checkbox-inner size-[12px] bg-black border-[0.5px] border-black border-solid transform"
                      :class="isChoiceSelected(widget, opt.id) ? 'scale-100 opacity-100' : 'scale-0 opacity-0'"
                    />
                  </div>

                  <!-- Label & Slot Capacity under option title -->
                  <div v-if="getOptionSlotsBadge(widget, opt)" class="flex-1 flex flex-col items-start gap-[4px] min-w-0">
                    <span class="font-707 truncate" :class="getChoiceOptionTypographyClass(widget, opt)">
                      {{ opt.label }}
                    </span>
                    <span 
                      class="inline-flex items-center px-[6px] py-[1.5px] border-[0.5px] rounded-[4px] font-707 text-[10px] font-medium leading-[13px]"
                      :class="isChoiceOptionDisabled(widget, opt) ? 'bg-neutral-200 text-neutral-500 border-neutral-300' : 'bg-neutral-100 border-[#e0e0e0] text-neutral-700'"
                    >
                      {{ getOptionSlotsBadge(widget, opt) }}
                    </span>
                  </div>
                  <div v-else class="flex-1 font-707 truncate" :class="getChoiceOptionTypographyClass(widget, opt)">
                    {{ opt.label }}
                  </div>
                </div>

                <!-- Add More Slot -->
                <button 
                  v-if="!isPreviewModal"
                  type="button"
                  @click.stop="handleChoiceAddMore(widget)"
                  class="border-[0.5px] border-[#d4d4d4] hover:border-black border-solid min-h-[48px] h-[48px] flex gap-[24px] items-center px-[16px] py-[12px] w-full cursor-pointer transition-colors bg-transparent select-none text-left rounded-none"
                >
                  <div class="relative shrink-0 size-[18px] flex items-center justify-center">
                    <img :src="FIGMA_ASSETS.addFilled" class="size-[18px] shrink-0 pointer-events-none object-contain" alt="Add" />
                  </div>
                  <span class="font-707 truncate" :class="getChoiceOptionTypographyClass(widget)">
                    Add more
                  </span>
                </button>
              </div>

              <!-- Variant 3: Horizontal Blocks (Global 48px height, 8px pile gap, 16px padding) -->
              <div v-else-if="widget.props.variant === 'horizontal-block'" class="flex gap-[8px] items-start w-full overflow-x-auto no-scrollbar pb-1">
                <div 
                  v-for="opt in (widget.props.options || [])" 
                  :key="opt.id"
                  @click.stop="toggleChoiceOption(widget, opt.id)"
                  class="luxury-choice-tile min-w-[128px] max-w-[200px] min-h-[48px] h-[48px] px-[16px] py-[12px] flex items-center justify-start shrink-0 border-[0.5px] border-solid border-[#d4d4d4] select-none font-707 rounded-none"
                  :class="[
                    isChoiceSelected(widget, opt.id) ? 'is-selected' : '',
                    isChoiceOptionDisabled(widget, opt)
                      ? 'opacity-40 cursor-not-allowed pointer-events-none bg-neutral-100/50'
                      : 'cursor-pointer bg-transparent'
                  ]"
                >
                  <span class="font-707 truncate" :class="getChoiceOptionTypographyClass(widget, opt)">{{ opt.label }}</span>
                </div>

                <!-- Add More Button -->
                <button 
                  v-if="!isPreviewModal"
                  type="button"
                  @click.stop="handleChoiceAddMore(widget)"
                  class="min-h-[48px] h-[48px] px-[16px] py-[12px] border-[0.5px] border-[#d4d4d4] hover:border-black border-solid flex gap-[16px] items-center shrink-0 cursor-pointer transition-colors bg-transparent select-none rounded-none"
                >
                  <img :src="FIGMA_ASSETS.addFilled" class="size-[24px] shrink-0 pointer-events-none" alt="Add" />
                  <span class="font-707 whitespace-nowrap" :class="getChoiceOptionTypographyClass(widget)">
                    Add more
                  </span>
                </button>
              </div>

              <!-- Variant 4: Image Grid (Figma: Dynamic 1-4 columns, 3:4 ratio, 8px grid gap, transparent Add more button with Add (Enter) more) -->
              <div 
                v-else-if="widget.props.variant === 'image-grid'" 
                class="grid gap-[8px] w-full"
                :class="getImageGridColsClass(widget)"
              >
                <div 
                  v-for="opt in (widget.props.options || [])" 
                  :key="opt.id"
                  @click.stop="toggleChoiceOption(widget, opt.id)"
                  @dragover.prevent="dragOverChoiceOptionId = `${widget.id}_${opt.id}`"
                  @dragleave="dragOverChoiceOptionId = null"
                  @drop.prevent="handleChoiceImageDrop($event, widget, opt.id)"
                  class="luxury-choice-tile aspect-[3/4] bg-[#ededed] relative overflow-hidden select-none rounded-none border border-solid border-transparent group/imagecard"
                  :class="[
                    isChoiceSelected(widget, opt.id) ? 'is-selected' : '',
                    isChoiceOptionDisabled(widget, opt)
                      ? 'opacity-40 cursor-not-allowed pointer-events-none grayscale'
                      : 'cursor-pointer',
                    dragOverChoiceOptionId === `${widget.id}_${opt.id}` ? 'ring-2 ring-black ring-offset-1' : ''
                  ]"
                >
                  <img 
                    v-if="opt.imageUrl" 
                    :src="opt.imageUrl" 
                    :alt="opt.label"
                    class="size-full object-cover pointer-events-none transition-transform duration-300" 
                  />
                  <div v-else class="size-full flex flex-col items-center justify-center font-707 font-medium text-[11px] leading-[14px] text-black p-1 text-center bg-[#ededed]">
                    <span>{{ opt.label }}</span>
                  </div>

                  <!-- 30% Darker Overlay on Selection -->
                  <div 
                    class="absolute inset-0 bg-black/30 pointer-events-none transition-opacity duration-200 z-[1]"
                    :class="isChoiceSelected(widget, opt.id) ? 'opacity-100' : 'opacity-0'"
                  />

                  <!-- Centered Simple Minimal White Check Icon -->
                  <div 
                    class="luxury-choice-matrix-check absolute inset-0 flex items-center justify-center pointer-events-none z-[2] transform"
                    :class="isChoiceSelected(widget, opt.id) ? 'scale-100 opacity-100' : 'scale-50 opacity-0'"
                  >
                    <Check class="size-6 text-white stroke-[2.5] drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]" />
                  </div>

                  <!-- Drop Highlight Overlay -->
                  <div 
                    v-if="dragOverChoiceOptionId === `${widget.id}_${opt.id}`" 
                    class="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-707 text-[10px] font-medium z-10 pointer-events-none"
                  >
                    Drop image
                  </div>
                </div>

                <!-- Add More Tile (No container / transparent, 3:4 ratio, Add (Enter) more text) -->
                <button 
                  v-if="!isPreviewModal"
                  type="button"
                  @click.stop="handleChoiceAddMore(widget)"
                  class="aspect-[3/4] bg-transparent border border-dashed border-[#ccc] flex flex-col gap-[6px] items-center justify-center cursor-pointer transition-all select-none rounded-none p-1.5"
                  title="Add more models"
                >
                  <img :src="FIGMA_ASSETS.addFilled" class="size-[20px] shrink-0 pointer-events-none" alt="Add" />
                  <span class="font-707 text-center leading-[14px] whitespace-pre-line" :class="getChoiceOptionTypographyClass(widget)">Add
more</span>
                </button>
              </div>
            </div>

            <!-- Ticket data block (Ticket page): one or two guest fields, filled in per guest -->
            <div
              v-else-if="widget.type === 'TicketField'"
              class="relative w-full px-[20px] py-[6px] select-none text-black"
              @click.stop="handleWidgetClick(widget)"
            >
              <div
                class="grid gap-x-[20px] w-full"
                :class="ticketFieldsOf(widget).length > 1 ? 'grid-cols-2' : 'grid-cols-1'"
                :style="{ textAlign: widget.props?.align || 'left' }"
              >
                <div v-for="field in ticketFieldsOf(widget)" :key="field" class="flex flex-col min-w-0" :class="ticketAlignClass(widget)">
                  <!-- QR of the guest's Access ID -->
                  <div v-if="field === 'qr'" class="size-[120px] border-[0.5px] border-black rounded-[6px] p-[9px] flex items-center justify-center">
                    <img v-if="ticketQr" :src="ticketQr" alt="Pass QR code" class="size-full object-contain [image-rendering:pixelated]" />
                  </div>
                  <!-- Brand logo, or the campaign title when there is none -->
                  <template v-else-if="field === 'brandLogo'">
                    <img v-if="ticketLogo" :src="ticketLogo" alt="Brand logo" class="h-[22px] w-auto max-w-[160px] object-contain" crossorigin="anonymous" />
                    <span v-else class="font-707 text-[10px] uppercase tracking-[0.12em] text-neutral-500">{{ ticketCampaignTitle }}</span>
                  </template>
                  <!-- Sessions the guest picked -->
                  <template v-else-if="field === 'sessions'">
                    <span class="font-707 text-[10px] leading-[13px] text-neutral-500 uppercase tracking-tight mb-[6px]">{{ ticketCaption(widget, field) }}</span>
                    <div class="flex flex-col gap-[6px] w-full">
                      <div v-for="(sessionItem, sIdx) in ticketSessions" :key="sIdx" class="border-[0.5px] border-[#d4d4d4] h-[34px] px-[12px] flex items-center justify-between gap-2">
                        <span class="font-707 font-medium text-[11px] truncate">{{ sessionItem.label }}</span>
                        <span v-if="sessionItem.sublabel" class="font-707 text-[11px] text-neutral-500 shrink-0">{{ sessionItem.sublabel }}</span>
                      </div>
                    </div>
                  </template>
                  <!-- Text fields -->
                  <template v-else>
                    <span class="font-707 text-[10px] leading-[13px] text-neutral-500 uppercase tracking-tight">{{ ticketCaption(widget, field) }}</span>
                    <span
                      class="font-707 font-medium text-[13px] leading-[18px] tracking-tight break-words mt-[2px]"
                      :class="[field === 'email' ? 'lowercase' : 'uppercase', field === 'accessId' ? 'font-mono' : '']"
                    >{{ ticketValue(widget, field) || '—' }}</span>
                  </template>
                </div>
              </div>
            </div>

            <!-- 10. GuestEPass Widget (Figma Node 222:4188) -->
            <div 
              v-else-if="widget.type === 'GuestEPass'" 
              class="relative w-full px-[16px] pb-[16px] pt-0 select-none group/epass text-black bg-transparent flex flex-col gap-[20px]"
              @click.stop="handleWidgetClick(widget)"
              data-node-id="222:4188"
              data-name="Guest E-Pass Container"
            >
              <!-- Floating Action Toolbar on Canvas -->
              <div 
                v-if="!isMiniPreview && !isPreviewModal && (hoveredWidgetId === widget.id || editorStore.selectedWidgetId === widget.id)"
                class="absolute z-40 apple-glass-modal flex gap-[4px] items-center p-[4px] rounded-[8px] shadow-[0px_4px_16px_rgba(0,0,0,0.18)] transition-all animate-in fade-in duration-150 select-none top-[12px] right-[12px]"
                data-name="Buttons Container"
              >
                <!-- Button 1: Adjust / Setup -->
                <button 
                  v-if="!isWidgetSetupModalOpen(widget)"
                  @click.stop="handleAdjustWidget(widget)"
                  class="apple-glass-icon-btn size-[24px] flex items-center justify-center rounded-[6px] text-black hover:bg-black/10 cursor-pointer"
                  title="E-Pass Setup"
                >
                  <SlidersHorizontal class="w-3.5 h-3.5" />
                </button>

                <!-- Button 2: Duplicate -->
                <button 
                  @click.stop="editorStore.duplicateWidget(widget.id)"
                  class="apple-glass-icon-btn size-[24px] flex items-center justify-center rounded-[6px] text-black hover:bg-black/10 cursor-pointer"
                  title="Duplicate"
                >
                  <Copy class="w-3.5 h-3.5" />
                </button>

                <!-- Button 3: Remove -->
                <button 
                  @click.stop="editorStore.removeWidget(widget.id)"
                  class="apple-glass-icon-btn size-[24px] hover:text-red-600 flex items-center justify-center rounded-[6px] text-black hover:bg-red-50 cursor-pointer"
                  title="Remove"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>

              <!-- Top Brand Logo (Inherited from Hero Banner setup - Exactly 48px height, 0 top padding) -->
              <div 
                v-if="getBrandLogo(widget)" 
                class="w-full flex items-center pt-0"
                :class="[
                  getBrandLogoAlign(widget) === 'center' ? 'justify-center' :
                  getBrandLogoAlign(widget) === 'right' ? 'justify-end' :
                  'justify-start'
                ]"
              >
                <div class="max-h-[48px] h-[48px] flex items-center shrink-0">
                  <img 
                    :src="getBrandLogo(widget)" 
                    alt="Brand Logo" 
                    class="max-h-[48px] h-[48px] w-auto object-contain brightness-0 transition-transform" 
                    style="filter: brightness(0);"
                  />
                </div>
              </div>

              <!-- 1. Big Headline Display (H2 - responsive multiline without double line restriction) -->
              <h2 class="font-707 font-medium text-heading-h2 text-[22px] leading-[28px] tracking-tight uppercase text-black whitespace-pre-line break-words mt-[2px]">
                {{ widget.props?.heading || 'SUCCESS.\nYOUR PASS HAS\nBEEN SENT.' }}
              </h2>

              <!-- 2. QR Code Section (Positioned directly under Headline and ABOVE Pass Information fields, Left Aligned with transparent canvas bg) -->
              <div 
                v-if="widget.props?.showQrCode !== false" 
                class="w-full flex items-start justify-start pt-[4px]"
              >
                <div class="size-[132px] border-[0.5px] border-black bg-transparent rounded-[6px] p-[10px] flex items-center justify-center relative overflow-hidden shadow-xs">
                  <!-- Live page: the real, scannable pass for this guest -->
                  <template v-if="isLivePass">
                    <img v-if="livePass!.status === 'ready' && livePassQr" :src="livePassQr" :alt="`QR code for ${livePass!.code}`" class="size-full object-contain [image-rendering:pixelated]" />
                    <div v-else-if="livePass!.status === 'error'" class="flex flex-col items-center justify-center text-center gap-1.5 px-1">
                      <span class="font-707 text-[10px] leading-[13px] text-neutral-600">{{ livePass!.error }}</span>
                      <button type="button" @click.stop="livePass!.retry()" class="font-707 text-[10px] font-medium underline underline-offset-2 cursor-pointer">Try again</button>
                    </div>
                    <div v-else class="flex flex-col items-center justify-center gap-2">
                      <span class="size-5 rounded-full border-2 border-black/15 border-t-black animate-spin" />
                      <span class="font-707 text-[10px] text-neutral-500 uppercase tracking-tight">Issuing pass…</span>
                    </div>
                  </template>
                  <!-- Editor: decorative placeholder QR -->
                  <svg v-else class="size-full text-black" viewBox="0 0 100 100" fill="currentColor">
                    <!-- Top-Left Position Marker -->
                    <rect x="6" y="6" width="28" height="28" fill="none" stroke="currentColor" stroke-width="5" />
                    <rect x="15" y="15" width="10" height="10" />
                    <!-- Top-Right Position Marker -->
                    <rect x="66" y="6" width="28" height="28" fill="none" stroke="currentColor" stroke-width="5" />
                    <rect x="75" y="15" width="10" height="10" />
                    <!-- Bottom-Left Position Marker -->
                    <rect x="6" y="66" width="28" height="28" fill="none" stroke="currentColor" stroke-width="5" />
                    <rect x="15" y="75" width="10" height="10" />
                    <!-- QR Data Pattern Matrix -->
                    <rect x="42" y="8" width="6" height="6" />
                    <rect x="52" y="8" width="6" height="6" />
                    <rect x="42" y="20" width="6" height="12" />
                    <rect x="52" y="26" width="6" height="6" />
                    <rect x="8" y="42" width="6" height="6" />
                    <rect x="20" y="42" width="12" height="6" />
                    <rect x="38" y="40" width="8" height="8" />
                    <rect x="52" y="42" width="6" height="6" />
                    <rect x="66" y="42" width="12" height="6" />
                    <rect x="84" y="42" width="8" height="8" />
                    <rect x="8" y="54" width="18" height="6" />
                    <rect x="32" y="52" width="6" height="12" />
                    <rect x="44" y="54" width="14" height="6" />
                    <rect x="64" y="54" width="8" height="14" />
                    <rect x="78" y="54" width="14" height="6" />
                    <rect x="42" y="66" width="6" height="8" />
                    <rect x="52" y="68" width="6" height="6" />
                    <rect x="78" y="66" width="6" height="14" />
                    <rect x="42" y="80" width="16" height="6" />
                    <rect x="64" y="80" width="8" height="12" />
                    <rect x="86" y="84" width="6" height="8" />
                  </svg>
                </div>
              </div>

              <!-- 3. Pass Information Fields Grid (Positioned below QR Code, medium font weight for data values only, no bold) -->
              <div class="grid grid-cols-2 gap-x-[20px] gap-y-[16px] w-full pt-[2px]">
                <!-- Guest Name -->
                <div class="flex flex-col">
                  <span class="font-707 font-normal text-caption text-[11px] leading-[14px] text-neutral-500 uppercase tracking-tight">
                    GUEST NAME
                  </span>
                  <span class="font-707 font-medium text-[13px] leading-[18px] text-black uppercase tracking-tight break-words mt-[2px]">
                    {{ getGuestName(widget) }}
                  </span>
                </div>

                <!-- Venue -->
                <div class="flex flex-col">
                  <span class="font-707 font-normal text-caption text-[11px] leading-[14px] text-neutral-500 uppercase tracking-tight">
                    VENUE
                  </span>
                  <span class="font-707 font-medium text-[13px] leading-[18px] text-black uppercase tracking-tight break-words mt-[2px]">
                    {{ getVenue(widget) }}
                  </span>
                </div>

                <!-- Access ID -->
                <div class="flex flex-col">
                  <span class="font-707 font-normal text-caption text-[11px] leading-[14px] text-neutral-500 uppercase tracking-tight">
                    ACCESS ID
                  </span>
                  <span class="font-707 font-medium text-[13px] leading-[18px] text-black uppercase tracking-tight break-words mt-[2px] font-mono">
                    {{ getAccessId(widget) }}
                  </span>
                </div>

                <!-- Guest Type -->
                <div class="flex flex-col">
                  <span class="font-707 font-normal text-caption text-[11px] leading-[14px] text-neutral-500 uppercase tracking-tight">
                    GUEST TYPE
                  </span>
                  <span class="font-707 font-medium text-[13px] leading-[18px] text-black uppercase tracking-tight break-words mt-[2px]">
                    {{ getGuestType(widget) }}
                  </span>
                </div>

                <!-- Email -->
                <div class="flex flex-col col-span-2">
                  <span class="font-707 font-normal text-caption text-[11px] leading-[14px] text-neutral-500 uppercase tracking-tight">
                    EMAIL
                  </span>
                  <span class="font-707 font-medium text-[13px] leading-[18px] text-black lowercase tracking-tight break-words mt-[2px]">
                    {{ getEmail(widget) }}
                  </span>
                </div>
              </div>

              <!-- 4. ACCESS VALID FOR Section (Strictly matching choice form font size [12px], font weight [medium], line height [18px], and natural casing) -->
              <div class="flex flex-col gap-[8px] w-full pt-[4px]">
                <span class="font-707 font-normal text-caption text-[11px] leading-[14px] text-black uppercase tracking-tight">
                  ACCESS VALID FOR:
                </span>

                <div class="flex flex-col gap-[8px] w-full">
                  <div 
                    v-for="(sessionItem, sIdx) in getValidForSessions(widget)" 
                    :key="sessionItem.id || sIdx"
                    class="border-[0.5px] border-solid border-[#d4d4d4] bg-transparent w-full select-none rounded-none"
                    :class="[
                      sessionItem.description && sessionItem.description.trim()
                        ? 'p-[16px] flex flex-col gap-[8px] items-start'
                        : 'min-h-[48px] h-[48px] px-[16px] py-[12px] flex items-center justify-between'
                    ]"
                  >
                    <!-- Layout A: With Description -->
                    <div v-if="sessionItem.description && sessionItem.description.trim()" class="w-full flex flex-col gap-[8px]">
                      <div class="flex items-baseline justify-between w-full font-707 gap-3">
                        <span class="font-707 font-medium text-[12px] leading-[18px] text-black truncate">
                          {{ sessionItem.label }}
                        </span>
                        <span v-if="sessionItem.sublabel" class="shrink-0 font-707 font-normal text-[12px] leading-[18px] text-neutral-500">
                          {{ sessionItem.sublabel }}
                        </span>
                      </div>
                      <div class="font-707 font-normal text-bodytext text-[12px] leading-[18px] text-neutral-600 whitespace-pre-line">
                        {{ sessionItem.description }}
                      </div>
                    </div>

                    <!-- Layout B: Without Description -->
                    <div v-else class="flex items-center justify-between w-full font-707 gap-3">
                      <span class="font-707 font-medium text-[12px] leading-[18px] text-black truncate">
                        {{ sessionItem.label }}
                      </span>
                      <span v-if="sessionItem.sublabel" class="shrink-0 font-707 font-normal text-[12px] leading-[16px] text-neutral-500">
                        {{ sessionItem.sublabel }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 5. Footer Troubleshoot / Disclaimer Notice with Hyperlink and Modal Pop Up Support -->
              <div v-if="widget.props?.showFooterNotice ?? true" class="flex items-start gap-[10px] w-full pt-[6px]">
                <div class="size-[18px] rounded-full bg-black text-white flex items-center justify-center shrink-0 mt-[1px]">
                  <span class="font-707 font-bold text-[11px] leading-none italic">i</span>
                </div>
                <div class="flex flex-col">
                  <span class="font-707 font-bold text-[11px] leading-[15px] text-black uppercase tracking-tight">
                    {{ widget.props?.footerNoticeTitle || "DIDN'T RECEIVE THE EMAIL?" }}
                  </span>
                  <p class="font-707 font-normal text-[11px] leading-[15px] text-black mt-[1px]">
                    <template v-for="(token, tkIdx) in parseNoticeTokens(widget)" :key="tkIdx">
                      <span v-if="token.type === 'text'">{{ token.text }}</span>
                      <a 
                        v-else-if="token.type === 'link'"
                        :href="token.url || '#'"
                        @click.stop.prevent="handleNoticeLinkClick(token, widget)"
                        class="underline underline-offset-2 cursor-pointer font-medium hover:text-neutral-600 transition-colors inline"
                      >
                        {{ token.text }}
                      </a>
                    </template>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Physical Bottom Clearance Spacer for Sticky Bottom Button (Disabled when last widget is a Hero banner so banner sits flush against the sticky button) -->
          <div 
            v-if="stickyButtonForThisPage && !isLastWidgetHero" 
            class="h-[64px] w-full shrink-0 pointer-events-none" 
            aria-hidden="true" 
          />
          <!-- Exclusive 32px bottom padding spacer when the latest order of widgets is a text widget and no sticky button -->
          <div 
            v-else-if="isLastWidgetText" 
            class="h-[32px] w-full shrink-0 pointer-events-none" 
            aria-hidden="true" 
          />
          <!-- Exclusive 48px bottom padding spacer when the latest order of widgets is a standard (not sticky) button widget (disabled when isHeroWithButtonOnly so page fits 100% in 1 screen) -->
          <div 
            v-else-if="isLastWidgetButton && !isHeroWithButtonOnly" 
            class="h-[48px] w-full shrink-0 pointer-events-none" 
            aria-hidden="true" 
          />
        </div>
      </div>

      <!-- Floating iOS-style Auto-hide Scrollbar Indicator (Zero layout space, shows only on scrolling) -->
      <div 
        v-if="isContentScrollable"
        class="absolute right-[3px] w-[3px] rounded-full bg-black/40 z-40 transition-opacity duration-300 pointer-events-none"
        :class="isScrolling ? 'opacity-100' : 'opacity-0'"
        :style="{
          top: `${48 + scrollIndicatorTop}px`,
          height: `${scrollIndicatorHeight}px`
        }"
      />

      <!-- Floating Viewport Sticky Bottom Button (Figma Node 244:11560) -->
      <div 
        v-if="stickyButtonForThisPage"
        @click.stop="handleActionButtonClick(stickyButtonForThisPage)"
        @mouseenter="hoveredWidgetId = stickyButtonForThisPage.id"
        @mouseleave="hoveredWidgetId = null"
        class="absolute bottom-0 inset-x-0 z-30 w-full p-0 transition-all select-none group/sticky cursor-pointer"
      >
        <!-- Floating Toolbar on Hover for Sticky Bottom Button in Editor -->
        <div 
          v-if="!isMiniPreview && !isPreviewModal && !isLivePage && (hoveredWidgetId === stickyButtonForThisPage.id || editorStore.selectedWidgetId === stickyButtonForThisPage.id)"
          class="absolute z-40 apple-glass-modal flex gap-[5px] items-center p-[4px] rounded-[10px] shadow-[0px_8px_24px_rgba(0,0,0,0.12)] border border-white/80 transition-all -top-[28px] right-[12px] select-none"
        >
          <button 
            v-if="!isWidgetSetupModalOpen(stickyButtonForThisPage)"
            @click.stop="handleAdjustWidget(stickyButtonForThisPage)"
            class="apple-glass-icon-btn size-[22px] flex items-center justify-center rounded-[6px] text-black cursor-pointer"
            title="Button Setup"
          >
            <SlidersHorizontal class="w-3.5 h-3.5" />
          </button>
          <button 
            @click.stop="handleRemoveStickyButton(stickyButtonForThisPage)"
            class="apple-glass-icon-btn size-[22px] hover:text-red-600 flex items-center justify-center rounded-[6px] text-black cursor-pointer"
            title="Remove Sticky Button"
          >
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>        <button 
          type="button"
          @click.stop="handleActionButtonClick(stickyButtonForThisPage)"
          :disabled="isButtonInactive(stickyButtonForThisPage)"
          :class="[
            (stickyButtonForThisPage.props?.variant === 'white' || stickyButtonForThisPage.props?.buttonVariant === 'white')
              ? 'bg-white text-black apple-cta-btn-white border-t border-black/10 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]'
              : (stickyButtonForThisPage.props?.variant === 'black' || stickyButtonForThisPage.props?.buttonVariant === 'black')
                ? 'bg-black text-white apple-cta-btn-dark'
                : (isStickyButtonOnDarkBackground
                    ? 'bg-white text-black apple-cta-btn-white border-t border-black/10 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]'
                    : 'bg-black text-white apple-cta-btn-dark'),
            isButtonInactive(stickyButtonForThisPage) ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'apple-cta-btn'
          ]"
          :style="{ height: `${stickyButtonForThisPage.props?.height || 48}px` }"
          class="w-full px-[16px] py-[12px] rounded-none flex items-center justify-center gap-[10px] font-707 font-medium text-[14px] leading-[18px] tracking-normal cursor-pointer border-0 border-none outline-none shadow-none transition-opacity"
        >
          <!-- Action Icon -->
          <component :is="getButtonIcon(stickyButtonForThisPage)" v-if="stickyButtonForThisPage.props?.showIcon" class="size-[16px] shrink-0" />
          <span class="whitespace-nowrap uppercase">{{ stickyButtonForThisPage.props?.label || stickyButtonForThisPage.props?.buttonText || stickyButtonForThisPage.props?.ctaLabel || 'BUTTON CTA' }}</span>
        </button>
      </div>

      <!-- Interactive Pop Up Modal Bottom Sheet (Figma Node 276:4722) -->
      <Transition name="apple-bottom-sheet">
        <div 
          v-if="isModalOverlayVisible"
          class="absolute inset-0 z-50 flex flex-col justify-end overflow-hidden"
          @click.stop="handleBackdropClick"
        >
          <!-- Frosted Dark Backdrop -->
          <div class="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity" />

          <!-- Bottom Sheet Card (White background with premium Apple blur transparent effect) -->
          <div 
            @click.stop
            class="apple-bottom-sheet-card relative z-10 w-full backdrop-blur-2xl bg-white/90 border-t border-white/60 text-black rounded-t-[20px] shadow-[0px_-10px_40px_rgba(0,0,0,0.16),0_-1px_3px_rgba(0,0,0,0.05)] max-h-[85%] flex flex-col overflow-hidden"
            data-node-id="276:4722"
            data-name="Bottom Modal Popup"
          >
            <!-- Sheet Top Fixed Header (Handle Pill + Title + Subtitle) -->
            <div class="px-[24px] pt-[16px] pb-[12px] shrink-0 flex flex-col items-start w-full">
              <!-- Sheet Top Handle Pill -->
              <div class="w-full flex items-center justify-center pb-2.5">
                <div class="w-10 h-1 rounded-full bg-neutral-300" />
              </div>

              <!-- Header: Title + Subtitle -->
              <div class="flex flex-col gap-[6px] items-start w-full">
                <h3 class="font-707 font-medium text-heading-h3 text-black tracking-tight whitespace-pre-line">
                  {{ modalDisplayProps.title || 'Select Arrival Date' }}
                </h3>
                <p class="font-707 font-normal text-bodytext text-neutral-700 whitespace-pre-line">
                  {{ modalDisplayProps.subtitle || 'Please provide a valid email address. We will resend your E-Pass immediately.' }}
                </p>
              </div>
            </div>

            <!-- Scrollable Middle Contents Area (Scrolls behind sticky bottom button) -->
            <div 
              ref="modalScrollRef"
              @wheel.stop="handleModalWheel"
              @mousedown="handleModalMouseDown"
              class="flex-1 overflow-y-auto no-scrollbar px-[24px] py-[8px] flex flex-col gap-[16px] w-full overscroll-contain select-none"
              :class="isModalDragging ? 'cursor-grabbing' : 'cursor-grab'"
              style="scrollbar-width: none; -ms-overflow-style: none; -webkit-overflow-scrolling: touch;"
            >
              <!-- Variant 1: Message / Alert (Clean notice, title + subtitle only) -->

              <!-- Variant 2: Message + Field placeholder -->
              <div v-if="modalDisplayProps.variant === 'message-field'" class="w-full">
                <!-- WhatsApp / Phone Mode -->
                <div 
                  v-if="modalDisplayProps.fieldType === 'tel' || modalDisplayProps.fieldType === 'whatsapp'"
                  class="border-b-[0.5px] border-black py-[8px] bg-transparent w-full flex items-center gap-[8px] relative"
                >
                  <!-- WhatsApp Country Calling Code Selector with Chevron -->
                  <div 
                    class="flex items-center gap-[4px] shrink-0 select-none cursor-pointer pr-[4px] group/code relative z-10"
                    @click.stop="toggleModalCountryCode"
                    title="Click to switch Country Calling Code"
                  >
                    <span class="font-707 text-[14px] leading-[20px] text-black font-normal tracking-tight">
                      {{ modalCountryCode }}
                    </span>
                    <ChevronDown class="w-[12px] h-[12px] text-neutral-400 group-hover/code:text-black transition-colors stroke-[2]" />
                  </div>

                  <input 
                    v-model="modalInputValue"
                    :readonly="isDesignCanvas"
                    :style="isDesignCanvas ? { pointerEvents: 'none' } : undefined"
                    :placeholder="modalDisplayProps.fieldPlaceholder || '81234567890'"
                    type="tel"
                    inputmode="numeric"
                    class="w-full font-707 text-[14px] leading-[20px] text-black placeholder:text-neutral-400 bg-transparent border-none outline-none p-0 m-0 relative z-10"
                  />
                </div>

                <!-- Standard Text / Email Mode -->
                <div 
                  v-else
                  class="border-b-[0.5px] border-black py-[8px] bg-transparent w-full flex items-center"
                >
                  <input 
                    v-model="modalInputValue"
                    :readonly="isDesignCanvas"
                    :style="isDesignCanvas ? { pointerEvents: 'none' } : undefined"
                    :placeholder="modalDisplayProps.fieldPlaceholder || (modalDisplayProps.fieldType === 'text' ? 'Text*' : 'Email*')"
                    :type="modalDisplayProps.fieldType === 'text' ? 'text' : 'email'"
                    :inputmode="modalDisplayProps.fieldType === 'text' ? 'text' : 'email'"
                    class="w-full font-707 text-[14px] leading-[20px] text-black placeholder:text-neutral-400 bg-transparent border-none outline-none p-0 m-0"
                  />
                </div>
              </div>

              <!-- Variant 3: Multiple Choice (Detailed) (Strictly following MultipleChoice widget styling & functions) -->
              <div v-else-if="modalDisplayProps.variant === 'choice-detailed'" class="w-full flex flex-col gap-[8px]">
                <div 
                  v-for="(opt, oIdx) in (modalDisplayProps.options || [])"
                  :key="opt.id || oIdx"
                  @click="toggleModalOption(opt.id || oIdx)"
                  class="luxury-choice-tile border-[0.5px] border-solid border-[#d4d4d4] bg-transparent flex gap-[24px] w-full select-none transition-all duration-150 rounded-none cursor-pointer hover:border-black/50"
                  :class="[
                    isModalOptionSelected(opt) ? 'is-selected border-black bg-transparent ring-[0.5px] ring-black shadow-none' : '',
                    opt.description && opt.description.trim()
                      ? 'items-start p-[16px]'
                      : 'items-center min-h-[48px] h-[48px] px-[16px] py-[12px]'
                  ]"
                >
                  <!-- Checkbox Container (18px outer square with 12px inner square when active) -->
                  <div 
                    class="relative shrink-0 size-[18px] border-[0.5px] border-black border-solid flex items-center justify-center bg-transparent rounded-none"
                    :class="opt.description && opt.description.trim() ? 'mt-[1px]' : ''"
                  >
                    <div 
                      class="luxury-choice-checkbox-inner size-[12px] bg-black border-[0.5px] border-black border-solid rounded-none transform transition-all duration-150"
                      :class="isModalOptionSelected(opt) ? 'scale-100 opacity-100' : 'scale-0 opacity-0'"
                    />
                  </div>

                  <!-- Option Content -->
                  <div 
                    class="flex-1 flex min-w-0"
                    :class="opt.description && opt.description.trim() ? 'flex-col gap-[6px] items-start' : 'items-center'"
                  >
                    <!-- Layout A: With Event Description -->
                    <template v-if="opt.description && opt.description.trim()">
                      <div class="flex items-baseline justify-between w-full font-707 gap-3">
                        <span class="font-707 font-medium text-bodytext-medium text-black truncate">{{ opt.label }}</span>
                        <span v-if="opt.sublabel" class="shrink-0 font-707 font-normal text-[12px] leading-[18px] text-neutral-500">{{ opt.sublabel }}</span>
                      </div>
                      <div class="font-707 font-normal text-bodytext text-[12px] leading-[18px] text-neutral-600 whitespace-pre-line">
                        {{ opt.description }}
                      </div>
                      <!-- Badge Label "XX Slots Available" Under Event Description -->
                      <div v-if="getModalOptionSlotsBadge(opt)" class="inline-flex items-center pt-[2px]">
                        <span 
                          class="inline-flex items-center px-[6px] py-[1.5px] border-[0.5px] rounded-[4px] font-707 text-[10px] font-medium leading-[13px] bg-transparent border-[#e0e0e0] text-neutral-700"
                        >
                          {{ getModalOptionSlotsBadge(opt) }}
                        </span>
                      </div>
                    </template>

                    <!-- Layout B: Without Event Description (Badge Label Under the Date) -->
                    <template v-else>
                      <div class="flex items-center justify-between w-full font-707 gap-3">
                        <span class="font-707 font-medium text-bodytext-medium text-black truncate">{{ opt.label }}</span>
                        <div class="flex flex-col items-end shrink-0 gap-[3px]">
                          <span v-if="opt.sublabel" class="font-707 font-normal text-[12px] leading-[16px] text-neutral-500">{{ opt.sublabel }}</span>
                          <span 
                            v-if="getModalOptionSlotsBadge(opt)" 
                            class="inline-flex items-center px-[6px] py-[1.5px] border-[0.5px] rounded-[4px] font-707 text-[10px] font-medium leading-[13px] bg-transparent border-[#e0e0e0] text-neutral-700"
                          >
                            {{ getModalOptionSlotsBadge(opt) }}
                          </span>
                        </div>
                      </div>
                    </template>
                  </div>
                </div>

                <!-- Add More Slot -->
                <button 
                  v-if="!isPreviewModal"
                  type="button"
                  @click.stop="handleModalAddOption"
                  class="border-[0.5px] border-[#d4d4d4] hover:border-black border-solid min-h-[48px] h-[48px] flex gap-[24px] items-center px-[16px] py-[12px] w-full cursor-pointer transition-colors bg-transparent select-none text-left rounded-none"
                >
                  <div class="relative shrink-0 size-[18px] flex items-center justify-center">
                    <img :src="FIGMA_ASSETS.addFilled" class="size-[18px] shrink-0 pointer-events-none object-contain" alt="Add" />
                  </div>
                  <span class="font-707 font-medium text-bodytext-medium text-black truncate">
                    Add more
                  </span>
                </button>
              </div>

              <!-- Variant 4: Simple Multiple Choice (Strictly following MultipleChoice simple-row widget) -->
              <div v-else-if="modalDisplayProps.variant === 'choice-simple'" class="w-full flex flex-col gap-[8px]">
                <div 
                  v-for="(opt, oIdx) in (modalDisplayProps.options || [])"
                  :key="opt.id || oIdx"
                  @click="toggleModalOption(opt.id || oIdx)"
                  class="luxury-choice-tile border-[0.5px] border-solid border-[#d4d4d4] bg-transparent flex gap-[24px] px-[16px] w-full select-none rounded-none cursor-pointer hover:border-black/50"
                  :class="[
                    isModalOptionSelected(opt) ? 'is-selected border-black bg-transparent ring-[0.5px] ring-black shadow-none' : '',
                    getModalOptionSlotsBadge(opt)
                      ? 'items-start py-[12px]'
                      : 'items-center min-h-[48px] h-[48px] py-[12px]'
                  ]"
                >
                  <!-- Checkbox Container (18px outer square with 12px inner square when active) -->
                  <div 
                    class="relative shrink-0 size-[18px] border-[0.5px] border-black border-solid flex items-center justify-center bg-transparent rounded-none"
                    :class="getModalOptionSlotsBadge(opt) ? 'mt-[1px]' : ''"
                  >
                    <div 
                      class="luxury-choice-checkbox-inner size-[12px] bg-black border-[0.5px] border-black border-solid rounded-none transform transition-all duration-150"
                      :class="isModalOptionSelected(opt) ? 'scale-100 opacity-100' : 'scale-0 opacity-0'"
                    />
                  </div>

                  <!-- Label & Slot Capacity under option title, or right sublabel -->
                  <div v-if="getModalOptionSlotsBadge(opt)" class="flex-1 flex flex-col items-start gap-[4px] min-w-0">
                    <div class="flex items-center justify-between w-full font-707 gap-2">
                      <span class="font-707 font-medium text-bodytext-medium text-black truncate">{{ opt.label }}</span>
                      <span v-if="opt.sublabel" class="font-707 font-normal text-[12px] leading-[18px] text-neutral-500 shrink-0">{{ opt.sublabel }}</span>
                    </div>
                    <span 
                      class="inline-flex items-center px-[6px] py-[1.5px] border-[0.5px] rounded-[4px] font-707 text-[10px] font-medium leading-[13px] bg-transparent border-[#e0e0e0] text-neutral-700"
                    >
                      {{ getModalOptionSlotsBadge(opt) }}
                    </span>
                  </div>
                  <div v-else class="flex-1 flex items-center justify-between font-707 gap-2">
                    <span class="font-707 font-medium text-bodytext-medium text-black truncate">{{ opt.label }}</span>
                    <span v-if="opt.sublabel" class="font-707 font-normal text-[12px] leading-[18px] text-neutral-500 shrink-0">{{ opt.sublabel }}</span>
                  </div>
                </div>

                <!-- Add More Slot -->
                <button 
                  v-if="!isPreviewModal"
                  type="button"
                  @click.stop="handleModalAddOption"
                  class="border-[0.5px] border-[#d4d4d4] hover:border-black border-solid min-h-[48px] h-[48px] flex gap-[24px] items-center px-[16px] py-[12px] w-full cursor-pointer transition-colors bg-transparent select-none text-left rounded-none"
                >
                  <div class="relative shrink-0 size-[18px] flex items-center justify-center">
                    <img :src="FIGMA_ASSETS.addFilled" class="size-[18px] shrink-0 pointer-events-none object-contain" alt="Add" />
                  </div>
                  <span class="font-707 font-medium text-bodytext-medium text-black truncate">
                    Add more
                  </span>
                </button>
              </div>

              <!-- Variant 5: Matrix Image Pop Up (3:4 ratio) -->
              <div v-else-if="modalDisplayProps.variant === 'image-matrix'" class="w-full grid grid-cols-4 gap-[8px]">
                <div 
                  v-for="(slot, sIdx) in (modalDisplayProps.imageSlots || [])"
                  :key="slot.id || sIdx"
                  @click="toggleModalSlot(slot.id || sIdx)"
                  class="aspect-[3/4] bg-transparent border-[0.5px] border-solid border-neutral-300 relative overflow-hidden transition-all cursor-pointer select-none rounded-none"
                  :class="isModalSlotSelected(slot) ? 'border-black ring-[0.5px] ring-black' : 'hover:border-black/50'"
                >
                  <img v-if="slot.url" :src="slot.url" class="w-full h-full object-cover" />
                  <div v-if="isModalSlotSelected(slot)" class="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Check class="size-4 text-white stroke-[2.5]" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Fixed / Sticky Bottom Action CTA Button -->
            <div class="px-[24px] pt-[8px] pb-[20px] shrink-0 w-full bg-transparent z-20">
              <button 
                type="button"
                @click.stop="handleModalDoneClick"
                :disabled="isModalButtonInactive"
                :class="[
                  isModalButtonInactive ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'apple-cta-btn',
                  'apple-cta-btn-dark bg-black text-white hover:bg-neutral-900 active:bg-neutral-800 w-full h-[48px] px-[16px] py-[12px] rounded-none flex items-center justify-center gap-[10px] font-707 font-medium text-[14px] leading-[18px] tracking-normal cursor-pointer border-0 border-none outline-none shadow-none transition-all'
                ]"
              >
                <span class="whitespace-nowrap uppercase">{{ modalDisplayProps.buttonText || 'DONE' }}</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, inject } from 'vue';
import QRCode from 'qrcode';
import { LIVE_PASS_KEY, SESSIONS_ANSWER_KEY, type PassSession } from './livePass.ts';
import { normalizeCtaAction } from './ctaActions.ts';
import { TICKET_CONTEXT_KEY, TICKET_SOURCE_KEY, ticketFieldMeta, type TicketFieldKey } from './ticket/ticketFields.ts';
import { useEditorStore } from '../../stores/editorStore.ts';
import { FIGMA_ASSETS } from '../../constants/figmaAssets.ts';
import { 
  SlidersHorizontal, 
  Copy, 
  Trash2, 
  Plus, 
  Pencil, 
  Check, 
  AlertCircle, 
  ChevronDown, 
  LayoutGrid,
  ArrowRight,
  Ticket,
  Phone,
  Instagram,
  Image as ImageIcon
} from 'lucide-vue-next';
import { uploadMediaDirectly } from '../../services/mediaService.ts';
import type { ActivationPage } from '../../types/editor.ts';

const props = withDefaults(defineProps<{
  page?: ActivationPage;
  pageIndex?: number;
  isSelected?: boolean;
  isMiniPreview?: boolean;
  isPreviewModal?: boolean;
  isLivePage?: boolean;
}>(), {
  isSelected: true,
  isMiniPreview: false,
  isPreviewModal: false,
  isLivePage: false
});

const emit = defineEmits<{
  (e: 'select-page', index: number): void;
  (e: 'next-page', formData?: Record<string, any>): void;
  (e: 'prev-page'): void;
}>();

const editorStore = useEditorStore();

// Real pass state on a published page (provided by PublicDropView); absent in the editor.
const livePass = inject(LIVE_PASS_KEY, null);
const isLivePass = computed(() => Boolean(props.isLivePage && livePass));
const livePassQr = ref('');

/** Same shape as the server's ticket codes (DDMMYY-HHMM-XXXX); preview only. */
const sampleAccessId = (() => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const suffix = Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
  return `${pad(now.getDate())}${pad(now.getMonth() + 1)}${String(now.getFullYear()).slice(-2)}-${pad(now.getHours())}${pad(now.getMinutes())}-${suffix}`;
})();
watch(
  () => livePass?.code,
  async (code) => {
    livePassQr.value = '';
    if (!code) return;
    try {
      livePassQr.value = await QRCode.toDataURL(code, { margin: 0, width: 264, errorCorrectionLevel: 'M' });
    } catch (err) {
      console.warn('[MobileArtboard] Could not render pass QR:', err);
    }
  },
  { immediate: true }
);
const logoFailed = ref(false);

const activePage = computed(() => {
  return props.page || editorStore.currentPage;
});

/* ---------- Ticket page ---------- */
const isTicketPage = computed(() => activePage.value?.kind === 'ticket');
/**
 * The editor canvas is for design and layout only: fields cannot be typed in
 * and options cannot be picked there. Testing as a guest happens in Preview.
 */
const isDesignCanvas = computed(() => !props.isPreviewModal && !props.isLivePage && !props.isMiniPreview);
// Rendered on its own for the PDF: the campaign's pass, logo and title come in from outside.
const ticketContext = inject(TICKET_CONTEXT_KEY, null);
// On a live page: where the campaign's Ticket page is (it is not a funnel page).
const ticketSource = inject(TICKET_SOURCE_KEY, null);

function ticketPassWidget(): any | null {
  return ticketContext?.passWidget || findPassWidget(null);
}

function ticketFieldsOf(widget: any): TicketFieldKey[] {
  const fields = (Array.isArray(widget.props?.fields) ? widget.props.fields : [widget.props?.field || 'guestName']) as TicketFieldKey[];
  return fields.slice(0, 2);
}

function ticketCaption(widget: any, field: string): string {
  const custom = widget.props?.captions?.[field];
  return custom !== undefined && custom !== '' ? custom : ticketFieldMeta(field).caption;
}

function ticketAlignClass(widget: any): string {
  const align = widget.props?.align || 'left';
  return align === 'center' ? 'items-center' : align === 'right' ? 'items-end' : 'items-start';
}

function ticketValue(_widget: any, field: TicketFieldKey): string {
  const pass = ticketPassWidget();
  switch (field) {
    case 'guestName': return pass ? getGuestName(pass) : '[GUEST NAME]';
    case 'accessId': return pass ? getAccessId(pass) : sampleAccessId;
    case 'guestType': return pass ? getGuestType(pass) : 'PUBLIC';
    case 'email': return pass ? getEmail(pass) : 'guest@email.com';
    case 'venue': return pass ? getVenue(pass) : '[EVENT VENUE LOCATION]';
    case 'eventTitle': return ticketCampaignTitle.value;
    default: return '';
  }
}

const ticketCampaignTitle = computed(() => ticketContext?.campaignTitle || editorStore.projectTitle || 'Campaign');
const ticketLogo = computed(() => {
  if (ticketContext) return ticketContext.logoUrl;
  const pass = ticketPassWidget();
  return pass ? getBrandLogo(pass) : '';
});
const ticketSessions = computed<PassSession[]>(() => {
  const pass = ticketPassWidget();
  return pass ? getValidForSessions(pass) : [];
});

// Sample QR in the editor (same format as a real code); the guest's own QR when live.
const sampleQr = ref('');
QRCode.toDataURL(sampleAccessId, { margin: 0, width: 264, errorCorrectionLevel: 'M' })
  .then(url => (sampleQr.value = url))
  .catch(() => {});
const ticketQr = computed(() => (isLivePass.value ? livePassQr.value : sampleQr.value));

const pageNumber = computed(() => {
  return typeof props.pageIndex === 'number' ? props.pageIndex + 1 : 1;
});

// Page Label Editable State
const isEditingPageName = ref(false);
const pageNameInput = ref('');
const pageNameInputRef = ref<HTMLInputElement | null>(null);

const currentPageName = computed(() => {
  if (activePage.value.page_name) return activePage.value.page_name;
  return pageNumber.value === 1 ? 'Landing Page' : 'Untitled Page';
});

function handleSelectThisPage() {
  if (typeof props.pageIndex === 'number' && !props.isSelected) {
    editorStore.selectPage(props.pageIndex);
    emit('select-page', props.pageIndex);
  }
}

function handleDoubleClickThisPage(e?: MouseEvent) {
  // If double clicking inside an active text input or textarea, allow native text selection
  if (e?.target instanceof HTMLInputElement || e?.target instanceof HTMLTextAreaElement) {
    return;
  }
  const pIdx = typeof props.pageIndex === 'number' ? props.pageIndex : editorStore.activePageIndex;
  editorStore.focusPage(pIdx);
}

function startEditingPageName() {
  if (wasDraggingRecently.value) return;
  pageNameInput.value = currentPageName.value;
  isEditingPageName.value = true;
  nextTick(() => {
    pageNameInputRef.value?.focus();
    pageNameInputRef.value?.select();
  });
}

function savePageName() {
  if (isEditingPageName.value) {
    const trimmed = pageNameInput.value.trim();
    if (trimmed) {
      activePage.value.page_name = trimmed;
      activePage.value.title = `Page ${pageNumber.value}: ${trimmed}`;
    }
    isEditingPageName.value = false;
  }
}

function cancelPageName() {
  isEditingPageName.value = false;
}

const isDragOver = ref(false);
const dropTargetIndex = ref<number | null>(null);
const hoveredWidgetId = ref<string | null>(null);

const scrollContainerRef = ref<HTMLElement | null>(null);
const modalScrollRef = ref<HTMLElement | null>(null);
const isScrolling = ref(false);
const isContentScrollable = ref(false);
const scrollIndicatorTop = ref(0);
const scrollIndicatorHeight = ref(30);
let scrollTimeout: any = null;

// Drag-to-scroll (Click + Hold to scroll) State & Handlers
const isArtboardDragging = ref(false);
const isModalDragging = ref(false);
const wasDraggingRecently = ref(false);
let dragSuppressTimer: any = null;

function markDragged() {
  wasDraggingRecently.value = true;
  if (dragSuppressTimer) clearTimeout(dragSuppressTimer);
  dragSuppressTimer = setTimeout(() => {
    wasDraggingRecently.value = false;
  }, 120);
}

function isInputElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return tagName === 'input' || tagName === 'textarea' || tagName === 'select' || target.isContentEditable;
}

function handleArtboardMouseDown(e: MouseEvent) {
  if (e.button !== 0 || props.isMiniPreview) return;
  if (isInputElement(e.target)) return;
  const targetContainer = scrollContainerRef.value;
  if (!targetContainer || isSingleFullScreenHero.value) return;

  const startY = e.clientY;
  const startScrollTop = targetContainer.scrollTop;
  let hasMoved = false;

  function onMouseMove(moveEvent: MouseEvent) {
    const deltaY = moveEvent.clientY - startY;
    if (!hasMoved && Math.abs(deltaY) > 3) {
      hasMoved = true;
      isArtboardDragging.value = true;
    }
    if (hasMoved && targetContainer) {
      targetContainer.scrollTop = startScrollTop - deltaY;
      moveEvent.preventDefault();
    }
  }

  function onMouseUp() {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    if (hasMoved) {
      markDragged();
    }
    setTimeout(() => {
      isArtboardDragging.value = false;
    }, 10);
  }

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
}

function handleModalMouseDown(e: MouseEvent) {
  if (e.button !== 0) return;
  if (isInputElement(e.target)) return;
  const targetContainer = modalScrollRef.value;
  if (!targetContainer) return;

  const startY = e.clientY;
  const startScrollTop = targetContainer.scrollTop;
  let hasMoved = false;

  function onMouseMove(moveEvent: MouseEvent) {
    const deltaY = moveEvent.clientY - startY;
    if (!hasMoved && Math.abs(deltaY) > 3) {
      hasMoved = true;
      isModalDragging.value = true;
    }
    if (hasMoved && targetContainer) {
      targetContainer.scrollTop = startScrollTop - deltaY;
      moveEvent.preventDefault();
    }
  }

  function onMouseUp() {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    if (hasMoved) {
      markDragged();
    }
    setTimeout(() => {
      isModalDragging.value = false;
    }, 10);
  }

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
}

function handleScroll(e: Event) {
  const container = e.target as HTMLElement;
  if (!container) return;

  const { scrollTop, scrollHeight, clientHeight } = container;
  isContentScrollable.value = scrollHeight > clientHeight + 2;

  if (isContentScrollable.value) {
    const availableTrack = clientHeight - 8;
    const thumbHeight = Math.max(20, (clientHeight / scrollHeight) * availableTrack);
    const maxScroll = scrollHeight - clientHeight;
    const scrollRatio = maxScroll > 0 ? scrollTop / maxScroll : 0;
    const thumbTop = 4 + scrollRatio * (availableTrack - thumbHeight);

    scrollIndicatorHeight.value = thumbHeight;
    scrollIndicatorTop.value = thumbTop;

    isScrolling.value = true;
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      isScrolling.value = false;
    }, 800);
  }
}

function updateScrollMetrics() {
  if (scrollContainerRef.value) {
    const { scrollHeight, clientHeight } = scrollContainerRef.value;
    isContentScrollable.value = scrollHeight > clientHeight + 4;
  }
}

function handleArtboardWheel(e: WheelEvent) {
  if (e.ctrlKey || e.metaKey || props.isMiniPreview) return;
  e.stopPropagation();

  // If modal bottom sheet is currently open, scroll the modal content container
  if (isModalOverlayVisible.value && modalScrollRef.value) {
    modalScrollRef.value.scrollTop += e.deltaY;
    return;
  }

  // Otherwise scroll artboard widget container
  if (scrollContainerRef.value && !isSingleFullScreenHero.value) {
    scrollContainerRef.value.scrollTop += e.deltaY;
  }
}

function handleModalWheel(e: WheelEvent) {
  if (e.ctrlKey || e.metaKey) return;
  e.stopPropagation();
  if (modalScrollRef.value) {
    modalScrollRef.value.scrollTop += e.deltaY;
  }
}

function scrollToWidget(id: string) {
  if (!scrollContainerRef.value || !props.isSelected || props.isMiniPreview) return;
  nextTick(() => {
    const el = scrollContainerRef.value?.querySelector(`[data-widget-id="${id}"]`) as HTMLElement | null;
    if (el && scrollContainerRef.value) {
      const container = scrollContainerRef.value;
      if (activePage.value.widget_tree[0]?.id === id) {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const containerRect = container.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        if (elRect.top < containerRect.top || elRect.bottom > containerRect.bottom) {
          const targetScrollTop = container.scrollTop + (elRect.top - containerRect.top) - 16;
          container.scrollTo({ top: Math.max(0, targetScrollTop), behavior: 'smooth' });
        }
      }
      const ta = textareaRefs.get(id);
      if (ta && ta !== document.activeElement) {
        ta.focus({ preventScroll: true });
      }
    }
  });
}

watch(() => editorStore.selectedWidgetId, (newId) => {
  if (newId) {
    scrollToWidget(newId);
  }
});

watch(() => activePage.value.widget_tree.length, (newLen, oldLen) => {
  if (newLen > (oldLen || 0)) {
    const lastWidget = activePage.value.widget_tree[newLen - 1];
    if (lastWidget) {
      scrollToWidget(lastWidget.id);
    }
  }
});

watch(() => activePage.value.widget_tree, async () => {
  await nextTick();
  updateScrollMetrics();
}, { deep: true });

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  updateScrollMetrics();
  if (scrollContainerRef.value && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      updateScrollMetrics();
    });
    resizeObserver.observe(scrollContainerRef.value);
  }
});

function handleArtboardClick() {
  if (wasDraggingRecently.value) return;
  handleSelectThisPage();
  editorStore.selectWidget(null);
  editorStore.closeAllSidebars();
}

const textareaRefs = new Map<string, HTMLTextAreaElement>();

function registerTextarea(id: string, el: any) {
  if (el) {
    textareaRefs.set(id, el as HTMLTextAreaElement);
    adjustTextareaHeight(el as HTMLTextAreaElement);
  } else {
    textareaRefs.delete(id);
  }
}

function adjustTextareaHeight(textarea: HTMLTextAreaElement) {
  if (!textarea) return;
  textarea.style.height = '100%';
}

function handleTextInput(e: Event, widgetId: string) {
  const target = e.target as HTMLTextAreaElement;
  adjustTextareaHeight(target);
  editorStore.updateWidgetProps(widgetId, { text: target.value });
}

function handleTextBlur(_widget: any) {
  // Retain unedited/empty text widgets even if user leaves them
}

function getTextTypographyClass(widget: any) {
  const style = widget.props.typographyStyle || 'headline-1';
  switch (style) {
    case 'heading-2':
      return 'text-[22px] md:text-[24px] font-medium leading-[1.15] text-black placeholder:text-black';
    case 'heading-3':
      return 'text-[17px] md:text-[18px] font-medium leading-[1.2] text-black placeholder:text-black';
    case 'subtext-lead':
      return 'text-[15px] md:text-[16px] font-medium leading-[1.3] text-black placeholder:text-black';
    case 'body-text-medium':
    case 'body-text-bold':
      return 'text-[12px] font-medium leading-[1.4] text-black placeholder:text-black';
    case 'body-text':
      return 'text-[12px] font-normal leading-[1.4] text-black placeholder:text-black';
    case 'caption':
      return 'text-[11px] font-normal leading-[1.4] text-black placeholder:text-black';
    case 'legal-micro':
      return 'text-[11px] font-normal leading-[1.4] text-neutral-500 placeholder:text-neutral-500';
    case 'headline-1':
    default:
      return 'text-[28px] md:text-[32px] font-medium leading-[1.08] text-black placeholder:text-black';
  }
}

function getTitleTypographyClass(styleInput: any) {
  const style = typeof styleInput === 'string' ? styleInput : (styleInput?.props?.titleTypographyStyle || styleInput?.props?.typographyStyle || 'heading-3');
  switch (style) {
    case 'display-h1':
    case 'headline-1':
      return 'text-[28px] md:text-[32px] font-medium leading-[34px] text-black tracking-normal';
    case 'heading-1':
      return 'text-[24px] font-medium leading-[30px] text-black tracking-normal';
    case 'heading-2':
      return 'text-[22px] font-medium leading-[28px] text-black tracking-normal';
    case 'heading-3':
      return 'text-[18px] font-medium leading-[24px] text-black tracking-normal';
    case 'heading-4':
      return 'text-[14px] font-medium leading-[20px] text-black tracking-normal';
    case 'subtext-lead':
      return 'text-[16px] font-medium leading-[22px] text-black tracking-normal';
    case 'body-text-medium':
    case 'body-text-bold':
      return 'text-[12px] font-medium leading-[18px] text-black tracking-normal';
    case 'body-text':
      return 'text-[12px] font-normal leading-[18px] text-black tracking-normal';
    case 'caption':
      return 'text-[11px] font-normal leading-[14px] text-black tracking-normal';
    case 'legal-micro':
      return 'text-[11px] font-normal leading-[14px] text-neutral-500 tracking-normal';
    default:
      return 'text-[18px] font-medium leading-[24px] text-black tracking-normal';
  }
}

function getChoiceTitleTypographyClass(widget: any) {
  return getTitleTypographyClass(widget);
}

function getChoiceOptionTypographyClass(widget: any, opt?: any) {
  const style = opt?.typographyStyle || widget.props.optionTypographyStyle || 'body-text-medium';
  switch (style) {
    case 'headline-1':
      return 'text-[24px] md:text-[28px] font-medium leading-[32px] text-black';
    case 'heading-2':
      return 'text-[20px] md:text-[22px] font-medium leading-[26px] text-black';
    case 'heading-3':
      return 'text-[17px] md:text-[18px] font-medium leading-[24px] text-black';
    case 'subtext-lead':
      return 'text-[16px] font-medium leading-[22px] text-black';
    case 'body-text':
      return 'text-[12px] font-normal leading-[18px] text-black';
    case 'caption':
      return 'text-[11px] font-normal leading-[14px] text-black';
    case 'legal-micro':
      return 'text-[11px] font-normal leading-[14px] text-neutral-500';
    case 'body-text-bold':
    case 'body-text-medium':
    default:
      return 'text-[12px] font-medium leading-[18px] text-black';
  }
}

function getOptionSlotsCapacity(widget: any, opt?: any): number | null {
  if (widget?.props?.showSlotsCapacity === false) return null;
  if (opt?.slotsCapacity !== undefined && opt?.slotsCapacity !== null && String(opt.slotsCapacity).trim() !== '') {
    const num = Number(opt.slotsCapacity);
    if (!isNaN(num)) return num;
  }
  if (widget?.props?.globalSlotsCapacity !== undefined && widget?.props?.globalSlotsCapacity !== null && String(widget.props.globalSlotsCapacity).trim() !== '') {
    const num = Number(widget.props.globalSlotsCapacity);
    if (!isNaN(num)) return num;
  }
  return 25;
}

function isChoiceOptionDisabled(widget: any, opt: any): boolean {
  if (!opt) return false;
  if (opt.disabled) return true;
  if (widget?.props?.showSlotsCapacity) {
    const capacity = getOptionSlotsCapacity(widget, opt);
    if (capacity !== null && capacity <= 0) {
      return true;
    }
  }
  return false;
}

function formatSlotsBadge(val?: string | number): string {
  if (val === undefined || val === null) return '';
  const str = String(val).trim();
  if (!str) return '';
  if (/slots/i.test(str)) return str;
  const num = Number(str);
  if (!isNaN(num) && num <= 0) {
    return '0 Slots Available (Full)';
  }
  return `${str} Slots Available`;
}

function getOptionSlotsBadge(widget: any, opt?: any): string {
  const v = widget?.props?.variant || 'detailed-card';
  if (v !== 'detailed-card' && v !== 'simple-row') return '';
  if (widget?.props?.showSlotsCapacity === false) return '';
  const val = getOptionSlotsCapacity(widget, opt);
  if (val === null) return '';
  return formatSlotsBadge(val);
}

function getImageGridColsClass(widget: any): string {
  const cols = Number(widget.props?.gridColumns) || 4;
  switch (cols) {
    case 1: return 'grid-cols-1';
    case 2: return 'grid-cols-2';
    case 3: return 'grid-cols-3';
    case 4:
    default: return 'grid-cols-4';
  }
}

watch(() => editorStore.selectedWidgetId, async (newId) => {
  if (newId && !props.isMiniPreview) {
    await nextTick();
    const textarea = textareaRefs.get(newId);
    if (textarea && textarea !== document.activeElement) {
      textarea.focus({ preventScroll: true });
      adjustTextareaHeight(textarea);
    }
  }
});

function handleWidgetClick(widget: any) {
  if (wasDraggingRecently.value) return;
  if (props.isPreviewModal || props.isMiniPreview) return;
  handleSelectThisPage();
  editorStore.selectWidget(widget.id);
  handleAdjustWidget(widget);
}

function isWidgetSetupModalOpen(widget: any): boolean {
  if (!widget) return false;
  if (widget.type === 'HeroDrop') {
    return editorStore.isMediaSidebarOpen || editorStore.isMediaGalleryOpen;
  }
  if (widget.type === 'TextBanner') {
    return editorStore.isTextSidebarOpen;
  }
  if (widget.type === 'ActionButton') {
    return editorStore.isButtonSidebarOpen;
  }
  if (widget.type === 'MultipleChoice') {
    return editorStore.isChoiceSidebarOpen;
  }
  if (widget.type === 'RegistrationForm') {
    return editorStore.isFormSidebarOpen;
  }
  if (widget.type === 'ModalOverlay') {
    return editorStore.isModalSidebarOpen;
  }
  if (widget.type === 'GuestEPass') {
    return editorStore.isEPassSidebarOpen;
  }
  if (widget.type === 'TicketField') {
    return editorStore.isTicketSidebarOpen;
  }
  return editorStore.isWidgetSidebarOpen;
}

function handleAdjustWidget(widget: any) {
  if (props.isPreviewModal || props.isMiniPreview) return;
  editorStore.selectWidget(widget.id);
  if (widget.type === 'HeroDrop') {
    editorStore.openMediaSidebar(widget.props?.ratio);
  } else if (widget.type === 'TextBanner') {
    editorStore.openTextSidebar();
  } else if (widget.type === 'ActionButton') {
    editorStore.openButtonSidebar();
  } else if (widget.type === 'MultipleChoice') {
    editorStore.openChoiceSidebar();
  } else if (widget.type === 'RegistrationForm') {
    editorStore.openFormSidebar();
  } else if (widget.type === 'ModalOverlay') {
    editorStore.openModalSidebar();
  } else if (widget.type === 'GuestEPass') {
    editorStore.openEPassSidebar();
  } else if (widget.type === 'TicketField') {
    editorStore.openTicketSidebar();
  } else {
    editorStore.openWidgetSidebar();
  }
}

function handleActionButtonClick(widget: any) {
  if (wasDraggingRecently.value) return;
  if (props.isPreviewModal) {
    handleButtonClick(widget);
    return;
  }
  if (props.isMiniPreview) return;
  handleSelectThisPage();
  editorStore.selectWidget(widget.id);
  handleAdjustWidget(widget);
}

function handleHeroCtaClick(widget: any) {
  if (wasDraggingRecently.value) return;
  if (props.isPreviewModal) {
    handleButtonClick(widget);
    return;
  }
  if (props.isMiniPreview) return;
  handleSelectThisPage();
  editorStore.selectWidget(widget.id);
  editorStore.openButtonSidebar();
}

function getButtonIcon(widget: any) {
  const iconName = widget.props?.iconName || 'arrow-right';
  switch (iconName) {
    case 'grid': return LayoutGrid;
    case 'ticket': return Ticket;
    case 'whatsapp': return Phone;
    case 'instagram': return Instagram;
    case 'arrow-right':
    default: return ArrowRight;
  }
}

/**
 * Moves the guest to the next step. On a published page the step lives in
 * PublicDropView, so it has to be told (with this page's answers); calling the
 * editor's selectPage there did nothing, which left "Next Page" buttons dead
 * on live campaigns.
 */
function goToNextPage(formData?: Record<string, any>) {
  if (props.isLivePage) {
    emit('next-page', formData);
    return;
  }
  const currentIdx = typeof props.pageIndex === 'number' ? props.pageIndex : editorStore.activePageIndex;
  // The Ticket page is the PDF design, not a step: the funnel ends before it.
  const next = editorStore.pages[currentIdx + 1];
  if (next && next.kind !== 'ticket') {
    editorStore.selectPage(currentIdx + 1);
  } else {
    editorStore.isTestFormModalOpen = true;
  }
}

/** The guest's answers on this page, keyed by field label. Empty when the page has no fields. */
function collectPageAnswers(): Record<string, any> {
  const formData: Record<string, any> = {};
  let userEmail = '';
  let userName = '';

  activePage.value.widget_tree.forEach((w) => {
    if (w.type === 'FieldInput') {
      const key = w.props?.label || w.props?.placeholder || w.id;
      formData[key] = w.props?.value || '';
      if (w.props?.inputType === 'email' || /email/i.test(key)) userEmail = w.props?.value;
      if (/name/i.test(key)) userName = w.props?.value;
    } else if (w.type === 'RegistrationForm') {
      const fields = (w.props?.fields || []) as any[];
      fields.forEach((f: any) => {
        const key = f.name || f.label || 'field';
        formData[key] = f.value || '';
        if (f.type === 'email' || /email/i.test(key)) userEmail = f.value;
        if (/name/i.test(key)) userName = f.value;
      });
    } else if (w.type === 'MultipleChoice') {
      const key = w.props?.question || w.id;
      // Store what the guest saw (labels), not internal option ids.
      const selected = (w.props?.selectedValues || []) as string[];
      formData[key] = (w.props?.options || [])
        .filter((opt: any) => selected.includes(opt.id))
        .map((opt: any) => opt.label || opt.id);
    }
  });

  const sessions = selectedSessionsIn(activePage.value.widget_tree);
  if (sessions.length) formData[SESSIONS_ANSWER_KEY] = sessions;

  // Only real answers: placeholders are added once, at submission, so a later
  // page without a name field cannot overwrite the name given earlier.
  if (!formData.email && userEmail) formData.email = userEmail;
  if (!formData.fullName && userName) formData.fullName = userName;
  return formData;
}

function handleButtonClick(widget: any) {
  if (widget.props?.disabled) return;
  const actionType = normalizeCtaAction(widget.props?.actionType) || 'submit';

  if (actionType === 'submit') {
    let allValid = true;
    let firstInvalidWidget: any = null;
    activePage.value.widget_tree.forEach((w) => {
      if (w.type === 'FieldInput') {
        const isValid = validateField(w, true);
        if (!isValid && !firstInvalidWidget) {
          firstInvalidWidget = w;
          allValid = false;
        }
      } else if (w.type === 'RegistrationForm') {
        const fields = (w.props?.fields || []) as any[];
        fields.forEach((f: any) => {
          if (f.required !== false && (!f.value || !f.value.trim())) {
            f.errorMessage = `Please enter your ${(f.name || 'details').toLowerCase()}.`;
            allValid = false;
            if (!firstInvalidWidget) firstInvalidWidget = w;
          }
        });
      } else if (w.type === 'MultipleChoice' && w.props?.required) {
        const selected = (w.props?.selectedValues || []) as string[];
        if (selected.length === 0 && !firstInvalidWidget) {
          firstInvalidWidget = w;
          allValid = false;
        }
      }
    });
    if (!allValid && firstInvalidWidget) {
      scrollToWidget(firstInvalidWidget.id);
      return;
    }
    goToNextPage(props.isLivePage ? collectPageAnswers() : undefined);
  } else if (actionType === 'link' && widget.props?.url) {
    if (widget.props?.openInNewTab) {
      window.open(widget.props.url, '_blank');
    } else {
      window.location.href = widget.props.url;
    }
  } else if (actionType === 'modal') {
    activeTriggeredModal.value = widget.props?.modalProps || {
      variant: 'message-alert',
      title: 'Your Pass Has Been Sent',
      subtitle: 'Please provide a valid email address. We will resend your E-Pass immediately.',
      buttonText: 'Done',
      buttonVariant: 'black'
    };
  } else if (actionType === 'download-pass') {
    downloadPass(widget);
  }
}

/** The pass a download button belongs to: itself, or the Ticket Summary on this page. */
function findPassWidget(trigger: any): any | null {
  if (trigger?.type === 'GuestEPass') return trigger;
  return activePage.value.widget_tree.find((w: any) => w.type === 'GuestEPass')
    || editorStore.pages.flatMap(p => p.widget_tree).find(w => w.type === 'GuestEPass')
    || null;
}

async function downloadPass(trigger: any) {
  const pass = findPassWidget(trigger);
  if (isLivePass.value && livePass!.status !== 'ready') {
    editorStore.showToast(livePass!.status === 'error' ? 'Your pass was not issued yet — tap "Try again" on the pass first.' : 'Your pass is still being issued — one moment.');
    return;
  }

  // The campaign's own Ticket page, when it has one: the PDF is that design.
  const ticketPage = props.isLivePage ? ticketSource?.page : editorStore.pages.find(p => p.kind === 'ticket');
  if (ticketPage) {
    editorStore.showToast('Preparing your ticket PDF…');
    try {
      const context = props.isLivePage && ticketSource
        ? ticketSource.context
        : { passWidget: pass, logoUrl: pass ? getBrandLogo(pass) : '', campaignTitle: editorStore.projectTitle };
      const title = (context.campaignTitle || 'ticket').replace(/[^a-z0-9]+/gi, '-').replace(/(^-|-$)/g, '').toLowerCase() || 'ticket';
      const { renderTicketPdf } = await import('./ticket/ticketPdf.ts');
      await renderTicketPdf({
        page: ticketPage,
        context,
        livePass: isLivePass.value ? livePass : null,
        fileName: `${title}-${isLivePass.value ? livePass!.code : 'sample'}.pdf`,
        isSample: !isLivePass.value
      });
    } catch (err) {
      console.warn('[MobileArtboard] Could not render the ticket PDF:', err);
      editorStore.showToast('Could not create the PDF. Please take a screenshot of your pass instead.');
    }
    return;
  }

  if (!pass) {
    editorStore.showToast('Add a Ticket Summary to this campaign to offer a downloadable pass.');
    return;
  }
  editorStore.showToast('Preparing your e-pass PDF…');
  try {
    const { downloadPassPdf } = await import('./passPdf.ts');
    await downloadPassPdf({
      headline: String(pass.props?.heading || 'SUCCESS.\nYOUR PASS HAS\nBEEN SENT.'),
      guestName: getGuestName(pass),
      venue: getVenue(pass),
      accessId: getAccessId(pass),
      guestType: getGuestType(pass),
      email: getEmail(pass),
      sessions: getValidForSessions(pass),
      logoUrl: getBrandLogo(pass) || undefined,
      campaignTitle: activePage.value.page_settings?.seoTitle || editorStore.projectTitle,
      pageUrl: typeof window !== 'undefined' && props.isLivePage ? window.location.href : undefined,
      showQr: pass.props?.showQrCode !== false,
      isSample: !isLivePass.value
    });
  } catch (err) {
    console.warn('[MobileArtboard] Could not build the pass PDF:', err);
    editorStore.showToast('Could not create the PDF. Please take a screenshot of your pass instead.');
  }
}

function handleLogoError() {
  logoFailed.value = true;
}

function getOverlayStyle(props: any) {
  const alpha = Math.max(0, Math.min(100, props.overlayOpacity ?? 50)) / 100;
  const position = props.textPosition || 'bottom';

  if (position === 'top') {
    return {
      background: `linear-gradient(to bottom, rgba(0, 0, 0, ${alpha}) 0%, rgba(0, 0, 0, ${alpha * 0.4}) 65%, transparent 100%)`
    };
  } else if (position === 'center') {
    return {
      background: `linear-gradient(to bottom, rgba(0, 0, 0, ${alpha * 0.1}) 0%, rgba(0, 0, 0, ${alpha}) 35%, rgba(0, 0, 0, ${alpha}) 65%, rgba(0, 0, 0, ${alpha * 0.1}) 100%)`
    };
  } else {
    // bottom
    return {
      background: `linear-gradient(to top, rgba(0, 0, 0, ${alpha}) 0%, rgba(0, 0, 0, ${alpha * 0.4}) 65%, transparent 100%)`
    };
  }
}

/** background-size equivalent of getMediaFitClass, for Ticket page banners. */
function ticketBannerSize(fit?: string): string {
  if (fit === 'Fit to screen' || fit === 'fit') return 'contain';
  if (fit === 'Center' || fit === 'center') return 'auto';
  return 'cover';
}

function getMediaFitClass(fit?: string) {
  switch (fit) {
    case 'Fit to screen':
    case 'fit':
      return 'object-contain object-center';
    case 'Center':
    case 'center':
      return 'object-none object-center';
    case 'Fill the screen':
    case 'fill':
    default:
      return 'object-cover object-center';
  }
}

function handleHeroImageError(widget: any) {
  if (widget && widget.props) {
    editorStore.updateWidgetProps(widget.id, {
      isSolidSpace: true,
      imageUrl: ''
    });
  }
}

function getRatioClass(ratio?: string) {
  switch (ratio) {
    case 'Dynamic Fit':
      return props.isLivePage
        ? 'min-h-[calc(100dvh-48px)] h-full flex-1 w-full shrink-0'
        : 'h-full min-h-0 flex-1 w-full shrink-0';
    case '4:5':
      return 'aspect-[4/5] w-full shrink-0';
    case '3:4':
      return 'aspect-[3/4] w-full shrink-0';
    case '4:3':
      return 'aspect-[4/3] w-full shrink-0';
    case '16:9':
      return 'aspect-video w-full shrink-0';
    case '9:16':
      return 'aspect-[9/16] w-full shrink-0';
    case '1:1':
      return 'aspect-square w-full shrink-0';
    case 'Buttons':
      return 'min-h-[76px] py-[16px] px-0 w-full shrink-0 flex flex-col justify-center';
    case 'Full screen landing page':
    default:
      return isHeroWithButtonOnly.value
        ? (props.isLivePage ? 'min-h-[calc(100dvh-48px)] h-full flex-1 w-full shrink-0' : (props.isPreviewModal ? 'h-full min-h-0 flex-1 w-full shrink-0' : 'h-[580px] min-h-[580px] w-full shrink-0'))
        : (props.isPreviewModal ? 'h-[580px] min-h-[580px] w-full shrink-0' : 'h-[580px] min-h-[580px] w-full shrink-0');
  }
}

function getWidgetMarginTopClass(index: number) {
  const tree = inFlowWidgets.value;
  const currentWidget = tree[index];

  if (index === 0) {
    // If GuestEPass is the first top widget, place it exactly 8px under the header
    if (currentWidget?.type === 'GuestEPass') {
      return 'mt-[8px]';
    }
    // If text widget, MultipleChoice, FieldInput, or RegistrationForm is the first top widget, apply exclusive 24px top margin for clean breathing room from header
    if (currentWidget?.type === 'TextBanner' || currentWidget?.type === 'MultipleChoice' || currentWidget?.type === 'FieldInput' || currentWidget?.type === 'RegistrationForm') {
      return 'mt-[24px]';
    }
    // If action button is the first top widget, top padding follows applied bottom padding (48px or 16px)
    if (currentWidget?.type === 'ActionButton') {
      if (isHeroWithButtonOnly.value) return 'mt-[16px]';
      if (isLastWidgetButton.value) return 'mt-[48px]';
      return 'mt-[16px]';
    }
    return 'mt-0';
  }
  const prevWidget = tree[index - 1];

  // 1. If hero banner meets another hero banner (Hero meets Hero), 0px spacing between them
  if (currentWidget?.type === 'HeroDrop' && prevWidget?.type === 'HeroDrop') {
    return 'mt-0';
  }

  // 2. If ActionButton meets HeroDrop: top padding exactly follows applied bottom padding (48px when last, 16px in dynamic fit)
  if (currentWidget?.type === 'ActionButton' && prevWidget?.type === 'HeroDrop') {
    if (isHeroWithButtonOnly.value) return 'mt-[16px]';
    if (isLastWidgetButton.value) return 'mt-[48px]';
    return 'mt-[16px]';
  }
  if (currentWidget?.type === 'HeroDrop' && prevWidget?.type === 'ActionButton') {
    return 'mt-0';
  }

  // 3. If text widget is the top widget (index 0) and followed by form input, banner, or any other widget: exclusive 24px bottom spacing
  if (index === 1 && prevWidget?.type === 'TextBanner' && currentWidget?.type !== 'TextBanner') {
    if (currentWidget?.type === 'ActionButton') {
      if (isHeroWithButtonOnly.value) return 'mt-[16px]';
      if (isLastWidgetButton.value) return 'mt-[48px]';
    }
    if (currentWidget?.type === 'FieldInput') {
      return 'mt-[12px]';
    }
    return 'mt-[24px]';
  }

  // 4. If text widget meets another text widget (Text meets Text), 8px spacing matching widget headers
  if (currentWidget?.type === 'TextBanner' && prevWidget?.type === 'TextBanner') {
    return 'mt-[8px]';
  }

  // 5. If text widget is followed by FieldInput, RegistrationForm, MultipleChoice, or Banner anywhere in stack: 24px spacing (or 12px for FieldInput with floating label)
  if (prevWidget?.type === 'TextBanner' && (currentWidget?.type === 'FieldInput' || currentWidget?.type === 'RegistrationForm' || currentWidget?.type === 'MultipleChoice' || currentWidget?.type === 'HeroDrop')) {
    if (currentWidget?.type === 'FieldInput') {
      return 'mt-[12px]';
    }
    return 'mt-[24px]';
  }

  // If ActionButton follows TextBanner
  if (currentWidget?.type === 'ActionButton' && prevWidget?.type === 'TextBanner') {
    if (isHeroWithButtonOnly.value) return 'mt-[16px]';
    if (isLastWidgetButton.value) return 'mt-[48px]';
    return 'mt-[24px]';
  }

  // 6. If FieldInput meets another FieldInput, 12px spacing between them
  if (currentWidget?.type === 'FieldInput' && prevWidget?.type === 'FieldInput') {
    return 'mt-[12px]';
  }

  // 6b. If MultipleChoice or RegistrationForm meets FieldInput, MultipleChoice, or RegistrationForm: 12px spacing
  if ((currentWidget?.type === 'MultipleChoice' || currentWidget?.type === 'RegistrationForm') && 
      (prevWidget?.type === 'FieldInput' || prevWidget?.type === 'MultipleChoice' || prevWidget?.type === 'RegistrationForm')) {
    return 'mt-[12px]';
  }

  // 7. If ActionButton meets another ActionButton, 8px spacing between them
  if (currentWidget?.type === 'ActionButton' && prevWidget?.type === 'ActionButton') {
    return 'mt-[8px]';
  }

  // 8. If ActionButton follows any other widget (FieldInput, MultipleChoice, etc.), top padding follows applied bottom padding
  if (currentWidget?.type === 'ActionButton') {
    if (isHeroWithButtonOnly.value) return 'mt-[16px]';
    if (isLastWidgetButton.value) return 'mt-[48px]';
    return 'mt-[16px]';
  }

  // 9. Default spacing between different widget types
  return 'mt-[16px]';
}

function handleMultipleChoiceContainerClick(widget: any) {
  if (props.isMiniPreview) return;
  handleSelectThisPage();
  editorStore.selectWidget(widget.id);
  handleAdjustWidget(widget);
}

function isChoiceSelected(widget: any, optId: string): boolean {
  const selected = (widget.props?.selectedValues || []) as string[];
  return selected.includes(optId);
}

function toggleChoiceOption(widget: any, optId: string) {
  if (wasDraggingRecently.value) return;
  if (props.isMiniPreview) return;
  handleSelectThisPage();
  editorStore.selectWidget(widget.id);

  // The canvas is for layout: picking an option there only selects the block.
  // Pre-selected options are set in the Choice setup; guests pick in Preview.
  if (isDesignCanvas.value) {
    handleAdjustWidget(widget);
    return;
  }

  const opt = (widget.props?.options || []).find((o: any) => o.id === optId);
  if (opt && isChoiceOptionDisabled(widget, opt)) {
    return;
  }

  const allowMultiple = widget.props?.allowMultiple ?? true;
  let selected = [...((widget.props?.selectedValues || []) as string[])];

  if (selected.includes(optId)) {
    selected = selected.filter(id => id !== optId);
  } else {
    if (allowMultiple) {
      selected.push(optId);
    } else {
      selected = [optId];
    }
  }

  editorStore.updateWidgetProps(widget.id, { selectedValues: selected });
}

function getAutomaticOptionLabel(v: string, index: number): string {
  if (v === 'detailed-card') return `Pass Option ${index + 1}`;
  if (v === 'simple-row') {
    const sizes = ['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];
    return sizes[index] || `Option ${index + 1}`;
  }
  if (v === 'horizontal-block') {
    const sessions = ['Morning', 'Afternoon', 'Evening', 'Night', 'Session 5', 'Session 6'];
    return sessions[index] || `Session ${index + 1}`;
  }
  if (v === 'image-grid') return `Model ${String(index + 1).padStart(2, '0')}`;
  return `Option ${index + 1}`;
}

function handleChoiceAddMore(widget: any) {
  if (props.isMiniPreview) return;
  handleSelectThisPage();
  editorStore.selectWidget(widget.id);

  const currentOptions = [...(widget.props?.options || [])];
  const nextIdx = currentOptions.length;
  const variant = widget.props?.variant || 'detailed-card';
  const autoLabel = getAutomaticOptionLabel(variant, nextIdx);

  let newOption: any = {
    id: `opt_${Date.now()}`,
    label: autoLabel
  };

  if (variant === 'detailed-card') {
    const defaultDay = String(Math.min(24 + nextIdx, 31)).padStart(2, '0');
    newOption = {
      id: `opt_${Date.now()}`,
      label: autoLabel,
      sublabel: `${defaultDay} Oct 2026`,
      description: 'Access to activation area and special event lounge'
    };
  } else if (variant === 'image-grid') {
    const defaultImages = [
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=300&q=80',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=300&q=80',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=300&q=80'
    ];
    newOption = {
      id: `opt_${Date.now()}`,
      label: autoLabel,
      imageUrl: defaultImages[nextIdx % defaultImages.length]
    };
  }

  currentOptions.push(newOption);
  editorStore.updateWidgetProps(widget.id, { options: currentOptions });
}

const inputFieldRefs = new Map<string, HTMLInputElement>();

function registerInputField(id: string, el: any) {
  if (el) {
    inputFieldRefs.set(id, el as HTMLInputElement);
  } else {
    inputFieldRefs.delete(id);
  }
}

const focusedFieldId = ref<string | null>(null);
const shakingFieldIds = ref<Set<string>>(new Set());

function triggerFieldShake(widgetId: string) {
  shakingFieldIds.value.add(widgetId);
  setTimeout(() => {
    shakingFieldIds.value.delete(widgetId);
  }, 500);
}

// Watch for error states to trigger the tactile jitter/shake animation
watch(
  () => activePage.value.widget_tree.map(w => `${w.id}_${w.props?.stateVariant}_${w.props?.showError}`),
  (newVals, oldVals) => {
    if (!oldVals) return;
    newVals.forEach((val, idx) => {
      const oldVal = oldVals[idx];
      if (val !== oldVal) {
        const widget = activePage.value.widget_tree[idx];
        if (widget && widget.type === 'FieldInput') {
          if (widget.props?.stateVariant === 'Wrong alert' || widget.props?.stateVariant === 'Wrong' || widget.props?.showError) {
            triggerFieldShake(widget.id);
          }
        }
      }
    });
  }
);

function handleFieldContainerClick(widget: any) {
  handleSelectThisPage();
  editorStore.selectWidget(widget.id);
  handleAdjustWidget(widget);
  if (!props.isMiniPreview) {
    const inputEl = inputFieldRefs.get(widget.id);
    if (inputEl && inputEl !== document.activeElement) {
      inputEl.focus();
    }
  }
}

function isPhoneField(widget: any): boolean {
  if (!widget || widget.type !== 'FieldInput') return false;
  const label = (widget.props?.label || '').toLowerCase();
  return widget.props?.inputType === 'tel' || label.includes('whatsapp') || label.includes('wa') || label.includes('phone') || !!widget.props?.countryCode;
}

const countryCodes = ['+62', '+65', '+60', '+1', '+44', '+61', '+81', '+971'];
function toggleCountryCode(widget: any) {
  const current = widget.props.countryCode || '+62';
  const idx = countryCodes.indexOf(current);
  widget.props.countryCode = countryCodes[(idx + 1) % countryCodes.length];
}

const modalCountryCode = ref('+62');
function toggleModalCountryCode() {
  if (wasDraggingRecently.value) return;
  const idx = countryCodes.indexOf(modalCountryCode.value);
  modalCountryCode.value = countryCodes[(idx + 1) % countryCodes.length];
}

function validateField(widget: any, triggerShake = true): boolean {
  if (widget.type !== 'FieldInput') return true;
  const label = (widget.props.label || '').toLowerCase();
  const isEmail = widget.props.inputType === 'email' || label.includes('email');
  const isWa = isPhoneField(widget);
  const val = (widget.props.value || '').trim();

  // 1. Required Check
  if (widget.props.required && !val) {
    widget.props.showError = true;
    widget.props.stateVariant = 'Wrong';
    widget.props.errorMessage = `${widget.props.label || 'This field'} is required.`;
    if (triggerShake) triggerFieldShake(widget.id);
    return false;
  }

  // 2. Email Mandatory @domain Validation
  if (isEmail && val) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(val)) {
      widget.props.showError = true;
      widget.props.stateVariant = 'Wrong';
      widget.props.errorMessage = 'Please enter a valid email address with @domain (e.g. name@domain.com).';
      if (triggerShake) triggerFieldShake(widget.id);
      return false;
    }
  }

  // 3. WhatsApp / Phone Validation (8-15 digits)
  if (isWa && val) {
    const digits = val.replace(/\D/g, '');
    if (digits.length < 8 || digits.length > 15) {
      widget.props.showError = true;
      widget.props.stateVariant = 'Wrong';
      widget.props.errorMessage = 'Please enter a valid WhatsApp number (min 8 digits).';
      if (triggerShake) triggerFieldShake(widget.id);
      return false;
    }
  }

  // 4. Clear errors when input is valid
  if (val) {
    widget.props.showError = false;
    if (widget.props.stateVariant === 'Wrong' || widget.props.stateVariant === 'Wrong alert') {
      widget.props.stateVariant = 'Input';
    }
  } else {
    widget.props.showError = false;
    widget.props.stateVariant = 'Default';
  }
  return true;
}

function handleFieldFocus(widget: any) {
  focusedFieldId.value = widget.id;
  widget.props.isFocused = true;
}

function handleFieldBlur(widget: any) {
  if (focusedFieldId.value === widget.id) {
    focusedFieldId.value = null;
  }
  widget.props.isFocused = false;

  // Validate on blur if user entered value or if required field
  if (widget.props.value || widget.props.required) {
    validateField(widget, true);
  }
}

function isFieldUnderlineActive(widget: any): boolean {
  if (shakingFieldIds.value.has(widget.id)) return true;
  if (focusedFieldId.value === widget.id || !!widget.props.isFocused) return true;
  return false;
}

function isFieldErrorMessageVisible(widget: any): boolean {
  if (!isFieldError(widget)) return false;
  // Error message helper text and alert icon are shown only during on-going input / focus or during error trigger shake
  return focusedFieldId.value === widget.id || !!widget.props.isFocused || shakingFieldIds.value.has(widget.id);
}

function isFieldLabelFloating(widget: any): boolean {
  if (focusedFieldId.value === widget.id || !!widget.props.isFocused) return true;
  if (widget.props.value && String(widget.props.value).trim().length > 0) return true;
  return !!widget.props.alwaysShowLabel;
}

function isFieldError(widget: any): boolean {
  return widget.props.stateVariant === 'Wrong alert' || widget.props.stateVariant === 'Wrong' || !!widget.props.showError;
}

function toggleFieldVariant(widget: any) {
  const variants = ['Default', 'Input', 'Wrong alert', 'Wrong'];
  const currentIndex = variants.indexOf(widget.props.stateVariant || 'Default');
  const nextVariant = variants[(currentIndex + 1) % variants.length];
  widget.props.stateVariant = nextVariant;
  const isWa = isPhoneField(widget);
  
  if (nextVariant === 'Default') {
    widget.props.value = '';
    widget.props.showError = false;
  } else if (nextVariant === 'Input') {
    if (isWa) {
      widget.props.value = '81234567890';
    } else {
      if (!widget.props.value || !widget.props.value.includes('@')) widget.props.value = 'lioviani@gmail.com';
    }
    widget.props.showError = false;
  } else if (nextVariant === 'Wrong alert') {
    if (isWa) {
      widget.props.value = '812';
      widget.props.errorMessage = 'Please enter a valid WhatsApp number (min 8 digits).';
    } else {
      widget.props.value = 'lioviani@gmail';
      widget.props.errorMessage = 'Please enter a valid email address with @domain (e.g. name@domain.com).';
    }
    widget.props.showError = true;
    triggerFieldShake(widget.id);
  } else if (nextVariant === 'Wrong') {
    if (isWa) {
      widget.props.value = '812';
      widget.props.errorMessage = 'Please enter a valid WhatsApp number (min 8 digits).';
    } else {
      widget.props.value = 'lioviani@gmail';
      widget.props.errorMessage = 'Please enter a valid email address with @domain (e.g. name@domain.com).';
    }
    widget.props.showError = true;
    triggerFieldShake(widget.id);
  }
}

function handleFieldInputChange(e: Event, widget: any) {
  const target = e.target as HTMLInputElement;
  let val = target.value;
  const isWa = isPhoneField(widget);

  if (isWa) {
    // Only allow digits, and automatically strip any leading zeros (e.g. 0812 -> 812)
    val = val.replace(/\D/g, '').replace(/^0+/, '');
    target.value = val;
  }

  widget.props.value = val;
  const trimmedVal = val.trim();
  const label = (widget.props.label || '').toLowerCase();
  const isEmail = widget.props.inputType === 'email' || label.includes('email');

  if (widget.props.showError || widget.props.stateVariant === 'Wrong alert' || widget.props.stateVariant === 'Wrong') {
    if (isEmail) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailPattern.test(trimmedVal)) {
        widget.props.showError = false;
        widget.props.stateVariant = 'Input';
      } else {
        widget.props.stateVariant = 'Wrong';
      }
    } else if (isWa) {
      if (trimmedVal.length >= 8) {
        widget.props.showError = false;
        widget.props.stateVariant = 'Input';
      } else {
        widget.props.stateVariant = 'Wrong';
      }
    } else if (trimmedVal) {
      widget.props.showError = false;
      widget.props.stateVariant = 'Input';
    }
  } else {
    if (trimmedVal && widget.props.stateVariant === 'Default') {
      widget.props.stateVariant = 'Input';
    } else if (!trimmedVal && widget.props.stateVariant === 'Input') {
      widget.props.stateVariant = 'Default';
    }
  }
}

// --- RegistrationForm Section Field Helpers ---
const focusedFormItemKey = ref<string | null>(null);

function handleRegistrationFormContainerClick(widget: any) {
  handleSelectThisPage();
  editorStore.selectWidget(widget.id);
  handleAdjustWidget(widget);
}

function focusRegistrationFormField(widgetId: string, fieldId: string) {
  if (props.isMiniPreview) return;
  const inputEl = inputFieldRefs.get(`${widgetId}_${fieldId}`);
  if (inputEl && inputEl !== document.activeElement) {
    inputEl.focus();
  }
}

function isFormItemFloating(widgetId: string, field: any): boolean {
  if (focusedFormItemKey.value === `${widgetId}_${field.id}`) return true;
  if (field.value && String(field.value).trim().length > 0) return true;
  return false;
}

function isFormItemUnderlineActive(widgetId: string, field: any): boolean {
  if (shakingFieldIds.value.has(`${widgetId}_${field.id}`)) return true;
  if (focusedFormItemKey.value === `${widgetId}_${field.id}`) return true;
  return false;
}

function isPhoneItem(field: any): boolean {
  if (!field) return false;
  const name = (field.name || '').toLowerCase();
  return field.type === 'tel' || name.includes('whatsapp') || name.includes('wa') || name.includes('phone') || !!field.countryCode;
}

function toggleFormItemCountryCode(widget: any, field: any) {
  const current = field.countryCode || '+62';
  const idx = countryCodes.indexOf(current);
  field.countryCode = countryCodes[(idx + 1) % countryCodes.length];
  editorStore.updateWidgetProps(widget.id, { fields: [...widget.props.fields] });
}

function handleRegistrationFormFieldFocus(widgetId: string, fieldId: string) {
  focusedFormItemKey.value = `${widgetId}_${fieldId}`;
}

function handleRegistrationFormFieldBlur(widgetId: string, fieldId: string) {
  if (focusedFormItemKey.value === `${widgetId}_${fieldId}`) {
    focusedFormItemKey.value = null;
  }
}

function handleRegistrationFormItemInput(e: Event, widget: any, field: any) {
  const target = e.target as HTMLInputElement;
  let val = target.value;
  const isWa = isPhoneItem(field);
  if (isWa) {
    val = val.replace(/\D/g, '').replace(/^0+/, '');
    target.value = val;
  }
  field.value = val;

  // Validate on the fly
  const name = (field.name || '').toLowerCase();
  const isEmail = field.type === 'email' || name.includes('email');
  const trimmed = val.trim();

  if (field.required !== false && !trimmed) {
    field.errorMessage = `${field.name || 'This field'} is required.`;
  } else if (isEmail && trimmed) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmed)) {
      field.errorMessage = 'Please enter a valid email address with @domain (e.g. name@domain.com).';
    } else {
      field.errorMessage = '';
    }
  } else if (isWa && trimmed) {
    const digits = trimmed.replace(/\D/g, '');
    if (digits.length < 8 || digits.length > 15) {
      field.errorMessage = 'Please enter a valid WhatsApp number (min 8 digits).';
    } else {
      field.errorMessage = '';
    }
  } else {
    field.errorMessage = '';
  }

  editorStore.updateWidgetProps(widget.id, { fields: [...widget.props.fields] });
}

const inFlowWidgets = computed(() => {
  return activePage.value.widget_tree.filter(w => w.type !== 'ModalOverlay' && !(w.type === 'ActionButton' && w.props?.positionMode === 'sticky-bottom'));
});

// Pop Up Modal State & Interactions (Figma Node 276:4722)
const activeTriggeredModal = ref<any>(null);
const modalInputValue = ref('');

const isModalOverlayVisible = computed(() => {
  if (activeTriggeredModal.value) return true;
  if (!props.isMiniPreview && props.isSelected && editorStore.isModalSidebarOpen) {
    return true;
  }
  return false;
});

const modalDisplayProps = computed(() => {
  if (activeTriggeredModal.value) {
    return activeTriggeredModal.value;
  }
  const selected = editorStore.selectedWidget;
  if (selected?.props?.modalProps) {
    return selected.props.modalProps;
  }
  if (selected?.type === 'ModalOverlay') {
    return selected.props;
  }
  const btnWithModal = activePage.value.widget_tree.find(w => (w.type === 'ActionButton' || w.type === 'HeroDrop') && (w.props?.actionType === 'modal' || w.props?.modalProps));
  if (btnWithModal?.props?.modalProps) {
    return btnWithModal.props.modalProps;
  }
  return {
    variant: 'message-alert',
    title: 'Your Pass Has Been Sent',
    subtitle: 'Please provide a valid email address. We will resend your E-Pass immediately.',
    buttonText: 'Done',
    buttonVariant: 'black',
    dismissible: true
  };
});

function isModalOptionSelected(opt: any): boolean {
  return !!opt.selected;
}

function isModalSlotSelected(slot: any): boolean {
  return !!slot.selected;
}

function getModalOptionSlotsBadge(opt: any): string | null {
  if (!modalDisplayProps.value.showSlotsCapacity) return null;
  const rawSlots = opt.slotsCapacity !== undefined && opt.slotsCapacity !== ''
    ? opt.slotsCapacity
    : modalDisplayProps.value.globalSlotsCapacity ?? 25;
  const num = parseInt(String(rawSlots), 10);
  if (isNaN(num)) return `${rawSlots} Slots Available`;
  return `${num} Slots Available`;
}

function handleModalAddOption() {
  if (wasDraggingRecently.value) return;
  const mProps = modalDisplayProps.value;
  if (!mProps.options) mProps.options = [];
  const current = mProps.options;
  const newIdx = current.length + 1;
  const isDetailed = mProps.variant === 'choice-detailed';
  current.push({
    id: `opt_${Date.now()}`,
    label: isDetailed ? `Pass Option ${newIdx}` : `Option ${newIdx}`,
    sublabel: isDetailed ? `${String(newIdx + 23).padStart(2, '0')} Oct 2026` : undefined,
    description: isDetailed ? 'Access to activation area and special event lounge' : undefined,
    selected: false
  });
  
  // Persist update back to editor store if applicable
  const selected = editorStore.selectedWidget;
  if (selected) {
    if (selected.props?.modalProps) {
      editorStore.updateWidgetProps(selected.id, {
        modalProps: { ...selected.props.modalProps, options: current }
      });
    } else if (selected.type === 'ModalOverlay') {
      editorStore.updateWidgetProps(selected.id, { options: current });
    }
  }
}

function toggleModalOption(optIdOrIdx: any) {
  if (wasDraggingRecently.value || isDesignCanvas.value) return;
  const mProps = modalDisplayProps.value;
  if (!mProps.options) return;
  const isMulti = mProps.allowMultiple ?? (mProps.variant === 'choice-detailed');
  
  if (isMulti) {
    mProps.options.forEach((o: any, idx: number) => {
      if (o.id === optIdOrIdx || idx === optIdOrIdx) {
        o.selected = !o.selected;
      }
    });
  } else {
    mProps.options.forEach((o: any, idx: number) => {
      if (o.id === optIdOrIdx || idx === optIdOrIdx) {
        o.selected = !o.selected;
      } else {
        o.selected = false;
      }
    });
  }
}

function toggleModalSlot(slotIdOrIdx: any) {
  if (wasDraggingRecently.value || isDesignCanvas.value) return;
  const mProps = modalDisplayProps.value;
  if (!mProps.imageSlots) return;
  mProps.imageSlots.forEach((s: any, idx: number) => {
    if (s.id === slotIdOrIdx || idx === slotIdOrIdx) {
      s.selected = !s.selected;
    } else {
      s.selected = false;
    }
  });
}

function handleBackdropClick() {
  if (modalDisplayProps.value.dismissible ?? true) {
    if (activeTriggeredModal.value) {
      activeTriggeredModal.value = null;
    } else if (editorStore.isModalSidebarOpen) {
      editorStore.closeModalSidebar();
    }
  }
}

const isModalButtonInactive = computed(() => {
  const mProps = modalDisplayProps.value;
  if (!mProps) return false;

  // 1. If variant is message-field (Email / WhatsApp / Text)
  if (mProps.variant === 'message-field') {
    const val = (modalInputValue.value || '').trim();
    if (!val) return true;
    if (mProps.fieldType === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) return true;
    }
    return false;
  }

  // 2. If variant is choice-detailed or choice-simple
  if (mProps.variant === 'choice-detailed' || mProps.variant === 'choice-simple') {
    const opts = (mProps.options || []) as any[];
    const hasSelected = opts.some((o: any) => o.selected);
    if (!hasSelected) return true;
    return false;
  }

  // 3. If variant is image-matrix
  if (mProps.variant === 'image-matrix') {
    const slots = (mProps.imageSlots || []) as any[];
    const hasSelected = slots.some((s: any) => s.selected);
    if (!hasSelected) return true;
    return false;
  }

  return false;
});

const isPageRequiredFieldsComplete = computed(() => {
  for (const w of activePage.value.widget_tree) {
    if (w.type === 'FieldInput') {
      const isReq = w.props?.required ?? w.props?.isRequired ?? false;
      if (isReq) {
        const val = (w.props?.value || '').trim();
        if (!val) return false;
        if (w.props?.inputType === 'email' || (w.props?.label || '').toLowerCase().includes('email')) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(val)) return false;
        }
      }
    } else if (w.type === 'RegistrationForm') {
      const fields = (w.props?.fields || []) as any[];
      for (const f of fields) {
        if (f.required !== false) {
          const val = (f.value || '').trim();
          if (!val) return false;
          if (f.type === 'email' || (f.name || '').toLowerCase().includes('email')) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(val)) return false;
          }
        }
      }
    } else if (w.type === 'MultipleChoice') {
      const isReq = w.props?.required !== false;
      if (isReq) {
        const selectedValues = (w.props?.selectedValues || []) as string[];
        const options = (w.props?.options || []) as any[];
        const hasSelected = selectedValues.length > 0 || options.some((o: any) => o.selected);
        if (!hasSelected) return false;
      }
    }
  }
  return true;
});

function isButtonInactive(widget: any): boolean {
  if (!widget) return false;
  if (widget.props?.disabled) return true;
  if (!isPageRequiredFieldsComplete.value) {
    return true;
  }
  return false;
}

function handleModalDoneClick() {
  if (wasDraggingRecently.value || isModalButtonInactive.value) return;
  const mProps = modalDisplayProps.value;

  // 1. Persist modal input value if filled
  if (modalInputValue.value) {
    const val = modalInputValue.value.trim();
    if (val) {
      const selected = editorStore.selectedWidget;
      if (selected && selected.props?.modalProps) {
        editorStore.updateWidgetProps(selected.id, {
          modalProps: { ...selected.props.modalProps, fieldValue: val }
        });
      }
    }
  }

  // 2. Persist choice selections if applicable
  if (mProps.options && mProps.options.length > 0) {
    const selected = editorStore.selectedWidget;
    if (selected && selected.props?.modalProps) {
      editorStore.updateWidgetProps(selected.id, {
        modalProps: { ...selected.props.modalProps, options: [...mProps.options] }
      });
    }
  }

  // 3. Persist image matrix slots if applicable
  if (mProps.imageSlots && mProps.imageSlots.length > 0) {
    const selected = editorStore.selectedWidget;
    if (selected && selected.props?.modalProps) {
      editorStore.updateWidgetProps(selected.id, {
        modalProps: { ...selected.props.modalProps, imageSlots: [...mProps.imageSlots] }
      });
    }
  }

  const btnAction = mProps.buttonAction || 'submit-close';
  const btnUrl = mProps.buttonUrl;
  const openInNewTab = mProps.buttonOpenInNewTab ?? true;

  // Close the modal bottom sheet
  if (activeTriggeredModal.value) {
    activeTriggeredModal.value = null;
  } else if (editorStore.isModalSidebarOpen) {
    editorStore.closeModalSidebar();
  }

  // 4. Handle navigation or external URL
  if (btnAction === 'next_page') {
    goToNextPage(props.isLivePage ? collectPageAnswers() : undefined);
  } else if (btnAction === 'link' && btnUrl) {
    if (openInNewTab) {
      window.open(btnUrl, '_blank');
    } else {
      window.location.href = btnUrl;
    }
  }
}

const isHeroWithButtonOnly = computed(() => {
  const tree = inFlowWidgets.value;
  if (tree.length === 0) return false;
  
  // 1. Solo HeroDrop with 'Full screen landing page' or 'Dynamic Fit' (or default ratio)
  if (tree.length === 1 && tree[0].type === 'HeroDrop' && (tree[0].props.ratio === 'Full screen landing page' || tree[0].props.ratio === 'Dynamic Fit' || !tree[0].props.ratio)) {
    return true;
  }
  
  // 2. HeroDrop with 'Full screen landing page' followed ONLY by ActionButton(s) in-flow
  if (
    tree[0].type === 'HeroDrop' && 
    (tree[0].props.ratio === 'Full screen landing page' || !tree[0].props.ratio) &&
    tree.length > 1 &&
    tree.slice(1).every(w => w.type === 'ActionButton')
  ) {
    return true;
  }

  // 3. 'Dynamic Fit' preset: HeroDrop + optional 1 TextBanner + optional 1 ActionButton
  if (
    tree[0].type === 'HeroDrop' &&
    tree[0].props.ratio === 'Dynamic Fit' &&
    tree.length <= 3 &&
    tree.slice(1).every(w => w.type === 'TextBanner' || w.type === 'ActionButton')
  ) {
    return true;
  }
  
  return false;
});

const isSingleFullScreenHero = computed(() => {
  return isHeroWithButtonOnly.value;
});

const isLastWidgetHero = computed(() => {
  const tree = inFlowWidgets.value;
  if (tree.length === 0) return false;
  return tree[tree.length - 1]?.type === 'HeroDrop';
});

const isLastWidgetText = computed(() => {
  const tree = inFlowWidgets.value;
  if (tree.length === 0) return false;
  return tree[tree.length - 1]?.type === 'TextBanner';
});

const isLastWidgetButton = computed(() => {
  const tree = inFlowWidgets.value;
  if (tree.length === 0) return false;
  const last = tree[tree.length - 1];
  return last?.type === 'ActionButton' && (last.props?.positionMode === 'in-flow' || !last.props?.positionMode);
});

function handleRemoveStickyButton(widget: any) {
  if (!widget) return;
  if (widget.type === 'HeroDrop') {
    editorStore.updateWidgetProps(widget.id, {
      isCtaEnabled: false,
      showButton: false,
      positionMode: 'in-flow',
      ctaPositionMode: 'in-flow'
    });
  } else if (widget.type === 'GuestEPass') {
    editorStore.updateWidgetProps(widget.id, {
      isCtaEnabled: false,
      showButton: false,
      showStickyButton: false
    });
  } else {
    editorStore.removeWidget(widget.id);
  }
}

const stickyButtonForThisPage = computed(() => {
  // 1. Check if active page has a HeroDrop with sticky CTA (part of Hero banner)
  const heroWithStickyCta = activePage.value.widget_tree.find(w => 
    w.type === 'HeroDrop' && 
    (w.props?.isCtaEnabled ?? (!!w.props?.buttonText || !!w.props?.ctaLabel || !!w.props?.showButton)) && 
    (w.props?.buttonText || w.props?.ctaLabel || w.props?.showButton) &&
    (w.props?.ctaPositionMode === 'sticky-bottom' || w.props?.positionMode === 'sticky-bottom')
  );
  if (heroWithStickyCta) return heroWithStickyCta;

  // 1b. Check if active page has a GuestEPass with sticky CTA (part of E-Pass setup)
  const epassWithStickyCta = activePage.value.widget_tree.find(w => 
    w.type === 'GuestEPass' && 
    (w.props?.isCtaEnabled ?? (!!w.props?.buttonText || !!w.props?.ctaLabel || !!w.props?.showButton || !!w.props?.showStickyButton)) && 
    (w.props?.buttonText || w.props?.ctaLabel || w.props?.showButton || w.props?.showStickyButton)
  );
  if (epassWithStickyCta) return epassWithStickyCta;

  // 2. Check if active page has an independent ActionButton with sticky-bottom
  const localBtn = activePage.value.widget_tree.find(w => w.type === 'ActionButton' && w.props?.positionMode === 'sticky-bottom');
  if (localBtn) return localBtn;

  // 3. Check other pages for global/shared ActionButton sticky (scope === 'all' or custom)
  for (const p of editorStore.pages) {
    if (p.id === activePage.value.id) continue;
    const btn = p.widget_tree.find(w => w.type === 'ActionButton' && w.props?.positionMode === 'sticky-bottom');
    if (btn) {
      const scope = btn.props?.stickyScope || 'current';
      if (scope === 'all') return btn;
      if (scope === 'custom' && (btn.props?.stickyPageIds || []).includes(activePage.value.id)) return btn;
    }
  }
  return null;
});

const isStickyButtonOnDarkBackground = computed(() => {
  if (!stickyButtonForThisPage.value) return false;

  // 1. If sticky button is defined on a HeroDrop widget directly:
  if (stickyButtonForThisPage.value.type === 'HeroDrop') {
    const hero = stickyButtonForThisPage.value;
    return !!hero.props?.imageUrl && !hero.props?.isSolidSpace;
  }

  // 2. If it's an ActionButton, check if it sits directly over a Hero banner at the bottom of the page
  const tree = inFlowWidgets.value;
  const bottomHero = tree.length > 0 && tree[tree.length - 1]?.type === 'HeroDrop' ? tree[tree.length - 1] : null;
  if (bottomHero) {
    return !!bottomHero.props?.imageUrl && !bottomHero.props?.isSolidSpace;
  }

  // 3. Fallback to ActionButton variant
  return stickyButtonForThisPage.value.props?.variant === 'white';
});

const containerBottomPaddingClass = computed(() => {
  const tree = inFlowWidgets.value;
  if (tree.length === 0) return 'pb-0';
  if (isLastWidgetHero.value) return 'pb-0';
  if (stickyButtonForThisPage.value) return 'pb-[72px]';
  if (isHeroWithButtonOnly.value) return 'pb-[16px]';
  if (isLastWidgetButton.value) return 'pb-0';
  if (isLastWidgetText.value) return 'pb-0';
  return 'pb-[16px]';
});

function handleDragEnter() {
  handleSelectThisPage();
  isDragOver.value = true;
  editorStore.isDraggingOverCanvas = true;
}

function handleDragOver(e: DragEvent, index?: number) {
  e.preventDefault();
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'copy';
  }
  isDragOver.value = true;
  dropTargetIndex.value = typeof index === 'number' ? index : null;
}

function handleDragLeave(e: DragEvent) {
  const relatedTarget = e.relatedTarget as HTMLElement;
  const currentTarget = e.currentTarget as HTMLElement;
  if (!currentTarget || !currentTarget.contains(relatedTarget)) {
    isDragOver.value = false;
    dropTargetIndex.value = null;
    editorStore.isDraggingOverCanvas = false;
  }
}

function handleDrop(e: DragEvent, targetIndex?: number) {
  e.preventDefault();
  handleSelectThisPage();
  isDragOver.value = false;
  dropTargetIndex.value = null;
  editorStore.isDraggingOverCanvas = false;

  // Check if physical image file dropped from OS desktop/finder
  const files = e.dataTransfer?.files;
  if (files && files.length > 0 && files[0].type.startsWith('image/')) {
    const file = files[0];
    const reader = new FileReader();
    reader.onload = async (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      if (dataUrl) {
        // If dropped directly onto an existing HeroDrop, replace its image
        const isDroppedOnExistingHero = typeof targetIndex === 'number' && activePage.value.widget_tree[targetIndex]?.type === 'HeroDrop';
        let targetId: string;

        if (isDroppedOnExistingHero) {
          const existingHero = activePage.value.widget_tree[targetIndex!];
          editorStore.updateWidgetProps(existingHero.id, {
            imageUrl: dataUrl,
            isSolidSpace: false
          });
          editorStore.selectWidget(existingHero.id);
          targetId = existingHero.id;
        } else {
          // Otherwise, insert a NEW HeroDrop widget at the drop location!
          const newWidget = editorStore.addWidget('HeroDrop', typeof targetIndex === 'number' ? targetIndex : undefined, {
            imageUrl: dataUrl,
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
          targetId = newWidget.id;
          editorStore.selectWidget(newWidget.id);
        }

        // Upload to server directly in background and replace with persistent URL
        try {
          const savedMedia = await uploadMediaDirectly({
            dataUrl,
            title: file.name.replace(/\.[^/.]+$/, ''),
            category: 'Photos',
            filename: file.name
          });

          if (savedMedia?.url && targetId) {
            editorStore.updateWidgetProps(targetId, {
              imageUrl: savedMedia.url,
              isSolidSpace: false
            });
          }
        } catch (err) {
          console.warn('Server upload background failed, retaining local preview:', err);
        }
      }
    };
    reader.readAsDataURL(file);
    return;
  }

  let dragData = editorStore.draggedWidget;
  if (!dragData && e.dataTransfer) {
    try {
      const raw = e.dataTransfer.getData('application/json');
      if (raw) {
        dragData = JSON.parse(raw);
      }
    } catch {
      const rawType = e.dataTransfer.getData('text/plain');
      if (rawType) {
        dragData = { type: rawType as any };
      }
    }
  }

  if (dragData) {
    const insertIdx = typeof targetIndex === 'number' ? targetIndex : undefined;

    if (dragData.type === 'HeroDrop') {
      const check = editorStore.canAddWidget('HeroDrop');
      if (!check.allowed) {
        if (check.reason) editorStore.showToast(check.reason);
        return;
      }
      // Always insert new hero banner widget at the drop location
      const newWidget = editorStore.addWidget('HeroDrop', insertIdx, {
        ratio: 'Dynamic Fit',
        isSolidSpace: !dragData.customProps?.imageUrl,
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
        brandLogoUrl: '',
        ...(dragData.customProps || {})
      });
      if (newWidget) {
        editorStore.selectWidget(newWidget.id);
        if (!editorStore.isWidgetSidebarOpen) {
          editorStore.openMediaSidebar(newWidget.props.ratio);
        }
      }
    } else {
      const check = editorStore.canAddWidget(dragData.type);
      if (!check.allowed) {
        if (check.reason) editorStore.showToast(check.reason);
        return;
      }
      editorStore.addWidget(dragData.type, insertIdx, dragData.customProps);
    }
  }
}

const isDragOverLogoSlot = ref<string | null>(null);

function handleOpenLogoPicker(widgetId: string) {
  editorStore.selectWidget(widgetId);
  editorStore.updateWidgetProps(widgetId, { isBrandLogoEnabled: true });
  editorStore.openMediaSidebar();
}

function handleLogoDropOnBanner(e: DragEvent, widgetId: string) {
  isDragOverLogoSlot.value = null;
  // Check if image from Media Gallery or JSON payload
  const jsonStr = e.dataTransfer?.getData('application/json');
  if (jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      if (data?.customProps?.imageUrl) {
        editorStore.updateWidgetProps(widgetId, {
          brandLogoUrl: data.customProps.imageUrl,
          isBrandLogoEnabled: true
        });
        editorStore.selectWidget(widgetId);
        return;
      }
    } catch (_) {}
  }

  // Check if physical file dropped
  const files = e.dataTransfer?.files;
  if (files && files.length > 0 && files[0].type.startsWith('image/')) {
    const file = files[0];
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        // Upload to server directly
        const savedMedia = await uploadMediaDirectly({
          dataUrl,
          title: file.name.replace(/\.[^/.]+$/, ''),
          category: 'Logo',
          filename: file.name
        });

        editorStore.updateWidgetProps(widgetId, {
          brandLogoUrl: savedMedia.url,
          isBrandLogoEnabled: true
        });
        editorStore.selectWidget(widgetId);
      }
    };
    reader.readAsDataURL(file);
  }
}

const dragOverChoiceOptionId = ref<string | null>(null);

async function handleChoiceImageDrop(e: DragEvent, widget: any, optId: string) {
  dragOverChoiceOptionId.value = null;
  editorStore.selectWidget(widget.id);

  // Check if image from Media Gallery or JSON payload
  const jsonStr = e.dataTransfer?.getData('application/json');
  if (jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      if (data?.customProps?.imageUrl) {
        const options = [...(widget.props.options || [])];
        const optIdx = options.findIndex((o: any) => o.id === optId);
        if (optIdx !== -1) {
          options[optIdx] = { ...options[optIdx], imageUrl: data.customProps.imageUrl };
          editorStore.updateWidgetProps(widget.id, { options });
        }
        return;
      }
    } catch (_) {}
  }

  // Check if physical file dropped
  const files = e.dataTransfer?.files;
  if (files && files.length > 0 && files[0].type.startsWith('image/')) {
    const file = files[0];
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        const options = [...(widget.props.options || [])];
        const optIdx = options.findIndex((o: any) => o.id === optId);
        if (optIdx !== -1) {
          options[optIdx] = { ...options[optIdx], imageUrl: dataUrl };
          editorStore.updateWidgetProps(widget.id, { options });
        }

        try {
          const savedMedia = await uploadMediaDirectly({
            dataUrl,
            title: file.name.replace(/\.[^/.]+$/, ''),
            category: 'Product Catalog',
            filename: file.name
          });

          if (savedMedia?.url) {
            const currentOpts = [...(widget.props.options || [])];
            const currentIdx = currentOpts.findIndex((o: any) => o.id === optId);
            if (currentIdx !== -1) {
              currentOpts[currentIdx] = { ...currentOpts[currentIdx], imageUrl: savedMedia.url };
              editorStore.updateWidgetProps(widget.id, { options: currentOpts });
            }
          }
        } catch (err) {
          console.warn('Background upload failed, retaining preview:', err);
        }
      }
    };
    reader.readAsDataURL(file);
  }
}

function getGuestName(widget: any) {
  if (isLivePass.value) return (livePass!.guestName || 'GUEST').toUpperCase();
  // 1. Check if any RegistrationForm has a filled name field
  const regWidgets = editorStore.pages.flatMap(p => p.widget_tree).filter(w => w.type === 'RegistrationForm');
  for (const rw of regWidgets) {
    const fields = (rw.props?.fields || []) as any[];
    const fn = fields.find((f: any) => f.name?.toLowerCase().includes('first') || f.name?.toLowerCase().includes('given'))?.value?.trim();
    const ln = fields.find((f: any) => f.name?.toLowerCase().includes('last') || f.name?.toLowerCase().includes('family') || f.name?.toLowerCase().includes('sur'))?.value?.trim();
    if (fn || ln) {
      return [fn, ln].filter(Boolean).join(' ').toUpperCase();
    }
    const fullNameField = fields.find((f: any) => f.name?.toLowerCase().includes('name') && f.value?.trim());
    if (fullNameField) {
      return fullNameField.value.trim().toUpperCase();
    }
  }

  // 2. Check if any FieldInput with 'name' has a filled value
  const nameWidget = editorStore.pages.flatMap(p => p.widget_tree).find(w => 
    w.type === 'FieldInput' && 
    (w.props?.label?.toLowerCase().includes('name') || w.props?.placeholder?.toLowerCase().includes('name')) &&
    w.props?.value && w.props.value.trim()
  );
  if (nameWidget && nameWidget.props?.value?.trim()) {
    return nameWidget.props.value.trim().toUpperCase();
  }

  // 3. Check if any Pop Up Modal collected a name value
  if (modalInputValue.value && (modalDisplayProps.value.fieldType === 'text' || modalDisplayProps.value.fieldPlaceholder?.toLowerCase().includes('name'))) {
    return modalInputValue.value.trim().toUpperCase();
  }
  const allWidgets = editorStore.pages.flatMap(p => p.widget_tree);
  for (const w of allWidgets) {
    const mProps = w.props?.modalProps || (w.type === 'ModalOverlay' ? w.props : null);
    if (mProps?.fieldValue && (mProps.fieldType === 'text' || mProps.fieldPlaceholder?.toLowerCase().includes('name'))) {
      return mProps.fieldValue.trim().toUpperCase();
    }
  }

  return widget.props?.guestNameFallback || '[GUEST NAME]';
}

function getVenue(widget: any) {
  return widget.props?.venue || '[EVENT VENUE LOCATION]';
}

/** The options a guest picked in these widgets (choice blocks first, then choice pop-ups). */
function selectedSessionsIn(widgets: any[]): PassSession[] {
  const toSession = (opt: any, idx: number): PassSession => ({
    label: opt.label || `Pass Option ${idx + 1}`,
    sublabel: opt.sublabel || '',
    description: opt.description || ''
  });
  for (const cw of widgets.filter(w => w.type === 'MultipleChoice')) {
    const selected = (cw.props?.selectedValues || []) as string[];
    const picked = (cw.props?.options || []).filter((opt: any) => selected.includes(opt.id));
    if (picked.length) return picked.map(toSession);
  }
  for (const w of widgets) {
    const mProps = w.props?.modalProps || (w.type === 'ModalOverlay' ? w.props : null);
    const picked = (mProps?.options || []).filter((opt: any) => opt.selected);
    if (picked.length) return picked.map(toSession);
  }
  return [];
}

function getValidForSessions(widget: any) {
  // Live: exactly what this guest picked, as the server recorded it — the same
  // list the PDF and the door staff see. If the campaign offered no choice,
  // the pass lists the sessions the designer set on the Ticket Summary.
  if (isLivePass.value) {
    if (livePass!.sessions.length) return livePass!.sessions;
    return (widget.props?.validForFallback || []) as PassSession[];
  }

  // 1. Check if user selected any options in MultipleChoice widgets across pages
  const choiceWidgets = editorStore.pages.flatMap(p => p.widget_tree).filter(w => w.type === 'MultipleChoice');
  
  for (const cw of choiceWidgets) {
    if (cw.props?.selectedValues && cw.props.selectedValues.length > 0) {
      const selectedOptions = (cw.props.options || []).filter((opt: any) => 
        cw.props.selectedValues.includes(opt.id)
      );
      if (selectedOptions.length > 0) {
        return selectedOptions.map((opt: any, idx: number) => ({
          id: opt.id,
          label: opt.label || `Pass Option ${idx + 1}`,
          sublabel: opt.sublabel || '',
          description: opt.description || ''
        }));
      }
    }
  }

  // 1b. Check if user selected any options in Pop Up Modals across pages
  const allWidgets = editorStore.pages.flatMap(p => p.widget_tree);
  for (const w of allWidgets) {
    const mProps = w.props?.modalProps || (w.type === 'ModalOverlay' ? w.props : null);
    if (mProps && (mProps.variant === 'choice-detailed' || mProps.variant === 'choice-simple' || mProps.variant === 'image-matrix' || mProps.options?.length > 0)) {
      const selectedModalOpts = (mProps.options || []).filter((opt: any) => opt.selected);
      if (selectedModalOpts.length > 0) {
        return selectedModalOpts.map((opt: any, idx: number) => ({
          id: opt.id || `m_opt_${idx}`,
          label: opt.label || `Pass Option ${idx + 1}`,
          sublabel: opt.sublabel || '',
          description: opt.description || ''
        }));
      }
    }
  }

  // 2. If no selection active yet, check if a MultipleChoice exists in the project and use its options
  for (const cw of choiceWidgets) {
    if (cw.props?.options && cw.props.options.length > 0) {
      return cw.props.options.slice(0, 2).map((opt: any, idx: number) => ({
        id: opt.id,
        label: opt.label || `Pass Option ${idx + 1}`,
        sublabel: opt.sublabel || '',
        description: opt.description || ''
      }));
    }
  }

  // 2b. Check if any Pop Up Modal with choice options exists in the project and use its options
  for (const w of allWidgets) {
    const mProps = w.props?.modalProps || (w.type === 'ModalOverlay' ? w.props : null);
    if (mProps && mProps.options && mProps.options.length > 0 && 
        (mProps.variant === 'choice-detailed' || mProps.variant === 'choice-simple' || mProps.variant === 'image-matrix' || mProps.options?.length > 0)) {
      return mProps.options.slice(0, 2).map((opt: any, idx: number) => ({
        id: opt.id || `m_opt_${idx}`,
        label: opt.label || `Pass Option ${idx + 1}`,
        sublabel: opt.sublabel || '',
        description: opt.description || ''
      }));
    }
  }

  // 3. Fallback to clean dummy data UI placeholder strictly matching choice form format
  return widget.props?.validForFallback || [
    { 
      id: 'opt_1', 
      label: 'Pass Option 1', 
      sublabel: '2 September 2026', 
      description: 'Access to main floor & VIP lounge' 
    },
    { 
      id: 'opt_2', 
      label: 'Pass Option 2', 
      sublabel: '3 September 2026', 
      description: 'Access to main floor & VIP lounge' 
    }
  ];
}

function getBrandLogo(widget: any) {
  if (widget?.props?.brandLogoUrl) return widget.props.brandLogoUrl;
  const heroHere = activePage.value.widget_tree.find((w: any) => w.type === 'HeroDrop' && w.props?.brandLogoUrl);
  if (heroHere) return heroHere.props.brandLogoUrl;
  // editorStore.pages is the project open in the editor — on a live page it is
  // someone else's (or nothing), so never borrow a logo from it there; the
  // campaign's own logo comes from the page (PublicDropView) instead.
  if (props.isLivePage) return ticketSource?.context.logoUrl || '';
  // Inherit brand logo from any HeroDrop banner in the project
  for (const page of editorStore.pages) {
    for (const w of page.widget_tree) {
      if (w.type === 'HeroDrop' && w.props?.brandLogoUrl) {
        return w.props.brandLogoUrl;
      }
    }
  }
  return '';
}

function getBrandLogoAlign(widget: any) {
  if (widget?.props?.brandLogoAlign) return widget.props.brandLogoAlign;
  for (const page of editorStore.pages) {
    for (const w of page.widget_tree) {
      if (w.type === 'HeroDrop' && w.props?.brandLogoAlign) {
        return w.props.brandLogoAlign;
      }
    }
  }
  return 'left';
}

function getEmail(widget: any) {
  if (isLivePass.value) return livePass!.email.toLowerCase();
  const regWidgets = editorStore.pages.flatMap(p => p.widget_tree).filter(w => w.type === 'RegistrationForm');
  for (const rw of regWidgets) {
    const fields = (rw.props?.fields || []) as any[];
    const emailField = fields.find((f: any) => (f.name?.toLowerCase().includes('email') || f.type === 'email') && f.value?.trim());
    if (emailField) {
      return emailField.value.trim().toLowerCase();
    }
  }
  const emailWidget = editorStore.pages.flatMap(p => p.widget_tree).find(w => 
    w.type === 'FieldInput' && 
    (w.props?.inputType === 'email' || w.props?.label?.toLowerCase().includes('email') || w.props?.placeholder?.toLowerCase().includes('email')) &&
    w.props?.value && w.props.value.trim()
  );
  if (emailWidget && emailWidget.props?.value?.trim()) {
    return emailWidget.props.value.trim().toLowerCase();
  }

  // Check if Pop Up Modal collected an email
  if (modalInputValue.value && (modalDisplayProps.value.fieldType === 'email' || modalInputValue.value.includes('@'))) {
    return modalInputValue.value.trim().toLowerCase();
  }
  const allWidgets = editorStore.pages.flatMap(p => p.widget_tree);
  for (const w of allWidgets) {
    const mProps = w.props?.modalProps || (w.type === 'ModalOverlay' ? w.props : null);
    if (mProps?.fieldValue && (mProps.fieldType === 'email' || mProps.fieldValue.includes('@'))) {
      return mProps.fieldValue.trim().toLowerCase();
    }
  }

  return 'guest@email.com';
}

function getAccessId(widget: any) {
  // On a live page only the server-issued code is real; the widget's own value
  // is the editor placeholder and must never be shown to a guest as theirs.
  if (isLivePass.value) {
    if (livePass!.status === 'ready') return livePass!.code;
    return livePass!.status === 'error' ? '—' : 'ISSUING…';
  }
  // Editor: the system issues a fresh ID per guest at submission. Show one in
  // the same format so the design reads like a real pass, never a fixed code.
  return sampleAccessId;
}

function getGuestType(widget: any) {
  if (isLivePass.value && livePass!.guestType) return livePass!.guestType.toUpperCase();
  return String(widget.props?.guestType || 'Public').toUpperCase();
}

interface NoticeToken {
  type: 'text' | 'link';
  text: string;
  url?: string;
}

function parseNoticeTokens(widget: any): NoticeToken[] {
  const rawText = widget?.props?.footerNoticeText || 'Check your spam folder or contact support';
  const customLinkWords = widget?.props?.footerNoticeLinkWords?.trim();
  const customLinkUrl = widget?.props?.footerNoticeLinkUrl?.trim() || '';

  // 1. Check for markdown-style link [word](url)
  const mdRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  if (mdRegex.test(rawText)) {
    mdRegex.lastIndex = 0;
    const tokens: NoticeToken[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = mdRegex.exec(rawText)) !== null) {
      if (match.index > lastIndex) {
        tokens.push({ type: 'text', text: rawText.substring(lastIndex, match.index) });
      }
      tokens.push({ type: 'link', text: match[1], url: match[2] });
      lastIndex = mdRegex.lastIndex;
    }
    if (lastIndex < rawText.length) {
      tokens.push({ type: 'text', text: rawText.substring(lastIndex) });
    }
    return tokens;
  }

  // 2. Check if customLinkWords is specified and matches rawText
  if (customLinkWords && rawText.toLowerCase().includes(customLinkWords.toLowerCase())) {
    const idx = rawText.toLowerCase().indexOf(customLinkWords.toLowerCase());
    const before = rawText.substring(0, idx);
    const linkText = rawText.substring(idx, idx + customLinkWords.length);
    const after = rawText.substring(idx + customLinkWords.length);
    const tokens: NoticeToken[] = [];
    if (before) tokens.push({ type: 'text', text: before });
    tokens.push({ type: 'link', text: linkText, url: customLinkUrl });
    if (after) tokens.push({ type: 'text', text: after });
    return tokens;
  }

  // 3. Fallback: check if 'contact support' appears
  if (rawText.toLowerCase().includes('contact support')) {
    const idx = rawText.toLowerCase().indexOf('contact support');
    const before = rawText.substring(0, idx);
    const linkText = rawText.substring(idx, idx + 'contact support'.length);
    const after = rawText.substring(idx + 'contact support'.length);
    const tokens: NoticeToken[] = [];
    if (before) tokens.push({ type: 'text', text: before });
    tokens.push({ type: 'link', text: linkText, url: customLinkUrl });
    if (after) tokens.push({ type: 'text', text: after });
    return tokens;
  }

  return [{ type: 'text', text: rawText }];
}

function handleNoticeLinkClick(token: any, widget?: any) {
  const actionType = widget?.props?.footerNoticeActionType || (token?.url === 'modal' ? 'modal' : 'link');
  if (actionType === 'modal' || token?.url === 'modal') {
    activeTriggeredModal.value = widget?.props?.noticeModalProps || widget?.props?.modalProps || {
      variant: 'message-alert',
      title: "Didn't Receive Your Pass?",
      subtitle: 'Please check your spam or junk folder. If you still have not received it, our team is ready to assist you.',
      buttonText: 'Done',
      buttonVariant: 'black'
    };
    return;
  }
  if (token?.url && token.url !== '#' && token.url !== 'modal') {
    window.open(token.url, '_blank', 'noopener,noreferrer');
  } else {
    editorStore.showToast('Connecting to support...');
  }
}
</script>
