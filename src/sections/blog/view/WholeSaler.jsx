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
  Chip,
  Snackbar,
  Alert,
  Box,
  IconButton,
  InputAdornment,
} from "@mui/material";

const API_BASE_URL = "https://my-project-backend-ee4t.onrender.com/api/wholesaler";

// 🔥 Wholesaler API
const wholesalerApi = {
  register: async (data) => {
    const res = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
    }
    return res.json();
  },

  getAll: async () => {
    const res = await fetch(API_BASE_URL);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return data.data || data;
  },

  update: async (id, data) => {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
    }
    return res.json();
  },

  delete: async (id) => {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
    }
    return res.json();
  },
};

const defaultForm = {
  storeName: "",
  email: "",
  pin: "",
  phoneNumber: "",
  city: "",
  address: "",
};

export default function WholesalerRegistration() {
  const [wholesalers, setWholesalers] = useState([]);
  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editForm, setEditForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showPinInList, setShowPinInList] = useState({});

  // 🔥 Fetch Wholesalers
  const fetchWholesalers = async () => {
    setLoading(true);
    try {
      const data = await wholesalerApi.getAll();
      setWholesalers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      showSnackbar(err.message || "Failed to fetch wholesalers", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWholesalers();
  }, []);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // 🔥 REGISTER WHOLESALER
  const handleRegister = async () => {
    if (!form.storeName || !form.email || !form.pin || !form.phoneNumber || !form.city || !form.address) {
      return showSnackbar("Please fill all required fields", "error");
    }

    if (form.pin.length < 4) {
      return showSnackbar("PIN must be at least 4 characters long", "error");
    }

    if (form.phoneNumber.length !== 10) {
      return showSnackbar("Phone number must be 10 digits", "error");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      return showSnackbar("Please enter a valid email address", "error");
    }

    setLoading(true);
    try {
      const res = await wholesalerApi.register(form);

      if (res.token) {
        showSnackbar("Wholesaler Registered Successfully!");
        setOpen(false);
        setForm(defaultForm);
        fetchWholesalers();
        
        localStorage.setItem("wholesalerToken", res.token);
        localStorage.setItem("wholesalerInfo", JSON.stringify(res.wholesaler));
      } else {
        showSnackbar(res.message || "Error registering wholesaler", "error");
      }
    } catch (err) {
      console.error("Register error:", err);
      showSnackbar(err.message || "Server error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 UPDATE WHOLESALER
  const handleUpdate = async () => {
    if (!editForm.storeName || !editForm.email || !editForm.phoneNumber || !editForm.city || !editForm.address) {
      return showSnackbar("Please fill all required fields", "error");
    }

    if (editForm.phoneNumber.length !== 10) {
      return showSnackbar("Phone number must be 10 digits", "error");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editForm.email)) {
      return showSnackbar("Please enter a valid email address", "error");
    }

    setLoading(true);
    try {
      const res = await wholesalerApi.update(editingId, editForm);
      
      if (res.success) {
        showSnackbar("Wholesaler Updated Successfully!");
        setOpenEdit(false);
        setEditForm(defaultForm);
        setEditingId(null);
        fetchWholesalers();
      } else {
        showSnackbar(res.message || "Error updating wholesaler", "error");
      }
    } catch (err) {
      console.error("Update error:", err);
      showSnackbar(err.message || "Server error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 DELETE WHOLESALER
  const handleDelete = async (id, storeName) => {
    if (window.confirm(`Are you sure you want to delete "${storeName}"?`)) {
      setLoading(true);
      try {
        const res = await wholesalerApi.delete(id);
        
        if (res.success) {
          showSnackbar("Wholesaler Deleted Successfully!");
          fetchWholesalers();
        } else {
          showSnackbar(res.message || "Error deleting wholesaler", "error");
        }
      } catch (err) {
        console.error("Delete error:", err);
        showSnackbar(err.message || "Server error. Please try again.", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  // 🔥 OPEN EDIT DIALOG
  const openEditDialog = (wholesaler) => {
    setEditingId(wholesaler._id);
    setEditForm({
      storeName: wholesaler.storeName,
      email: wholesaler.email,
      pin: wholesaler.pin,
      phoneNumber: wholesaler.phoneNumber,
      city: wholesaler.city,
      address: wholesaler.address,
    });
    setOpenEdit(true);
  };

  const handleTogglePinVisibility = () => {
    setShowPin(!showPin);
  };

  const togglePinVisibilityInList = (wholesalerId) => {
    setShowPinInList(prev => ({
      ...prev,
      [wholesalerId]: !prev[wholesalerId]
    }));
  };

  return (
    <Container maxWidth="lg">
      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Wholesaler Registration
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Join our B2B network and grow your business
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          onClick={() => setOpen(true)} 
          disabled={loading}
          size="large"
        >
          Register New Wholesaler
        </Button>
      </Stack>

      {/* STATS CARD */}
      <Card sx={{ mb: 4, bgcolor: "#f5f5f5" }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" color="primary" fontWeight="bold">
                Total Wholesalers
              </Typography>
              <Typography variant="h3" fontWeight="bold">
                {wholesalers.length}
              </Typography>
            </Box>
            <Chip 
              label="Active Partners" 
              color="success" 
              size="medium"
              sx={{ fontSize: "1rem", py: 2, px: 1 }}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* WHOLESALER LIST */}
      <Typography variant="h5" gutterBottom mb={2} fontWeight="bold">
        Registered Wholesalers
      </Typography>
      
      {loading && !wholesalers.length ? (
        <Typography textAlign="center" py={4}>Loading wholesalers...</Typography>
      ) : (
        <Grid container spacing={3}>
          {wholesalers.length === 0 ? (
            <Grid item xs={12}>
              <Card sx={{ bgcolor: "#fafafa", textAlign: "center", py: 4 }}>
                <Typography color="textSecondary">
                  No wholesalers registered yet. Be the first to register!
                </Typography>
              </Card>
            </Grid>
          ) : (
            wholesalers.map((w, index) => (
              <Grid item xs={12} sm={6} md={4} key={w._id || index}>
                <Card sx={{ height: "100%", transition: "0.3s", "&:hover": { boxShadow: 6 } }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {w.storeName}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Chip 
                          label="Wholesaler" 
                          color="primary" 
                          size="small" 
                        />
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          onClick={() => openEditDialog(w)}
                          sx={{ minWidth: "35px", p: "4px 8px" }}
                        >
                          ✏️
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleDelete(w._id, w.storeName)}
                          sx={{ minWidth: "35px", p: "4px 8px" }}
                        >
                          🗑️
                        </Button>
                      </Stack>
                    </Stack>
                    
                    <Stack spacing={1.5}>
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Email
                        </Typography>
                        <Typography variant="body2">
                          {w.email}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Phone Number
                        </Typography>
                        <Typography variant="body2">
                          {w.phoneNumber}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          PIN
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="body2" fontWeight="bold" fontFamily="monospace">
                            {showPinInList[w._id] ? w.pin : "••••"}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => togglePinVisibilityInList(w._id)}
                            sx={{ p: 0.5 }}
                          >
                            <span>{showPinInList[w._id] ? "👁️" : "🔒"}</span>
                          </IconButton>
                        </Stack>
                      </Box>
                      
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          City
                        </Typography>
                        <Typography variant="body2">
                          {w.city}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Address
                        </Typography>
                        <Typography variant="body2">
                          {w.address}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* REGISTRATION DIALOG */}
      <Dialog open={open} onClose={() => !loading && setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          <Typography variant="h5" fontWeight="bold">
            Wholesaler Registration
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Fill in the details to register as a wholesaler
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3} mt={1}>
            <TextField
              label="Store Name"
              name="storeName"
              value={form.storeName}
              onChange={handleChange}
              fullWidth
              required
              placeholder="e.g., City Wholesale Mart"
              helperText="Your business/store name"
            />

            <TextField
              label="Email Address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              required
              placeholder="wholesaler@business.com"
              helperText="Used for login and communications"
            />

            <TextField
              label="Phone Number"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              fullWidth
              required
              placeholder="9876543210"
              helperText="10-digit mobile number"
              inputProps={{ maxLength: 10 }}
            />

            <TextField
              label="PIN (4+ characters)"
              name="pin"
              type={showPin ? "text" : "password"}
              value={form.pin}
              onChange={handleChange}
              fullWidth
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle pin visibility"
                      onClick={handleTogglePinVisibility}
                      edge="end"
                    >
                      {showPin ? "👁️" : "🔒"}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              helperText="Minimum 4 characters - keep it secure"
            />

            <TextField
              label="City"
              name="city"
              value={form.city}
              onChange={handleChange}
              fullWidth
              required
              placeholder="Mumbai, Delhi, Bengaluru"
            />

            <TextField
              label="Full Address"
              name="address"
              value={form.address}
              onChange={handleChange}
              fullWidth
              required
              multiline
              rows={3}
              placeholder="Street address, warehouse location, landmark"
              helperText="Complete business address"
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button 
            onClick={() => setOpen(false)} 
            disabled={loading}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleRegister} 
            disabled={loading}
          >
            {loading ? "Registering..." : "Register Wholesaler"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={openEdit} onClose={() => !loading && setOpenEdit(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          <Typography variant="h5" fontWeight="bold">
            Edit Wholesaler
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Update wholesaler information
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3} mt={1}>
            <TextField
              label="Store Name"
              name="storeName"
              value={editForm.storeName}
              onChange={handleEditChange}
              fullWidth
              required
            />

            <TextField
              label="Email Address"
              name="email"
              type="email"
              value={editForm.email}
              onChange={handleEditChange}
              fullWidth
              required
            />

            <TextField
              label="Phone Number"
              name="phoneNumber"
              value={editForm.phoneNumber}
              onChange={handleEditChange}
              fullWidth
              required
              inputProps={{ maxLength: 10 }}
            />

            <TextField
              label="PIN"
              name="pin"
              value={editForm.pin}
              onChange={handleEditChange}
              fullWidth
              required
              helperText="Update PIN if needed"
            />

            <TextField
              label="City"
              name="city"
              value={editForm.city}
              onChange={handleEditChange}
              fullWidth
              required
            />

            <TextField
              label="Full Address"
              name="address"
              value={editForm.address}
              onChange={handleEditChange}
              fullWidth
              required
              multiline
              rows={3}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button 
            onClick={() => setOpenEdit(false)} 
            disabled={loading}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleUpdate} 
            disabled={loading}
            color="primary"
          >
            {loading ? "Updating..." : "Update Wholesaler"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}