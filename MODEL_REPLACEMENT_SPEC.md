# Camera Model Replacement Specification

## Executive Summary
Replace the current `camera.glb` model with `scene (5).glb` in the Three.js-based landing page. This specification outlines the migration path, compatibility considerations, and implementation steps required to ensure seamless model swapping while maintaining all interactive features and animations.

---

## Current Implementation Context

### Model Usage Location
- **File**: `components/three-viewer.tsx`
- **Component**: `CameraModel` (lines 97-149)
- **Loading Method**: `useGLTF("/assets/camera.glb")` from @react-three/drei

### Current Model Characteristics
**File**: `/assets/camera.glb`
**Current Features**:
- Canon camera product model with detailed lens assembly
- Contains 16 named mesh objects for lens explosion animation
- Supports scroll-triggered lens component separation effect
- Optimized with HDR environment lighting (`/assets/environment.hdr`)
- Integrated post-processing effects (SSAO, Bloom, Tone Mapping)

### Lens Objects for Animation
The model includes these named components that trigger on "Autofocus" section scroll:
```
Circle002, +Sphere001001, new, +Plane008001, +SideButtons001, Rings2001, 
+Rings1001, +Circle003001, +Sphere003001, +Circle001001, Text001, 
Plane006001, +Plane005001, +Sphere001, +Cylinder001, +BODY044001
```

---

## New Model Specification

### New Model Details
**File Name**: `scene (5).glb`
**Source**: https://hebbkx1anhila5yf.public.blob.vercel-storage.com/scene%20%285%29-2nTwVoUsoawgiC9gaNKDngUWmtis5q.glb
**Target Location**: `/public/assets/scene.glb` (renamed for consistency)

---

## Critical Compatibility Considerations

### 1. **Mesh Object Naming**
**Requirement**: The new model must have identifiable mesh objects for the lens explosion effect.
- **Current State**: 16 lens components with specific names
- **New Model Action Required**:
  - Inspect the `scene (5).glb` structure using Three.js DevTools or console logging
  - Identify equivalent component names in the new model
  - Update `LENS_OBJECT_NAMES` array if object names differ (lines 25-42)
  - If fewer lens components exist, reduce the array accordingly

### 2. **Model Scale and Positioning**
- **Current**: Optimized for viewport visibility at specific camera positions
- **New Model Action Required**:
  - Verify model scale matches current expectations
  - Adjust camera positions in scroll animation if model dimensions differ
  - Update `cameraState` positions if needed (check scroll trigger offsets)

### 3. **Animation State Initialization**
- **Current**: Lens objects default to visible with z-position at startPos
- **New Model Action Required**:
  - Ensure all target objects have valid position properties
  - Verify position properties are numeric (not constrained by model)

### 4. **Lighting Compatibility**
- **Current Lights**: 
  - Ambient light (intensity: 0.3)
  - Directional lights at [5,5,5] and [-5,3,-5]
  - HDR environment map
- **Action**: Test lighting after model replacement; adjust intensities if needed

---

## Implementation Steps

### Phase 1: Asset Preparation
1. Download `scene (5).glb` from provided URL
2. Rename to `scene.glb` for consistency with naming conventions
3. Copy to `/public/assets/scene.glb`
4. Verify file integrity and size

### Phase 2: Model Inspection
1. Add temporary console logging to identify mesh object names:
   ```typescript
   scene.traverse((child) => {
     if (child.isMesh) console.log("[v0] Mesh:", child.name);
   });
   ```
2. Document all mesh object names and positions
3. Compare with current `LENS_OBJECT_NAMES` array

### Phase 3: Code Updates
1. Update `useGLTF` path from `/assets/camera.glb` to `/assets/scene.glb`
2. Update `LENS_OBJECT_NAMES` array based on inspection (if needed)
3. Test lens explosion animation on "Autofocus" section scroll
4. Verify model appears correctly at all viewport sizes

### Phase 4: Animation Adjustment
1. Verify scroll trigger positions work with new model
2. Adjust camera positions if model scale differs significantly
3. Test all scroll animation states (Hero, Performance, Power, Autofocus, Explore)

### Phase 5: Quality Assurance
1. Desktop testing (Chrome, Firefox, Safari)
2. Mobile testing (iOS Safari, Android Chrome)
3. Verify loader appears while model downloads
4. Test explore mode (OrbitControls) with new model
5. Validate lighting and post-processing effects

---

## Rollback Plan
If compatibility issues arise:
1. Revert `useGLTF` path to `/assets/camera.glb`
2. Revert `LENS_OBJECT_NAMES` array changes
3. Investigate model structure and adjust implementation as needed

---

## Success Criteria
- ✅ Model loads without console errors
- ✅ Lens explosion animation works smoothly
- ✅ Camera scroll animations trigger correctly
- ✅ Explore mode (OrbitControls) functions properly
- ✅ Post-processing effects render correctly
- ✅ Responsive on mobile and desktop
- ✅ No performance degradation vs. original model

---

## Affected Files Summary
| File | Changes | Priority |
|------|---------|----------|
| `/public/assets/scene.glb` | Add new model | High |
| `components/three-viewer.tsx` | Update model path + object names | High |
| `components/three-viewer.tsx` (line 776) | Update preload path | Medium |
| Camera positions (if scale differs) | Adjust values | Low |

