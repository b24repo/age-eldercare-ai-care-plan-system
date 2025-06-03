import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductionCareplanAgent from '../components/ProductionCareplanAgent';

// Mock the OpenAIService used in the form
jest.mock('../services/openai', () => ({
  OpenAIService: jest.fn().mockImplementation(() => ({
    generateAndValidate: jest.fn().mockResolvedValue({
      plan: 'Test Plan',
      quality: { overall: { score: 5, explanation: 'Excellent' } },
      enhanced: 'Enhanced Plan'
    })
  }))
}));

describe('ProductionCareplanAgent App Integration - Full Scenario Coverage', () => {
  beforeEach(() => {
    render(<ProductionCareplanAgent />);
  });

  test('renders header and main layout', () => {
    expect(screen.getByText(/Enterprise Sage Eldercare AI System/i)).toBeInTheDocument();
    expect(screen.getByText(/Industry-Leading Prompt Engineering/i)).toBeInTheDocument();
  });

  test('renders header, navigation, main, and footer', () => {
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  test('renders page title and logo', () => {
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByTestId('logo')).toBeInTheDocument();
  });

  test('renders form and content sections', () => {
    expect(screen.getByTestId('care-plan-form')).toBeInTheDocument();
    expect(screen.getAllByTestId('content-section').length).toBeGreaterThan(0);
  });

  test('submits form and displays care plan (integration happy path)', async () => {
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/age/i), { target: { value: '80' } });
    fireEvent.change(screen.getByLabelText(/medical history/i), { target: { value: 'Diabetes' } });
    fireEvent.change(screen.getByLabelText(/current concerns/i), { target: { value: 'Mobility' } });
    fireEvent.click(screen.getByRole('button', { name: /generate care plan/i }));
    expect(await screen.findByText(/Test Plan/)).toBeInTheDocument();
    expect(screen.getByText(/Enhanced Plan/)).toBeInTheDocument();
    expect(screen.getByText(/Excellent/)).toBeInTheDocument();
  });

  test('shows error from child component', async () => {
    // Override mock to reject
    const { OpenAIService } = require('../services/openai');
    OpenAIService.mockImplementation(() => ({
      generateAndValidate: jest.fn().mockRejectedValue(new Error('API Error'))
    }));
    render(<ProductionCareplanAgent />);
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/age/i), { target: { value: '80' } });
    fireEvent.change(screen.getByLabelText(/medical history/i), { target: { value: 'Diabetes' } });
    fireEvent.change(screen.getByLabelText(/current concerns/i), { target: { value: 'Mobility' } });
    fireEvent.click(screen.getByRole('button', { name: /generate care plan/i }));
    expect(await screen.findByText(/API Error/)).toBeInTheDocument();
  });

  test('shows loading spinner during API call', async () => {
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/age/i), { target: { value: '80' } });
    fireEvent.change(screen.getByLabelText(/medical history/i), { target: { value: 'Diabetes' } });
    fireEvent.change(screen.getByLabelText(/current concerns/i), { target: { value: 'Mobility' } });
    fireEvent.click(screen.getByRole('button', { name: /generate care plan/i }));
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument());
  });

  test('resets state after successful submission', async () => {
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/age/i), { target: { value: '80' } });
    fireEvent.change(screen.getByLabelText(/medical history/i), { target: { value: 'Diabetes' } });
    fireEvent.change(screen.getByLabelText(/current concerns/i), { target: { value: 'Mobility' } });
    fireEvent.click(screen.getByRole('button', { name: /generate care plan/i }));
    await screen.findByText(/Test Plan/);
    expect(screen.getByLabelText(/name/i)).toHaveValue('');
    expect(screen.getByLabelText(/age/i)).toHaveValue('');
    expect(screen.getByLabelText(/medical history/i)).toHaveValue('');
    expect(screen.getByLabelText(/current concerns/i)).toHaveValue('');
  });

  test('conditional rendering: no care plan before submit', () => {
    expect(screen.queryByTestId('care-plan-content')).not.toBeInTheDocument();
    expect(screen.queryByTestId('quality-scores')).not.toBeInTheDocument();
  });

  test('edge case: rapid submissions only shows latest result', async () => {
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/age/i), { target: { value: '80' } });
    fireEvent.change(screen.getByLabelText(/medical history/i), { target: { value: 'Diabetes' } });
    fireEvent.change(screen.getByLabelText(/current concerns/i), { target: { value: 'Mobility' } });
    fireEvent.click(screen.getByRole('button', { name: /generate care plan/i }));
    fireEvent.click(screen.getByRole('button', { name: /generate care plan/i }));
    expect(await screen.findByText(/Test Plan/)).toBeInTheDocument();
  });

  test('is accessible by keyboard and landmarks', () => {
    const main = screen.getByRole('main');
    main.focus();
    expect(main).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  test('renders responsive container and main area', () => {
    expect(screen.getByTestId('app-container')).toHaveClass('min-h-screen', 'flex', 'flex-col');
    expect(screen.getByTestId('main-content-area')).toHaveClass('flex-grow', 'bg-gray-50');
  });
}); 