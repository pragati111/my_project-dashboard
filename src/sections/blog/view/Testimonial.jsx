/* eslint-disable */
import { useState, useEffect } from "react";
import {
  Container,
  Stack,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Rating,
  Snackbar,
  Alert,
} from "@mui/material";

// ✅ PROD API
const API_BASE_URL =
  "https://my-project-backend-ee4t.onrender.com/api/testimonials";

// ✅ CLOUDINARY
const CLOUD_NAME = "drq4o4qix";
const UPLOAD_PRESET = "market_data";

// 🔥 API
const testimonialApi = {
  getAll: async () => {
    const res = await fetch(`${API_BASE_URL}/get`);
    const data = await res.json();
    return data.data;
  },

  create: async (data) => {
    const res = await fetch(`${API_BASE_URL}/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  update: async (id, data) => {
    const res = await fetch(`${API_BASE_URL}/update/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  delete: async (id) => {
    await fetch(`${API_BASE_URL}/delete/${id}`, {
      method: "DELETE",
    });
  },
};

// 🔥 Cloudinary Upload
const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await res.json();
  return data.secure_url;
};

// 🔥 Default Form
const defaultForm = {
  name: "",
  image: "",
  rating: 0,
  review: "",
  date: "",
};

export default function TestimonialView() {
  const [testimonials, setTestimonials] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [uploading, setUploading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const fetchTestimonials = async () => {
    const data = await testimonialApi.getAll();
    setTestimonials(data || []);
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  // 🔥 IMAGE UPLOAD
  const handleImageUpload = async (file) => {
    if (!file) return;

    try {
      setUploading(true);
      const url = await uploadToCloudinary(file);
      setForm((prev) => ({ ...prev, image: url }));
    } catch (err) {
      setSnackbar({ open: true, message: "Upload failed ❌" });
    } finally {
      setUploading(false);
    }
  };

  // 🔥 EDIT
  const handleEdit = (t) => {
    setForm({
      name: t.name,
      image: t.image,
      rating: t.rating,
      review: t.review,
      date: t.date ? t.date.split("T")[0] : "",
    });

    setEditId(t._id);
    setOpen(true);
  };

  // 🔥 DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this testimonial?")) return;

    await testimonialApi.delete(id);
    fetchTestimonials();
  };

  // 🔥 CREATE / UPDATE
  const handleSubmit = async () => {
    if (!form.name || !form.image || !form.rating || !form.review) {
      setSnackbar({ open: true, message: "Fill all fields ⚠️" });
      return;
    }

    try {
      if (editId) {
        await testimonialApi.update(editId, form);
        setSnackbar({ open: true, message: "Updated ✅" });
      } else {
        await testimonialApi.create(form);
        setSnackbar({ open: true, message: "Added ✅" });
      }

      setEditId(null);
      setForm(defaultForm);
      setOpen(false);
      fetchTestimonials();
    } catch (err) {
      setSnackbar({ open: true, message: "Error ❌" });
    }
  };

  return (
    <Container>
      <Stack direction="row" justifyContent="space-between" mb={4}>
        <Typography variant="h4">Testimonial Management</Typography>
        <Button
          variant="contained"
          onClick={() => {
            setForm(defaultForm);
            setEditId(null);
            setOpen(true);
          }}
        >
          Add Testimonial
        </Button>
      </Stack>

      {/* 🔥 LIST */}
      <Grid container spacing={3}>
        {testimonials.map((t) => (
          <Grid item xs={12} sm={6} md={4} key={t._id}>
            <Card>
              <CardContent>
                <img
                  src={t.image}
                  alt={t.name}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    objectFit: "cover",
                    marginBottom: 10,
                  }}
                />

                <Typography variant="h6">{t.name}</Typography>

                <Rating value={t.rating} readOnly />

                <Typography mt={1}>{t.review}</Typography>

                <Typography variant="caption">
                  {t.date
                    ? new Date(t.date).toLocaleDateString()
                    : ""}
                </Typography>

                {/* 🔥 ACTION BUTTONS */}
                <Stack direction="row" spacing={1} mt={2}>
                  <Button size="small" onClick={() => handleEdit(t)}>
                    Edit
                  </Button>

                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDelete(t._id)}
                  >
                    Delete
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 🔥 DIALOG FORM */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>
          {editId ? "Edit Testimonial" : "Add Testimonial"}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="User Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              fullWidth
            />

            {/* IMAGE UPLOAD */}
            <Button variant="outlined" component="label">
              Upload Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) =>
                  handleImageUpload(e.target.files[0])
                }
              />
            </Button>

            {uploading && <Typography>Uploading...</Typography>}

            {form.image && (
              <img
                src={form.image}
                alt="preview"
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                }}
              />
            )}

            <Typography>Rating</Typography>
            <Rating
              value={form.rating}
              onChange={(e, val) =>
                setForm({ ...form, rating: val })
              }
            />

            <TextField
              label="Review"
              multiline
              rows={3}
              value={form.review}
              onChange={(e) =>
                setForm({ ...form, review: e.target.value })
              }
              fullWidth
            />

            <TextField
              label="Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={form.date}
              onChange={(e) =>
                setForm({ ...form, date: e.target.value })
              }
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editId ? "Update" : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🔥 SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() =>
          setSnackbar({ open: false, message: "" })
        }
      >
        <Alert severity="success">{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
}