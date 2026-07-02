import { zodResolver } from '@hookform/resolvers/zod'
import { DefaultValues, useForm, FieldValues } from 'react-hook-form'
import z from 'zod'

// Create a generic hook that accepts a dynamic schema type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useZodForm = <T extends z.ZodType<any, any, any>>(
  schema: T,
  defaultValues?: DefaultValues<z.TypeOf<T>> | undefined
) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
    reset,
  } = useForm<z.infer<T> & FieldValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: defaultValues as any,
  })

  return {
    register,
    errors,
    handleSubmit,
    watch,
    reset,
  }
}
