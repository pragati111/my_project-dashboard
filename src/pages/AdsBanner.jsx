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
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              backgroundColor: "#f3f4f6",
              color: "#6b7280",
              borderRadius: "4px",
              width: 24,
              height: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: "bold",
            }}
          >
            IMG
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="600" color="#1f2937">
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
        </Box>
        {isEmpty && (
          <Chip
            label="Empty"
            size="small"
            sx={{ color: "#6b7280", borderColor: "#d1d5db" }}
            variant="outlined"
          />
        )}
      </Box>

      {/* Upload Area */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 200,
          border: "2px dashed #e5e7eb",
          borderRadius: 2,
          backgroundColor: "#f9fafb",
          position: "relative",
        }}
      >
        {hasImage && imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8, maxHeight: 200 }}
          />
        ) : (
          <Box sx={{ textAlign: "center" }}>
            <Box
              sx={{
                fontSize: 40,
                color: "#9ca3af",
                mb: 1,
                backgroundColor: "#f3f4f6",
                borderRadius: "50%",
                width: 60,
                height: 60,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                fontWeight: "bold",
              }}
            >
              ↑
            </Box>
            <Typography variant="h6" color="#374151" gutterBottom>
              Upload Banner
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Drag & drop or click to select
            </Typography>
          </Box>
        )}

        {/* Upload / Change Button */}
        <Button
          component="label"
          variant="contained"
          disabled={isUploading}
          sx={{
            ...redButtonStyle,
            position: hasImage && imageUrl ? "absolute" : "static",
            bottom: hasImage && imageUrl ? 10 : "auto",
            right: hasImage && imageUrl ? 10 : "auto",
            mt: hasImage && imageUrl ? 0 : 2,
          }}
        >
          {isUploading ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={16} color="inherit" />
              Uploading...
            </Box>
          ) : hasImage && imageUrl ? (
            "Change"
          ) : (
            "Upload"
          )}
          <input type="file" accept="image/*" hidden onChange={onUpload} disabled={isUploading} />
        </Button>
      </Box>
    </CardContent>
  </Card>
);

// ----------------------------------------------------------
// Banner config — add/remove banners here easily
// ----------------------------------------------------------
const BANNER_FIELDS = [
  { key: "homeBanner1", title: "Home Banner 1", subtitle: "First main banner" },
  { key: "homeBanner2", title: "Home Banner 2", subtitle: "Second main banner" },
  { key: "homeBanner3", title: "Home Banner 3", subtitle: "Third main banner" },
];

// ----------------------------------------------------------
// ✅ Main Component
// ----------------------------------------------------------
export default function BannerManager() {
  const [banner, setBanner] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [loading, setLoading] = useState(false);
  // Track uploading state per banner key
  const [uploadingKey, setUploadingKey] = useState(null);

  const fetchBanner = async () => {
    setLoading(true);
    try {
      const res = await getBanner();
      console.log("API response:", res);
      console.log("Banner data:", res.banner);
      setBanner(res.banner || null);
    } catch (error) {
      console.error("Error fetching banner:", error.response?.status, error.response?.data);
      setSnackbar({ open: true, message: "Error fetching banner", severity: "error" });
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

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data.secure_url;
  };

  const handleSubmit = async (values) => {
    try {
      await createBanner(values);
      setSnackbar({ open: true, message: "✅ Banners saved successfully", severity: "success" });
      fetchBanner();
    } catch (error) {
      console.error("Error saving banners:", error);
      setSnackbar({ open: true, message: "❌ Error saving banners", severity: "error" });
    }
  };

  return (
    <Box sx={{ p: 4, backgroundColor: "#ffffff", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="700" color="#1f2937" gutterBottom>
          Banner Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your homepage banners — upload up to 3 images
        </Typography>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <Formik
          initialValues={{
            homeBanner1: banner?.homeBanner1 || "",
            homeBanner2: banner?.homeBanner2 || "",
            homeBanner3: banner?.homeBanner3 || "",
          }}
          enableReinitialize
          onSubmit={handleSubmit}
        >
          {({ setFieldValue, values }) => {
            // One handler for all banners, takes the field key
            const handleImageUpload = (fieldKey) => async (event) => {
              const { files } = event.target;
              if (!files.length) return;

              setUploadingKey(fieldKey);
              try {
                const url = await uploadImageToCloudinary(files[0]);
                setFieldValue(fieldKey, url);
                setSnackbar({ open: true, message: `Banner uploaded successfully`, severity: "success" });
              } catch {
                setSnackbar({ open: true, message: "Error uploading image", severity: "error" });
              } finally {
                setUploadingKey(null);
              }
            };

            return (
              <Form>
                <Grid container spacing={3}>
                  {BANNER_FIELDS.map(({ key, title, subtitle }) => (
                    <Grid item xs={12} md={4} key={key}>
                      <UploadArea
                        title={title}
                        subtitle={subtitle}
                        hasImage={!!values[key]}
                        imageUrl={values[key]}
                        isEmpty={!values[key]}
                        onUpload={handleImageUpload(key)}
                        isUploading={uploadingKey === key}
                      />
                    </Grid>
                  ))}
                </Grid>

                {/* Save Button */}
                <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={!!uploadingKey}
                    sx={{ ...redButtonStyle, px: 4, py: 1.5 }}
                  >
                    {uploadingKey ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CircularProgress size={20} color="inherit" />
                        Uploading...
                      </Box>
                    ) : (
                      "Save All Banners"
                    )}
                  </Button>
                </Box>
              </Form>
            );
          }}
        </Formik>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
}