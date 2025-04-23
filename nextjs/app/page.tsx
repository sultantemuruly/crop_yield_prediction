import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PredictionForm from "@/components/prediction-form";
import TrainingForm from "@/components/training-form";

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8 lg:p-12">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Crop Yield Prediction
          </h1>
          <p className="text-gray-500 md:text-xl/relaxed">
            Predict crop yields or submit training data to improve the model
          </p>
        </div>

        <Tabs defaultValue="predict" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="predict">Predict Yield</TabsTrigger>
            <TabsTrigger value="train">Train Model</TabsTrigger>
          </TabsList>
          <TabsContent value="predict" className="p-4 border rounded-md mt-2">
            <PredictionForm />
          </TabsContent>
          <TabsContent value="train" className="p-4 border rounded-md mt-2">
            <TrainingForm />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
