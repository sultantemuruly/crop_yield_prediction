/* eslint-disable */
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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

export default function TrainingFormScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      area: "Albania",
      item: "Maize",
      rainfall: 1485,
      pesticides: 121,
      temp: 16,
      year: new Date().getFullYear(),
      yield_value: 36613,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const payload = { ...values, is_trained: false };

    try {
      const url = process.env.EXPO_PUBLIC_FASTAPI_URL || "";
      const response = await fetch(`${url}/info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to submit training data");
      }

      setSuccess(true);
      reset(values);
    } catch (err) {
      console.error(err);
      setError("An error occurred while submitting training data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Train Model</Text>
      <Text style={styles.subtitle}>
        Submit data to improve the prediction model
      </Text>

      {/* Country Picker */}
      <Text style={styles.label}>Country</Text>
      <Controller
        control={control}
        name="area"
        render={({ field: { onChange, value } }) => (
          <View style={styles.pickerWrapper}>
            <Picker selectedValue={value} onValueChange={onChange}>
              {countries.map((country) => (
                <Picker.Item key={country} label={country} value={country} />
              ))}
            </Picker>
          </View>
        )}
      />
      {errors.area && <Text style={styles.error}>{errors.area.message}</Text>}

      {/* Crop Picker */}
      <Text style={styles.label}>Crop Type</Text>
      <Controller
        control={control}
        name="item"
        render={({ field: { onChange, value } }) => (
          <Picker selectedValue={value} onValueChange={onChange}>
            {cropTypes.map((crop) => (
              <Picker.Item key={crop} label={crop} value={crop} />
            ))}
          </Picker>
        )}
      />
      {errors.item && <Text style={styles.error}>{errors.item.message}</Text>}

      {/* Rainfall */}
      <Text style={styles.label}>Rainfall (mm)</Text>
      <Controller
        control={control}
        name="rainfall"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={String(value)}
            onChangeText={(text) => onChange(Number(text))}
          />
        )}
      />
      {errors.rainfall && (
        <Text style={styles.error}>{errors.rainfall.message}</Text>
      )}

      {/* Pesticides */}
      <Text style={styles.label}>Pesticides (tonnes)</Text>
      <Controller
        control={control}
        name="pesticides"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={String(value)}
            onChangeText={(text) => onChange(Number(text))}
          />
        )}
      />
      {errors.pesticides && (
        <Text style={styles.error}>{errors.pesticides.message}</Text>
      )}

      {/* Temperature */}
      <Text style={styles.label}>Temperature (°C)</Text>
      <Controller
        control={control}
        name="temp"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={String(value)}
            onChangeText={(text) => onChange(Number(text))}
          />
        )}
      />
      {errors.temp && <Text style={styles.error}>{errors.temp.message}</Text>}

      {/* Year */}
      <Text style={styles.label}>Year</Text>
      <Controller
        control={control}
        name="year"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={String(value)}
            onChangeText={(text) => onChange(Number(text))}
          />
        )}
      />
      {errors.year && <Text style={styles.error}>{errors.year.message}</Text>}

      {/* Yield Value */}
      <Text style={styles.label}>Actual Yield (hectograms / hectare)</Text>
      <Controller
        control={control}
        name="yield_value"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={String(value)}
            onChangeText={(text) => onChange(Number(text))}
          />
        )}
      />
      {errors.yield_value && (
        <Text style={styles.error}>{errors.yield_value.message}</Text>
      )}

      {isLoading ? (
        <ActivityIndicator style={{ marginVertical: 20 }} />
      ) : (
        <View style={styles.buttonWrapper}>
          <Button
            title="Submit Training Data"
            onPress={handleSubmit(onSubmit)}
          />
        </View>
      )}

      {error && (
        <Text style={[styles.feedback, { color: "#b91c1c" }]}>{error}</Text>
      )}

      {success && (
        <Text style={[styles.feedback, { color: "#15803d" }]}>
          Training data submitted successfully!
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    marginTop: 20,
    backgroundColor: "#f8fafc", // subtle off-white
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1e3a8a", // deep blue
    marginBottom: 4,
  },
  subtitle: {
    color: "#64748b",
    fontSize: 16,
    marginBottom: 24,
  },
  label: {
    fontWeight: "600",
    marginTop: 16,
    color: "#0f172a",
    fontSize: 15,
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    fontSize: 16,
    color: "#0f172a",
    marginTop: 6,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  error: {
    color: "#dc2626",
    fontSize: 13,
    marginTop: 4,
  },
  feedback: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 24,
    padding: 12,
    borderRadius: 12,
    textAlign: "center",
    backgroundColor: "#f1f5f9",
  },
  pickerWrapper: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    marginTop: 6,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  buttonWrapper: {
    marginTop: 24,
    borderRadius: 12,
    overflow: "hidden",
  },
});
