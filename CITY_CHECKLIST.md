# Canair — realism worklist

Target: believable near-future metropolis, with open streets, on Galaxy S24 Ultra.
GTA is a visual reference, not an achieved quality claim.

## Implemented foundations
- [x] Metropolitan grid and varied building silhouettes
- [x] Open exploration, indexed building podium contacts
- [x] Higgsfield asphalt, limestone, facade, grass and bark
- [x] World-scale mapping, local building shadows
- [x] Central garden, street furniture and southern quay

## Current pass
- [x] Civic plaza with animated fountain and accessible circulation
- [x] Architectural pavilion and meaningful monument placement
- [x] Distinct glass office district with curtain-wall material
- [x] Reflective sky environment for glass and metal
- [x] Plaza seating and deduplicated resource cleanup
- [ ] Build, contact tests, scene geometry checks, deployment

## Required before calling the city realistic or finished
- [ ] Live GPU screenshot review at street height
- [ ] Physical S24 Ultra frame-time and memory measurements
- [ ] Individually authored hero buildings and realistic tree assets
- [ ] Animated pedestrians with sidewalks and avoidance
- [ ] Fine material roughness/normal maps and facade depth
- [ ] District-specific storefronts, signage, service entrances
- [ ] Natural coast, terrain transition, waterfront access
- [ ] Continuous exploration UI and city map
- [ ] LOD and streaming appropriate to measured device limits

No task is marked visually verified on the basis of a build or unit test.

Browser verification is currently blocked by Vercel login in the agent browser.

## Architectural reference pass — 19 September
- [x] Six Higgsfield references: classic residence, bronze office, terraced hotel,
  terracotta atelier, bay-window residence, covered market
- [x] Six reusable modeled facade designs on eligible circuit buildings
- [x] Secondary-lot thresholds, canopies, planters and residential terrace rails
- [x] Spatially batched circuit details for frustum culling
- [x] Model/reference comparison page at /architecture.html
- [x] Reproducible coordinate registry: CITY_ARCHITECTURE_PROGRESS.json
- [ ] Individual art-direction and image comparison for each route building
- [ ] Unique landmark silhouettes and bespoke businesses beyond Red Fox
- [ ] Replace secondary-lot facade imagery with detailed architectural models
- [ ] Furnish visible rooms beyond Red Fox (most new glazing is opaque)
- [ ] GPU/phone review, measured LOD tuning, texture/lighting refinement

This pass applies six architectural families; it is not a completed bespoke
reconstruction of every building, nor a photoreal match to the generated photos.

## Authored places — Mawhet Roset and Lube Tone
- [x] Separate Higgsfield references, derived from the available chapters
- [x] Replace landmark proxy boxes and old floating labels
- [x] Mawhet Roset: breakfast room, furnished bedroom bays and small balconies
- [x] Lube Tone: bronze canopy, glazed music room, tables, stage and instruments
- [x] Footprints checked against grid roads and race corridor
- [x] Shared game/review models selectable in architecture.html
- [ ] Visual verification, side-elevation refinement and material detail

Chapter 2 supplies the modest lodging and room contents; chapter 5 supplies
Lube Tone's upscale music setting. Facade styling is proposed game art direction.
Interiors are visual scenery; pedestrians, entering rooms, music and service
interactions are not implemented by this pass.
