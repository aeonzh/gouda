import { useCallback, useState } from 'react';

export interface ApiState<T = any> {
  data: null | T;
  error: null | string;
  loading: boolean;
}

export interface UseApiReturn<T = any> {
  state: ApiState<T>;
  execute: (apiCall: () => Promise<T>) => Promise<void>;
  reset: () => void;
}

export function useApi<T = any>(): UseApiReturn<T> {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    error: null,
    loading: false,
  });

  const execute = useCallback(async (apiCall: () => Promise<T>) => {
    setState((prev) => ({ ...prev, error: null, loading: true }));

    try {
      const data = await apiCall();
      setState((prev) => ({ ...prev, data, loading: false }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      loading: false,
    });
  }, []);

  return {
    execute,
    reset,
    state,
  };
}

// Custom hook for form validation
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validate: (values: T) => Record<keyof T, string>,
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<keyof T, string>>(
    {} as Record<keyof T, string>,
  );
  const [touched, setTouched] = useState<Record<keyof T, boolean>>(
    {} as Record<keyof T, boolean>,
  );

  const handleChange = useCallback(
    (name: keyof T, value: any) => {
      setValues((prev) => ({ ...prev, [name]: value }));
      if (touched[name]) {
        const newErrors = validate(values);
        setErrors(newErrors);
      }
    },
    [touched, validate, values],
  );

  const handleBlur = useCallback(
    (name: keyof T) => {
      setTouched((prev) => ({ ...prev, [name]: true }));
      const newErrors = validate(values);
      setErrors(newErrors);
    },
    [validate, values],
  );

  const handleSubmit = useCallback(
    (onSubmit: () => void) => {
      const newErrors = validate(values);
      setErrors(newErrors);

      if (Object.values(newErrors).every((error) => !error)) {
        onSubmit();
      }
    },
    [validate, values],
  );

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({} as Record<keyof T, string>);
    setTouched({} as Record<keyof T, boolean>);
  }, [initialValues]);

  return {
    errors,
    handleBlur,
    handleChange,
    handleSubmit,
    isValid: Object.values(errors).every((error) => !error),
    resetForm,
    touched,
    values,
  };
}

// Error utility functions
export const errorUtils = {
  formatErrorMessage: (error: any): string => {
    if (error?.message) {
      return error.message;
    }

    if (error?.status === 500) {
      return 'Server error. Please try again later.';
    }

    if (error?.status === 404) {
      return 'Resource not found.';
    }

    return 'An unexpected error occurred. Please try again.';
  },

  isAuthError: (error: any): boolean => {
    return (
      error?.status === 401 ||
      error?.status === 403 ||
      error?.message?.includes('unauthorized') ||
      error?.message?.includes('forbidden') ||
      error?.code === 'UNAUTHORIZED' ||
      error?.code === 'FORBIDDEN'
    );
  },

  isNetworkError: (error: any): boolean => {
    return (
      error?.message?.includes('Network Error') ||
      error?.message?.includes('fetch') ||
      error?.code === 'NETWORK_ERROR' ||
      error?.status === 0
    );
  },

  isValidationError: (error: any): boolean => {
    return (
      error?.status === 400 ||
      error?.message?.includes('validation') ||
      error?.message?.includes('invalid') ||
      error?.code === 'VALIDATION_ERROR'
    );
  },
};
