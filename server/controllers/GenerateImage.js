import * as dotenv from "dotenv";
import { createError } from "../error.js";
import axios from "axios";

dotenv.config();

export const generateImage = async (req, res, next) => {
  try {
    const { prompt, width, height, steps, cfg_scale, samples, style_preset } = req.body;

    // Defaults (if not provided by frontend)
    const imageWidth = width || 1024;
    const imageHeight = height || 1024;
    const diffusionSteps = steps || 30;
    const cfgScale = cfg_scale || 7;
    const numSamples = samples || 1;

    // SDXL 1.0 engine_id
    const engineId = "stable-diffusion-xl-1024-v1-0";

    const response = await axios.post(
      `https://api.stability.ai/v1/generation/${engineId}/text-to-image`,
      {
        text_prompts: [
          {
            text: prompt,
            weight: 1, // default weight
          },
        ],
        width: imageWidth,
        height: imageHeight,
        steps: diffusionSteps,
        cfg_scale: cfgScale,
        samples: numSamples,
        style_preset: style_preset || undefined, // optional (anime, cinematic, etc.)
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json", // base64 JSON response
        },
      }
    );

    // Extract base64 image
    const generatedImage = response.data.artifacts[0].base64;

    res.status(200).json({ photo: generatedImage });
  } catch (error) {
    next(
      createError(
        error?.response?.status || 500,
        error?.response?.data?.message ||
          error?.response?.data?.error?.message ||
          error.message ||
          "Image generation failed"
      )
    );
  }
};
