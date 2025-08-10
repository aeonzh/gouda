import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { createProduct, type Product } from 'shared/api/products';

export type ProductFormMode = 'create' | 'edit';

export interface UseProductFormOptions {
  initialValues: Partial<Product>;
  mode: ProductFormMode;
  onSubmit: (values: ProductFormState) => Promise<void> | void;
}

export interface ProductFormState {
  name: string;
  description?: string;
  image_url?: string;
  price: number;
  category_id?: string;
}

export interface UseProductFormReturn {
  values: ProductFormState;
  isSubmitting: boolean;
  validationErrors: Partial<Record<keyof ProductFormState, string>>;
  onChange: <K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) => void;
  onSubmit: () => Promise<void> | void;
  actions: {
    create: (input: Omit<Product, 'id' | 'stock_quantity' | 'status'> & Partial<Pick<Product, 'status'>>) => Promise<void>;
  };
}

export function useProductForm({ initialValues, mode, onSubmit }: UseProductFormOptions): UseProductFormReturn {
  const [values, setValues] = useState<ProductFormState>({
    name: initialValues.name || '',
    description: initialValues.description || '',
    image_url: initialValues.image_url || '',
    price: typeof initialValues.price === 'number' ? initialValues.price : 0,
    category_id: initialValues.category_id,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validationErrors = useMemo(() => {
    const errs: Partial<Record<keyof ProductFormState, string>> = {};
    const trimmedName = (values.name || '').trim();
    if (!trimmedName) errs.name = 'Name is required';
    if (trimmedName.length < 2) errs.name = 'Name must be at least 2 characters';
    if (trimmedName.length > 120) errs.name = 'Name is too long';
    if (values.description && values.description.length > 2000) errs.description = 'Description is too long';
    if (values.price == null || Number.isNaN(values.price)) errs.price = 'Price is required';
    if ((values.price ?? 0) <= 0) errs.price = 'Price must be greater than 0';
    return errs;
  }, [values]);

  const onChange = useCallback(<K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const actions = useMemo(() => ({
    async create(input: Omit<Product, 'id' | 'stock_quantity' | 'status'> & Partial<Pick<Product, 'status'>>>): Promise<void> {
      const payload: any = {
        ...input,
        status: input.status ?? 'draft',
        // stock_quantity will be defaulted by DB if present
      };
      await createProduct(payload as Product);
    },
  }), []);

  const onSubmitInternal = useCallback(async () => {
    if (Object.keys(validationErrors).length > 0) {
      Alert.alert('Validation Error', Object.values(validationErrors)[0]);
      return;
    }
    setIsSubmitting(true);
    try {
      const normalized: ProductFormState = {
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
        image_url: values.image_url?.trim() || undefined,
        price: Number(Number(values.price).toFixed(2)),
        category_id: values.category_id || undefined,
      };
      await onSubmit(normalized);
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, validationErrors, values]);

  return {
    values,
    isSubmitting,
    validationErrors,
    onChange,
    onSubmit: onSubmitInternal,
    actions,
  } as const;
}


