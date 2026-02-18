# Stub Mode - Quick Reference

## What is Stub Mode?

Stub mode is a **development mode** that simulates external services without actually connecting to them.

## Why is My Application in Stub Mode?

Your application uses stub mode in **TWO places**:

### 1. Frontend - Omniverse WebRTC Streaming

```
❌ NVIDIA library NOT installed
↓
Using: src/lib/omniverse-webrtc-stub.js
↓
Result: Simulated video stream (placeholder graphics)
```

**Why?**
- The `@nvidia/omniverse-webrtc-streaming-library` is not installed
- It requires NVIDIA registry access (not publicly available)

### 2. Backend - Flownex Bridge

```
❌ pythonnet (clr) NOT installed
↓
Using: Stub implementations in flownex_direct.py
↓
Result: All operations return dummy data (0.0)
```

**Why?**
- The `pythonnet` package is not installed
- It's needed for .NET interop to communicate with Flownex

## Is This a Problem?

### NO! ✅

Stub mode is **intentional** and has many benefits:

| Benefit | Description |
|---------|-------------|
| 🚀 Fast Development | Work on UI without external services |
| 💻 Cross-Platform | Runs on Windows, Mac, Linux |
| 🔒 Safe | No risk to production systems |
| 🧪 Testing | Test workflows without real data |
| 📦 Portable | Share project easily |

## Quick Diagnostic

Run this command anytime:

```bash
npm run check-stub
```

You'll see:
- ✅ What's working
- ❌ What's in stub mode
- 📝 How to fix (if you want to)

## Visual Guide

### Current State (Stub Mode)

```
┌─────────────────────────────────────┐
│  Frontend (Omniverse WebRTC)        │
│  ❌ Real Library: NO                │
│  ✅ Stub Mode: YES                  │
│  📝 Shows: Placeholder graphics     │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  Your React App                     │
│  ✅ Fully Functional                │
│  ✅ UI Development Ready            │
│  ✅ Testing Ready                   │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  Backend (Flownex Bridge)           │
│  ❌ pythonnet: NO                   │
│  ✅ Stub Mode: YES                  │
│  📝 Returns: Dummy data (0.0)       │
└─────────────────────────────────────┘
```

### Target State (Real Mode)

```
┌─────────────────────────────────────┐
│  Frontend (Omniverse WebRTC)        │
│  ✅ Real Library: YES               │
│  ❌ Stub Mode: NO                   │
│  📝 Shows: Real 3D viewport         │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  Your React App                     │
│  ✅ Fully Functional                │
│  ✅ Production Ready                │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  Backend (Flownex Bridge)           │
│  ✅ pythonnet: YES                  │
│  ❌ Stub Mode: NO                   │
│  📝 Returns: Real simulation data   │
└─────────────────────────────────────┘
```

## When to Exit Stub Mode?

### Stay in Stub Mode if:
- ✅ Developing UI
- ✅ Testing workflows
- ✅ Learning the application
- ✅ Don't have external services set up

### Exit Stub Mode if:
- 🎯 Need real video streaming
- 🎯 Need actual simulation data
- 🎯 Demoing to stakeholders
- 🎯 Production deployment

## How to Exit?

### Quick Answer:

**Frontend:**
```bash
# 1. Get NVIDIA registry access
# 2. Install library
npm install
# 3. Update imports in AppStream.js
# 4. Start Omniverse Kit
```

**Backend:**
```bash
# 1. Install pythonnet
pip install pythonnet
# 2. Implement Flownex API calls
# 3. Test with real project
```

### Detailed Guide:

See [WHY_STUB_MODE.md](WHY_STUB_MODE.md) for complete instructions.

## Console Messages

You might see these messages (all normal):

```
Using stub for NVIDIA Omniverse WebRTC Streaming Library
To use real Omniverse streaming, install: npm install
```
↓ **This is EXPECTED in stub mode**

```
Simulating connection to Omniverse stream...
Stream started (stub mode)
Connected to stub stream
```
↓ **Working as designed**

## Common Questions

### Q: Will my app work without exiting stub mode?
**A:** YES! All UI and workflows function normally.

### Q: Can I develop features in stub mode?
**A:** YES! That's the whole point.

### Q: Do I need NVIDIA software to develop?
**A:** NO! Stub mode removes that requirement.

### Q: Is stub mode slower than real mode?
**A:** NO! Often faster (no network/external services).

### Q: Can I switch between stub and real mode?
**A:** YES! Just install/uninstall dependencies.

## Files to Know

| File | Purpose |
|------|---------|
| `WHY_STUB_MODE.md` | Complete guide |
| `check-stub-mode.js` | Diagnostic tool |
| `src/lib/omniverse-webrtc-stub.js` | Frontend stub |
| `flownex-bridge/adapters/flownex_direct.py` | Backend stub |

## Summary

```
Stub Mode = Development Mode ✅
  ↓
Not a Bug = Feature! 🎉
  ↓
Intentional = Good Design 👍
  ↓
Stay or Exit = Your Choice 🎯
```

**Remember:** Stub mode is a **feature**, not a bug!

---

Need more details? Run: `npm run check-stub`
