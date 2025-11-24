# Lab Common Components

Shared components for all security lab interfaces.

## Components

### 1. **LabAnimations**
CSS animations for pipeline flow effects.
- `animate-flow-right`: Horizontal pulsing animation
- `animate-flow-down`: Vertical pulsing animation

Usage:
```tsx
<LabAnimations />
```

### 2. **StageHeader**
Section headers for pipeline stages.

Props:
- `number`: Stage number (1, 2, 3)
- `title`: Stage title
- `color`: 'neutral' | 'red' | 'emerald' (default: 'neutral')

Usage:
```tsx
<StageHeader number={1} title="Input Stream" />
<StageHeader number={3} title="Output" color="emerald" />
```

### 3. **PipelineConnector**
Animated arrows connecting pipeline stages.

**FIXED:** Arrow now properly centers vertically with column heights using `h-full` and `top-1/2 -translate-y-1/2` positioning.

Props:
- `active`: boolean - whether the connection is active
- `pulsing`: boolean - whether to show pulsing animation

Usage:
```tsx
<PipelineConnector active={true} pulsing={true} />
```

### 4. **SecurityGate**
Interactive security defense toggles with tooltips.

Props:
- `label`: Gate name
- `description`: Short description
- `tooltip`: Optional detailed explanation
- `isActive`: boolean - whether gate is enabled
- `isTriggered`: boolean - whether gate caught an attack
- `onToggle`: () => void - toggle handler
- `icon`: Tabler icon component

Usage:
```tsx
<SecurityGate
  label="Input Filter"
  description="Detect malicious patterns"
  tooltip="Scans user input for known attack patterns..."
  isActive={defenses.inputFilter}
  isTriggered={result.defenseTriggered === 'Input Filter'}
  onToggle={() => toggleDefense('inputFilter')}
  icon={IconFilter}
/>
```

## Arrow Centering Fix

The PipelineConnector now uses:
- Outer wrapper: Standard flex with `items-center` for mobile centering
- Desktop inner div: `h-full` to match parent height from `lg:items-stretch`
- All elements: `top-1/2 -translate-y-1/2` for perfect vertical centering

This ensures arrows are always centered in the middle of the tallest column's height.

## Usage in Labs

Import all components:
```tsx
import { 
  LabAnimations, 
  StageHeader, 
  PipelineConnector, 
  SecurityGate 
} from '@/components/ui/lab-common';
```

Layout structure:
```tsx
<div className="not-prose ...">
  <LabAnimations />
  
  <div className="flex flex-col lg:flex-row lg:items-stretch">
    {/* Stage 1 */}
    <div className="flex-1 min-w-0 flex flex-col">
      <StageHeader number={1} title="Input" />
      {/* content */}
    </div>
    
    <PipelineConnector active={true} pulsing={true} />
    
    {/* Stage 2 */}
    <div className="flex-1 min-w-0 flex flex-col">
      <StageHeader number={2} title="Security Gates" />
      <div className="gap-3 flex-1 flex flex-col justify-between">
        <SecurityGate {...props} />
      </div>
    </div>
    
    <PipelineConnector active={result.activeDefenseCount > 0} />
    
    {/* Stage 3 */}
    <div className="flex-1 min-w-0 flex flex-col">
      <StageHeader number={3} title="Output" color="emerald" />
      {/* content */}
    </div>
  </div>
</div>
```
