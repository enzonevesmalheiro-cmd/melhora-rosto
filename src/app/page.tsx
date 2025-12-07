"use client";

import { useState } from "react";
import { Upload, Camera, Sparkles, CheckCircle2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FaceAnalysis {
  faceShape: string;
  characteristics: string[];
  exercises: Exercise[];
  habits: Habit[];
  recommendations: string[];
}

interface Exercise {
  name: string;
  description: string;
  duration: string;
  frequency: string;
  benefits: string[];
}

interface Habit {
  name: string;
  description: string;
  frequency: string;
  impact: string;
}

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<FaceAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setAnalysis(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();

      // Aguarda o vídeo carregar
      await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
      });

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0);

      const imageData = canvas.toDataURL("image/jpeg");
      setSelectedImage(imageData);
      setAnalysis(null);
      setError(null);

      // Para a câmera
      stream.getTracks().forEach((track) => track.stop());
    } catch (err) {
      setError("Não foi possível acessar a câmera. Por favor, use o upload de imagem.");
    }
  };

  const analyzeFace = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze-face", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: selectedImage }),
      });

      if (!response.ok) {
        throw new Error("Erro ao analisar a imagem");
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError("Erro ao analisar a face. Por favor, tente novamente.");
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-purple-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              FaceGlow
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Descubra o formato do seu rosto e receba exercícios personalizados para realçar sua beleza natural
          </p>
        </div>

        {/* Upload Section */}
        {!analysis && (
          <Card className="mb-8 border-2 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Envie sua foto</CardTitle>
              <CardDescription>
                Tire uma foto ou faça upload de uma imagem clara do seu rosto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Upload Button */}
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl hover:border-purple-500 transition-all cursor-pointer bg-white dark:bg-gray-800">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer text-center w-full">
                    <Upload className="w-16 h-16 mx-auto mb-4 text-purple-500" />
                    <p className="text-lg font-semibold mb-2">Fazer Upload</p>
                    <p className="text-sm text-gray-500">PNG, JPG até 10MB</p>
                  </label>
                </div>

                {/* Camera Button */}
                <div
                  onClick={handleCameraCapture}
                  className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl hover:border-pink-500 transition-all cursor-pointer bg-white dark:bg-gray-800"
                >
                  <Camera className="w-16 h-16 mx-auto mb-4 text-pink-500" />
                  <p className="text-lg font-semibold mb-2">Usar Câmera</p>
                  <p className="text-sm text-gray-500">Tire uma foto agora</p>
                </div>
              </div>

              {/* Preview */}
              {selectedImage && (
                <div className="mt-8">
                  <div className="relative w-full max-w-md mx-auto">
                    <img
                      src={selectedImage}
                      alt="Preview"
                      className="w-full h-auto rounded-xl shadow-lg"
                    />
                  </div>
                  <div className="flex justify-center mt-6">
                    <Button
                      onClick={analyzeFace}
                      disabled={isAnalyzing}
                      size="lg"
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                          Analisando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Analisar Rosto
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {error && (
                <Alert variant="destructive" className="mt-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Face Shape Card */}
            <Card className="border-2 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-3xl mb-2">Seu Formato de Rosto</CardTitle>
                    <CardDescription>Análise completa da sua estrutura facial</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAnalysis(null);
                      setSelectedImage(null);
                    }}
                  >
                    Nova Análise
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 p-6 rounded-xl mb-6">
                  <h3 className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-4">
                    {analysis.faceShape}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.characteristics.map((char, index) => (
                      <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                        {char}
                      </Badge>
                    ))}
                  </div>
                </div>

                {analysis.recommendations.length > 0 && (
                  <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1">
                        {analysis.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Exercises and Habits Tabs */}
            <Card className="border-2 shadow-xl">
              <CardContent className="pt-6">
                <Tabs defaultValue="exercises" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="exercises" className="text-lg">
                      Exercícios Faciais
                    </TabsTrigger>
                    <TabsTrigger value="habits" className="text-lg">
                      Hábitos Saudáveis
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="exercises" className="space-y-6">
                    {analysis.exercises.map((exercise, index) => (
                      <Card key={index} className="border shadow-md">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-xl mb-2">{exercise.name}</CardTitle>
                              <div className="flex gap-2 flex-wrap">
                                <Badge variant="outline">{exercise.duration}</Badge>
                                <Badge variant="outline">{exercise.frequency}</Badge>
                              </div>
                            </div>
                            <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700 dark:text-gray-300 mb-4">
                            {exercise.description}
                          </p>
                          <Separator className="my-4" />
                          <div>
                            <h4 className="font-semibold mb-2 text-sm text-gray-600 dark:text-gray-400">
                              Benefícios:
                            </h4>
                            <ul className="space-y-1">
                              {exercise.benefits.map((benefit, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                  <span>{benefit}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="habits" className="space-y-6">
                    {analysis.habits.map((habit, index) => (
                      <Card key={index} className="border shadow-md">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-xl mb-2">{habit.name}</CardTitle>
                              <div className="flex gap-2 flex-wrap">
                                <Badge variant="outline">{habit.frequency}</Badge>
                                <Badge
                                  variant="secondary"
                                  className="bg-purple-100 text-purple-700 dark:bg-purple-900/30"
                                >
                                  {habit.impact}
                                </Badge>
                              </div>
                            </div>
                            <Sparkles className="w-6 h-6 text-purple-500 flex-shrink-0" />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700 dark:text-gray-300">{habit.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
