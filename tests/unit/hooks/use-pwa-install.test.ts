import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePwaInstall } from '@/hooks/use-pwa-install';

describe('usePwaInstall', () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('should start with canInstall false', () => {
    const { result } = renderHook(() => usePwaInstall());
    expect(result.current.canInstall).toBe(false);
    expect(result.current.isInstalled).toBe(false);
  });

  it('should set canInstall true when beforeinstallprompt fires', () => {
    const { result } = renderHook(() => usePwaInstall());

    act(() => {
      const event = new Event('beforeinstallprompt');
      Object.assign(event, {
        prompt: vi.fn().mockResolvedValue(undefined),
        userChoice: Promise.resolve({ outcome: 'dismissed' }),
      });
      window.dispatchEvent(event);
    });

    expect(result.current.canInstall).toBe(true);
  });

  it('should detect already installed via display-mode', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(display-mode: standalone)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => usePwaInstall());
    expect(result.current.isInstalled).toBe(true);
    expect(result.current.canInstall).toBe(false);
  });

  it('should handle accepted install', async () => {
    const mockPrompt = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => usePwaInstall());

    act(() => {
      const event = new Event('beforeinstallprompt');
      Object.assign(event, {
        prompt: mockPrompt,
        userChoice: Promise.resolve({ outcome: 'accepted' }),
      });
      window.dispatchEvent(event);
    });

    expect(result.current.canInstall).toBe(true);

    let installResult: boolean | undefined;
    await act(async () => {
      installResult = await result.current.promptInstall();
    });

    expect(mockPrompt).toHaveBeenCalled();
    expect(installResult).toBe(true);
    expect(result.current.isInstalled).toBe(true);
    expect(result.current.canInstall).toBe(false);
  });

  it('should handle dismissed install', async () => {
    const mockPrompt = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => usePwaInstall());

    act(() => {
      const event = new Event('beforeinstallprompt');
      Object.assign(event, {
        prompt: mockPrompt,
        userChoice: Promise.resolve({ outcome: 'dismissed' }),
      });
      window.dispatchEvent(event);
    });

    let installResult: boolean | undefined;
    await act(async () => {
      installResult = await result.current.promptInstall();
    });

    expect(installResult).toBe(false);
    expect(result.current.isInstalled).toBe(false);
    expect(result.current.canInstall).toBe(true);
  });

  it('should return false from promptInstall when no prompt available', async () => {
    const { result } = renderHook(() => usePwaInstall());

    let installResult: boolean | undefined;
    await act(async () => {
      installResult = await result.current.promptInstall();
    });

    expect(installResult).toBe(false);
  });

  it('should clean up event listener on unmount', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => usePwaInstall());

    expect(addSpy).toHaveBeenCalledWith('beforeinstallprompt', expect.any(Function));

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('beforeinstallprompt', expect.any(Function));

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});
