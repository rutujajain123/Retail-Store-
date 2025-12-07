# 🎬 Row Pop Effect - Visual Guide

## Animation Sequence

### Initial State
```
┌───────────────────────────────────┐
│ Transaction ID │ Date │ Customer  │  ← Normal, clickable row
├───────────────────────────────────┤
│ TXN001        │ 2025-01-15        │
├───────────────────────────────────┤
│ TXN002        │ 2025-01-14        │ ← User clicks here
└───────────────────────────────────┘
```

### Stage 1: Click Detected (0%)
```
Animation starts
Row state: Normal
Transform: scale(1) translateY(0)
Opacity: 1

Visual:
┌───────────────────────────────────┐
│ TXN002  (selected)                │  ← Ready to pop
└───────────────────────────────────┘
```

### Stage 2: Midpoint Pop (50%)
```
Animation: Halfway through
Row state: Expanding upward
Transform: scale(1.05) translateY(-10px)
Opacity: 1

Visual:
         ┌───────────────────────────────────┐
         │ TXN002  (expanded, lifted)       │  ← Slightly larger, elevated
         └───────────────────────────────────┘
         
(Row grows 5% larger and rises 10px)
```

### Stage 3: Completion (100%)
```
Animation: Complete
Row state: Disappeared
Transform: scale(0.8) translateY(-100px)
Opacity: 0

Visual:
                  ↑ Row flies away while shrinking
                  │ and fading out


                  
(Row shrinks to 80% and rises 100px, completely transparent)
```

---

## 🎯 Effect Properties

```
Duration:  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
           0────────────0.6s

Easing:    ╱─╲       cubic-bezier(0.34, 1.56, 0.64, 1)
           (bouncy elastic curve)

Motion:    ▶ Horizontal: None (straight up)
           ▼ Vertical: 100px upward
           ◄ Scale: 1.0 → 1.05 → 0.8 (expand then shrink)
           ◄ Fade: 1.0 → 1.0 → 0.0 (stays visible then fades)
```

---

## 📊 Timeline Breakdown

```
Time(ms)   0%      25%      50%      75%      100%
           │       │        │        │        │
           0       150      300      450      600
           │       │        │        │        │
Scale:     1.0 → 1.01 → 1.05 → 0.95 → 0.8
           │       │        │        │        │
Y-Pos:     0px ──→ -5px ──→ -10px ──→ -75px ──→ -100px
           │       │        │        │        │
Opacity:   1.0 → 1.0 → 1.0 → 0.5 → 0.0
           │       │        │        │        │
Status:   READY  EXPAND  PEAK   SHRINK  GONE
```

---

## 💫 Animation Curve

```
Vertical Position Over Time
                    
  0 px ▄─────────────
      │              ╲
 -20 px│              ╲
      │               ╲
 -40 px│                ╲
      │                 ╲─╲
 -60 px│                   ╲
      │                     ╲
 -80 px│                      ╲
      │                        ╲
-100 px└────────────────────────╲─
       0    150   300   450   600ms

Opacity Over Time

  100% ┌─────────────┐
       │              ╲
   50% │               ╲
       │                ╲
    0% └─────────────────╲
       0    150   300   450   600ms

Scale Over Time

 110% ─╖
      ╒┴╖
 100% ┤  ╲
      │   ╲
  90% │    ╲
      │     ╲
  80% └──────╲─
       0    150   300   450   600ms
```

---

## 🎮 User Interaction

### Click to Pop Flow

```
1. USER HOVERS ROW
   ↓
   Cursor changes to pointer ⬍
   Row has slight hover effect
   
2. USER CLICKS ROW
   ↓
   Event triggered
   handleRowPop(rowId) called
   poppingRow state updated
   
3. ANIMATION PLAYS (0.6s)
   ↓
   Row expands (1.05x)
   Row lifts up (-10px)
   Row shrinks back to 0.8x
   Row moves up (-100px total)
   Row fades out
   
4. ANIMATION COMPLETE
   ↓
   State resets
   Row disappears from view
   Ready for next interaction
```

---

## 🎨 Visual Representation

### Before Click
```
╔════════════════════════════════════╗
║ TABLE ROW (clickable)              ║
║ ┌────────────────────────────────┐ ║
║ │ TXN001 │ 2025-01-15 │ John    │ ║
║ │ TXN002 │ 2025-01-14 │ Jane    │ ║  ← Click here
║ │ TXN003 │ 2025-01-13 │ Bob     │ ║
║ └────────────────────────────────┘ ║
╚════════════════════════════════════╝
```

### Click Animation Sequence
```
Frame 1 (0ms):        Frame 2 (150ms):      Frame 3 (300ms):
Normal size           Slightly expanded     Peak lift
  ┌──────────┐          ┌──────────┐                
  │TXN002    │          │TXN002    │        ┌──────────┐
  └──────────┘          └──────────┘        │TXN002    │
  Scale: 1.0x           Scale: 1.02x        └──────────┘
                        Lift: -5px          Scale: 1.05x
                        Opacity: 1.0        Lift: -10px

Frame 4 (450ms):      Frame 5 (600ms):
Shrinking             Disappeared
     ┌──────────┐
     │TXN002    │
     └──────────┘
     Scale: 0.95x
     Lift: -75px
     Opacity: 0.5              (gone)
                               Opacity: 0
```

---

## 🔊 Interactive Feedback

### Cursor State
```
Normal Row:  Cursor → ⬍ (pointer/hand)
Hovering:    Slight visual highlight
Clicked:     Animation plays immediately
```

### Visual Feedback Timeline
```
0 ms    ┤ Click detected
        │ Animation starts
        │ Row starts expanding
        │
100 ms  ┤ Row at peak expansion
        │ Rising upward
        │
300 ms  ┤ Midpoint
        │ Row shrinking
        │
450 ms  ┤ Nearly disappeared
        │ Mostly faded
        │
600 ms  ┤ Animation complete
        │ Row gone
        │
```

---

## 💡 What Makes It Feel Great

✨ **Bouncy Easing:** The `cubic-bezier(0.34, 1.56, 0.64, 1)` creates an elastic, spring-like feel
✨ **Multi-stage Motion:** Scale + translate + opacity together create depth
✨ **Upward Direction:** Rows "float away" instead of just disappearing
✨ **Smooth Transitions:** 0.6s duration feels natural, not rushed
✨ **Immediate Response:** Animation starts instantly on click

---

## 📱 Mobile Experience

Works perfectly on all devices:
- ✅ Desktop (mouse hover + click)
- ✅ Tablet (touch click)
- ✅ Mobile (touch tap)
- ✅ All animations run at 60fps

---

## 🎯 Summary

The pop-out effect creates a satisfying, interactive experience where:
1. User sees pointer cursor on hover (affordance)
2. Clicking a row triggers immediate visual feedback
3. Smooth 0.6s animation shows the "pop"
4. Row elegantly floats away and fades out
5. Clear, responsive interaction loop

**Result:** Delightful user experience that feels premium and responsive! 🎉

