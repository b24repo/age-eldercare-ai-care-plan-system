import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductionCareplanAgent from '../ProductionCareplanAgent';

// Mock the backend service or API call if used inside ProductionCareplanAgent
jest.mock('../../services/openai', () => ({
  OpenAIService: jest.fn().mockImplementation(() => ({
    generateAndValidate: jest.fn().mockResolvedValue({
      plan: 'Test Plan',
      quality: { overall: { score: 5, explanation: 'Excellent' } },
      enhanced: 'Enhanced Plan'
    })
  }))
}));

describe('ProductionCareplanAgent Component - Full Scenario Coverage', () => {
  beforeEach(() => {
    render(<ProductionCareplanAgent />);
  });

  test('renders form with all required input fields', () => {
    expect(screen.getByLabelText(/client name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/age & living situation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/medical history/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/current concerns/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/family input/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/assessment notes/i)).toBeInTheDocument();
  });

  test('submits valid data and shows result (happy path)', async () => {
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/age/i), { target: { value: '80' } });
    fireEvent.change(screen.getByLabelText(/medical history/i), { target: { value: 'Diabetes' } });
    fireEvent.change(screen.getByLabelText(/current concerns/i), { target: { value: 'Mobility' } });
    fireEvent.click(screen.getByRole('button', { name: /generate care plan/i }));
    expect(await screen.findByText(/Test Plan/)).toBeInTheDocument();
    expect(screen.getByText(/Enhanced Plan/)).toBeInTheDocument();
    expect(screen.getByText(/Excellent/)).toBeInTheDocument();
  });

  test('shows validation errors for missing fields', async () => {
    fireEvent.click(screen.getByRole('button', { name: /generate care plan/i }));
    expect(await screen.findAllByRole('alert')).toHaveLength(4);
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/age is required/i)).toBeInTheDocument();
    expect(screen.getByText(/medical history is required/i)).toBeInTheDocument();
    expect(screen.getByText(/current concerns is required/i)).toBeInTheDocument();
  });

  test('shows validation error for invalid age', async () => {
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByLabelText(/age/i), { target: { value: 'abc' } });
    fireEvent.change(screen.getByLabelText(/medical history/i), { target: { value: 'Asthma' } });
    fireEvent.change(screen.getByLabelText(/current concerns/i), { target: { value: 'Falls' } });
    fireEvent.click(screen.getByRole('button', { name: /generate care plan/i }));
    expect(await screen.findByText(/age must be a number/i)).toBeInTheDocument();
  });

  test('handles API error gracefully', async () => {
    // Override mock to reject
    const { OpenAIService } = require('../../services/openai');
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

  test('resets form after successful submission', async () => {
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

  test('is accessible by keyboard', () => {
    const nameInput = screen.getByLabelText(/name/i);
    nameInput.focus();
    expect(nameInput).toHaveFocus();
    fireEvent.keyDown(nameInput, { key: 'Tab' });
    const ageInput = screen.getByLabelText(/age/i);
    expect(ageInput).toBeInTheDocument();
  });
}); 