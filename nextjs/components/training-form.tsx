"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2 } from "lucide-react";

// Import the Select components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { countries, cropTypes } from "@/lib/data";

const formSchema = z.object({
  area: z.string().min(1, "Please select a country"),
  item: z.string().min(1, "Please select a crop type"),
  rainfall: z.coerce
    .number()
    .nonnegative("Rainfall must be a non-negative number"),
  pesticides: z.coerce
    .number()
    .nonnegative("Pesticides must be a non-negative number"),
  temp: z.coerce.number(),
  year: z.coerce.number().int().min(1900).max(2100),
  yield_value: z.coerce
    .number()
    .positive("Yield value must be a positive number"),
});

type FormValues = z.infer<typeof formSchema>;

export default function TrainingForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      area: "India",
      item: "Wheat",
      rainfall: 150,
      pesticides: 10,
      temp: 25,
      year: new Date().getFullYear(),
      yield_value: 5,
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/train", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to submit training data");
      }

      setSuccess(true);
      form.reset(values);
    } catch (err) {
      console.error(err);
      setError("An error occurred while submitting training data");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Train Model</h2>
        <p className="text-gray-500">
          Submit data to improve the prediction model
        </p>
      </div>

      <Form {...form}>
        <form
          /* onSubmit={form.handleSubmit(onSubmit)} */ className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="item"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Crop Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a crop type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cropTypes.map((crop) => (
                        <SelectItem key={crop} value={crop}>
                          {crop}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rainfall"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rainfall (mm)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="150" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pesticides"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pesticides (tonnes)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="temp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Temperature (°C)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="25" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="2023" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="yield_value"
              render={({ field }) => (
                <FormItem className="col-span-full">
                  <FormLabel>Actual Yield (hectograms / hectare)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="5" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the actual yield value for training the model
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Training Data"
            )}
          </Button>
        </form>
      </Form>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Success</AlertTitle>
          <AlertDescription className="text-green-700">
            Training data submitted successfully. The model will be updated with
            your data.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
