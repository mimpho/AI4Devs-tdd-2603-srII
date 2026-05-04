/**
 * Tests MTT - Frontend
 * 
 * Contiene 7 tests unitarios para HU1 (Frontend)
 */

import '@testing-library/jest-dom';
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import AddCandidateForm from '../components/AddCandidateForm';
import { sendCandidateData } from '../services/candidateService';

jest.mock('react-datepicker', () => (props) => (
  <input
    data-testid={props.placeholderText || 'date-picker'}
    value={props.selected ? props.selected.toISOString().slice(0, 10) : ''}
    onChange={(e) => props.onChange(e.target.value ? new Date(e.target.value) : null)}
  />
));

jest.mock('../components/FileUploader', () => (props) => (
  <button type="button" onClick={() => props.onUpload({ filePath: 'uploads/cv.pdf', fileType: 'application/pdf' })}>
    Mock Upload CV
  </button>
));

jest.mock('../services/candidateService', () => ({
  sendCandidateData: jest.fn(),
}));

describe('HU1 - Frontend: AddCandidateForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const fillBasicFields = () => {
    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText(/apellido/i), { target: { value: 'Lopez' } });
    fireEvent.change(screen.getByLabelText(/correo electr[oó]nico/i), { target: { value: 'ana@example.com' } });
  };

  it('renders basic candidate fields and submit button', () => {
    render(<AddCandidateForm />);

    expect(screen.getByRole('heading', { name: /agregar candidato/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/apellido/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electr[oó]nico/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar/i })).toBeInTheDocument();
  });

  it('submits candidate data through candidate service', async () => {
    sendCandidateData.mockResolvedValue({ id: 1 });

    render(<AddCandidateForm />);
    fillBasicFields();

    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));

    await waitFor(() => {
      expect(sendCandidateData).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'Ana',
          lastName: 'Lopez',
          email: 'ana@example.com',
        })
      );
    });

    expect(await screen.findByText(/candidato añadido con éxito/i)).toBeInTheDocument();
  });

  it('displays error message from backend', async () => {
    sendCandidateData.mockRejectedValue({
      response: { data: { message: 'Email already exists' } },
    });

    render(<AddCandidateForm />);
    fillBasicFields();

    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));

    await waitFor(() => {
      expect(screen.getByText(/Error al añadir candidato: Email already exists/i)).toBeInTheDocument();
    });
  });

  it('clears success message when a subsequent submit fails', async () => {
    render(<AddCandidateForm />);
    fillBasicFields();

    sendCandidateData.mockResolvedValueOnce({ id: 1 });
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));

    await waitFor(() => {
      expect(screen.getByText(/candidato añadido con éxito/i)).toBeInTheDocument();
    });

    sendCandidateData.mockRejectedValueOnce({
      response: { data: { message: 'Email already exists' } },
    });

    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));

    await waitFor(() => {
      expect(screen.queryByText(/candidato añadido con éxito/i)).not.toBeInTheDocument();
      expect(screen.getByText(/Error al añadir candidato: Email already exists/i)).toBeInTheDocument();
    });
  });

  it('maps date fields to YYYY-MM-DD format in payload', async () => {
    sendCandidateData.mockResolvedValue({ id: 1 });

    render(<AddCandidateForm />);
    fillBasicFields();

    fireEvent.click(screen.getByRole('button', { name: /añadir educación/i }));

    const institution = screen.getByPlaceholderText(/institución/i);
    const title = screen.getByPlaceholderText(/título/i);
    fireEvent.change(institution, { target: { value: 'UC3M' } });
    fireEvent.change(title, { target: { value: 'CS' } });

    const datePickers = screen.getAllByTestId('Fecha de Inicio');
    fireEvent.change(datePickers[0], { target: { value: '2020-01-01' } });

    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));

    await waitFor(() => {
      const callArgs = sendCandidateData.mock.calls[0][0];
      expect(callArgs.educations[0].startDate).toBe('2020-01-01');
    });
  });

  it('sends payload with empty arrays and null CV when no data provided', async () => {
    sendCandidateData.mockResolvedValue({ id: 1 });

    render(<AddCandidateForm />);
    fillBasicFields();

    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));

    await waitFor(() => {
      const callArgs = sendCandidateData.mock.calls[0][0];
      expect(callArgs.educations).toEqual([]);
      expect(callArgs.workExperiences).toEqual([]);
      expect(callArgs.cv).toBeNull();
    });
  });

  it('includes CV with filePath and fileType in payload after upload', async () => {
    sendCandidateData.mockResolvedValue({ id: 1 });

    render(<AddCandidateForm />);
    fillBasicFields();

    fireEvent.click(screen.getByRole('button', { name: /mock upload cv/i }));
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));

    await waitFor(() => {
      const callArgs = sendCandidateData.mock.calls[0][0];
      expect(callArgs.cv).toEqual({
        filePath: 'uploads/cv.pdf',
        fileType: 'application/pdf',
      });
    });
  });
});
