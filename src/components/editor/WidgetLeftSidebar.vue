<template>
  <!-- Widget Left Sidebar Menu (Figma Node 74:182) -->
  <aside 
    v-if="isOpen"
    @click.stop
    @wheel.stop
    class="absolute left-[24px] top-1/2 -translate-y-1/2 w-[464px] h-auto max-h-[calc(100vh-140px)] backdrop-blur-2xl bg-[rgba(255,255,255,0.92)] border border-black/8 content-stretch flex flex-col items-start overflow-y-auto pb-[32px] rounded-[12px] shadow-[0px_20px_50px_0px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.05)] z-40 select-none transition-all animate-apple-slide-left-center no-scrollbar"
    data-node-id="74:182"
    data-name="Sidebar"
  >
    <!-- Widget Container & Header -->
    <div class="content-stretch flex flex-col gap-[6px] items-start p-[24px] shrink-0 w-full border-b border-[#f0f0f0]">
      <div class="content-stretch flex items-center justify-between shrink-0 w-full">
        <p class="font-707 font-medium text-[16px] leading-[22px] text-black whitespace-nowrap">
          Widget
        </p>
        <button 
          @click="$emit('close')"
          class="apple-glass-icon-btn size-7 flex items-center justify-center rounded-full cursor-pointer"
        >
          <img :src="FIGMA_ASSETS.closeIcon" class="w-3.5 h-3.5" alt="Close" />
        </button>
      </div>
      <p class="font-707 font-normal text-[12px] leading-[16px] text-neutral-500">
        Select blocks to assemble your campaign page.
      </p>
    </div>

    <!-- Section 1: Media/Banners -->
    <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full border-b border-[#f0f0f0]">
      <div class="content-stretch flex items-center justify-between shrink-0 w-full">
        <p class="flex-[1_0_0] font-707 font-medium text-[13px] leading-[18px] text-black">
          Media/Banners
        </p>
      </div>
      <div class="content-stretch flex gap-[14px] items-start overflow-x-auto -mx-[24px] px-[24px] w-[calc(100%+48px)] pb-2 no-scrollbar">
        <!-- 1. Full screen landing cover (Scrollable) -->
        <div 
          draggable="true"
          @dragstart="handleDragStart($event, { type: 'HeroDrop', label: 'Full Screen (Scrollable)', customProps: { ratio: 'Full screen landing page', isSolidSpace: true, subtitle: 'FULL SCREEN (SCROLLABLE)' } })"
          @dragend="handleDragEnd"
          @click="addMediaWidget('Full screen landing page')"
          class="content-stretch flex flex-col gap-[6px] items-center shrink-0 w-[84px] cursor-grab active:cursor-grabbing group"
          title="Drag to canvas or click to add (100vh hero for multi-section scrollable page)"
        >
          <div class="bg-white group-hover:bg-neutral-50 h-[130px] rounded-[8px] shrink-0 w-[72px] transition-all border border-black/10 group-hover:border-black shadow-sm overflow-hidden flex flex-col justify-between p-1.5">
            <!-- Full Height Hero Cover Area -->
            <div class="w-full flex-1 bg-[#dcdcdc] group-hover:bg-[#cecece] rounded-[4px] transition-colors flex flex-col justify-between p-1.5 relative overflow-hidden">
              <div class="w-2/5 h-1 bg-black/20 rounded-full" />
              <div class="w-full flex flex-col gap-1">
                <div class="w-4/5 h-1.5 bg-black/25 rounded-full" />
                <div class="w-3/5 h-1 bg-black/15 rounded-full" />
              </div>
            </div>
            <!-- Bottom Peek Indicating Scrollable Multi-Layer Page Below -->
            <div class="w-full h-3.5 bg-neutral-100 border border-neutral-200 rounded-[3px] flex items-center justify-center gap-1 mt-1 shrink-0">
              <div class="w-4 h-0.5 bg-neutral-400 rounded-full" />
            </div>
          </div>
          <p class="font-707 font-normal text-[11px] text-black text-center leading-tight">
            Full Screen (Scrollable)
          </p>
        </div>

        <!-- 2. Dynamic Fit (Responsive 1-Screen) -->
        <div 
          draggable="true"
          @dragstart="handleDragStart($event, { type: 'HeroDrop', label: 'Dynamic Fit (1-Screen)', customProps: { ratio: 'Dynamic Fit', isSolidSpace: true, subtitle: 'DYNAMIC FIT (1-SCREEN)' } })"
          @dragend="handleDragEnd"
          @click="addMediaWidget('Dynamic Fit')"
          class="content-stretch flex flex-col gap-[6px] items-center shrink-0 w-[84px] cursor-grab active:cursor-grabbing group"
          title="Drag to canvas or click to add (Adaptive 1-screen fit without scrolling)"
        >
          <div class="bg-white group-hover:bg-neutral-50 h-[130px] rounded-[8px] shrink-0 w-[72px] transition-all border border-black/10 group-hover:border-black shadow-sm overflow-hidden flex flex-col justify-between p-1.5">
            <!-- Adaptive Hero Image -->
            <div class="w-full h-[54px] bg-[#dcdcdc] group-hover:bg-[#cecece] rounded-[4px] transition-colors flex flex-col justify-start p-1.5">
              <div class="w-2/5 h-1 bg-black/20 rounded-full" />
            </div>
            <!-- Middle Text Line -->
            <div class="w-full flex flex-col gap-1 py-1">
              <div class="w-4/5 h-1.5 bg-black/25 rounded-full" />
              <div class="w-3/5 h-1 bg-black/15 rounded-full" />
            </div>
            <!-- Bottom Action CTA Button -->
            <div class="w-full h-4 bg-black/85 rounded-[3px] flex items-center justify-center shrink-0">
              <div class="w-1/2 h-1 bg-white/70 rounded-full" />
            </div>
          </div>
          <p class="font-707 font-normal text-[11px] text-black text-center leading-tight">
            Dynamic Fit (1-Screen)
          </p>
        </div>

        <!-- 3. 3:4 Portrait -->
        <div 
          draggable="true"
          @dragstart="handleDragStart($event, { type: 'HeroDrop', label: '3:4', customProps: { ratio: '3:4', isSolidSpace: true, subtitle: '3:4 RATIO COVER' } })"
          @dragend="handleDragEnd"
          @click="addMediaWidget('3:4')"
          class="content-stretch flex flex-col gap-[6px] items-center shrink-0 w-[84px] cursor-grab active:cursor-grabbing group"
          title="Drag to canvas or click to add (Standard 3:4 portrait cover with content below)"
        >
          <div class="bg-white group-hover:bg-neutral-50 h-[130px] rounded-[8px] shrink-0 w-[72px] transition-all border border-black/10 group-hover:border-black shadow-sm overflow-hidden flex flex-col justify-between p-1.5">
            <!-- 3:4 Hero Block -->
            <div class="w-full h-[64px] bg-[#dcdcdc] group-hover:bg-[#cecece] rounded-[4px] transition-colors flex flex-col justify-start p-1.5">
              <div class="w-2/5 h-1 bg-black/20 rounded-full" />
            </div>
            <!-- Form Blocks Below -->
            <div class="w-full flex-1 flex flex-col gap-1 pt-1.5 justify-start">
              <div class="w-3/4 h-1.5 bg-black/20 rounded-full" />
              <div class="w-full h-2.5 bg-neutral-100 border border-neutral-200 rounded-[2px]" />
              <div class="w-full h-3 bg-black/80 rounded-[2px] mt-auto" />
            </div>
          </div>
          <p class="font-707 font-normal text-[11px] text-black text-center whitespace-nowrap">
            3:4
          </p>
        </div>

        <!-- 4. 4:5 Medium Portrait -->
        <div 
          draggable="true"
          @dragstart="handleDragStart($event, { type: 'HeroDrop', label: '4:5', customProps: { ratio: '4:5', isSolidSpace: true, subtitle: '4:5 RATIO COVER' } })"
          @dragend="handleDragEnd"
          @click="addMediaWidget('4:5')"
          class="content-stretch flex flex-col gap-[6px] items-center shrink-0 w-[84px] cursor-grab active:cursor-grabbing group"
          title="Drag to canvas or click to add (4:5 feed portrait cover)"
        >
          <div class="bg-white group-hover:bg-neutral-50 h-[130px] rounded-[8px] shrink-0 w-[72px] transition-all border border-black/10 group-hover:border-black shadow-sm overflow-hidden flex flex-col justify-between p-1.5">
            <!-- 4:5 Hero Block -->
            <div class="w-full h-[58px] bg-[#dcdcdc] group-hover:bg-[#cecece] rounded-[4px] transition-colors flex flex-col justify-start p-1.5">
              <div class="w-2/5 h-1 bg-black/20 rounded-full" />
            </div>
            <!-- Form Content Below -->
            <div class="w-full flex-1 flex flex-col gap-1 pt-1.5 justify-start">
              <div class="w-4/5 h-1.5 bg-black/20 rounded-full" />
              <div class="w-full h-2.5 bg-neutral-100 border border-neutral-200 rounded-[2px]" />
              <div class="w-full h-2.5 bg-neutral-100 border border-neutral-200 rounded-[2px]" />
            </div>
          </div>
          <p class="font-707 font-normal text-[11px] text-black text-center whitespace-nowrap">
            4:5
          </p>
        </div>

        <!-- 5. 4:3 Classic Landscape -->
        <div 
          draggable="true"
          @dragstart="handleDragStart($event, { type: 'HeroDrop', label: '4:3', customProps: { ratio: '4:3', isSolidSpace: true, subtitle: '4:3 RATIO COVER' } })"
          @dragend="handleDragEnd"
          @click="addMediaWidget('4:3')"
          class="content-stretch flex flex-col gap-[6px] items-center shrink-0 w-[84px] cursor-grab active:cursor-grabbing group"
          title="Drag to canvas or click to add (4:3 landscape cover)"
        >
          <div class="bg-white group-hover:bg-neutral-50 h-[130px] rounded-[8px] shrink-0 w-[72px] transition-all border border-black/10 group-hover:border-black shadow-sm overflow-hidden flex flex-col justify-between p-1.5">
            <!-- 4:3 Hero Block -->
            <div class="w-full h-[46px] bg-[#dcdcdc] group-hover:bg-[#cecece] rounded-[4px] transition-colors flex flex-col justify-start p-1.5">
              <div class="w-2/5 h-1 bg-black/20 rounded-full" />
            </div>
            <!-- Form Content Below -->
            <div class="w-full flex-1 flex flex-col gap-1.5 pt-1.5 justify-start">
              <div class="w-3/4 h-1.5 bg-black/25 rounded-full" />
              <div class="w-full h-2.5 bg-neutral-100 border border-neutral-200 rounded-[2px]" />
              <div class="w-full h-2.5 bg-neutral-100 border border-neutral-200 rounded-[2px]" />
              <div class="w-full h-3 bg-black/80 rounded-[2px] mt-auto" />
            </div>
          </div>
          <p class="font-707 font-normal text-[11px] text-black text-center whitespace-nowrap">
            4:3
          </p>
        </div>

        <!-- 6. 16:9 Cinematic Widescreen -->
        <div 
          draggable="true"
          @dragstart="handleDragStart($event, { type: 'HeroDrop', label: '16:9', customProps: { ratio: '16:9', isSolidSpace: true, subtitle: '16:9 RATIO BANNER' } })"
          @dragend="handleDragEnd"
          @click="addMediaWidget('16:9')"
          class="content-stretch flex flex-col gap-[6px] items-center shrink-0 w-[84px] cursor-grab active:cursor-grabbing group"
          title="Drag to canvas or click to add (16:9 cinematic widescreen header)"
        >
          <div class="bg-white group-hover:bg-neutral-50 h-[130px] rounded-[8px] shrink-0 w-[72px] transition-all border border-black/10 group-hover:border-black shadow-sm overflow-hidden flex flex-col justify-between p-1.5">
            <!-- 16:9 Hero Block -->
            <div class="w-full h-[36px] bg-[#dcdcdc] group-hover:bg-[#cecece] rounded-[4px] transition-colors flex flex-col justify-start p-1.5">
              <div class="w-2/5 h-1 bg-black/20 rounded-full" />
            </div>
            <!-- Form Content Below -->
            <div class="w-full flex-1 flex flex-col gap-1.5 pt-1.5 justify-start">
              <div class="w-2/3 h-1.5 bg-black/25 rounded-full" />
              <div class="w-full h-2.5 bg-neutral-100 border border-neutral-200 rounded-[2px]" />
              <div class="w-full h-2.5 bg-neutral-100 border border-neutral-200 rounded-[2px]" />
              <div class="w-full h-3 bg-black/80 rounded-[2px] mt-auto" />
            </div>
          </div>
          <p class="font-707 font-normal text-[11px] text-black text-center whitespace-nowrap">
            16:9
          </p>
        </div>

        <!-- 7. 9:16 Vertical Story Cover -->
        <div 
          draggable="true"
          @dragstart="handleDragStart($event, { type: 'HeroDrop', label: '9:16', customProps: { ratio: '9:16', isSolidSpace: true, subtitle: '9:16 STORY BANNER' } })"
          @dragend="handleDragEnd"
          @click="addMediaWidget('9:16')"
          class="content-stretch flex flex-col gap-[6px] items-center shrink-0 w-[84px] cursor-grab active:cursor-grabbing group"
          title="Drag to canvas or click to add (9:16 vertical full story cover)"
        >
          <div class="bg-white group-hover:bg-neutral-50 h-[130px] rounded-[8px] shrink-0 w-[72px] transition-all border border-black/10 group-hover:border-black shadow-sm overflow-hidden flex flex-col p-1.5">
            <div class="w-full h-full bg-[#dcdcdc] group-hover:bg-[#cecece] rounded-[4px] transition-colors flex flex-col justify-between p-1.5">
              <div class="w-1/3 h-1 bg-black/20 rounded-full" />
              <div class="w-full flex flex-col gap-1">
                <div class="w-4/5 h-1.5 bg-black/30 rounded-full" />
                <div class="w-full h-3 bg-black/70 rounded-[2px]" />
              </div>
            </div>
          </div>
          <p class="font-707 font-normal text-[11px] text-black text-center whitespace-nowrap">
            9:16
          </p>
        </div>

        <!-- 8. 1:1 Square -->
        <div 
          draggable="true"
          @dragstart="handleDragStart($event, { type: 'HeroDrop', label: '1:1', customProps: { ratio: '1:1', isSolidSpace: true, subtitle: '1:1 SQUARE BANNER' } })"
          @dragend="handleDragEnd"
          @click="addMediaWidget('1:1')"
          class="content-stretch flex flex-col gap-[6px] items-center shrink-0 w-[84px] cursor-grab active:cursor-grabbing group"
          title="Drag to canvas or click to add (1:1 square hero with body space below)"
        >
          <div class="bg-white group-hover:bg-neutral-50 h-[130px] rounded-[8px] shrink-0 w-[72px] transition-all border border-black/10 group-hover:border-black shadow-sm overflow-hidden flex flex-col justify-between p-1.5">
            <!-- 1:1 Square Hero Block -->
            <div class="w-full h-[58px] bg-[#dcdcdc] group-hover:bg-[#cecece] rounded-[4px] transition-colors flex flex-col justify-start p-1.5">
              <div class="w-2/5 h-1 bg-black/20 rounded-full" />
            </div>
            <!-- Form Content Below -->
            <div class="w-full flex-1 flex flex-col gap-1.5 pt-1.5 justify-start">
              <div class="w-3/4 h-1.5 bg-black/20 rounded-full" />
              <div class="w-full h-2.5 bg-neutral-100 border border-neutral-200 rounded-[2px]" />
              <div class="w-full h-3 bg-black/80 rounded-[2px] mt-auto" />
            </div>
          </div>
          <p class="font-707 font-normal text-[11px] text-black text-center whitespace-nowrap">
            1:1
          </p>
        </div>
      </div>
    </div>

    <!-- Section 2: Add Form Inputs & Choices -->
    <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full border-b border-[#f0f0f0]">
      <div class="content-stretch flex items-center justify-between shrink-0 w-full">
        <p class="flex-[1_0_0] font-707 font-medium text-[13px] leading-[18px] text-black">
          Add Form Inputs & Choices
        </p>
      </div>

      <!-- Pre-built Form Templates & Choice Styles Cards Carousel -->
      <div class="content-stretch flex gap-[14px] items-start overflow-x-auto -mx-[24px] px-[24px] w-[calc(100%+48px)] no-scrollbar pb-[4px]">
        <!-- 1. Registration Form (Full 5-field preset) -->
        <div 
          draggable="true"
          @dragstart="handleDragStart($event, { type: 'RegistrationForm', label: 'Registration Form', customProps: { title: 'REGISTRATION FORM', subtitle: 'Fill in your details below to register.' } })"
          @dragend="handleDragEnd"
          @click="addRegistrationFormWidget('registration')"
          class="content-stretch flex flex-col gap-[6px] items-center shrink-0 cursor-grab active:cursor-grabbing group w-[84px]"
          title="Drag to canvas or click to add (Complete Registration Form: Name, Email, WhatsApp, Instagram)"
        >
          <div class="border border-[#c9c9c9] flex flex-col justify-between p-2 h-[130px] rounded-[8px] shrink-0 w-[72px] bg-white group-hover:border-black transition-colors shadow-sm overflow-hidden">
            <!-- Header lines -->
            <div class="flex flex-col gap-1 w-full pt-0.5">
              <div class="w-4/5 h-1.5 bg-black/80 rounded-[1px]" />
              <div class="w-full h-1 bg-black/30 rounded-[1px]" />
            </div>
            <!-- Stack of luxury input lines -->
            <div class="flex flex-col gap-1.5 w-full py-0.5">
              <div class="w-full flex flex-col gap-0.5">
                <div class="w-2/5 h-0.5 bg-neutral-400 rounded-full" />
                <div class="w-full h-0.5 bg-neutral-300" />
              </div>
              <div class="w-full flex flex-col gap-0.5">
                <div class="w-1/3 h-0.5 bg-neutral-400 rounded-full" />
                <div class="w-full h-0.5 bg-neutral-300" />
              </div>
              <div class="w-full flex flex-col gap-0.5">
                <div class="w-1/2 h-0.5 bg-neutral-400 rounded-full" />
                <div class="w-full h-0.5 bg-neutral-300" />
              </div>
              <div class="w-full flex flex-col gap-0.5">
                <div class="w-2/5 h-0.5 bg-neutral-400 rounded-full" />
                <div class="w-full h-0.5 bg-neutral-300" />
              </div>
            </div>
            <!-- Mini bottom accent -->
            <div class="w-full h-1 bg-neutral-100 rounded-full" />
          </div>
          <p class="font-707 font-normal text-[11px] text-black text-center whitespace-nowrap">
            Registration Form
          </p>
        </div>

        <!-- 2. Contact / RSVP Form (3-field preset: Name, Email, WhatsApp) -->
        <div 
          draggable="true"
          @dragstart="handleDragStart($event, { type: 'RegistrationForm', label: 'Contact / RSVP', customProps: { title: 'RSVP & CONTACT', subtitle: 'Please confirm your contact details.' } })"
          @dragend="handleDragEnd"
          @click="addRegistrationFormWidget('contact')"
          class="content-stretch flex flex-col gap-[6px] items-center shrink-0 cursor-grab active:cursor-grabbing group w-[84px]"
          title="Drag to canvas or click to add (RSVP Contact Form: Name, Email, WhatsApp)"
        >
          <div class="border border-[#c9c9c9] flex flex-col justify-between p-2 h-[130px] rounded-[8px] shrink-0 w-[72px] bg-white group-hover:border-black transition-colors shadow-sm overflow-hidden">
            <!-- Header lines -->
            <div class="flex flex-col gap-1 w-full pt-0.5">
              <div class="w-3/4 h-1.5 bg-black/80 rounded-[1px]" />
              <div class="w-full h-1 bg-black/30 rounded-[1px]" />
            </div>
            <!-- Stack of luxury input lines -->
            <div class="flex flex-col gap-2 w-full py-0.5">
              <div class="w-full flex flex-col gap-0.5">
                <div class="w-2/5 h-0.5 bg-neutral-400 rounded-full" />
                <div class="w-full h-0.5 bg-neutral-300" />
              </div>
              <div class="w-full flex flex-col gap-0.5">
                <div class="w-1/2 h-0.5 bg-neutral-400 rounded-full" />
                <div class="w-full h-0.5 bg-neutral-300" />
              </div>
              <div class="w-full flex flex-col gap-0.5">
                <div class="w-1/3 h-0.5 bg-neutral-400 rounded-full" />
                <div class="w-full h-0.5 bg-neutral-300" />
              </div>
            </div>
            <!-- Mini button wire -->
            <div class="w-full h-2.5 bg-black/80 rounded-[2px] flex items-center justify-center">
              <div class="w-1/2 h-0.5 bg-white/70 rounded-full" />
            </div>
          </div>
          <p class="font-707 font-normal text-[11px] text-black text-center whitespace-nowrap">
            Contact / RSVP
          </p>
        </div>

        <!-- 3. Quick Waitlist Form (Lead preset: Name, Email) -->
        <div 
          draggable="true"
          @dragstart="handleDragStart($event, { type: 'RegistrationForm', label: 'Quick Waitlist', customProps: { title: 'JOIN THE WAITLIST', subtitle: 'Be the first to know when tickets go live.' } })"
          @dragend="handleDragEnd"
          @click="addRegistrationFormWidget('waitlist')"
          class="content-stretch flex flex-col gap-[6px] items-center shrink-0 cursor-grab active:cursor-grabbing group w-[84px]"
          title="Drag to canvas or click to add (Quick Waitlist: First Name, Email, WhatsApp)"
        >
          <div class="border border-[#c9c9c9] flex flex-col justify-between p-2 h-[130px] rounded-[8px] shrink-0 w-[72px] bg-white group-hover:border-black transition-colors shadow-sm overflow-hidden">
            <!-- Header lines -->
            <div class="flex flex-col gap-1 w-full pt-0.5">
              <div class="w-4/5 h-1.5 bg-black/80 rounded-[1px]" />
              <div class="w-3/4 h-1 bg-black/30 rounded-[1px]" />
            </div>
            <!-- Stack of luxury input lines -->
            <div class="flex flex-col gap-2.5 w-full py-0.5">
              <div class="w-full flex flex-col gap-0.5">
                <div class="w-2/5 h-0.5 bg-neutral-400 rounded-full" />
                <div class="w-full h-0.5 bg-neutral-300" />
              </div>
              <div class="w-full flex flex-col gap-0.5">
                <div class="w-1/2 h-0.5 bg-neutral-400 rounded-full" />
                <div class="w-full h-0.5 bg-neutral-300" />
              </div>
            </div>
            <!-- Mini button wire -->
            <div class="w-full h-3 bg-black/85 rounded-[2px] flex items-center justify-center">
              <div class="w-2/5 h-0.5 bg-white/70 rounded-full" />
            </div>
          </div>
          <p class="font-707 font-normal text-[11px] text-black text-center whitespace-nowrap">
            Quick Waitlist
          </p>
        </div>

        <!-- 4. Choice Style: Detailed Cards -->
        <div 
          draggable="true"
          @dragstart="handleDragStart($event, { type: 'MultipleChoice', label: 'Detailed Cards', customProps: getChoiceDefaultProps('Detailed Cards') })"
          @dragend="handleDragEnd"
          @click="addChoiceWidget('Detailed Cards')"
          class="content-stretch flex flex-col gap-[6px] items-center shrink-0 cursor-grab active:cursor-grabbing group w-[84px]"
          title="Drag to canvas or click to add (Stacked detailed choice cards with dates & descriptions)"
        >
          <div class="border border-[#c9c9c9] flex flex-col justify-between p-2 h-[130px] rounded-[8px] shrink-0 w-[72px] bg-white group-hover:border-black transition-colors shadow-sm overflow-hidden">
            <!-- Header line -->
            <div class="flex flex-col gap-1 w-full pt-0.5">
              <div class="w-3/4 h-1.5 bg-black/80 rounded-[1px]" />
              <div class="w-full h-1 bg-black/30 rounded-[1px]" />
            </div>
            <!-- Two stacked detailed cards -->
            <div class="flex flex-col gap-1.5 w-full">
              <!-- Card 1 (Selected) -->
              <div class="w-full border border-black rounded-[3px] p-1 flex items-center justify-between bg-neutral-50">
                <div class="flex flex-col gap-0.5 flex-1 min-w-0 pr-1">
                  <div class="w-3/4 h-1 bg-black rounded-full" />
                  <div class="w-1/2 h-0.5 bg-neutral-400 rounded-full" />
                </div>
                <div class="size-2 rounded-full border border-black bg-black flex items-center justify-center shrink-0">
                  <div class="size-0.5 bg-white rounded-full" />
                </div>
              </div>
              <!-- Card 2 (Unselected) -->
              <div class="w-full border border-neutral-200 rounded-[3px] p-1 flex items-center justify-between">
                <div class="flex flex-col gap-0.5 flex-1 min-w-0 pr-1">
                  <div class="w-3/4 h-1 bg-neutral-600 rounded-full" />
                  <div class="w-1/2 h-0.5 bg-neutral-300 rounded-full" />
                </div>
                <div class="size-2 rounded-full border border-neutral-300 shrink-0" />
              </div>
            </div>
            <div class="w-full h-1 bg-neutral-100 rounded-full" />
          </div>
          <p class="font-707 font-normal text-[11px] text-black text-center whitespace-nowrap">
            Detailed Cards
          </p>
        </div>

        <!-- 5. Choice Style: Simple Rows -->
        <div 
          draggable="true"
          @dragstart="handleDragStart($event, { type: 'MultipleChoice', label: 'Simple Rows', customProps: getChoiceDefaultProps('Simple Rows') })"
          @dragend="handleDragEnd"
          @click="addChoiceWidget('Simple Rows')"
          class="content-stretch flex flex-col gap-[6px] items-center shrink-0 cursor-grab active:cursor-grabbing group w-[84px]"
          title="Drag to canvas or click to add (Clean single-line options with radio indicators)"
        >
          <div class="border border-[#c9c9c9] flex flex-col justify-between p-2 h-[130px] rounded-[8px] shrink-0 w-[72px] bg-white group-hover:border-black transition-colors shadow-sm overflow-hidden">
            <!-- Header line -->
            <div class="flex flex-col gap-1 w-full pt-0.5">
              <div class="w-3/4 h-1.5 bg-black/80 rounded-[1px]" />
              <div class="w-full h-1 bg-black/30 rounded-[1px]" />
            </div>
            <!-- 3 clean rows -->
            <div class="flex flex-col gap-1.5 w-full py-0.5">
              <div class="w-full flex items-center justify-between py-0.5 border-b border-neutral-100">
                <div class="flex items-center gap-1">
                  <div class="size-1.5 rounded-full bg-black shrink-0" />
                  <div class="w-7 h-1 bg-black rounded-full" />
                </div>
                <div class="w-3 h-0.5 bg-neutral-300 rounded-full" />
              </div>
              <div class="w-full flex items-center justify-between py-0.5 border-b border-neutral-100">
                <div class="flex items-center gap-1">
                  <div class="size-1.5 rounded-full border border-neutral-300 shrink-0" />
                  <div class="w-6 h-1 bg-neutral-600 rounded-full" />
                </div>
                <div class="w-3 h-0.5 bg-neutral-300 rounded-full" />
              </div>
              <div class="w-full flex items-center justify-between py-0.5">
                <div class="flex items-center gap-1">
                  <div class="size-1.5 rounded-full border border-neutral-300 shrink-0" />
                  <div class="w-8 h-1 bg-neutral-600 rounded-full" />
                </div>
                <div class="w-3 h-0.5 bg-neutral-300 rounded-full" />
              </div>
            </div>
            <div class="w-full h-1 bg-neutral-100 rounded-full" />
          </div>
          <p class="font-707 font-normal text-[11px] text-black text-center whitespace-nowrap">
            Simple Rows
          </p>
        </div>

        <!-- 6. Choice Style: Horizontal Grid -->
        <div 
          draggable="true"
          @dragstart="handleDragStart($event, { type: 'MultipleChoice', label: 'Horizontal Grid', customProps: getChoiceDefaultProps('Horizontal Blocks') })"
          @dragend="handleDragEnd"
          @click="addChoiceWidget('Horizontal Blocks')"
          class="content-stretch flex flex-col gap-[6px] items-center shrink-0 cursor-grab active:cursor-grabbing group w-[84px]"
          title="Drag to canvas or click to add (Compact multi-column pill chips)"
        >
          <div class="border border-[#c9c9c9] flex flex-col justify-between p-2 h-[130px] rounded-[8px] shrink-0 w-[72px] bg-white group-hover:border-black transition-colors shadow-sm overflow-hidden">
            <!-- Header line -->
            <div class="flex flex-col gap-1 w-full pt-0.5">
              <div class="w-3/4 h-1.5 bg-black/80 rounded-[1px]" />
              <div class="w-full h-1 bg-black/30 rounded-[1px]" />
            </div>
            <!-- 2x2 grid of chips -->
            <div class="grid grid-cols-2 gap-1 w-full py-0.5">
              <div class="h-5 rounded-[3px] bg-black flex items-center justify-center p-0.5">
                <div class="w-3/4 h-1 bg-white rounded-full" />
              </div>
              <div class="h-5 rounded-[3px] border border-neutral-200 bg-neutral-50 flex items-center justify-center p-0.5">
                <div class="w-3/4 h-1 bg-neutral-600 rounded-full" />
              </div>
              <div class="h-5 rounded-[3px] border border-neutral-200 bg-neutral-50 flex items-center justify-center p-0.5">
                <div class="w-3/4 h-1 bg-neutral-600 rounded-full" />
              </div>
              <div class="h-5 rounded-[3px] border border-neutral-200 bg-neutral-50 flex items-center justify-center p-0.5">
                <div class="w-3/4 h-1 bg-neutral-600 rounded-full" />
              </div>
            </div>
            <div class="w-full h-1 bg-neutral-100 rounded-full" />
          </div>
          <p class="font-707 font-normal text-[11px] text-black text-center whitespace-nowrap">
            Horizontal Grid
          </p>
        </div>

        <!-- 7. Choice Style: Image Matrix -->
        <div 
          draggable="true"
          @dragstart="handleDragStart($event, { type: 'MultipleChoice', label: 'Image Matrix', customProps: getChoiceDefaultProps('Image Matrix') })"
          @dragend="handleDragEnd"
          @click="addChoiceWidget('Image Matrix')"
          class="content-stretch flex flex-col gap-[6px] items-center shrink-0 cursor-grab active:cursor-grabbing group w-[84px]"
          title="Drag to canvas or click to add (Visual media cards with image tiles & labels)"
        >
          <div class="border border-[#c9c9c9] flex flex-col justify-between p-2 h-[130px] rounded-[8px] shrink-0 w-[72px] bg-white group-hover:border-black transition-colors shadow-sm overflow-hidden">
            <!-- Header line -->
            <div class="flex flex-col gap-1 w-full pt-0.5">
              <div class="w-3/4 h-1.5 bg-black/80 rounded-[1px]" />
              <div class="w-full h-1 bg-black/30 rounded-[1px]" />
            </div>
            <!-- 2x2 Image Grid -->
            <div class="grid grid-cols-2 gap-1 w-full py-0.5">
              <div class="flex flex-col gap-0.5 items-center">
                <div class="w-full h-5 bg-[#dcdcdc] rounded-[2px] border border-black" />
                <div class="w-3/4 h-0.5 bg-black rounded-full" />
              </div>
              <div class="flex flex-col gap-0.5 items-center">
                <div class="w-full h-5 bg-neutral-100 rounded-[2px] border border-neutral-200" />
                <div class="w-3/4 h-0.5 bg-neutral-400 rounded-full" />
              </div>
              <div class="flex flex-col gap-0.5 items-center">
                <div class="w-full h-5 bg-neutral-100 rounded-[2px] border border-neutral-200" />
                <div class="w-3/4 h-0.5 bg-neutral-400 rounded-full" />
              </div>
              <div class="flex flex-col gap-0.5 items-center">
                <div class="w-full h-5 bg-neutral-100 rounded-[2px] border border-neutral-200" />
                <div class="w-3/4 h-0.5 bg-neutral-400 rounded-full" />
              </div>
            </div>
            <div class="w-full h-1 bg-neutral-100 rounded-full" />
          </div>
          <p class="font-707 font-normal text-[11px] text-black text-center whitespace-nowrap">
            Image Matrix
          </p>
        </div>
      </div>

      <!-- Filter Buttons (Individual Field Category Tabs) -->
      <div class="content-stretch flex gap-[6px] items-start overflow-x-auto -mx-[24px] px-[24px] w-[calc(100%+48px)] no-scrollbar pt-1 pb-[4px]">
        <button 
          v-for="tab in formTabs" 
          :key="tab"
          @click="selectedFormTab = tab"
          :class="selectedFormTab === tab ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
          class="h-[30px] items-center justify-center px-[10px] py-[4px] rounded-[6px] shrink-0 font-707 text-[11px] whitespace-nowrap cursor-pointer"
        >
          {{ tab }}
        </button>
      </div>

      <!-- Individual Form Field Icons Grid -->
      <div class="content-stretch flex gap-[12px] items-start overflow-x-auto -mx-[24px] px-[24px] w-[calc(100%+48px)] pt-[2px] pb-[4px] no-scrollbar">
        <div 
          v-for="field in currentTabFields" 
          :key="field.name"
          draggable="true"
          @dragstart="handleFieldDragStart($event, field.name)"
          @dragend="handleDragEnd"
          @click="addFormField(field.name)"
          class="flex flex-col gap-[6px] items-center shrink-0 w-[56px] cursor-grab active:cursor-grabbing group"
          title="Drag to canvas or click to add"
        >
          <div class="size-[38px] rounded-full bg-[#f5f5f5] group-hover:bg-black group-hover:border-black border border-[#d9d9d9] flex items-center justify-center transition-all duration-150 shadow-sm text-black group-hover:text-white shrink-0">
            <component :is="field.icon" class="size-4 stroke-[1.75] transition-colors" />
          </div>
          <p class="font-707 font-normal text-[10px] text-black group-hover:font-medium text-center leading-tight transition-colors">
            {{ field.name }}
          </p>
        </div>
      </div>
    </div>

    <!-- Section 3: Action Button (Figma Node 244:11560) -->
    <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full border-b border-[#f0f0f0]">
      <div class="content-stretch flex items-center justify-between shrink-0 w-full">
        <p class="flex-[1_0_0] font-707 font-medium text-[13px] leading-[18px] text-black">
          Action Button
        </p>
      </div>
      <div class="content-stretch flex gap-[14px] items-start overflow-x-auto -mx-[24px] px-[24px] w-[calc(100%+48px)] no-scrollbar pb-[4px]">
        <!-- Action Button 1: Standard Black Button (Figma Node 176:5763) -->
        <div 
          draggable="true"
          @dragstart="handleDragStart($event, { type: 'ActionButton', label: 'Black Action Button', customProps: { label: 'BUTTON CTA', variant: 'black', actionType: 'submit', height: 48 } })"
          @dragend="handleDragEnd"
          @click="addActionButton('black')"
          class="content-stretch flex flex-col gap-[6px] items-center shrink-0 cursor-grab active:cursor-grabbing group"
          title="Drag to canvas or click to add"
        >
          <div class="border border-[#c9c9c9] flex flex-col items-center justify-center h-[76px] rounded-[8px] shrink-0 w-[112px] bg-white group-hover:border-black transition-colors shadow-sm px-2.5 overflow-hidden">
            <div class="w-full bg-black text-white h-[32px] rounded-[0px] flex items-center justify-center font-707 font-medium text-[10px] tracking-normal uppercase px-2 shadow-sm">
              Button CTA
            </div>
          </div>
          <p class="font-707 font-normal text-[11px] text-black text-center whitespace-nowrap">
            Black Button
          </p>
        </div>

        <!-- Action Button 2: Standard White Button (Figma Node 176:5741) -->
        <div 
          draggable="true"
          @dragstart="handleDragStart($event, { type: 'ActionButton', label: 'White Action Button', customProps: { label: 'BUTTON CTA', variant: 'white', actionType: 'submit', height: 48 } })"
          @dragend="handleDragEnd"
          @click="addActionButton('white')"
          class="content-stretch flex flex-col gap-[6px] items-center shrink-0 cursor-grab active:cursor-grabbing group"
          title="Drag to canvas or click to add"
        >
          <div class="border border-[#c9c9c9] flex flex-col items-center justify-center h-[76px] rounded-[8px] shrink-0 w-[112px] bg-white group-hover:border-black transition-colors shadow-sm px-2.5 overflow-hidden">
            <div class="w-full bg-[#f2f2f2] text-black h-[32px] rounded-[0px] flex items-center justify-center font-707 font-medium text-[10px] tracking-normal uppercase px-2 shadow-none border-0 border-none outline-none">
              Button CTA
            </div>
          </div>
          <p class="font-707 font-normal text-[11px] text-black text-center whitespace-nowrap">
            White Button
          </p>
        </div>
      </div>
    </div>

    <!-- Section 4: Interactive & Activations -->
    <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full border-b border-[#f0f0f0]">
      <div class="content-stretch flex items-center justify-between shrink-0 w-full">
        <p class="flex-[1_0_0] font-707 font-medium text-[13px] leading-[18px] text-black">
          Interactive & Activations
        </p>
      </div>
      <div class="content-stretch flex gap-[14px] items-start overflow-x-auto -mx-[24px] px-[24px] w-[calc(100%+48px)] no-scrollbar">
        <!-- Interactive Card 1: Guest E-Pass Ticketing (Figma Node 222:4188) -->
        <div 
          draggable="true"
          @dragstart="handleDragStart($event, { type: 'GuestEPass', label: 'Guest E-Pass', customProps: { venue: 'LA MODA PLAZA INDONESIA', guestNameFallback: 'MR. ALVIN DECOROUS' } })"
          @dragend="handleDragEnd"
          @click="addEPassWidget"
          class="content-stretch flex flex-col gap-[6px] items-center shrink-0 cursor-grab active:cursor-grabbing group"
          title="Drag to canvas or click to add (Dynamic Guest E-Pass ticket summary)"
        >
          <div class="border border-[#c9c9c9] flex flex-col gap-[6px] h-[130px] items-center justify-between p-2 rounded-[8px] shrink-0 w-[84px] bg-white group-hover:border-black transition-colors relative overflow-hidden shadow-sm">
            <!-- Mini QR + Info Header -->
            <div class="w-full flex items-center gap-1.5 pt-0.5">
              <!-- Mini QR Box -->
              <div class="size-[26px] bg-[#f2f2f2] border-[0.5px] border-black rounded-[2px] flex items-center justify-center shrink-0 p-0.5">
                <div class="grid grid-cols-2 gap-0.5 size-full">
                  <div class="bg-black rounded-[0.5px]"></div>
                  <div class="bg-black rounded-[0.5px]"></div>
                  <div class="bg-black rounded-[0.5px]"></div>
                  <div class="bg-transparent"></div>
                </div>
              </div>
              <!-- Mini Text lines -->
              <div class="flex-1 flex flex-col gap-0.5 min-w-0">
                <div class="w-2/3 h-1 bg-black/30 rounded-full" />
                <div class="w-full h-1 bg-black/60 rounded-full" />
              </div>
            </div>
            <!-- Mini Valid For Card -->
            <div class="w-full border-[0.5px] border-[#d4d4d4] rounded-[2px] p-1 flex flex-col gap-0.5 bg-neutral-50/50">
              <div class="flex justify-between items-center w-full">
                <div class="w-1/3 h-1 bg-black/40 rounded-full" />
                <div class="w-1/3 h-1 bg-black/30 rounded-full" />
              </div>
              <div class="w-4/5 h-0.5 bg-black/20 rounded-full" />
            </div>
            <!-- Mini T&C lines -->
            <div class="w-full flex flex-col gap-0.5 pb-0.5">
              <div class="w-1/2 h-1 bg-black/40 rounded-full" />
              <div class="w-full h-0.5 bg-black/20 rounded-full" />
              <div class="w-4/5 h-0.5 bg-black/20 rounded-full" />
            </div>
          </div>
          <p class="font-707 font-normal text-[11px] text-black text-center leading-tight">
            Guest E-Pass
          </p>
        </div>

        <!-- Interactive Card 2: Tennis Court / Sneaker Sizing Grid -->
        <div 
          draggable="true"
          @dragstart="handleDragStart($event, { type: 'RsvpForm', label: 'Sneaker Sizing & Court Selector', customProps: { heading: 'TENNIS COURT RSVP & SIZING' } })"
          @dragend="handleDragEnd"
          @click="addInteractiveWidget('Sneaker Sizing & Court Selector')"
          class="content-stretch flex flex-col gap-[6px] items-center shrink-0 cursor-grab active:cursor-grabbing group"
          title="Drag to canvas or click to add"
        >
          <div class="border border-[#c9c9c9] flex flex-col gap-[8px] h-[130px] items-center justify-center rounded-[8px] shrink-0 w-[84px] bg-white group-hover:border-black transition-colors relative overflow-hidden shadow-sm">
            <div class="bg-[#d9d9d9] h-[64px] rounded-[6px] w-[50px] relative flex flex-col items-center justify-center p-1.5">
              <div class="grid grid-cols-2 gap-1 w-full">
                <div class="bg-[#aaa] rounded-sm size-2.5"></div>
                <div class="bg-[#aaa] rounded-sm size-2.5"></div>
                <div class="bg-[#aaa] rounded-sm size-2.5"></div>
                <div class="bg-[#aaa] rounded-sm size-2.5"></div>
              </div>
            </div>
          </div>
          <p class="font-707 font-normal text-[11px] text-black text-center leading-tight">
            Tennis Court Picker
          </p>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useEditorStore } from '../../stores/editorStore.ts';
import { FIGMA_ASSETS } from '../../constants/figmaAssets.ts';
import type { WidgetType, ModalVariant } from '../../types/editor.ts';
import { 
  User, 
  Mail, 
  Phone, 
  Cake, 
  Users, 
  UserCheck, 
  Instagram, 
  Type, 
  Hash, 
  AlignLeft, 
  MapPin, 
  ChevronDown, 
  Footprints, 
  CheckSquare, 
  CircleDot, 
  ListChecks, 
  Calendar, 
  Clock, 
  Ticket, 
  CalendarCheck,
  LayoutGrid,
  Image as ImageIcon
} from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const editorStore = useEditorStore();

const formTabs = ['Contacts', 'General', 'Dates', 'Scheduling'];
const selectedFormTab = ref('Contacts');

const currentTabFields = computed(() => {
  switch (selectedFormTab.value) {
    case 'General':
      return [
        { name: 'Text Input', icon: Type },
        { name: 'Number', icon: Hash },
        { name: 'Long Text', icon: AlignLeft },
        { name: 'Address', icon: MapPin },
        { name: 'Dropdown', icon: ChevronDown }
      ];
    case 'Dates':
      return [
        { name: 'Birthday', icon: Cake },
        { name: 'Event Date', icon: Calendar },
        { name: 'Countdown', icon: Clock }
      ];
    case 'Scheduling':
      return [
        { name: 'Session Slot', icon: CalendarCheck },
        { name: 'RSVP Pass', icon: Ticket },
        { name: 'Time Window', icon: Clock }
      ];
    case 'Contacts':
    default:
      return [
        { name: 'First Name', icon: User },
        { name: 'Last Name', icon: User },
        { name: 'Email', icon: Mail },
        { name: 'WhatsApp Number', icon: Phone },
        { name: 'National ID / KTP', icon: UserCheck },
        { name: 'Instagram Handle', icon: Instagram }
      ];
  }
});

function handleDragStart(event: DragEvent, item: { type: WidgetType; label?: string; customProps?: Record<string, any> }) {
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'copyMove';
    event.dataTransfer.setData('application/json', JSON.stringify(item));
    event.dataTransfer.setData('text/plain', item.type);
  }
  editorStore.draggedWidget = item;
}

function handleDragEnd() {
  editorStore.draggedWidget = null;
  editorStore.isDraggingOverCanvas = false;
}

function addMediaWidget(ratio: string) {
  editorStore.addMediaBannerWidget(ratio);
}

function addTextWidget() {
  editorStore.addWidget('TextBanner', undefined, { text: '', placeholder: 'WRITE YOUR TEXT HERE' });
}

function addRegistrationFormWidget(templateType: 'registration' | 'contact' | 'waitlist' = 'registration') {
  if (templateType === 'contact') {
    editorStore.addWidget('RegistrationForm', undefined, {
      title: 'RSVP & CONTACT',
      subtitle: 'Please confirm your contact details.',
      titleTypographyStyle: 'heading-3',
      typographyStyle: 'heading-3',
      fields: [
        { id: 'f_fn', name: 'First Name', placeholder: 'First Name*', type: 'text', required: true, value: '' },
        { id: 'f_ln', name: 'Last Name', placeholder: 'Last Name*', type: 'text', required: true, value: '' },
        { id: 'f_em', name: 'Email Address', placeholder: 'Email Address*', type: 'email', required: true, value: '' },
        { id: 'f_wa', name: 'WhatsApp Number', placeholder: 'WhatsApp Number*', type: 'tel', countryCode: '+62', required: true, value: '' }
      ]
    });
  } else if (templateType === 'waitlist') {
    editorStore.addWidget('RegistrationForm', undefined, {
      title: 'JOIN THE WAITLIST',
      subtitle: 'Be the first to know when tickets go live.',
      titleTypographyStyle: 'heading-3',
      typographyStyle: 'heading-3',
      fields: [
        { id: 'f_fn', name: 'First Name', placeholder: 'First Name*', type: 'text', required: true, value: '' },
        { id: 'f_em', name: 'Email Address', placeholder: 'Email Address*', type: 'email', required: true, value: '' },
        { id: 'f_wa', name: 'WhatsApp Number', placeholder: 'WhatsApp Number*', type: 'tel', countryCode: '+62', required: true, value: '' }
      ]
    });
  } else {
    editorStore.addWidget('RegistrationForm', undefined, {
      title: 'REGISTRATION FORM',
      subtitle: 'Fill in your details below to register.',
      titleTypographyStyle: 'heading-3',
      typographyStyle: 'heading-3',
      fields: [
        { id: 'f_fn', name: 'First Name', placeholder: 'First Name*', type: 'text', required: true, value: '' },
        { id: 'f_ln', name: 'Last Name', placeholder: 'Last Name*', type: 'text', required: true, value: '' },
        { id: 'f_em', name: 'Email Address', placeholder: 'Email Address*', type: 'email', required: true, value: '' },
        { id: 'f_wa', name: 'WhatsApp Number', placeholder: 'WhatsApp Number*', type: 'tel', countryCode: '+62', required: true, value: '' },
        { id: 'f_ig', name: 'Instagram Handle', placeholder: 'Instagram Handle*', type: 'text', required: true, value: '' }
      ]
    });
  }
}

function addChoiceWidget(choiceName: string) {
  editorStore.addWidget('MultipleChoice', undefined, getChoiceDefaultProps(choiceName));
}

function getChoiceDefaultProps(choiceName: string) {
  switch (choiceName) {
    case 'Detailed Cards':
    case 'Detailed Card':
    case 'Checkbox':
      return {
        title: 'SELECT ARRIVALS',
        subtitle: 'Choose your preferred attendance day below.',
        variant: 'detailed-card',
        allowMultiple: true,
        required: false,
        showSlotsCapacity: true,
        globalSlotsCapacity: 25,
        selectedValues: [],
        options: [
          {
            id: 'opt_1',
            label: 'Pass Option 1',
            sublabel: '24 Oct 2026',
            description: 'Access to activation area and special event lounge'
          },
          {
            id: 'opt_2',
            label: 'Pass Option 2',
            sublabel: '25 Oct 2026',
            description: 'Access to activation area and special event lounge'
          }
        ]
      };
    case 'Simple Rows':
    case 'Simple Row':
    case 'Radio Group':
      return {
        title: 'SELECT APPAREL SIZE',
        subtitle: 'Choose your preferred size below.',
        variant: 'simple-row',
        allowMultiple: true,
        required: false,
        showSlotsCapacity: true,
        globalSlotsCapacity: 25,
        selectedValues: [],
        options: [
          { id: 'opt_1', label: 'S' },
          { id: 'opt_2', label: 'M' },
          { id: 'opt_3', label: 'L' }
        ]
      };
    case 'Horizontal Blocks':
    case 'Horizontal Block':
    case 'Sneaker Size':
      return {
        title: 'SELECT YOUR SESSIONS',
        subtitle: 'Choose your preferred sessions below.',
        variant: 'horizontal-block',
        allowMultiple: true,
        required: false,
        selectedValues: [],
        options: [
          { id: 'opt_1', label: 'Morning' },
          { id: 'opt_2', label: 'Afternoon' }
        ]
      };
    case 'Image Matrix':
    case 'Image Grid':
    case 'Multi Choice':
    default:
      return {
        title: 'SELECT YOUR MODEL',
        subtitle: 'Choose your preferred model below.',
        variant: 'image-grid',
        gridColumns: 4,
        allowMultiple: true,
        required: false,
        selectedValues: [],
        options: [
          { id: 'opt_1', label: 'Model 01', imageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=300&q=80' },
          { id: 'opt_2', label: 'Model 02', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80' },
          { id: 'opt_3', label: 'Model 03', imageUrl: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=300&q=80' }
        ]
      };
  }
}

function handleFieldDragStart(event: DragEvent, fieldName: string) {
  if (fieldName === 'RSVP Pass') {
    handleDragStart(event, {
      type: 'GuestEPass',
      label: 'Guest E-Pass',
      customProps: getEPassDefaultProps()
    });
  } else if (selectedFormTab.value === 'Choices') {
    handleDragStart(event, {
      type: 'MultipleChoice',
      label: fieldName,
      customProps: getChoiceDefaultProps(fieldName)
    });
  } else {
    handleDragStart(event, {
      type: 'FieldInput',
      label: fieldName,
      customProps: getFieldDefaultProps(fieldName)
    });
  }
}

function getEPassDefaultProps() {
  return {
    venue: '',
    guestNameFallback: '',
    validForFallback: [
      { id: 'opt_1', label: '[PASS OPTION 1]', sublabel: '[DATE FORMAT]', description: '[EVENT DESCRIPTION OR SESSION DETAILS]' },
      { id: 'opt_2', label: '[PASS OPTION 2]', sublabel: '[DATE FORMAT]', description: '[EVENT DESCRIPTION OR SESSION DETAILS]' }
    ]
  };
}

function getFieldDefaultProps(fieldName: string) {
  const isEmail = fieldName.toLowerCase().includes('email');
  const isWa = fieldName.toLowerCase().includes('whatsapp') || fieldName.toLowerCase().includes('phone');
  const label = fieldName;
  const placeholder = `${fieldName}*`;
  return {
    label,
    placeholder,
    value: '',
    required: true,
    countryCode: isWa ? '+62' : undefined,
    inputType: isEmail ? 'email' : (isWa ? 'tel' : 'text'),
    stateVariant: 'Default',
    errorMessage: isEmail 
      ? 'Please enter a valid email address with @domain (e.g. name@domain.com).' 
      : (isWa ? 'Please enter a valid WhatsApp number.' : `Please enter your ${fieldName.toLowerCase()}.`),
    showError: false
  };
}

function addFormField(fieldName: string) {
  if (fieldName === 'RSVP Pass') {
    addEPassWidget();
  } else if (selectedFormTab.value === 'Choices') {
    editorStore.addWidget('MultipleChoice', undefined, getChoiceDefaultProps(fieldName));
  } else {
    editorStore.addWidget('FieldInput', undefined, getFieldDefaultProps(fieldName));
  }
}

function addActionButton(variant: 'black' | 'white' = 'black') {
  editorStore.addWidget('ActionButton', undefined, {
    label: 'BUTTON CTA',
    variant: variant,
    actionType: 'submit',
    url: '',
    height: 48
  });
}

function addEPassWidget() {
  const check = editorStore.canAddWidget('GuestEPass');
  if (!check.allowed) {
    if (check.reason) editorStore.showToast(check.reason);
    return;
  }
  const widget = editorStore.addWidget('GuestEPass', undefined, getEPassDefaultProps());
  if (widget) {
    editorStore.openEPassSidebar();
  }
}

function addInteractiveWidget(name: string) {
  editorStore.addWidget('RsvpForm', undefined, { heading: name.toUpperCase() });
}

function addOverlayWidget(type: string) {
  editorStore.addWidget('RulesAccordion', undefined, { title: `${type.toUpperCase()} RULES` });
}
</script>
