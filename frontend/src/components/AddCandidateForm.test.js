import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import AddCandidateForm from './AddCandidateForm';
import { sendCandidateData } from '../services/candidateService';

jest.mock('react-datepicker', () => (props) => (
  <input
    placeholder={props.placeholderText}
    value={props.selected ? props.selected.toISOString().slice(0, 10) : ''}
    onChange={(e) => props.onChange(e.target.value ? new Date(e.target.value) : null)}
  />
));

jest.mock('../services/candidateService', () => ({
  sendCandidateData: jest.fn(),
}));

describe('AddCandidateForm', () => {
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

    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText(/apellido/i), { target: { value: 'Lopez' } });
    fireEvent.change(screen.getByLabelText(/correo electr[oó]nico/i), { target: { value: 'ana@example.com' } });

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

  it('shows backend validation error when submit fails', async () => {
    sendCandidateData.mockRejectedValue({
      response: {
        data: {
          message: 'Invalid email',
        },
      },
    });

    render(<AddCandidateForm />);

    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText(/apellido/i), { target: { value: 'Lopez' } });
    fireEvent.change(screen.getByLabelText(/correo electr[oó]nico/i), { target: { value: 'ana@example.com' } });

    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));

    expect(await screen.findByText(/error al añadir candidato: invalid email/i)).toBeInTheDocument();
  });

  it('clears success message when a later submit fails', async () => {
    sendCandidateData
      .mockResolvedValueOnce({ id: 1 })
      .mockRejectedValueOnce({
        response: {
          data: {
            message: 'Email already exists',
          },
        },
      });

    render(<AddCandidateForm />);

    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText(/apellido/i), { target: { value: 'Lopez' } });
    fireEvent.change(screen.getByLabelText(/correo electr[oó]nico/i), { target: { value: 'ana@example.com' } });

    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));
    expect(await screen.findByText(/candidato añadido con éxito/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));
    expect(await screen.findByText(/error al añadir candidato: email already exists/i)).toBeInTheDocument();
    expect(screen.queryByText(/candidato añadido con éxito/i)).not.toBeInTheDocument();
  });

  it('maps education and work dates to YYYY-MM-DD before submit', async () => {
    sendCandidateData.mockResolvedValue({ id: 1 });

    render(<AddCandidateForm />);

    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText(/apellido/i), { target: { value: 'Lopez' } });
    fireEvent.change(screen.getByLabelText(/correo electr[oó]nico/i), { target: { value: 'ana@example.com' } });

    fireEvent.click(screen.getByRole('button', { name: /añadir educación/i }));
    fireEvent.click(screen.getByRole('button', { name: /añadir experiencia laboral/i }));

    fireEvent.change(screen.getByPlaceholderText(/institución/i), { target: { value: 'UC3M' } });
    fireEvent.change(screen.getByPlaceholderText(/título/i), { target: { value: 'Computer Science' } });
    fireEvent.change(screen.getByPlaceholderText(/empresa/i), { target: { value: 'Acme' } });
    fireEvent.change(screen.getByPlaceholderText(/puesto/i), { target: { value: 'Developer' } });

    const startDateInputs = screen.getAllByPlaceholderText(/fecha de inicio/i);
    const endDateInputs = screen.getAllByPlaceholderText(/fecha de fin/i);

    fireEvent.change(startDateInputs[0], { target: { value: '2026-01-15' } });
    fireEvent.change(endDateInputs[0], { target: { value: '2026-02-20' } });
    fireEvent.change(startDateInputs[1], { target: { value: '2024-03-01' } });
    fireEvent.change(endDateInputs[1], { target: { value: '2025-04-10' } });

    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));

    await waitFor(() => {
      expect(sendCandidateData).toHaveBeenCalledWith(
        expect.objectContaining({
          educations: [
            expect.objectContaining({
              startDate: '2026-01-15',
              endDate: '2026-02-20',
            }),
          ],
          workExperiences: [
            expect.objectContaining({
              startDate: '2024-03-01',
              endDate: '2025-04-10',
            }),
          ],
        })
      );
    });
  });

  it('sends empty optional sections with cv as null when user only fills required fields', async () => {
    sendCandidateData.mockResolvedValue({ id: 1 });

    render(<AddCandidateForm />);

    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText(/apellido/i), { target: { value: 'Lopez' } });
    fireEvent.change(screen.getByLabelText(/correo electr[oó]nico/i), { target: { value: 'ana@example.com' } });

    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));

    await waitFor(() => {
      expect(sendCandidateData).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'Ana',
          lastName: 'Lopez',
          email: 'ana@example.com',
          educations: [],
          workExperiences: [],
          cv: null,
        })
      );
    });
  });

  it('includes cv filePath and fileType in payload after successful upload', async () => {
    const uploadResponse = {
      filePath: 'uploads/1715760936750-cv.pdf',
      fileType: 'application/pdf',
    };

    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => uploadResponse,
    });

    sendCandidateData.mockResolvedValue({ id: 1 });

    render(<AddCandidateForm />);

    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText(/apellido/i), { target: { value: 'Lopez' } });
    fireEvent.change(screen.getByLabelText(/correo electr[oó]nico/i), { target: { value: 'ana@example.com' } });

    const fileInput = screen.getByLabelText(/file/i);
    const file = new File(['dummy content'], 'cv.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: /subir archivo/i }));

    await screen.findByText(/archivo subido con éxito/i);

    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));

    await waitFor(() => {
      expect(sendCandidateData).toHaveBeenCalledWith(
        expect.objectContaining({
          cv: {
            filePath: 'uploads/1715760936750-cv.pdf',
            fileType: 'application/pdf',
          },
        })
      );
    });

    fetchSpy.mockRestore();
  });
});
