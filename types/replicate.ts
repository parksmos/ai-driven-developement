export interface IFluxModelInput {
  /**
   * Prompt for generated image
   */
  prompt: string;

  /**
   * Aspect ratio for the generated image
   * @default "1:1"
   */
  aspect_ratio?: "1:1" | "16:9" | "21:9" | "3:2" | "2:3" | "4:5" | "5:4" | "3:4" | "4:3" | "9:16" | "9:21";

  /**
   * Number of outputs to generate
   * @default 1
   * @minimum 1
   * @maximum 4
   */
  num_outputs?: number;

  /**
   * Number of denoising steps. 4 is recommended, and lower number of steps produce lower quality outputs, faster.
   * @default 4
   * @minimum 1
   * @maximum 4
   */
  num_inference_steps?: number;

  /**
   * Random seed. Set for reproducible generation
   */
  seed?: number;

  /**
   * Format of the output images
   * @default "webp"
   */
  output_format?: "webp" | "jpg" | "png";

  /**
   * Quality when saving the output images, from 0 to 100. 100 is best quality, 0 is lowest quality. Not relevant for .png outputs
   * @default 80
   * @minimum 0
   * @maximum 100
   */
  output_quality?: number;

  /**
   * Disable safety checker for generated images.
   * @default false
   */
  disable_safety_checker?: boolean;

  /**
   * Run faster predictions with model optimized for speed (currently fp8 quantized); disable to run in original bf16
   * @default true
   */
  go_fast?: boolean;

  /**
   * Approximate number of megapixels for generated image
   * @default "1"
   */
  megapixels?: "1" | "0.25";
}

export interface IPredictionInput {
  prompt: string;
  style?: {
    color?: string;
    texture?: string;
    mood?: string;
    intensity?: number;
  };
}

export interface IPrediction {
  id: string;
  version: string;
  urls: {
    get: string;
    cancel: string;
  };
  created_at: string;
  started_at?: string;
  completed_at?: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  input: any;
  output?: string[] | null;
  error?: string | null;
  logs?: string | null;
  metrics: {
    predict_time?: number;
  };
}

export interface IPredictionOutput {
  success: boolean;
  data?: {
    imageURL: string;
  };
  error?: {
    code: string;
    message: string;
  };
  prediction?: IPrediction;
} 