import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import ElevSoknad from '../components/forms/ElevSoknad';
import { LoadingButton } from '../components/ui/LoadingStates';
import { useFormWithValidation } from '../hooks/useFormWithValidation';
import { ansattInnloggingSchema, type AnsattInnloggingFormData } from '../lib/validation/shared-schemas';

export default function LoggInn() {
  const [visPassord, setVisPassord] = useState(false);
  const [huskMeg, setHuskMeg] = useState(false);
  const [visSoknad, setVisSoknad] = useState(false);
  const { loggInn, erInnlogget, loading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    setValue,
    watch,
    hasFieldError,
    getFieldError,
    isSubmitting,
    submitForm
  } = useFormWithValidation<AnsattInnloggingFormData>({
    schema: ansattInnloggingSchema,
    onSubmit: async (data) => {
      await loggInn(data.epost, data.passord);
      
      // Lagre legitimasjoner hvis "husk meg" er valgt
      if (huskMeg) {
        localStorage.setItem('lagretEpost', data.epost);
        localStorage.setItem('lagretPassord', data.passord);
        localStorage.setItem('huskMeg', 'true');
      } else {
        // Fjern lagrede legitimasjoner hvis "husk meg" ikke er valgt
        localStorage.removeItem('lagretEpost');
        localStorage.removeItem('lagretPassord');
        localStorage.removeItem('huskMeg');
      }
      
      navigate('/oversikt');
    },
    successMessage: 'Velkommen tilbake!'
  });

  // Last inn lagrede legitimasjoner ved oppstart
  useEffect(() => {
    const lagretEpost = localStorage.getItem('lagretEpost');
    const lagretPassord = localStorage.getItem('lagretPassord');
    const lagretHuskMeg = localStorage.getItem('huskMeg') === 'true';
    
    if (lagretHuskMeg && lagretEpost && lagretPassord) {
      setValue('epost', lagretEpost);
      setValue('passord', lagretPassord);
      setHuskMeg(true);
    }
  }, [setValue]);

  // Redirect hvis allerede innlogget
  useEffect(() => {
    if (!loading && erInnlogget) {
      navigate('/oversikt');
    }
  }, [erInnlogget, loading, navigate]);

  // Vis loading mens autentisering sjekkes
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-2 lg:px-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const håndterUtviklingsmodus = async () => {
    setValue('epost', 'admin@test.no');
    setValue('passord', 'admin123');
    await submitForm();
  };

  const epost = watch('epost');
  const passord = watch('passord');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-2 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Logg inn på TMS
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-1 px-2 shadow sm:rounded-lg sm:px-10">
          <form className="cards-spacing-vertical" onSubmit={submitForm}>
            <div>
              <label htmlFor="epost" className="block text-sm font-medium text-gray-700">
                E-post
              </label>
              <div className="mt-1">
                <input
                  {...register('epost')}
                  id="epost"
                  type="email"
                  autoComplete="email"
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    hasFieldError('epost') ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {hasFieldError('epost') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('epost')}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="passord" className="block text-sm font-medium text-gray-700">
                Passord
              </label>
              <div className="mt-1 relative">
                <input
                  {...register('passord')}
                  id="passord"
                  type={visPassord ? "text" : "password"}
                  autoComplete="current-password"
                  className={`appearance-none block w-full px-3 py-2 pr-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    hasFieldError('passord') ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setVisPassord(!visPassord)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {visPassord ? (
                    <FaEyeSlash className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FaEye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {hasFieldError('passord') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('passord')}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                id="husk-meg"
                name="husk-meg"
                type="checkbox"
                checked={huskMeg}
                onChange={(e) => setHuskMeg(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="husk-meg" className="ml-2 block text-sm text-gray-900">
                Husk meg
              </label>
            </div>

            <div>
              <LoadingButton
                loading={isSubmitting}
                type="submit"
                disabled={!epost || !passord}
                className="group relative w-full flex justify-center py-2 px-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Logg inn
              </LoadingButton>
            </div>
          </form>

          <div className="mt-6 space-y-8">
            <button
              onClick={() => setVisSoknad(true)}
              className="w-full flex justify-center py-2 px-2 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Søk om tilgang som elev
            </button>
            
            <LoadingButton
              loading={isSubmitting}
              onClick={håndterUtviklingsmodus}
              className="w-full flex justify-center py-2 px-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Utviklingsmodus (Admin)
            </LoadingButton>
          </div>
        </div>
      </div>

      {visSoknad && (
        <ElevSoknad onClose={() => setVisSoknad(false)} />
      )}
    </div>
  );
} 