'use client';

import { marketplaceApi } from '@/lib/shared/services/api-client';
import { CreateProductInput, Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

const categories = [
  'seeds',
  'tools',
  'equipment',
  'fertilizers',
  'pesticides',
  'others',
] as const;

const createProductSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0, 'Price cannot be negative'),
  category: z.enum(categories),
  location: z.object({
    coordinates: z.tuple([
      z.number().min(-180).max(180),
      z.number().min(-90).max(90),
    ]),
    address: z.string().min(1, 'Address is required'),
  }),
  images: z.array(z.string()).min(1, 'At least one image is required'),
});

type CreateProductData = z.infer<typeof createProductSchema>;

export default function CreateProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateProductData>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      location: {
        coordinates: [0, 0],
        address: '',
      },
      images: [],
    },
  });

  const onSubmit = async (data: CreateProductData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      await marketplaceApi.post<Product>('/products', data);
      
      router.push('/marketplace');
      router.refresh();
    } catch (e) {
      setError('Failed to create product. Please try again.');
      console.error('Create product error:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-2xl py-8">
      <Link
        href="/marketplace"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Marketplace
      </Link>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">List a Product</h1>
          <p className="text-muted-foreground">
            Fill in the details below to create a new product listing.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                {...register('title')}
                placeholder="Enter product title"
                className="mt-1"
              />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                {...register('description')}
                placeholder="Enter product description"
                className="mt-1"
                rows={4}
              />
              {errors.description && (
                <p className="text-sm text-destructive mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Price</label>
                <Controller
                  name="price"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="number"
                      step="0.01"
                      value={field.value || ''}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      placeholder="0.00"
                      className="mt-1"
                    />
                  )}
                />
                {errors.price && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.price.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Category</label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.category && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.category.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Location</label>
              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <Input
                    value={field.value.address}
                    onChange={(e) => 
                      field.onChange({
                        ...field.value,
                        address: e.target.value,
                      })
                    }
                    placeholder="Enter address"
                    className="mt-1"
                  />
                )}
              />
              {errors.location?.address && (
                <p className="text-sm text-destructive mt-1">
                  {errors.location.address.message}
                </p>
              )}
            </div>

            {/* TODO: Add image upload functionality */}
            <div>
              <label className="text-sm font-medium">Images</label>
              <p className="text-sm text-muted-foreground mt-1">
                Image upload functionality coming soon.
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Create Product
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}