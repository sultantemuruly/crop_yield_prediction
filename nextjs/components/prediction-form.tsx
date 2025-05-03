"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

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
});

type FormValues = z.infer<typeof formSchema>;

export default function PredictionForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const url = process.env.NEXT_PUBLIC_FASTAPI_URL || "";

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      area: "India",
      item: "Wheat",
      rainfall: 150,
      pesticides: 10,
      temp: 25,
      year: new Date().getFullYear(),
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${url}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to get prediction");
      }

      const data = await response.json();
      setPrediction(data.predicted_yield);
    } catch (err) {
      console.error(err);
      setError("An error occurred while getting the prediction");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Predict Crop Yield</h2>
        <p className="text-gray-500">Enter parameters to predict crop yield</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Predicting...
              </>
            ) : (
              "Predict Yield"
            )}
          </Button>
        </form>
      </Form>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-md">{error}</div>
      )}

      {prediction !== null && !error && (
        <Card className="bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-medium">Predicted Yield</h3>
              <p className="text-3xl font-bold text-green-700 mt-2">
                {prediction.toFixed(2)} (hectograms / hectare)
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
