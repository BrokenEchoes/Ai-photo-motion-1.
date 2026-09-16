import express from "express";
import multer from "multer";

const app = express();

const upload = multer({
  storage: multer.memoryStorage()
});

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.POLLINATIONS_API_KEY;

app.use(express.static("."));

app.post(
  "/generate",
  upload.single("photo"),
  async (req, res) => {

    try {

      if (!API_KEY) {
        return res.status(500).json({
          error: "Pollinations API key is not configured."
        });
      }

      if (!req.file) {
        return res.status(400).json({
          error: "Photo is required."
        });
      }

      const prompt =
        req.body.prompt ||
        "Create a realistic photo edit.";

      const form = new FormData();

      form.append(
        "image",
        new Blob(
          [req.file.buffer],
          { type: req.file.mimetype }
        ),
        req.file.originalname
      );

      form.append("prompt", prompt);

      form.append(
        "model",
        "gptimage"
      );

      const response = await fetch(
        "https://gen.pollinations.ai/v1/images/edits",
        {
          method: "POST",

          headers: {
            "Authorization":
              `Bearer ${API_KEY}`
          },

          body: form
        }
      );

      const text = await response.text();

      if (!response.ok) {

        console.error(
          "Pollinations error:",
          text
        );

        return res.status(
          response.status
        ).json({
          error: text
        });
      }

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        return res.status(500).json({
          error:
            "Invalid response from Pollinations."
        });
      }

      res.json(data);

    } catch (error) {

      console.error(error);

      res.status(500).json({
        error:
          error.message ||
          "Image generation failed."
      });

    }

  }
);

app.listen(
  PORT,
  () => {
    console.log(
      `AI Photo Studio running on port ${PORT}`
    );
  }
);