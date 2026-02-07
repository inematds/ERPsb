import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Users } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';

describe('EmptyState', () => {
  it('should render title and description', () => {
    render(
      <EmptyState
        icon={Users}
        title="No items"
        description="Add your first item"
      />,
    );
    expect(screen.getByText('No items')).toBeDefined();
    expect(screen.getByText('Add your first item')).toBeDefined();
  });

  it('should render action button when provided', () => {
    render(
      <EmptyState
        icon={Users}
        title="No items"
        description="Add something"
        actionLabel="Add now"
        actionHref="/add"
      />,
    );
    const link = screen.getByRole('link', { name: 'Add now' });
    expect(link).toBeDefined();
    expect(link.getAttribute('href')).toBe('/add');
  });

  it('should not render action button when not provided', () => {
    render(
      <EmptyState
        icon={Users}
        title="No items"
        description="Nothing here"
      />,
    );
    expect(screen.queryByRole('link')).toBeNull();
  });
});
