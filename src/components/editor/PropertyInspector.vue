<template>
  <aside class="w-80 bg-[#121316] border-l border-[#23262d] flex flex-col select-none z-20">
    <div class="p-3 border-b border-[#23262d] flex items-center justify-between bg-[#0e0f12]">
      <div class="flex items-center gap-2">
        <Sliders class="w-4 h-4 text-white" />
        <span class="text-xs font-bold uppercase tracking-wider text-white">Inspector</span>
      </div>
      <span v-if="editorStore.selectedWidget" class="text-[10px] font-mono bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded">
        {{ editorStore.selectedWidget.type }}
      </span>
    </div>

    <!-- Inspector Content -->
    <div v-if="editorStore.selectedWidget" class="flex-1 overflow-y-auto p-4 space-y-5">
      <!-- 1. HeroDrop Inspector -->
      <div v-if="editorStore.selectedWidget.type === 'HeroDrop'" class="space-y-3">
        <div>
          <label class="block text-[11px] font-mono text-neutral-400 uppercase mb-1">Title</label>
          <input 
            v-model="editorStore.selectedWidget.props.title"
            class="w-full bg-[#181a1f] border border-[#2c303a] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white transition-colors"
          />
        </div>
        <div>
          <label class="block text-[11px] font-mono text-neutral-400 uppercase mb-1">Subtitle / Release Info</label>
          <input 
            v-model="editorStore.selectedWidget.props.subtitle"
            class="w-full bg-[#181a1f] border border-[#2c303a] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white transition-colors"
          />
        </div>
        <div>
          <label class="block text-[11px] font-mono text-neutral-400 uppercase mb-1">Badge Tag</label>
          <input 
            v-model="editorStore.selectedWidget.props.badge"
            class="w-full bg-[#181a1f] border border-[#2c303a] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white transition-colors"
          />
        </div>
        <div>
          <label class="block text-[11px] font-mono text-neutral-400 uppercase mb-1">Hero Image URL</label>
          <input 
            v-model="editorStore.selectedWidget.props.imageUrl"
            class="w-full bg-[#181a1f] border border-[#2c303a] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white transition-colors font-mono"
          />
        </div>
      </div>

      <!-- 2. CountdownTimer Inspector -->
      <div v-else-if="editorStore.selectedWidget.type === 'CountdownTimer'" class="space-y-3">
        <div>
          <label class="block text-[11px] font-mono text-neutral-400 uppercase mb-1">Timer Header Label</label>
          <input 
            v-model="editorStore.selectedWidget.props.label"
            class="w-full bg-[#181a1f] border border-[#2c303a] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white transition-colors"
          />
        </div>
        <div>
          <label class="block text-[11px] font-mono text-neutral-400 uppercase mb-1">Target End Timestamp</label>
          <input 
            v-model="editorStore.selectedWidget.props.targetDate"
            class="w-full bg-[#181a1f] border border-[#2c303a] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white transition-colors font-mono"
          />
        </div>
      </div>

      <!-- 3. RaffleForm Inspector -->
      <div v-else-if="editorStore.selectedWidget.type === 'RaffleForm'" class="space-y-3">
        <div>
          <label class="block text-[11px] font-mono text-neutral-400 uppercase mb-1">Heading</label>
          <input 
            v-model="editorStore.selectedWidget.props.heading"
            class="w-full bg-[#181a1f] border border-[#2c303a] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white transition-colors"
          />
        </div>
        <div>
          <label class="block text-[11px] font-mono text-neutral-400 uppercase mb-1">Size System</label>
          <select 
            v-model="editorStore.selectedWidget.props.sizeSystem"
            class="w-full bg-[#181a1f] border border-[#2c303a] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white transition-colors"
          >
            <option value="US Mens">US Mens</option>
            <option value="US Womens">US Womens</option>
            <option value="UK">UK</option>
            <option value="EU">EU</option>
            <option value="CM / JP">CM / JP</option>
          </select>
        </div>
        <div>
          <label class="block text-[11px] font-mono text-neutral-400 uppercase mb-1">Button CTA Label</label>
          <input 
            v-model="editorStore.selectedWidget.props.ctaLabel"
            class="w-full bg-[#181a1f] border border-[#2c303a] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white transition-colors"
          />
        </div>
        <div class="pt-2 border-t border-[#232730] space-y-2">
          <label class="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
            <input type="checkbox" v-model="editorStore.selectedWidget.props.requireInstagram" class="rounded accent-white" />
            Require Instagram Handle
          </label>
          <label class="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
            <input type="checkbox" v-model="editorStore.selectedWidget.props.requirePhone" class="rounded accent-white" />
            Require WhatsApp Phone Number
          </label>
        </div>
      </div>

      <!-- 4. LocationCard Inspector -->
      <div v-else-if="editorStore.selectedWidget.type === 'LocationCard'" class="space-y-3">
        <div>
          <label class="block text-[11px] font-mono text-neutral-400 uppercase mb-1">Venue Name</label>
          <input 
            v-model="editorStore.selectedWidget.props.venueName"
            class="w-full bg-[#181a1f] border border-[#2c303a] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white transition-colors"
          />
        </div>
        <div>
          <label class="block text-[11px] font-mono text-neutral-400 uppercase mb-1">Address Details</label>
          <textarea 
            v-model="editorStore.selectedWidget.props.address"
            rows="2"
            class="w-full bg-[#181a1f] border border-[#2c303a] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white transition-colors"
          ></textarea>
        </div>
      </div>

      <!-- 5. TextBanner Inspector -->
      <div v-else-if="editorStore.selectedWidget.type === 'TextBanner'" class="space-y-3">
        <div>
          <label class="block text-[11px] font-mono text-neutral-400 uppercase mb-1">Text Content</label>
          <textarea 
            v-model="editorStore.selectedWidget.props.text"
            rows="3"
            placeholder="Type your text here..."
            class="w-full bg-[#181a1f] border border-[#2c303a] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white transition-colors font-707"
          ></textarea>
        </div>
        <div>
          <label class="block text-[11px] font-mono text-neutral-400 uppercase mb-1">Text Alignment</label>
          <div class="grid grid-cols-3 gap-1">
            <button 
              type="button"
              @click="editorStore.selectedWidget.props.textAlign = 'left'"
              :class="editorStore.selectedWidget.props.textAlign === 'left' || !editorStore.selectedWidget.props.textAlign ? 'bg-white text-black' : 'bg-[#181a1f] text-neutral-400'"
              class="py-1 text-xs rounded border border-[#2c303a] font-medium cursor-pointer"
            >Left</button>
            <button 
              type="button"
              @click="editorStore.selectedWidget.props.textAlign = 'center'"
              :class="editorStore.selectedWidget.props.textAlign === 'center' ? 'bg-white text-black' : 'bg-[#181a1f] text-neutral-400'"
              class="py-1 text-xs rounded border border-[#2c303a] font-medium cursor-pointer"
            >Center</button>
            <button 
              type="button"
              @click="editorStore.selectedWidget.props.textAlign = 'right'"
              :class="editorStore.selectedWidget.props.textAlign === 'right' ? 'bg-white text-black' : 'bg-[#181a1f] text-neutral-400'"
              class="py-1 text-xs rounded border border-[#2c303a] font-medium cursor-pointer"
            >Right</button>
          </div>
        </div>
      </div>

      <!-- 6. FieldInput Inspector (Figma Node 236:11400) -->
      <div v-else-if="editorStore.selectedWidget.type === 'FieldInput'" class="space-y-3">
        <div>
          <label class="block text-[11px] font-mono text-neutral-400 uppercase mb-1">State Variant (Figma)</label>
          <div class="grid grid-cols-2 gap-1.5">
            <button 
              type="button"
              @click="setFieldVariant('Default')"
              :class="editorStore.selectedWidget.props.stateVariant === 'Default' || !editorStore.selectedWidget.props.stateVariant ? 'bg-white text-black font-semibold' : 'bg-[#181a1f] text-neutral-400 hover:text-white'"
              class="py-1.5 px-2 text-[11px] rounded border border-[#2c303a] font-mono cursor-pointer transition-colors"
            >Default</button>
            <button 
              type="button"
              @click="setFieldVariant('Input')"
              :class="editorStore.selectedWidget.props.stateVariant === 'Input' ? 'bg-white text-black font-semibold' : 'bg-[#181a1f] text-neutral-400 hover:text-white'"
              class="py-1.5 px-2 text-[11px] rounded border border-[#2c303a] font-mono cursor-pointer transition-colors"
            >User Input</button>
            <button 
              type="button"
              @click="setFieldVariant('Wrong alert')"
              :class="editorStore.selectedWidget.props.stateVariant === 'Wrong alert' ? 'bg-[#9b0707] text-white font-semibold' : 'bg-[#181a1f] text-neutral-400 hover:text-white'"
              class="py-1.5 px-2 text-[11px] rounded border border-[#2c303a] font-mono cursor-pointer transition-colors"
            >Wrong Alert</button>
            <button 
              type="button"
              @click="setFieldVariant('Wrong')"
              :class="editorStore.selectedWidget.props.stateVariant === 'Wrong' ? 'bg-[#9b0707] text-white font-semibold' : 'bg-[#181a1f] text-neutral-400 hover:text-white'"
              class="py-1.5 px-2 text-[11px] rounded border border-[#2c303a] font-mono cursor-pointer transition-colors"
            >Wrong + Msg</button>
          </div>
        </div>
        <div>
          <label class="block text-[11px] font-mono text-neutral-400 uppercase mb-1">Field Label</label>
          <input 
            v-model="editorStore.selectedWidget.props.label"
            class="w-full bg-[#181a1f] border border-[#2c303a] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white transition-colors"
          />
        </div>
        <div>
          <label class="block text-[11px] font-mono text-neutral-400 uppercase mb-1">Placeholder</label>
          <input 
            v-model="editorStore.selectedWidget.props.placeholder"
            class="w-full bg-[#181a1f] border border-[#2c303a] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white transition-colors"
          />
        </div>
        <div>
          <label class="block text-[11px] font-mono text-neutral-400 uppercase mb-1">Current Value</label>
          <input 
            v-model="editorStore.selectedWidget.props.value"
            class="w-full bg-[#181a1f] border border-[#2c303a] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white transition-colors font-mono"
          />
        </div>
        <div v-if="editorStore.selectedWidget.props.inputType === 'tel' || (editorStore.selectedWidget.props.label && editorStore.selectedWidget.props.label.toLowerCase().includes('whatsapp')) || editorStore.selectedWidget.props.countryCode">
          <label class="block text-[11px] font-mono text-neutral-400 uppercase mb-1">Country Calling Code</label>
          <input 
            v-model="editorStore.selectedWidget.props.countryCode"
            placeholder="+62"
            class="w-full bg-[#181a1f] border border-[#2c303a] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white transition-colors font-mono"
          />
        </div>
        <div>
          <label class="block text-[11px] font-mono text-neutral-400 uppercase mb-1">Error Message Helper</label>
          <input 
            v-model="editorStore.selectedWidget.props.errorMessage"
            class="w-full bg-[#181a1f] border border-[#2c303a] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white transition-colors text-[#ff7373]"
          />
        </div>
        <div class="pt-2 border-t border-[#232730]">
          <label class="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
            <input type="checkbox" v-model="editorStore.selectedWidget.props.required" class="rounded accent-white" />
            Required Field (*)
          </label>
        </div>
      </div>
      <!-- 7. ActionButton Inspector (Figma Node 244:11560) -->
      <div v-else-if="editorStore.selectedWidget.type === 'ActionButton'" class="space-y-3">
        <div>
          <label class="block text-[11px] font-mono text-neutral-400 uppercase mb-1">Button Variant</label>
          <div class="grid grid-cols-3 gap-1.5">
            <button 
              type="button"
              @click="editorStore.selectedWidget.props.variant = 'black'"
              :class="editorStore.selectedWidget.props.variant === 'black' || !editorStore.selectedWidget.props.variant ? 'bg-white text-black font-semibold' : 'bg-[#181a1f] text-neutral-400 hover:text-white'"
              class="py-1.5 px-2 text-[11px] rounded border border-[#2c303a] font-mono cursor-pointer transition-colors"
            >Black</button>
            <button 
              type="button"
              @click="editorStore.selectedWidget.props.variant = 'white'"
              :class="editorStore.selectedWidget.props.variant === 'white' ? 'bg-white text-black font-semibold' : 'bg-[#181a1f] text-neutral-400 hover:text-white'"
              class="py-1.5 px-2 text-[11px] rounded border border-[#2c303a] font-mono cursor-pointer transition-colors"
            >White</button>
            <button 
              type="button"
              @click="editorStore.selectedWidget.props.variant = 'grey'"
              :class="editorStore.selectedWidget.props.variant === 'grey' ? 'bg-white text-black font-semibold' : 'bg-[#181a1f] text-neutral-400 hover:text-white'"
              class="py-1.5 px-2 text-[11px] rounded border border-[#2c303a] font-mono cursor-pointer transition-colors"
            >Grey</button>
          </div>
        </div>
        <div>
          <label class="block text-[11px] font-mono text-neutral-400 uppercase mb-1">Button Text</label>
          <input 
            v-model="editorStore.selectedWidget.props.label"
            class="w-full bg-[#181a1f] border border-[#2c303a] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white transition-colors uppercase font-medium"
            placeholder="BUTTON CTA"
          />
        </div>
        <div>
          <label class="block text-[11px] font-mono text-neutral-400 uppercase mb-1">Action Type</label>
          <select 
            v-model="editorStore.selectedWidget.props.actionType"
            class="w-full bg-[#181a1f] border border-[#2c303a] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white transition-colors"
          >
            <option value="submit">Submit Form</option>
            <option value="link">Open Link (URL)</option>
            <option value="modal">Open Modal / Popup</option>
            <option value="scroll">Scroll to Block</option>
          </select>
        </div>
        <div v-if="editorStore.selectedWidget.props.actionType === 'link'">
          <label class="block text-[11px] font-mono text-neutral-400 uppercase mb-1">Destination URL</label>
          <input 
            v-model="editorStore.selectedWidget.props.url"
            class="w-full bg-[#181a1f] border border-[#2c303a] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white transition-colors font-mono"
            placeholder="https://..."
          />
        </div>
        <div class="pt-2 border-t border-[#232730] space-y-2">
          <label class="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
            <input type="checkbox" v-model="editorStore.selectedWidget.props.showIcon" class="rounded accent-white" />
            Show Leading Icon
          </label>
        </div>
      </div>
      <!-- Block Actions -->
      <div class="pt-4 border-t border-[#232730]">
        <button 
          @click="editorStore.removeWidget(editorStore.selectedWidget.id)"
          class="w-full py-2 px-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <Trash2 class="w-3.5 h-3.5" /> Remove Block
        </button>
      </div>
    </div>

    <!-- Empty State when no widget selected -->
    <div v-else class="flex-1 p-6 text-center text-neutral-500 flex flex-col items-center justify-center">
      <Layers class="w-8 h-8 mb-2 opacity-40" />
      <div class="text-xs font-medium text-neutral-400">No Block Selected</div>
      <div class="text-[11px] mt-1 text-neutral-500">Click any block in the mobile preview to inspect and modify properties.</div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useEditorStore } from '../../stores/editorStore.ts';
import { Sliders, Layers, Trash2 } from 'lucide-vue-next';

const editorStore = useEditorStore();

function setFieldVariant(variant: 'Default' | 'Input' | 'Wrong alert' | 'Wrong') {
  if (!editorStore.selectedWidget) return;
  editorStore.selectedWidget.props.stateVariant = variant;
  if (variant === 'Default') {
    editorStore.selectedWidget.props.value = '';
    editorStore.selectedWidget.props.showError = false;
  } else if (variant === 'Input') {
    if (!editorStore.selectedWidget.props.value || !editorStore.selectedWidget.props.value.includes('@')) {
      editorStore.selectedWidget.props.value = 'lioviani@gmail.com';
    }
    editorStore.selectedWidget.props.showError = false;
  } else if (variant === 'Wrong alert') {
    editorStore.selectedWidget.props.value = 'lioviani@gmail';
    editorStore.selectedWidget.props.errorMessage = 'Please enter a valid email address with @domain (e.g. name@domain.com).';
    editorStore.selectedWidget.props.showError = true;
  } else if (variant === 'Wrong') {
    editorStore.selectedWidget.props.value = 'lioviani@gmail';
    editorStore.selectedWidget.props.errorMessage = 'Please enter a valid email address with @domain (e.g. name@domain.com).';
    editorStore.selectedWidget.props.showError = true;
  }
}
</script>
