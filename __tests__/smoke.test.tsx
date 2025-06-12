import React from 'react';
import { render } from '@testing-library/react';

// Import the main pages
import HomePage from '../src/app/page';
import SchedulePage from '../src/app/schedule/page';

// Smoke test for HomePage
test('HomePage renders without crashing', () => {
  render(<HomePage />);
});

// Smoke test for SchedulePage
test('SchedulePage renders without crashing', () => {
  render(<SchedulePage />);
});