/* eslint-disable react/prop-types */
/* eslint-disable */
import { FieldArray, Formik, Form } from "formik";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Alert, Box, Button, Container, Grid, IconButton, Paper, Snackbar,
  TextField, Typography, MenuItem, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Card, CardContent, CardMedia,
  Dialog, DialogTitle, DialogContent, DialogActions, Switch,
  FormControlLabel, Chip, Divider, Select, InputLabel, FormControl, Checkbox, FormGroup,
} from "@mui/material";
import { MdEdit, MdDelete, MdAdd, MdRemove } from "react-icons/md";
import { getCategories } from "src/services/categoryService";
import { getSubCategories } from "src/services/SubcategoryService";
import { createProduct, deleteProduct, getProduct, updateProduct } from "src/services/ProductService";
const CLOUDINARY_UPLOAD_PRESET = "market_data";
const CLOUDINARY_CLOUD_NAME = "drq4o4qix";

const CUSTOMIZATION_TYPES = ["radio", "checkbox", "dropdown", "text", "textarea", "file"];

const emptyCustomization = {
  id: "",
  label: "",
  type: "radio",
  options: [],
  placeholder: "",
  showIf: { field: "", value: "" },
};

const emptyMedia = { type: "image", url: "" };

const redButtonStyle = {
  bgcolor: "#dc2626",
  color: "white",
  "&:hover": { bgcolor: "#b91c1c" },
};

const redOutlinedButtonStyle = {
  color: "#dc2626",
  borderColor: "#dc2626",
  "&:hover": { borderColor: "#b91c1c", bgcolor: "rgba(220,38,38,0.04)" },
};

// ─── Customization Builder ───────────────────────────────────────────────────
function CustomizationBuilder({ customizations, setFieldValue }) {
  const add = () =>
    setFieldValue("customizations", [...customizations, { ...emptyCustomization, id: `field_${Date.now()}` }]);

  const remove = (i) =>
    setFieldValue("customizations", customizations.filter((_, idx) => idx !== i));

  const update = (i, key, value) => {
    const updated = customizations.map((c, idx) =>
      idx === i ? { ...c, [key]: value } : c
    );
    setFieldValue("customizations", updated);
  };

  const updateShowIf = (i, key, value) => {
    const updated = customizations.map((c, idx) =>
      idx === i ? { ...c, showIf: { ...c.showIf, [key]: value } } : c
    );
    setFieldValue("customizations", updated);
  };

  const addOption = (i) => {
    const updated = customizations.map((c, idx) =>
      idx === i ? { ...c, options: [...(c.options || []), ""] } : c
    );
    setFieldValue("customizations", updated);
  };

  const updateOption = (i, oi, value) => {
    const updated = customizations.map((c, idx) =>
      idx === i
        ? { ...c, options: c.options.map((o, oidx) => (oidx === oi ? value : o)) }
        : c
    );
    setFieldValue("customizations", updated);
  };

  const removeOption = (i, oi) => {
    const updated = customizations.map((c, idx) =>
      idx === i ? { ...c, options: c.options.filter((_, oidx) => oidx !== oi) } : c
    );
    setFieldValue("customizations", updated);
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" color="black">Customizations</Typography>
        <Button startIcon={<MdAdd />} onClick={add} size="small" variant="outlined" sx={redOutlinedButtonStyle}>
          Add Field
        </Button>
      </Box>

      {customizations.length === 0 && (
        <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
          No customization fields yet. Click "Add Field" to start.
        </Typography>
      )}

      {customizations.map((c, i) => (
        <Paper key={i} variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "#fafafa" }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle2" color="#dc2626">Field {i + 1}</Typography>
            <IconButton size="small" color="error" onClick={() => remove(i)}>
              <MdDelete />
            </IconButton>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Field ID"
                fullWidth
                size="small"
                value={c.id}
                onChange={(e) => update(i, "id", e.target.value)}
                helperText="e.g. size, finish, quantity"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Label"
                fullWidth
                size="small"
                value={c.label}
                onChange={(e) => update(i, "label", e.target.value)}
                helperText="e.g. Card Size"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                label="Type"
                fullWidth
                size="small"
                value={c.type}
                onChange={(e) => update(i, "type", e.target.value)}
              >
                {CUSTOMIZATION_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Placeholder — for text/textarea/file */}
            {["text", "textarea", "file"].includes(c.type) && (
              <Grid item xs={6}>
                <TextField
                  label="Placeholder"
                  fullWidth
                  size="small"
                  value={c.placeholder}
                  onChange={(e) => update(i, "placeholder", e.target.value)}
                />
              </Grid>
            )}

            {/* Options — for radio/checkbox/dropdown */}
            {["radio", "checkbox", "dropdown"].includes(c.type) && (
              <Grid item xs={12}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Typography variant="body2" color="text.secondary">Options</Typography>
                  <Button size="small" startIcon={<MdAdd />} onClick={() => addOption(i)} sx={{ ...redOutlinedButtonStyle, py: 0 }}>
                    Add
                  </Button>
                </Box>
                {(c.options || []).map((opt, oi) => (
                  <Box key={oi} display="flex" gap={1} mb={1}>
                    <TextField
                      size="small"
                      fullWidth
                      placeholder={`Option ${oi + 1}`}
                      value={opt}
                      onChange={(e) => updateOption(i, oi, e.target.value)}
                    />
                    <IconButton size="small" color="error" onClick={() => removeOption(i, oi)}>
                      <MdRemove />
                    </IconButton>
                  </Box>
                ))}
              </Grid>
            )}

            {/* ShowIf condition */}
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">
                Show this field only if (optional):
              </Typography>
              <Grid container spacing={1} mt={0.5}>
                <Grid item xs={6}>
                  <TextField
                    label="Field ID"
                    size="small"
                    fullWidth
                    placeholder="e.g. printType"
                    value={c.showIf?.field || ""}
                    onChange={(e) => updateShowIf(i, "field", e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Value"
                    size="small"
                    fullWidth
                    placeholder="e.g. Double Side"
                    value={c.showIf?.value || ""}
                    onChange={(e) => updateShowIf(i, "value", e.target.value)}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      ))}
    </Paper>
  );
}

// ─── Media Builder ────────────────────────────────────────────────────────────
function MediaBuilder({ media, setFieldValue, uploading, setUploading, showSnackbar }) {
  const uploadToCloudinary = async (file, resourceType = "image") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
      formData
    );
    return res.data.secure_url;
  };

  const handleFileUpload = async (e, type) => {
    const files = e.target?.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      const urls = await Promise.all(
        Array.from(files).map((f) => uploadToCloudinary(f, type))
      );
      const newMedia = urls.map((url) => ({ type, url }));
      setFieldValue("media", [...(media || []), ...newMedia]);
      showSnackbar(`${type}(s) uploaded successfully`);
    } catch {
      showSnackbar("Upload failed", "error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeMedia = (i) =>
    setFieldValue("media", media.filter((_, idx) => idx !== i));

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" color="black" gutterBottom>Media (Images & Videos)</Typography>
      <Box display="flex" gap={2} mb={2}>
        <Button component="label" variant="outlined" disabled={uploading} sx={redOutlinedButtonStyle} size="small">
          + Images
          <input type="file" hidden multiple accept="image/*" onChange={(e) => handleFileUpload(e, "image")} />
        </Button>
        <Button component="label" variant="outlined" disabled={uploading} sx={redOutlinedButtonStyle} size="small">
          + Videos
          <input type="file" hidden multiple accept="video/*" onChange={(e) => handleFileUpload(e, "video")} />
        </Button>
      </Box>

      <Grid container spacing={1}>
        {(media || []).map((m, i) => (
          <Grid item xs={4} key={i}>
            <Box position="relative">
              {m.type === "image" ? (
                <img src={m.url} alt="" style={{ width: "100%", height: 90, objectFit: "cover", borderRadius: 6 }} />
              ) : (
                <Box
                  sx={{ width: "100%", height: 90, bgcolor: "#1f2937", borderRadius: 1, display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <Typography variant="caption" color="white">🎬 Video</Typography>
                </Box>
              )}
              <Chip
                label={m.type}
                size="small"
                sx={{ position: "absolute", bottom: 4, left: 4, bgcolor: "rgba(0,0,0,0.6)", color: "white", fontSize: 10 }}
              />
              <IconButton
                size="small"
                color="error"
                onClick={() => removeMedia(i)}
                sx={{ position: "absolute", top: -6, right: -6, bgcolor: "white", "&:hover": { bgcolor: "#fee2e2" } }}
              >
                ✕
              </IconButton>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProductData() {
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, productId: null, productName: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 20;

  const showSnackbar = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catData, subData, prodData] = await Promise.all([
          getCategories(),
          getSubCategories(),
          getProduct(),
        ]);
        setCategories(catData.categories || []);
        setSubCategories(subData.subcategories || []);
        setProducts(prodData.data || []);
      } catch (err) {
        console.error(err);
        showSnackbar("Failed to load data", "error");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (editingProduct?.category?._id) {
      filterSubCategories(editingProduct.category._id);
    }
  }, [editingProduct]);

  const filterSubCategories = (categoryId) => {
    if (!categoryId) return setFilteredSubCategories([]);
    setFilteredSubCategories(subCategories.filter((s) => s.category?._id === categoryId));
  };

  const calculatePricing = useCallback((originalPrice, discountedMRP, setFieldValue) => {
    if (originalPrice && discountedMRP && discountedMRP <= originalPrice) {
      setFieldValue("discount", (((originalPrice - discountedMRP) / originalPrice) * 100).toFixed(2));
      setFieldValue("amountSaving", originalPrice - discountedMRP);
      setFieldValue("price", discountedMRP);
    } else {
      setFieldValue("discount", 0);
      setFieldValue("amountSaving", 0);
      setFieldValue("price", originalPrice || 0);
    }
  }, []);

  const handleEdit = (product) => {
    setEditingProduct(product);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (productId) => {
    setDeleteDialog({
      open: true,
      productId,
      productName: products.find((p) => p._id === productId)?.productName || "this product",
    });
  };

  const confirmDelete = async () => {
    try {
      await deleteProduct(deleteDialog.productId);
      setProducts((prev) => prev.filter((p) => p._id !== deleteDialog.productId));
      showSnackbar("Product deleted successfully");
      setDeleteDialog({ open: false, productId: null, productName: "" });
    } catch {
      showSnackbar("Failed to delete product", "error");
    }
  };

  const handleSubmit = async (values, { resetForm, setSubmitting }) => {
    setSubmitting(true);
    setLoading(true);
    try {
      if (editingProduct) {
        const res = await updateProduct(editingProduct._id, values);
        setProducts((prev) =>
          prev.map((p) => (p._id === editingProduct._id ? res.product : p))
        );
        showSnackbar("Product updated successfully");
      } else {
        const res = await createProduct(values);
        setProducts((prev) => [res.product, ...prev]);
        showSnackbar("Product added successfully");
      }
      resetForm();
      setEditingProduct(null);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      showSnackbar("Error saving product", "error");
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  const indexOfLast = currentPage * PRODUCTS_PER_PAGE;
  const indexOfFirst = indexOfLast - PRODUCTS_PER_PAGE;
  const currentProducts = products.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);

  const getInitialValues = () => ({
    name: editingProduct?.name || "",
    productName: editingProduct?.productName || "",
    category: editingProduct?.category?._id || "",
    subCategory: editingProduct?.subCategory?._id || "",
    unit: editingProduct?.unit || "",
    pack: editingProduct?.pack || "",
    description: editingProduct?.description || "",
    stock: editingProduct?.stock || 0,
    originalPrice: editingProduct?.originalPrice || 0,
    discountedMRP: editingProduct?.discountedMRP || 0,
    price: editingProduct?.price || 0,
    discount: editingProduct?.discount || 0,
    amountSaving: editingProduct?.amountSaving || 0,
    rating: editingProduct?.rating || 0,
    reviews: editingProduct?.reviews || 0,
    popular: editingProduct?.popular || false,
    active: editingProduct?.active ?? true,
    images: editingProduct?.images || [],
    media: editingProduct?.media || [],
    customizations: editingProduct?.customizations || [],
    more_details: {
      brand: editingProduct?.more_details?.brand || "",
      expiry: editingProduct?.more_details?.expiry || "",
    },
  });

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: "bold" }}>
        Product Management
      </Typography>

      {editingProduct && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Editing: {editingProduct.productName || editingProduct.name}
          <Button size="small" onClick={() => setEditingProduct(null)} sx={{ ml: 2 }}>
            Cancel Edit
          </Button>
        </Alert>
      )}

      <Formik
        enableReinitialize
        initialValues={getInitialValues()}
        validate={(values) => {
          const errors = {};
          if (!values.name) errors.name = "Required";
          if (!values.productName) errors.productName = "Required";
          if (!values.category) errors.category = "Required";
          if (values.rating < 0 || values.rating > 5) errors.rating = "Rating must be 0–5";
          return errors;
        }}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, setFieldValue, handleChange, isSubmitting, resetForm }) => (
          <Form>
            <Grid container spacing={3}>
              {/* ── LEFT COLUMN ── */}
              <Grid item xs={12} md={6}>
                {/* Product Info */}
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" color="black" gutterBottom>Product Info</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField name="name" label="Name" fullWidth value={values.name} onChange={handleChange}
                        error={touched.name && !!errors.name} helperText={touched.name && errors.name} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField name="productName" label="Product Name" fullWidth value={values.productName} onChange={handleChange}
                        error={touched.productName && !!errors.productName} helperText={touched.productName && errors.productName} />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField select name="category" label="Category" fullWidth value={values.category}
                        onChange={(e) => { handleChange(e); filterSubCategories(e.target.value); setFieldValue("subCategory", ""); }}
                        error={touched.category && !!errors.category} helperText={touched.category && errors.category}>
                        <MenuItem value=""><em>Select</em></MenuItem>
                        {categories.map((c) => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
                      </TextField>
                    </Grid>
                    <Grid item xs={6}>
                      <TextField select name="subCategory" label="Sub Category" fullWidth value={values.subCategory}
                        disabled={!values.category} onChange={handleChange}>
                        <MenuItem value=""><em>Select</em></MenuItem>
                        {filteredSubCategories.map((s) => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}
                      </TextField>
                    </Grid>
                    <Grid item xs={6}>
                      <TextField name="unit" label="Unit" fullWidth value={values.unit} onChange={handleChange} />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField name="pack" label="Pack Size" fullWidth value={values.pack} onChange={handleChange} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField name="description" label="Description" fullWidth multiline rows={3}
                        value={values.description} onChange={handleChange} />
                    </Grid>

                    {/* Flags */}
                    <Grid item xs={6}>
                      <FormControlLabel
                        control={<Switch checked={values.popular} onChange={(e) => setFieldValue("popular", e.target.checked)} color="error" />}
                        label="Popular"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControlLabel
                        control={<Switch checked={values.active} onChange={(e) => setFieldValue("active", e.target.checked)} color="success" />}
                        label="Active"
                      />
                    </Grid>
                  </Grid>
                </Paper>

                {/* Extra Details */}
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" color="black" gutterBottom>Extra Details</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField name="more_details.brand" label="Brand" fullWidth value={values.more_details.brand} onChange={handleChange} />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField name="more_details.expiry" type="date" label="Expiry" fullWidth
                        InputLabelProps={{ shrink: true }} value={values.more_details.expiry} onChange={handleChange} />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField name="rating" label="Rating (0–5)" type="number" fullWidth
                        inputProps={{ min: 0, max: 5, step: 0.1 }} value={values.rating} onChange={handleChange}
                        error={touched.rating && !!errors.rating} helperText={touched.rating && errors.rating} />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField name="reviews" label="Review Count" type="number" fullWidth value={values.reviews} onChange={handleChange} />
                    </Grid>
                  </Grid>
                </Paper>

                {/* Customizations */}
                <CustomizationBuilder
                  customizations={values.customizations}
                  setFieldValue={setFieldValue}
                />
              </Grid>

              {/* ── RIGHT COLUMN ── */}
              <Grid item xs={12} md={6}>
                {/* Media */}
                <MediaBuilder
                  media={values.media}
                  setFieldValue={setFieldValue}
                  uploading={uploading}
                  setUploading={setUploading}
                  showSnackbar={showSnackbar}
                />

                {/* Legacy Images */}
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" color="black" gutterBottom>Product Images</Typography>
                  <FieldArray name="images">
                    {({ push, remove }) => (
                      <>
                        <Button component="label" variant="outlined" fullWidth sx={redOutlinedButtonStyle} disabled={uploading}>
                          {uploading ? "Uploading..." : "Upload Images"}
                          <input type="file" hidden multiple accept="image/*"
                            onChange={async (e) => {
                              const files = e.target?.files;
                              if (!files?.length) return;
                              setUploading(true);
                              try {
                                const urls = await Promise.all(
                                  Array.from(files).map(async (f) => {
                                    const fd = new FormData();
                                    fd.append("file", f);
                                    fd.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
                                    const r = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, fd);
                                    return r.data.secure_url;
                                  })
                                );
                                urls.forEach((u) => push(u));
                                showSnackbar("Images uploaded");
                              } catch { showSnackbar("Upload failed", "error"); }
                              finally { setUploading(false); e.target.value = ""; }
                            }}
                          />
                        </Button>
                        <Grid container spacing={1} sx={{ mt: 1 }}>
                          {values.images.map((img, i) => (
                            <Grid item xs={4} key={i}>
                              <Box position="relative">
                                <img src={img} alt="" style={{ width: "100%", height: 100, borderRadius: 8, objectFit: "cover" }} />
                                <IconButton size="small" color="error" onClick={() => remove(i)}
                                  sx={{ position: "absolute", top: -5, right: -5, bgcolor: "white" }}>✕</IconButton>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      </>
                    )}
                  </FieldArray>
                </Paper>

                {/* Pricing */}
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" color="black" gutterBottom>Pricing & Stock</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField name="stock" label="Stock" type="number" fullWidth value={values.stock} onChange={handleChange} />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField name="originalPrice" label="Original Price" type="number" fullWidth value={values.originalPrice}
                        onChange={(e) => { handleChange(e); calculatePricing(+e.target.value, values.discountedMRP, setFieldValue); }} />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField name="discountedMRP" label="Discounted MRP" type="number" fullWidth value={values.discountedMRP}
                        onChange={(e) => { handleChange(e); calculatePricing(values.originalPrice, +e.target.value, setFieldValue); }} />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField name="price" label="Final Price" fullWidth value={values.price} InputProps={{ readOnly: true }} />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField name="discount" label="Discount %" fullWidth value={values.discount} InputProps={{ readOnly: true }} />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField name="amountSaving" label="Amount Saving" fullWidth value={values.amountSaving} InputProps={{ readOnly: true }} />
                    </Grid>
                  </Grid>
                </Paper>

                {/* Preview */}
                {values.images?.[0] && (
                  <Card>
                    <CardMedia component="img" height="200" image={values.images[0]} />
                    <CardContent>
                      <Typography variant="h6">{values.productName || "Product Name"}</Typography>
                      <Typography variant="body2" color="text.secondary">{values.description || "Description..."}</Typography>
                      <Typography variant="h6" color="error">₹{values.price}</Typography>
                      {values.popular && <Chip label="Popular" size="small" color="warning" sx={{ mt: 1, mr: 1 }} />}
                      {values.active && <Chip label="Active" size="small" color="success" sx={{ mt: 1 }} />}
                    </CardContent>
                  </Card>
                )}
              </Grid>
            </Grid>

            <Box textAlign="center" mt={4} display="flex" justifyContent="center" gap={2}>
              {editingProduct && (
                <Button type="button" variant="outlined" sx={redOutlinedButtonStyle}
                  onClick={() => { resetForm(); setEditingProduct(null); }}>
                  Cancel Edit
                </Button>
              )}
              <Button type="submit" variant="contained" disabled={isSubmitting || loading} size="large" sx={redButtonStyle}>
                {loading ? "Saving..." : editingProduct ? "Update Product" : "Add Product"}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>

      {/* ── Product Table ── */}
      <Paper sx={{ mt: 6 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Sub Category</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentProducts.length > 0 ? (
                currentProducts.map((p) => (
                  <TableRow key={p._id} hover>
                    <TableCell>
                      <img
                        src={p.images?.[0] || p.media?.find((m) => m.type === "image")?.url || "https://via.placeholder.com/50"}
                        alt={p.name}
                        style={{ width: 50, height: 50, borderRadius: 4, objectFit: "cover" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{p.productName || p.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{p.description?.slice(0, 40)}...</Typography>
                    </TableCell>
                    {/* Single ref now — not array */}
                    <TableCell>{p.category?.name || "-"}</TableCell>
                    <TableCell>{p.subCategory?.name || "-"}</TableCell>
                    <TableCell>{p.stock ?? "-"}</TableCell>
                    <TableCell>₹{p.price}</TableCell>
                    <TableCell>
                      <Box display="flex" flexDirection="column" gap={0.5}>
                        {p.popular && <Chip label="Popular" size="small" color="warning" />}
                        <Chip label={p.active ? "Active" : "Inactive"} size="small" color={p.active ? "success" : "default"} />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleEdit(p)}><MdEdit /></IconButton>
                      <IconButton color="error" onClick={() => handleDelete(p._id)}><MdDelete /></IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="textSecondary">No products found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {products.length > 0 && (
          <Box mt={2} mb={2} display="flex" justifyContent="center" alignItems="center" gap={2}>
            <Button variant="outlined" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)} sx={redOutlinedButtonStyle}>Previous</Button>
            <Typography>Page {currentPage} of {totalPages}</Typography>
            <Button variant="outlined" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)} sx={redOutlinedButtonStyle}>Next</Button>
          </Box>
        )}
      </Paper>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, productId: null, productName: "" })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete "{deleteDialog.productName}"? This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, productId: null, productName: "" })} sx={redOutlinedButtonStyle}>Cancel</Button>
          <Button onClick={confirmDelete} variant="contained" sx={redButtonStyle}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}