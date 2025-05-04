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
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Picker } from "@react-native-picker/picker";

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

export default function PredictionFormScreen() {
  const [prediction, setPrediction] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
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

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setPrediction(null);

    try {
      const url = process.env.EXPO_PUBLIC_FASTAPI_URL || "";
      const response = await fetch(`${url}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch prediction");
      }

      const result = await response.json();
      setPrediction(result.predicted_yield);
    } catch (error) {
      Alert.alert("Error", "An error occurred while getting the prediction.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Predict Crop Yield</Text>

      <Text style={styles.label}>Country</Text>
      <Controller
        control={control}
        name="area"
        render={({ field: { onChange, value } }) => (
          <View style={styles.pickerWrapper}>
            <Picker selectedValue={value} onValueChange={onChange}>
              {countries.map((country) => (
                <Picker.Item label={country} value={country} key={country} />
              ))}
            </Picker>
          </View>
        )}
      />
      {errors.area && <Text style={styles.error}>{errors.area.message}</Text>}

      <Text style={styles.label}>Crop Type</Text>
      <Controller
        control={control}
        name="item"
        render={({ field: { onChange, value } }) => (
          <Picker selectedValue={value} onValueChange={onChange}>
            {cropTypes.map((crop) => (
              <Picker.Item label={crop} value={crop} key={crop} />
            ))}
          </Picker>
        )}
      />
      {errors.item && <Text style={styles.error}>{errors.item.message}</Text>}

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

      {isLoading ? (
        <ActivityIndicator style={{ marginVertical: 20 }} />
      ) : (
        <View style={styles.buttonWrapper}>
          <Button title="Predict Yield" onPress={handleSubmit(onSubmit)} />
        </View>
      )}

      {prediction !== null && (
        <View style={styles.result}>
          <Text style={styles.resultText}>
            Predicted Yield: {prediction.toFixed(2)} hectograms/hectare
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    marginTop: 30,
    backgroundColor: "#f9fafb",
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1e3a8a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 24,
  },
  label: {
    marginTop: 16,
    marginBottom: 4,
    fontWeight: "600",
    color: "#0f172a",
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
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  picker: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    marginBottom: 8,
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
  error: {
    color: "#dc2626",
    fontSize: 13,
    marginTop: 4,
  },
  result: {
    marginTop: 24,
    padding: 20,
    backgroundColor: "#ecfdf5",
    borderRadius: 16,
    borderColor: "#34d399",
    borderWidth: 1,
    shadowColor: "#10b981",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  resultText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#047857",
    textAlign: "center",
  },
  buttonWrapper: {
    marginTop: 24,
    borderRadius: 12,
    overflow: "hidden",
  },
});
