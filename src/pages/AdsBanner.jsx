/* eslint-disable perfectionist/sort-named-imports */
/* eslint-disable react/prop-types */
/* eslint-disable */
import axios from "axios";
import { Formik, Form } from "formik";
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Snackbar,
  Typography,
  Chip,
} from "@mui/material";
import { getBanner, createBanner } from "src/services/BannerService";

const CLOUDINARY_UPLOAD_PRESET = "market_data";
const CLOUDINARY_CLOUD_NAME = "drq4o4qix";

const redButtonStyle = {
  bgcolor: "#dc2626",
  color: "white",
  "&:hover": { bgcolor: "#b91c1c" },
};

// ----------------------------------------------------------
// ✅ Upload Area Component
// ----------------------------------------------------------
export const UploadArea = ({
  title,
  subtitle,
  onUpload,
  hasImage,
  imageUrl,
  isEmpty = true,
  isUploading,
}) => (
  <Card
    sx={{
      height: "100%",
      border: "2px dashed #e5e7eb",
      backgroundColor: "#ffffff",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    }}
  >
    <CardContent
      sx={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Box>
          <Typography variant="subtitle1" fontWeight="600">
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>
        {isEmpty && <Chip label="Empty" size="small" />}
      </Box>

      {/* Upload Area */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 200,
          border: "2px dashed #e5e7eb",
          borderRadius: 2,
          backgroundColor: "#f9fafb",
          position: "relative",
        }}
      >
        {hasImage ? (
          <img
            src={imageUrl}
            alt={title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: 8,
              maxHeight: 200,
            }}
          />
        ) : (
          <Typography>Upload Banner</Typography>
        )}

        <Button
          component="label"
          variant="contained"
          disabled={isUploading}
          sx={{
            ...redButtonStyle,
            position: hasImage ? "absolute" : "static",
            bottom: hasImage ? 10 : "auto",
            right: hasImage ? 10 : "auto",
          }}
        >
          {isUploading ? "Uploading..." : hasImage ? "Change" : "Upload"}
          <input type="file" hidden onChange={onUpload} />
        </Button>
      </Box>
    </CardContent>
  </Card>
);

// ----------------------------------------------------------
// 🔥 Dynamic Banner Config (1 → 15)
// ----------------------------------------------------------
const BANNER_FIELDS = Array.from({ length: 15 }, (_, i) => ({
  key: `homeBanner${i + 1}`,
  title: `Home Banner ${i + 1}`,
  subtitle: `Banner ${i + 1}`,
}));

// ----------------------------------------------------------
// ✅ Main Component
// ----------------------------------------------------------
export default function BannerManager() {
  const [banner, setBanner] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [loading, setLoading] = useState(false);
  const [uploadingKey, setUploadingKey] = useState(null);

  const fetchBanner = async () => {
    setLoading(true);
    try {
      const res = await getBanner();
      setBanner(res.banner || null);
    } catch {
      setSnackbar({ open: true, message: "Error fetching banner" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanner();
  }, []);

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      formData
    );

    return res.data.secure_url;
  };

  const handleSubmit = async (values) => {
    try {
      await createBanner(values);
      setSnackbar({ open: true, message: "Banners saved successfully" });
      fetchBanner();
    } catch {
      setSnackbar({ open: true, message: "Error saving banners" });
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" mb={2}>
        Banner Management
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <Formik
          initialValues={BANNER_FIELDS.reduce((acc, field) => {
            acc[field.key] = banner?.[field.key] || "";
            return acc;
          }, {})}
          enableReinitialize
          onSubmit={handleSubmit}
        >
          {({ setFieldValue, values }) => {
            const handleUpload = (key) => async (e) => {
              const file = e.target.files[0];
              if (!file) return;

              setUploadingKey(key);
              try {
                const url = await uploadImageToCloudinary(file);
                setFieldValue(key, url);
              } catch {
                setSnackbar({ open: true, message: "Upload failed" });
              } finally {
                setUploadingKey(null);
              }
            };

            return (
              <Form>
                <Grid container spacing={3}>
                  {BANNER_FIELDS.map(({ key, title, subtitle }) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={key}>
                      <UploadArea
                        title={title}
                        subtitle={subtitle}
                        hasImage={!!values[key]}
                        imageUrl={values[key]}
                        isEmpty={!values[key]}
                        onUpload={handleUpload(key)}
                        isUploading={uploadingKey === key}
                      />
                    </Grid>
                  ))}
                </Grid>

                <Box mt={4} textAlign="center">
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={!!uploadingKey}
                    sx={redButtonStyle}
                  >
                    Save All Banners
                  </Button>
                </Box>
              </Form>
            );
          }}
        </Formik>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: "" })}
        message={snackbar.message}
      />
    </Box>
  );
}