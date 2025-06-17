import * as dotenv from "dotenv";
import { createError } from "../error.js";
import axios from "axios";

dotenv.config();

export const generateImage = async (req, res, next) => {
  try {
    const { prompt } = req.body;

    // Replace 'stable-diffusion-v1-6' with the engine you find in your list!
    const response = await axios.post(
      "https://api.stability.ai/v1/generation/stable-diffusion-v1-6/text-to-image",
      {
        text_prompts: [{ text: prompt }],
        cfg_scale: 7,
        height: 512,
        width: 512,
        samples: 1,
        steps: 30,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      }
    );

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