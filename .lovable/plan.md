

# Audio Library Issues -- Fix Plan

## Root Cause (Critical)

The `<audio ref={audioRef}>` element is rendered **inside** `fullPlayerContent`, which on mobile lives inside `<DrawerContent>`. When the drawer closes, React unmounts `DrawerContent` children, destroying the audio element and killing playback. This means:

- Tapping play on the mini-player fails (audioRef is null when drawer is closed)
- If a track is playing and the user closes the drawer, audio stops immediately
- The mini-player play/pause button references a non-existent audio element

## Fix

### 1. Move `<audio>` element out of `fullPlayerContent` (EnhancedAudioPlayer.tsx)

Extract the `<audio ref={audioRef} src={track?.audio_url} preload="metadata" />` tag from `fullPlayerContent` and render it at the component's root level -- always mounted regardless of drawer/card state.

**Mobile return** becomes:
```tsx
return (
  <>
    <audio ref={audioRef} src={track?.audio_url} preload="metadata" />
    <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
      {/* mini-player trigger */}
      <DrawerContent>{fullPlayerContent}</DrawerContent>
    </Drawer>
  </>
);
```

**Desktop return** similarly renders `<audio>` outside the card.

Remove the duplicate `<audio>` from `fullPlayerContent`.

### 2. Fix "no track" early return (EnhancedAudioPlayer.tsx)

The `if (!track) return ...` at line 396 returns before the mobile mini-player is rendered. On mobile, if no track is selected, the component renders a desktop-only Card. This is fine but could flash. No change needed here -- the "no track" state correctly hides the mini-player.

### 3. Files Changed

| File | Change |
|------|--------|
| `EnhancedAudioPlayer.tsx` | Move `<audio>` element to always-mounted position outside drawer/card content |

This is a targeted fix -- the audio URLs are confirmed working (valid OGG from Archive.org).

