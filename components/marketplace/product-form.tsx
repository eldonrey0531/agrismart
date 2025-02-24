import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProductInput, productSchema } from '@/lib/validations/form';
import { Button } from '@/components/ui/button';
import { Form, FormField } from '@/components/ui/form';
import { FormInput } from '@/components/ui/form-input';
import { Select } from '@/components/ui/select';

interface ProductFormProps {
  onSubmit: (data: ProductInput) => Promise<void>;
  initialData?: Partial<ProductInput>;
  isLoading?: boolean;
  categories: Array<{ value: string; label: string }>;
}

export function ProductForm({
  onSubmit,
  initialData,
  isLoading = false,
  categories,
}: ProductFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const form = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      price: initialData?.price || 0,
      quantity: initialData?.quantity || 1,
      category: initialData?.category || '',
      location: initialData?.location || {
        latitude: 0,
        longitude: 0,
        address: '',
      },
      images: initialData?.images || [],
    },
    mode: 'onChange',
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // Convert FileList to Array and validate
    const newFiles = Array.from(files).slice(0, 5 - imageFiles.length);
    if (imageFiles.length + newFiles.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    // Validate file types and sizes
    const invalidFile = newFiles.find(
      file => !file.type.startsWith('image/') || file.size > 5 * 1024 * 1024
    );
    if (invalidFile) {
      setError('Invalid file type or size exceeds 5MB');
      return;
    }

    setImageFiles([...imageFiles, ...newFiles]);
    setError(null);
  };

  const handleSubmit = async (data: ProductInput) => {
    try {
      setError(null);
      
      // First, upload images and get URLs
      const imageUrls = await Promise.all(
        imageFiles.map(async (file) => {
          // TODO: Implement image upload logic
          const fakeUrl = URL.createObjectURL(file);
          return {
            url: fakeUrl,
            alt: file.name,
          };
        })
      );

      // Combine form data with image URLs
      const productData = {
        ...data,
        images: imageUrls,
      };

      await onSubmit(productData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-8"
        noValidate
      >
        <FormInput
          name="title"
          label="Product Title"
          disabled={isLoading}
          placeholder="Enter product title"
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                {...field}
                className="min-h-[120px] w-full rounded-md border border-input px-3 py-2 text-sm"
                placeholder="Describe your product..."
                disabled={isLoading}
              />
            </div>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            name="price"
            label="Price"
            type="number"
            min={0}
            step={0.01}
            disabled={isLoading}
            placeholder="0.00"
          />

          <FormInput
            name="quantity"
            label="Quantity"
            type="number"
            min={0}
            step={1}
            disabled={isLoading}
            placeholder="1"
          />
        </div>

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isLoading}
              >
                {categories.map((category) => (
                  <Select.Option
                    key={category.value}
                    value={category.value}
                  >
                    {category.label}
                  </Select.Option>
                ))}
              </Select>
            </div>
          )}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium">Product Images</label>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              disabled={isLoading || imageFiles.length >= 5}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer rounded-md bg-primary/10 px-4 py-2 text-sm text-primary hover:bg-primary/20"
            >
              Add Images
            </label>
            <span className="text-xs text-muted-foreground">
              {imageFiles.length}/5 images (Max 5MB each)
            </span>
          </div>
          {imageFiles.length > 0 && (
            <div className="grid grid-cols-5 gap-4 mt-4">
              {imageFiles.map((file, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-md overflow-hidden"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="object-cover w-full h-full"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newFiles = [...imageFiles];
                      newFiles.splice(index, 1);
                      setImageFiles(newFiles);
                    }}
                    className="absolute top-1 right-1 rounded-full bg-destructive p-1 text-white hover:bg-destructive/90"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="text-sm text-destructive" role="alert">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => form.reset()}
          >
            Reset
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !form.formState.isValid}
          >
            {isLoading ? 'Publishing...' : 'Publish Product'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default ProductForm;