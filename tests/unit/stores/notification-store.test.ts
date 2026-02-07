import { describe, it, expect, beforeEach } from 'vitest';
import { useNotificationStore } from '@/stores/notification-store';

describe('Notification Store', () => {
  beforeEach(() => {
    useNotificationStore.setState({ count: 0 });
  });

  it('should start with count 0', () => {
    expect(useNotificationStore.getState().count).toBe(0);
  });

  it('should increment count', () => {
    useNotificationStore.getState().increment();
    expect(useNotificationStore.getState().count).toBe(1);
    useNotificationStore.getState().increment();
    expect(useNotificationStore.getState().count).toBe(2);
  });

  it('should reset count to 0', () => {
    useNotificationStore.setState({ count: 5 });
    useNotificationStore.getState().reset();
    expect(useNotificationStore.getState().count).toBe(0);
  });

  it('should set count to specific value', () => {
    useNotificationStore.getState().setCount(42);
    expect(useNotificationStore.getState().count).toBe(42);
  });
});
