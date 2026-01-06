---
"@neiropacks/ink-mouse": patch
---

Optimize hover state tracking with bounds caching. Refactor to use unified caching mechanism for all mouse events, reducing `getBoundingClientRect()` calls by up to 60x. Removes ~60 lines of code by eliminating handler grouping logic.
