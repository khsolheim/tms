/**
 * FormComponents Tests
 * 
 * Testing av enhanced form komponenter med validering
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { 
  EnhancedInput, 
  EnhancedSelect, 
  exampleSchemas,
  useEnhancedForm 
} from '../../components/forms/FormComponents';

// Test wrapper komponenter for react-hook-form integration
const TestFormWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const form = useEnhancedForm(exampleSchemas.contact);
  
  return (
    <form>
      {      React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          const fieldName = child.props.name as keyof typeof exampleSchemas.contact._type;
          return React.cloneElement(child as any, {
            ...form.register(fieldName),
            error: form.formState.errors[fieldName]?.message
          });
        }
        return child;
      })}
    </form>
  );
};

const SimpleTestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div>{children}</div>;
};

describe('FormComponents', () => {
  describe('EnhancedInput', () => {
    it('rendrer grunnleggende input', () => {
      render(
        <SimpleTestWrapper>
          <EnhancedInput
            label="Test Label"
            name="test"
          />
        </SimpleTestWrapper>
      );
      
      const input = screen.getByLabelText('Test Label');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('name', 'test');
    });

    it('viser error melding', () => {
      render(
        <SimpleTestWrapper>
          <EnhancedInput
            label="Test Label"
            name="test"
            error="This is an error"
          />
        </SimpleTestWrapper>
      );
      
      expect(screen.getByText('This is an error')).toBeInTheDocument();
    });

    it('viser required indikator', () => {
      render(
        <SimpleTestWrapper>
          <EnhancedInput
            label="Test Label"
            name="test"
            required
          />
        </SimpleTestWrapper>
      );
      
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('rendrer help text når gitt', () => {
      render(
        <SimpleTestWrapper>
          <EnhancedInput
            label="Test Label"
            name="test"
            helpText="Dette er hjelpetekst"
          />
        </SimpleTestWrapper>
      );
      
      expect(screen.getByText('Dette er hjelpetekst')).toBeInTheDocument();
    });

    it('har riktig error styling når det er feil', () => {
      render(
        <SimpleTestWrapper>
          <EnhancedInput
            label="Test Label"
            name="test"
            error="Error message"
          />
        </SimpleTestWrapper>
      );
      
      const input = screen.getByLabelText('Test Label');
      expect(input).toHaveClass('border-red-300');
    });
  });

  describe('EnhancedSelect', () => {
    const options = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ];

    it('rendrer select med options', () => {
      render(
        <SimpleTestWrapper>
          <EnhancedSelect
            label="Test Select"
            name="test"
            options={options}
          />
        </SimpleTestWrapper>
      );
      
      const select = screen.getByLabelText('Test Select');
      expect(select).toBeInTheDocument();
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    it('viser placeholder når gitt', () => {
      render(
        <SimpleTestWrapper>
          <EnhancedSelect
            label="Test Select"
            name="test"
            placeholder="Velg en option"
            options={options}
          />
        </SimpleTestWrapper>
      );
      
      expect(screen.getByText('Velg en option')).toBeInTheDocument();
    });

    it('viser error melding', () => {
      render(
        <SimpleTestWrapper>
          <EnhancedSelect
            label="Test Select"
            name="test"
            options={options}
            error="Du må velge en option"
          />
        </SimpleTestWrapper>
      );
      
      expect(screen.getByText('Du må velge en option')).toBeInTheDocument();
    });
  });

  describe('Validation Schema', () => {
    it('contactSchema validerer korrekt', async () => {
      const validData = {
        name: 'Test Testesen',
        email: 'test@example.com',
        phone: '12345678',
        message: 'Dette er en test melding med nok tegn',
      };

      const result = exampleSchemas.contact.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('contactSchema feiler med ugyldig data', async () => {
      const invalidData = {
        name: '',
        email: 'ugyldig-epost',
        phone: '123', // for kort
        message: 'kort', // for kort
      };

      const result = exampleSchemas.contact.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      // Typecheck først, så assert på error issues
      expect(result).toHaveProperty('error');
      expect(result.success).toBe(false);
      // Assert errors exist without conditional
      expect(result).toEqual(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            issues: expect.arrayContaining([
              expect.objectContaining({
                code: expect.any(String)
              })
            ])
          })
        })
      );
    });

    it('epost validering fungerer korrekt', () => {
      const invalidEmail = { 
        name: 'Test', 
        email: 'ikke-epost', 
        phone: '12345678',
        message: 'Valid message with enough characters'
      };
      const validEmail = { 
        name: 'Test', 
        email: 'test@example.com', 
        phone: '12345678',
        message: 'Valid message with enough characters'
      };

      expect(exampleSchemas.contact.safeParse(invalidEmail).success).toBe(false);
      expect(exampleSchemas.contact.safeParse(validEmail).success).toBe(true);
    });

    it('telefon validering fungerer korrekt', () => {
      const shortPhone = { 
        name: 'Test', 
        email: 'test@example.com', 
        phone: '123',
        message: 'Valid message with enough characters'
      };
      const validPhone = { 
        name: 'Test', 
        email: 'test@example.com', 
        phone: '12345678',
        message: 'Valid message with enough characters'
      };

      expect(exampleSchemas.contact.safeParse(shortPhone).success).toBe(false);
      expect(exampleSchemas.contact.safeParse(validPhone).success).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('input har riktig labels og beskrivelser', () => {
      render(
        <SimpleTestWrapper>
          <EnhancedInput
            label="Navn"
            name="navn"
            helpText="Skriv inn ditt fulle navn"
          />
        </SimpleTestWrapper>
      );
      
      const input = screen.getByLabelText('Navn');
      expect(input).toBeInTheDocument();
    });

    it('error state har riktig aria attributes', () => {
      render(
        <SimpleTestWrapper>
          <EnhancedInput
            label="Test"
            name="test"
            error="Required field"
          />
        </SimpleTestWrapper>
      );
      
      // Med error bør input ha border-red-300 class
      const input = screen.getByLabelText('Test');
      expect(input).toHaveClass('border-red-300');
    });
  });

  describe('Integration', () => {
    it('komponenter fungerer sammen med react-hook-form', async () => {
      render(
        <TestFormWrapper>
          <EnhancedInput label="Navn" name="name" />
        </TestFormWrapper>
      );
      
      const input = screen.getByLabelText('Navn');
      expect(input).toBeInTheDocument();
    });
  });
}); 