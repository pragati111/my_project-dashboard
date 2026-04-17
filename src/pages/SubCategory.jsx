/* eslint-disable react/prop-types */
/* eslint-disable perfectionist/sort-named-imports */
/* eslint-disable */

import axios from "axios";
import * as XLSX from "xlsx";
import { Field, Formik, Form } from "formik";
import React, { useState, useEffect } from "react";
import { MdEdit, MdDelete, MdClear } from "react-icons/md";

import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import CSVUploaderSub from "./SubCategoryCSv";
import {
  getCategories,
} from "src/services/categoryService";
import {
  getSubCategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from "src/services/SubcategoryService";

// Cloudinary config
const CLOUDINARY_UPLOAD_PRESET = "market_data";
const CLOUDINARY_CLOUD_NAME = "drq4o4qix";

export default function SubCategory() {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingSub, setEditingSub] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subToDelete, setSubToDelete] = useState(null);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      console.log("Categories data:", data);
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setSnackbar({ open: true, message: "Error fetching categories", severity: "error" });
    }
  };

  // Fetch subcategories
  const fetchSubcategories = async () => {
    setLoading(true);
    try {
      const data = await getSubCategories();
      console.log("All subcategories data:", data);
      console.log("Total subcategories count:", data.subcategories?.length || 0);
      setSubcategories(data.subcategories || []);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      setSnackbar({ open: true, message: "Error fetching subcategories", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
  }, []);

  // Upload image to Cloudinary
  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return response.data.secure_url;
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw new Error("Failed to upload image to Cloudinary");
    }
  };

  const handleImageUpload = async (event, setFieldValue) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setSnackbar({ open: true, message: "Invalid file type. Please upload an image.", severity: "error" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSnackbar({ open: true, message: "File too large. Maximum size is 5MB.", severity: "error" });
      return;
    }

    setUploading(true);
    try {
      const imageUrl = await uploadImageToCloudinary(file);
      setFieldValue("image", imageUrl);
      setSnackbar({ open: true, message: "Image uploaded successfully", severity: "success" });
    } catch (error) {
      setSnackbar({ open: true, message: error.message || "Failed to upload image", severity: "error" });
    } finally {
      setUploading(false);
    }
  };

  // Submit (Add/Update)
  const handleSubmit = async (values, { resetForm }) => {
    // Validate required fields
    if (!values.name || !values.category) {
      setSnackbar({ open: true, message: "Name and category are required", severity: "error" });
      return;
    }

    try {
      const submitData = {
        name: values.name,
        category: values.category,
        image: values.image || "",
        section: values.section || "",
      };

      if (editingSub) {
        await updateSubcategory(editingSub._id, submitData);
        setSnackbar({ open: true, message: "Subcategory updated successfully", severity: "success" });
      } else {
        await createSubcategory(submitData);
        setSnackbar({ open: true, message: "Subcategory added successfully", severity: "success" });
      }
      resetForm();
      setEditingSub(null);
      fetchSubcategories();
    } catch (error) {
      console.error("Error saving subcategory:", error);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || error.message || "Error saving subcategory", 
        severity: "error" 
      });
    }
  };

  // Delete - with confirmation dialog
  const handleDeleteClick = (id) => {
    setSubToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!subToDelete) return;
    
    try {
      await deleteSubcategory(subToDelete);
      setSnackbar({ open: true, message: "Subcategory deleted successfully", severity: "success" });
      fetchSubcategories();
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || error.message || "Error deleting subcategory", 
        severity: "error" 
      });
    } finally {
      setDeleteDialogOpen(false);
      setSubToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setSubToDelete(null);
  };

  // Filter subcategories based on search query
  const filteredSubs = subcategories.filter(
    (sub) =>
      sub.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Red button styles
  const redButtonStyle = {
    bgcolor: '#dc2626',
    color: 'white',
    '&:hover': {
      bgcolor: '#b91c1c',
    },
  };

  const redOutlinedButtonStyle = {
    color: '#dc2626',
    borderColor: '#dc2626',
    '&:hover': {
      borderColor: '#b91c1c',
      bgcolor: 'rgba(220, 38, 38, 0.04)',
    },
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Subcategory Management
      </Typography>

      {/* CSV Upload */}
      <Box sx={{ mb: 3 }}>
        <CSVUploaderSub onUploadSuccess={fetchSubcategories} />
        <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
          <Typography variant="body2">
            💡 You can upload multiple subcategories at once using a CSV file.  
            Make sure your CSV includes columns: <b>name</b>, <b>category</b>, <b>image</b>, and <b>section</b> (optional).  
            <br />
            Example:  
            <code>Electronics, Mobile Phones, https://example.com/image.jpg, Electronics</code>
          </Typography>
        </Alert>
      </Box>

      {/* Formik Form */}
      <Formik
        initialValues={{
          name: editingSub?.name || "",
          category: editingSub?.category?._id || "",
          image: editingSub?.image || "",
          section: editingSub?.section || "",
        }}
        enableReinitialize
        onSubmit={handleSubmit}
        validate={(values) => {
          const errors = {};
          if (!values.name) errors.name = "Name is required";
          if (!values.category) errors.category = "Category is required";
          return errors;
        }}
      >
        {({ resetForm, setFieldValue, values, errors, touched, isSubmitting }) => (
          <Form style={{ marginBottom: "2rem" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>
              <Field 
                as={TextField} 
                name="name" 
                label="Subcategory Name" 
                fullWidth 
                required
                error={touched.name && Boolean(errors.name)}
                helperText={touched.name && errors.name}
              />

              <FormControl fullWidth required error={touched.category && Boolean(errors.category)}>
                <InputLabel>Category</InputLabel>
                <Field as={Select} name="category" label="Category">
                  <MenuItem value="">
                    <em>Select a category</em>
                  </MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Field>
                {touched.category && errors.category && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                    {errors.category}
                  </Typography>
                )}
              </FormControl>

              <Field 
                as={TextField} 
                name="section" 
                label="Section (optional)" 
                fullWidth 
                helperText="e.g., Electronics, Fashion, Grocery"
              />

              <Field 
                as={TextField} 
                name="image" 
                label="Image URL" 
                fullWidth 
                helperText="Enter image URL or upload below"
              />
              
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Button 
                  component="label" 
                  variant="outlined" 
                  disabled={uploading}
                  sx={redOutlinedButtonStyle}
                >
                  {uploading ? "Uploading..." : "Upload Image"}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => handleImageUpload(e, setFieldValue)}
                  />
                </Button>
                {uploading && <CircularProgress size={24} />}
              </Box>

              {values.image && (
                <Box sx={{ mt: 2 }}>
                  <img
                    src={values.image}
                    alt="Preview"
                    style={{ 
                      width: "100px", 
                      height: "100px", 
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "1px solid #e0e0e0"
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/100?text=Invalid+URL";
                    }}
                  />
                </Box>
              )}

              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  disabled={uploading || isSubmitting}
                  sx={redButtonStyle}
                >
                  {isSubmitting ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : editingSub ? (
                    "Update Subcategory"
                  ) : (
                    "Add Subcategory"
                  )}
                </Button>
                {editingSub && (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setEditingSub(null);
                      resetForm();
                    }}
                    startIcon={<MdClear />}
                  >
                    Cancel
                  </Button>
                )}
              </Box>
            </Box>
          </Form>
        )}
      </Formik>

      {/* Search */}
      <Box sx={{ mb: 2, display: "flex", gap: 2, alignItems: "center" }}>
        <TextField
          label="Search Subcategories"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or category..."
        />
        <Typography variant="body2" color="textSecondary">
          Total: {filteredSubs.length} subcategories
        </Typography>
      </Box>

      {/* Table - Showing All Subcategories */}
      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell><b>Name</b></TableCell>
                <TableCell><b>Category</b></TableCell>
                <TableCell><b>Section</b></TableCell>
                <TableCell><b>Image</b></TableCell>
                <TableCell><b>Actions</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSubs.length > 0 ? (
                filteredSubs.map((sub) => (
                  <TableRow key={sub._id} hover>
                    <TableCell>{sub.name}</TableCell>
                    <TableCell>{sub.category?.name || "N/A"}</TableCell>
                    <TableCell>{sub.section || "—"}</TableCell>
                    <TableCell>
                      {sub.image ? (
                        <img
                          src={sub.image}
                          alt={sub.name}
                          width="80"
                          height="80"
                          style={{ 
                            objectFit: "cover", 
                            borderRadius: "4px",
                            border: "1px solid #e0e0e0"
                          }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/80?text=No+Image";
                          }}
                        />
                      ) : (
                        <Box 
                          sx={{ 
                            width: 80, 
                            height: 80, 
                            bgcolor: '#f5f5f5', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            borderRadius: 1
                          }}
                        >
                          <Typography variant="caption" color="textSecondary">
                            No Image
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        color="primary" 
                        onClick={() => {
                          setEditingSub(sub);
                        }}
                        title="Edit"
                      >
                        <MdEdit />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleDeleteClick(sub._id)}
                        title="Delete"
                      >
                        <MdDelete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body1" color="textSecondary" sx={{ py: 3 }}>
                      {searchQuery 
                        ? "No subcategories found matching your search" 
                        : "No subcategories available. Add one to get started!"}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this subcategory? This action cannot be undone.
            {subToDelete && <br />}
            {subToDelete && <strong>Note: This will also affect products associated with this subcategory.</strong>}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}